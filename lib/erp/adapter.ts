import { ZKpisResponse } from '../contracts/kpis';
import {
  ZProject,
  ZSupplier,
  ZPurchaseOrder,
  ZActivityItem,
  ZERPHealth,
} from '../contracts/core';
import { z } from 'zod';

export type Adapter = {
  getKpis(params?: {
    start?: string;
    end?: string;
  }): Promise<z.infer<typeof ZKpisResponse>>;
  getActivity(): Promise<Array<z.infer<typeof ZActivityItem>>>;
  getERPHealth(): Promise<z.infer<typeof ZERPHealth>>;

  listProjects(): Promise<Array<z.infer<typeof ZProject>>>;
  getProject(id: string): Promise<z.infer<typeof ZProject> | null>;
  createProject(
    input: Omit<z.infer<typeof ZProject>, 'id' | 'createdAt'>
  ): Promise<z.infer<typeof ZProject>>;
  updateProject(
    id: string,
    input: Partial<z.infer<typeof ZProject>>
  ): Promise<z.infer<typeof ZProject>>;
  deleteProject(id: string): Promise<{ ok: true }>;

  listSuppliers(): Promise<Array<z.infer<typeof ZSupplier>>>;
  createSupplier(
    input: Omit<z.infer<typeof ZSupplier>, 'id' | 'createdAt'>
  ): Promise<z.infer<typeof ZSupplier>>;
  updateSupplier(
    id: string,
    input: Partial<z.infer<typeof ZSupplier>>
  ): Promise<z.infer<typeof ZSupplier>>;
  deleteSupplier(id: string): Promise<{ ok: true }>;

  listPOs(): Promise<Array<z.infer<typeof ZPurchaseOrder>>>;
  submitPO(id: string): Promise<z.infer<typeof ZPurchaseOrder>>;
  approvePO(id: string): Promise<z.infer<typeof ZPurchaseOrder>>;
};
