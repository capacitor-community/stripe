import { HTTPException } from 'hono/http-exception';
import type { HonoRequest } from 'hono/request';
import type { ZodType } from 'zod';

export const parseJsonBody = async <T>(
  request: HonoRequest,
  schema: ZodType<T>,
): Promise<T> => {
  const text = await request.text();
  let value: unknown = {};

  if (text.trim()) {
    try {
      value = JSON.parse(text);
    } catch {
      throw new HTTPException(400, { message: 'Invalid JSON body' });
    }
  }

  const result = schema.safeParse(value);
  if (!result.success) {
    throw new HTTPException(400, { message: 'Invalid request body' });
  }
  return result.data;
};
