import { z } from 'zod';

export const ZKpiCards = z.object({
  totalSpend: z.number().nonnegative().default(0),
  platformSavings: z.number().nonnegative().default(0),
  activeProjects: z.number().int().nonnegative().default(0),
  activeSuppliers: z.number().int().nonnegative().default(0),
});
export type KpiCards = z.infer<typeof ZKpiCards>;

export const ZSeries = z.object({
  labels: z.array(z.string()),
  values: z.array(z.number()),
});

export const ZKpiSeries = z.object({
  projectsCompletedMonthly: ZSeries,
  savingsMonthly: ZSeries,
});
export type KpiSeries = z.infer<typeof ZKpiSeries>;

export const ZKpisResponse = z.object({
  cards: ZKpiCards,
  series: ZKpiSeries,
});
export type KpisResponse = z.infer<typeof ZKpisResponse>;
