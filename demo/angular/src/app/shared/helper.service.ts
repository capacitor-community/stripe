import { Injectable, NgZone, inject } from '@angular/core';
import { ITestItems } from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  private zone = inject(NgZone);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  /**
   * items is not Deep Copy, this is substitution
   */
  public async updateItem(
    items: ITestItems[],
    name: string,
    result: boolean,
    value: unknown = undefined,
  ) {
    await new Promise<void>((resolve) => {
      this.zone.run(() => {
        let isChanged = false;
        items = items.map((item) => {
          if (item.name === name && item.result === undefined && !isChanged) {
            isChanged = true;
            if (item.expect === undefined) {
              item.result = result;
            } else if (Array.isArray(item.expect) && value) {
              // @ts-expect-error: valueがanyであるため
              item.result = item.expect.includes(value.toString());
            } else if (value && typeof value === 'object') {
              item.result = JSON.stringify(value).includes(
                item.expect.toString(),
              );
            } else {
              if (item.expect === 'error') {
                item.result = this.receiveErrorValue(value);
              }
            }
          }
          return item;
        });
        resolve();
      });
    });
  }

  private receiveErrorValue(value: unknown): boolean {
    return value.hasOwnProperty('code') && value.hasOwnProperty('message');
  }
}
