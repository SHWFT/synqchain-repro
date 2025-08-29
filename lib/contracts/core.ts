import { z } from 'zod';
import { ZId, ZDateISO } from './common';

export const ZSupplier = z.object({
  id: ZId,
  name: z.string(),
  status: z.enum(['active', 'inactive']).default('active'),
  createdAt: ZDateISO,
});
export type Supplier = z.infer<typeof ZSupplier>;

export const ZProject = z.object({
  id: ZId,
  name: z.string(),
  status: z
    .enum(['in-progress', 'completed', 'on-hold'])
    .default('in-progress'),
  budget: z.number().nonnegative().default(0),
  createdAt: ZDateISO,
});
export type Project = z.infer<typeof ZProject>;

export const ZPurchaseOrder = z.object({
  id: ZId,
  projectId: ZId.optional(),
  supplierId: ZId.optional(),
  amount: z.number().nonnegative().default(0),
  status: z
    .enum(['draft', 'submitted', 'approved', 'rejected'])
    .default('draft'),
  createdAt: ZDateISO,
});
export type PurchaseOrder = z.infer<typeof ZPurchaseOrder>;

export const ZActivityItem = z.object({
  id: ZId,
  kind: z.enum(['project', 'supplier', 'system', 'user']),
  title: z.string(),
  date: ZDateISO,
  href: z.string().optional(),
});
export type ActivityItem = z.infer<typeof ZActivityItem>;

export const ZERPHealthItem = z.object({
  name: z.string(),
  status: z.enum(['connected', 'mock', 'disconnected']).default('mock'),
});
export const ZERPHealth = z.array(ZERPHealthItem);
export type ERPHealth = z.infer<typeof ZERPHealth>;
