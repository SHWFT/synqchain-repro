import { getAdapter } from '@/lib/erp';
import { ok, fail, bad } from '@/lib/http/json';
import { ZSupplier } from '@/lib/contracts/core';
import { z } from 'zod';

export async function GET() {
  try {
    return ok(await getAdapter().listSuppliers(), z.array(ZSupplier));
  } catch (e) {
    return fail(e);
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ZSupplier.partial({ id: true, createdAt: true })
      .required({ name: true })
      .parse(body);
    const created = await getAdapter().createSupplier({
      name: parsed.name,
      status: parsed.status ?? 'active',
    });
    return ok(created, ZSupplier);
  } catch (e) {
    return bad(e instanceof Error ? e.message : 'Invalid');
  }
}
