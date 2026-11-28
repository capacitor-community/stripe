import { Capacitor } from '@capacitor/core';
import { Stripe } from '@capacitor-community/stripe';
import { embeddedPaymentElementAPI } from '@capacitor-community/stripe/dist/esm/private/embedded-placement.js';
import { bindSnapshotVisibleArea } from '@webview-native-ui/engine';
import { expect, it, vi } from 'vitest';

vi.mock('@webview-native-ui/engine', { spy: true });

it('clips in viewport coordinates and updates authored visibility without moving the host', async () => {
  vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);
  class Observer {
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', Observer);
  vi.stubGlobal('IntersectionObserver', Observer);
  const viewport = Object.assign(new EventTarget(), { offsetLeft: 0, offsetTop: 0, width: 300, height: 300 });
  vi.stubGlobal('visualViewport', viewport);
  const placement = vi.fn().mockResolvedValue(undefined);
  const api = embeddedPaymentElementAPI({
    ...Stripe,
    mountEmbeddedPaymentElement: vi.fn().mockResolvedValue(undefined),
    updateEmbeddedPaymentElement: placement,
    confirmEmbeddedPaymentElement: vi.fn(),
    unmountEmbeddedPaymentElement: vi.fn().mockResolvedValue(undefined),
  });
  const parent = document.createElement('div');
  const host = document.createElement('div');
  const style = document.createElement('style');
  style.textContent = 'html, body { overflow-x: visible; overflow-y: visible; } [data-open="false"] > div { visibility: hidden; }';
  document.head.append(style);
  document.body.append(parent);
  parent.append(host);
  vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(new DOMRect(5, 5, 200, 100));
  const visibleArea = () => new DOMRect(10, 15, 90, 50);
  const element = await api.create(host, {
    amount: 100, currency: 'usd', paymentIntentClientSecret: 'test',
    visibleArea,
  });
  try {
    expect(bindSnapshotVisibleArea).toHaveBeenCalledWith(host, visibleArea);
    const clip = { x: 10, y: 15, width: 90, height: 50 };
    expect(placement).toHaveBeenLastCalledWith(expect.objectContaining({ clip, visible: true }));
    parent.dataset.open = 'false';
    await vi.waitFor(() => expect(placement).toHaveBeenLastCalledWith(expect.objectContaining({ clip, visible: false })));
    delete parent.dataset.open;
    await vi.waitFor(() => expect(placement).toHaveBeenLastCalledWith(expect.objectContaining({ clip, visible: true })));
    viewport.width = 55;
    viewport.dispatchEvent(new Event('resize'));
    await vi.waitFor(() => expect(placement).toHaveBeenLastCalledWith(expect.objectContaining({ clip: { ...clip, width: 45 } })));
  } finally {
    await element.destroy();
    parent.remove();
    style.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
