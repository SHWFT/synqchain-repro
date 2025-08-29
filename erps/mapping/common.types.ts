import { z } from "zod";

export const ZPagination = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
});
export type Pagination = z.infer<typeof ZPagination>;

export const ZSupplier = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional(),
  region: z.string().optional(),
  currency: z.string().optional(),
  status: z.string().default("Active"),
  rating: z.number().optional(),
  leadTimeDays: z.number().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Supplier = z.infer<typeof ZSupplier>;

export const ZItem = z.object({
  id: z.string(),
  sku: z.string(),
  description: z.string().optional(),
  uom: z.string().optional(),
  price: z.number().optional(),
});
export type Item = z.infer<typeof ZItem>;

export const ZPOStatus = z.enum([
  "DRAFT","PENDING_APPROVAL","APPROVED","ACKNOWLEDGED","IN_FULFILLMENT",
  "SHIPPED","DELIVERED","INVOICED","PAID","CLOSED"
]);
export type POStatus = z.infer<typeof ZPOStatus>;

export const ZPurchaseOrder = z.object({
  id: z.string(),
  number: z.string(),
  supplierId: z.string().optional(),
  status: ZPOStatus.default("DRAFT"),
  total: z.number().default(0),
  currency: z.string().default("USD"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type PurchaseOrder = z.infer<typeof ZPurchaseOrder>;

export const ZListMeta = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
});
export type ListMeta = z.infer<typeof ZListMeta>;

export type ListResponse<T> = { data: T[]; pagination: ListMeta };
