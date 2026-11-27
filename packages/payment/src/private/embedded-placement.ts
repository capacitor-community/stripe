import { getUnprojectedVisibility, projectionAncestors } from '@webview-native-ui/engine';

import type { StripePlugin } from '../definitions';
import type { EmbeddedPaymentElementOptions, MountedEmbeddedPaymentElement } from '../embedded-payment-element';

interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}
interface Placement extends Frame {
  clip: Frame;
  visible: boolean;
}

export interface EmbeddedNativeBridge extends StripePlugin {
  mountEmbeddedPaymentElement(options: EmbeddedPaymentElementOptions & { selector: string }): Promise<void>;
  confirmEmbeddedPaymentElement: MountedEmbeddedPaymentElement['confirm'];
  unmountEmbeddedPaymentElement(): Promise<void>;
  updateEmbeddedPaymentElement(placement: Placement): Promise<void>;
}

/** DOM geometry is in viewport CSS pixels on both platforms. */
function measure(host: HTMLElement, { x, y, width, height }: DOMRect): Placement {
  let left = Math.max(0, x);
  let top = Math.max(0, y);
  let right = Math.min(innerWidth, x + width);
  let bottom = Math.min(innerHeight, y + height);
  for (const parent of projectionAncestors(host)) {
    const style = getComputedStyle(parent);
    const rect = parent.getBoundingClientRect();
    if (style.overflowX !== 'visible') {
      left = Math.max(left, rect.left + parent.clientLeft);
      right = Math.min(right, rect.left + parent.clientLeft + parent.clientWidth);
    }
    if (style.overflowY !== 'visible') {
      top = Math.max(top, rect.top + parent.clientTop);
      bottom = Math.min(bottom, rect.top + parent.clientTop + parent.clientHeight);
    }
  }
  return {
    x,
    y,
    width,
    height,
    clip: { x: left, y: top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) },
    visible: host.isConnected && right > left && bottom > top && getUnprojectedVisibility(host) === 'visible',
  };
}

function track(host: HTMLElement, bridge: EmbeddedNativeBridge, signal: AbortSignal): void {
  let frame = 0;
  let last = '';
  let dirty = true;
  let retryAt = Infinity;
  let previous: DOMRect | undefined;
  const update = (now: number) => {
    frame = requestAnimationFrame(update);
    if (now >= retryAt) {
      last = '';
      dirty = true;
    }
    // A sibling can move the host without resizing or scrolling any observed element.
    const rect = host.getBoundingClientRect();
    if (
      !dirty &&
      previous &&
      rect.x === previous.x &&
      rect.y === previous.y &&
      rect.width === previous.width &&
      rect.height === previous.height
    )
      return;
    previous = rect;
    dirty = false;
    const placement = measure(host, rect);
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
  const styles = new MutationObserver(schedule);
  const intersection = new IntersectionObserver(schedule);
  signal.addEventListener(
    'abort',
    () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resize.disconnect();
      styles.disconnect();
    },
    { once: true },
  );
  intersection.observe(host);
  // Scroll events in Ionic's shadow scroll container do not bubble into the document.
  for (const element of [host, ...projectionAncestors(host)]) {
    resize.observe(element);
    styles.observe(element, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    element.addEventListener('scroll', schedule, { passive: true, signal });
  }
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', schedule, { signal });
  update(performance.now());
}

export function embeddedPaymentElementAPI(bridge: EmbeddedNativeBridge) {
  let active = false;
  let releasing: Promise<void> | undefined;
  let nextHost = 0;

  async function create(
    element: HTMLElement,
    options: EmbeddedPaymentElementOptions,
  ): Promise<MountedEmbeddedPaymentElement> {
    if (releasing) await releasing;
    if (active) throw new Error('Destroy the mounted Embedded Payment Element before creating another.');
    if (!Number.isSafeInteger(options.amount) || options.amount <= 0) {
      throw new Error('Provide a positive integer amount in the smallest currency unit.');
    }
    if (
      typeof document === 'undefined' ||
      !(element instanceof HTMLElement) ||
      element.getRootNode() !== document ||
      !element.getBoundingClientRect().width
    ) {
      throw new Error('Provide a laid-out HTML container in the main document.');
    }

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
      await bridge.mountEmbeddedPaymentElement({ ...options, selector });
      if (lifecycle.signal.aborted) throw new Error('The checkout page was closed.');
      mounted = true;
      track(element, bridge, lifecycle.signal);
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
