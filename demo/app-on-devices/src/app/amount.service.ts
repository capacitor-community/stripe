import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AmountService {
  readonly input = signal<string>('0');
  readonly amount = computed<number>(() => {
    const cents = Number.parseInt(this.input(), 10);
    return Number.isFinite(cents) ? cents / 100 : 0;
  });
  readonly amountDisplay = computed<string>(() => this.amount().toFixed(2));

  onDigit(digit: number) {
    if (!Number.isInteger(digit) || digit < 0 || digit > 9) {
      return;
    }
    this.input.update((prev) => {
      if (prev === '0') return digit === 0 ? '0' : String(digit);
      const next = prev + String(digit);
      return next.length > 9 ? prev : next;
    });
  }

  onBackspace() {
    this.input.update((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  }
}
