import { Capacitor, CapacitorException, ExceptionCode } from '@capacitor/core';
import {
  bindSnapshotVisibleArea,
  measureProjectionFrame,
  observeProjectionLayout,
  projectionAncestors,
  type Frame,
} from '@webview-native-ui/engine';

import type { StripePlugin } from '../definitions';
import type { EmbeddedPaymentElementOptions, MountedEmbeddedPaymentElement } from '../embedded-payment-element';

interface Placement extends Frame {
  clip: Frame;
  visible: boolean;
}

export interface EmbeddedNativeBridge extends StripePlugin {
  mountEmbeddedPaymentElement(
    options: Omit<EmbeddedPaymentElementOptions, 'visibleArea'> & { selector: string },
  ): Promise<void>;
  confirmEmbeddedPaymentElement: MountedEmbeddedPaymentElement['confirm'];
  unmountEmbeddedPaymentElement(): Promise<void>;
  updateEmbeddedPaymentElement(placement: Placement): Promise<void>;
}

function track(
  host: HTMLElement,
  bridge: EmbeddedNativeBridge,
  signal: AbortSignal,
  visibleArea: EmbeddedPaymentElementOptions['visibleArea'],
): void {
  const stopClipping = visibleArea && bindSnapshotVisibleArea(host, visibleArea);
  let frame = 0;
  let last = '';
  let dirty = true;
  let retryAt = Infinity;
  let previousArea: string | undefined;
  let previous: DOMRect | undefined;
  const update = (now: number) => {
    frame = requestAnimationFrame(update);
    if (now >= retryAt) {
      last = '';
      dirty = true;
    }
    // A sibling can move the host without resizing or scrolling any observed element.
    const rect = host.getBoundingClientRect();
    const area = visibleArea?.();
    const areaKey = area && [area.x, area.y, area.width, area.height].join(',');
    if (
      previousArea === areaKey &&
      !dirty &&
      previous &&
      rect.x === previous.x &&
      rect.y === previous.y &&
      rect.width === previous.width &&
      rect.height === previous.height
    )
      return;
    previousArea = areaKey;
    previous = rect;
    dirty = false;
    const { frame: bounds, clip, visible } = measureProjectionFrame(host, { bounds: rect, visibleArea: area });
    const placement = { ...bounds, clip, visible };
    const key = JSON.stringify(placement);
    if (key === last) return;
    last = key;
    retryAt = Infinity;
    void bridge.updateEmbeddedPaymentElement(placement).catch(() => {
      if (last === key) retryAt = performance.now() + 250;
    });
  };
  const schedule = () => {
    dirty = true;
  };
  const resize = new ResizeObserver(schedule);
  const ancestors = new Set<Element>([host, ...projectionAncestors(host)]);
  const stopObservingLayout = observeProjectionLayout(window, [host], (scroll) => {
    if (!(scroll?.target instanceof Element) || ancestors.has(scroll.target)) schedule();
  });
  const intersection = new IntersectionObserver(schedule);
  signal.addEventListener(
    'abort',
    () => {
      stopClipping?.();
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resize.disconnect();
      stopObservingLayout();
    },
    { once: true },
  );
  intersection.observe(host);
  for (const element of ancestors) resize.observe(element);
  update(performance.now());
}

export function embeddedPaymentElementAPI(bridge: EmbeddedNativeBridge): {
  create(element: HTMLElement, options: EmbeddedPaymentElementOptions): Promise<MountedEmbeddedPaymentElement>;
} {
  let active = false;
  let releasing: Promise<void> | undefined;
  let nextHost = 0;

  async function create(
    element: HTMLElement,
    options: EmbeddedPaymentElementOptions,
  ): Promise<MountedEmbeddedPaymentElement> {
    if (!Capacitor.isNativePlatform()) {
      throw new CapacitorException('Embedded Payment Element requires iOS or Android.', ExceptionCode.Unimplemented);
    }
    if (releasing) await releasing;
    if (active) throw new Error('Destroy the mounted Embedded Payment Element before creating another.');
    if (!Number.isSafeInteger(options.amount) || options.amount <= 0) {
      throw new Error('Provide a positive integer amount in the smallest currency unit.');
    }
    if (typeof document === 'undefined' || !(element instanceof HTMLElement) || element.getRootNode() !== document) {
      throw new Error('Provide a laid-out HTML container in the main document.');
    }

    const { width, height } = element.getBoundingClientRect();
    if (!width || !height) throw new Error('Provide a container with a nonzero width and height.');

    const lifecycle = new AbortController();
    let attribute: string;
    do {
      attribute = 'data-stripe-embedded-' + ++nextHost;
    } while (document.querySelector('[' + attribute + ']'));
    const selector = '[' + attribute + ']';
    let teardown: Promise<void> | undefined;
    const destroy = () => {
      if (!teardown) {
        lifecycle.abort();
        element.removeAttribute(attribute);
        teardown = bridge.unmountEmbeddedPaymentElement().finally(() => {
          active = false;
          releasing = undefined;
        });
        releasing = teardown;
      }
      return teardown;
    };

    active = true;
    let mounted = false;
    try {
      element.setAttribute(attribute, '');
      window.addEventListener(
        'pagehide',
        () => {
          void destroy().catch(() => undefined);
        },
        { once: true, signal: lifecycle.signal },
      );
      const { visibleArea, ...paymentOptions } = options;
      await bridge.mountEmbeddedPaymentElement({ ...paymentOptions, selector });
      if (lifecycle.signal.aborted) throw new Error('The checkout page was closed.');
      mounted = true;
      track(element, bridge, lifecycle.signal, visibleArea);
      return {
        confirm: async () => {
          if (lifecycle.signal.aborted) throw new Error('The payment element has been destroyed.');
          return bridge.confirmEmbeddedPaymentElement();
        },
        destroy,
      };
    } catch (error) {
      if (mounted || teardown) await destroy();
      else {
        lifecycle.abort();
        element.removeAttribute(attribute);
        active = false;
      }
      throw error;
    }
  }

  return { create };
}
