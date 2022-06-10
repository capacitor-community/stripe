import { Injectable, NgZone } from '@angular/core';
import { ITestItems } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(private zone: NgZone) { }

  /**
   * items is not Deep Copy, this is substitution
   */
  public async updateItem(items: ITestItems[], name: string, result: boolean, value: any = undefined) {
    await new Promise<void>(resolve => {
      this.zone.run(() => {
        let isChanged = false;
        items = items.map((item) => {
          if (item.name === name && item.result === undefined && !isChanged) {
            isChanged = true;
            if (item.expect === undefined) {
              item.result = result;
            } else if (Array.isArray(item.expect) && value) {
              // @ts-ignore
              item.result = item.expect.includes(value.toString());
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

  private receiveErrorValue(value: any): boolean {
    return value.hasOwnProperty('code') &&  value.hasOwnProperty('message');
  }
}
