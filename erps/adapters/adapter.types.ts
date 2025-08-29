import type { Pagination, ListResponse, Supplier, Item, PurchaseOrder } from "../mapping/common.types";

export type ERPAdapterID = "mock" | "file-fixture" | "epicor" | "netsuite" | "sap-s4" | "dynamics-bc";

export interface ERPAdapter {
  id: ERPAdapterID;
  name: string;
  health(): Promise<{ ok: boolean; message?: string }>;

  listSuppliers(p: Pagination): Promise<ListResponse<Supplier>>;
  listItems(p: Pagination): Promise<ListResponse<Item>>;
  listPurchaseOrders(p: Pagination): Promise<ListResponse<PurchaseOrder>>;
}

export class ValidationError extends Error {}
export class NotImplementedError extends Error {}
