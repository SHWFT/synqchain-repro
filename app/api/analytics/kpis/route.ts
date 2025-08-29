import { getAdapter } from '@/lib/erp';
import { ok, fail } from '@/lib/http/json';
import { ZKpisResponse } from '@/lib/contracts/kpis';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const start = url.searchParams.get('start') || undefined;
    const end = url.searchParams.get('end') || undefined;
    const data = await getAdapter().getKpis({ start, end });
    return ok(data, ZKpisResponse);
  } catch (e) {
    return fail(e);
  }
}
