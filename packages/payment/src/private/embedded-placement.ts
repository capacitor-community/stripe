import { getUnprojectedVisibility, projectionAncestors } from '@webview-native-ui/engine';
import { enableSupportIonicOverlays } from '@webview-native-ui/engine/ionic';

import type { StripePlugin } from '../definitions';
import type { EmbeddedPaymentElementOptions } from '../embedded-payment-element';

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

function track(host: HTMLElement, bridge: EmbeddedNativeBridge): () => void {
  let frame = 0;
  let last = '';
  let dirty = true;
  let retry: ReturnType<typeof setTimeout>;
  let stopped = false;
  let previous: DOMRect | undefined;
  const update = () => {
    frame = requestAnimationFrame(update);
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
    void bridge.updateEmbeddedPaymentElement(placement).catch(() => {
      if (stopped || last !== key) return;
      clearTimeout(retry);
      retry = setTimeout(() => {
        if (last === key) {
          last = '';
          dirty = true;
        }
      }, 250);
    });
  };
  const schedule = () => {
    dirty = true;
  };
  const resize = new ResizeObserver(schedule);
  const styles = new MutationObserver(schedule);
  const intersection = new IntersectionObserver(schedule);
  intersection.observe(host);
  const events = new AbortController();
  // Scroll events in Ionic's shadow scroll container do not bubble into the document.
  for (const element of [host, ...projectionAncestors(host)]) {
    resize.observe(element);
    styles.observe(element, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    element.addEventListener('scroll', schedule, { passive: true, signal: events.signal });
  }
  window.addEventListener('scroll', schedule, { passive: true, signal: events.signal });
  window.addEventListener('resize', schedule, { signal: events.signal });
  update();
  return () => {
    stopped = true;
    clearTimeout(retry);
    cancelAnimationFrame(frame);
    events.abort();
    intersection.disconnect();
    resize.disconnect();
    styles.disconnect();
  };
}

export function withEmbeddedPlacement(bridge: EmbeddedNativeBridge): StripePlugin {
  let stop: (() => void) | undefined;
  let pending: Promise<void> = Promise.resolve();
  const serialize = (operation: () => Promise<void>) => {
    const result = pending.then(operation);
    pending = result.catch(() => undefined);
    return result;
  };
  const mount = (options: EmbeddedPaymentElementOptions) =>
    serialize(async () => {
      if (stop) throw new Error('Destroy the mounted Embedded Payment Element before mounting another.');
      if (!Number.isSafeInteger(options.amount) || options.amount <= 0) {
        throw new Error('Provide a positive integer amount in the smallest currency unit.');
      }
      const hosts = document.querySelectorAll(options.selector);
      const host = hosts[0];
      if (hosts.length !== 1 || !(host instanceof HTMLElement) || !host.getBoundingClientRect().width) {
        throw new Error('The Embedded Payment Element selector must match one laid-out HTML container.');
      }
      if (document.querySelector('ion-app')) enableSupportIonicOverlays();
      // Capacitor retains native plugin instances across full document navigations.
      const lifecycle = new AbortController();
      window.addEventListener(
        'pagehide',
        () => {
          lifecycle.abort();
          stop?.();
          stop = undefined;
          void bridge.unmountEmbeddedPaymentElement().catch(() => undefined);
        },
        { once: true, signal: lifecycle.signal },
      );
      try {
        await bridge.mountEmbeddedPaymentElement(options);
        if (lifecycle.signal.aborted) throw new Error('The checkout page was closed.');
        const untrack = track(host, bridge);
        stop = () => {
          lifecycle.abort();
          untrack();
        };
      } catch (error) {
        lifecycle.abort();
        throw error;
      }
    });
  const destroy = () =>
    serialize(async () => {
      stop?.();
      stop = undefined;
      await bridge.unmountEmbeddedPaymentElement();
    });
  return new Proxy(bridge, {
    get(target, key) {
      if (key === 'mountEmbeddedPaymentElement') return mount;
      if (key === 'unmountEmbeddedPaymentElement') return destroy;
      return Reflect.get(target, key);
    },
  });
}
