import { Injectable, WritableSignal } from '@angular/core';
import { ITestItems } from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  constructor() {}

  public async updateItem(
    items: WritableSignal<ITestItems[]>,
    name: string,
    result: boolean,
    value: unknown = undefined,
  ) {
    items.update((current) => {
      let isChanged = false;
      return current.map((item) => {
        if (item.name === name && item.result === undefined && !isChanged) {
          isChanged = true;
          item = { ...item };
          if (item.expect === undefined) {
            item.result = result;
          } else if (Array.isArray(item.expect) && value) {
            // @ts-expect-error: valueがanyであるため
            item.result = item.expect.includes(value.toString());
          } else if (value && typeof value === 'object') {
            item.result = JSON.stringify(value).includes(item.expect.toString());
          } else {
            if (item.expect === 'error') {
              item.result = this.receiveErrorValue(value);
            }
          }
        }
        return item;
      });
    });
  }

  private receiveErrorValue(value: unknown): boolean {
    return value.hasOwnProperty('code') && value.hasOwnProperty('message');
  }
}
