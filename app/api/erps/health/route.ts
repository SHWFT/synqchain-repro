import { getAdapter } from '@/lib/erp';
import { ok, fail } from '@/lib/http/json';
import { ZERPHealth } from '@/lib/contracts/core';

export async function GET() {
  try {
    return ok(await getAdapter().getERPHealth(), ZERPHealth);
  } catch (e) {
    return fail(e);
  }
}
