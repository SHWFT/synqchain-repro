import { getAdapter } from '@/lib/erp';
import { ok, fail, bad } from '@/lib/http/json';
import { ZProject } from '@/lib/contracts/core';
import { z } from 'zod';

export async function GET() {
  try {
    return ok(await getAdapter().listProjects(), z.array(ZProject));
  } catch (e) {
    return fail(e);
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ZProject.partial({ id: true, createdAt: true })
      .required({ name: true })
      .parse(body);
    const created = await getAdapter().createProject({
      name: parsed.name,
      status: parsed.status ?? 'in-progress',
      budget: parsed.budget ?? 0,
    });
    return ok(created, ZProject);
  } catch (e) {
    return bad(e instanceof Error ? e.message : 'Invalid');
  }
}
