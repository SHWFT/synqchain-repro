import { getAdapter } from '@/lib/erp';
import { ok, fail } from '@/lib/http/json';
import { ZActivityItem } from '@/lib/contracts/core';
import { z } from 'zod';

export async function GET() {
  try {
    return ok(await getAdapter().getActivity(), z.array(ZActivityItem));
  } catch (e) {
    return fail(e);
  }
}
