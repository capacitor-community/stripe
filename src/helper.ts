export function flatten(json: any, prefix?: string, omit?: string[]): any {
  let obj: any = {};

  for (const prop of Object.keys(json)) {
    if (
      typeof json[prop] !== 'undefined' &&
      json[prop] !== null &&
      (!Array.isArray(omit) || !omit.includes(prop))
    ) {
      if (typeof json[prop] === 'object') {
        obj = {
          ...obj,
          ...flatten(json[prop], prefix ? `${prefix}[${prop}]` : prop),
        };
      } else {
        const key = prefix ? `${prefix}[${prop}]` : prop;
        obj[key] = json[prop];
      }
    }
  }

  return obj;
}

export function stringify(json: any): string {
  let str = '';
  json = flatten(json);

  for (const prop of Object.keys(json)) {
    const key = encodeURIComponent(prop);
    const val = encodeURIComponent(json[prop]);
    str += `${key}=${val}&`;
  }

  return str;
}

export function formBody(json: any, prefix?: string, omit?: string[]): string {
  json = flatten(json, prefix, omit);
  return stringify(json);
}

export async function _callStripeAPI<T>(fetchUrl: string, fetchOpts: RequestInit): Promise<T> {
  const res = await fetch(fetchUrl, fetchOpts);

  let parsed;

  try {
    parsed = await res.json();
  } catch (e) {
    parsed = await res.text();
  }

  if (res.ok) {
    return parsed;
  } else {
    throw parsed?.error?.message ? parsed.error.message : parsed;
  }
}

export async function _stripePost<T>(
  path: string,
  body: string,
  key: string,
  extraHeaders?: any,
): Promise<T> {
  extraHeaders = extraHeaders || {};

  return _callStripeAPI<T>(`https://api.stripe.com${path}`, {
    body: body,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Bearer ${key}`,
      'Stripe-version': '2020-03-02',
      ...extraHeaders,
    },
  });
}

export async function _stripeGet<T>(path: string, key: string, extraHeaders?: any): Promise<T> {
  extraHeaders = extraHeaders || {};

  return _callStripeAPI<T>(`https://api.stripe.com${path}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${key}`,
      'Stripe-version': '2020-03-02',
      ...extraHeaders,
    },
  });
}
