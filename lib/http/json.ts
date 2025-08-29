import { NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

export function ok<T>(data: T, schema?: ZodSchema<T>) {
  if (schema) schema.parse(data);
  return NextResponse.json(data, { status: 200 });
}
export function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
export function fail(e: unknown) {
  const msg = e instanceof Error ? e.message : 'Internal Error';
  return NextResponse.json({ error: msg }, { status: 500 });
}
