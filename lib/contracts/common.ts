import { z } from 'zod';

export const ZId = z.string().min(1);
export const ZDateISO = z.string().datetime().or(z.string()); // accept simple ISO strings from mock

export const ZPage = z.object({
  page: z.number().int().nonnegative().default(0),
  pageSize: z.number().int().positive().max(200).default(20),
  total: z.number().int().nonnegative().default(0),
});
export type Page = z.infer<typeof ZPage>;
