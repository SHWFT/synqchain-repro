import type { ERPAdapter } from "./adapter.types";
import { ZPagination, type Pagination, type ListResponse } from "../mapping/common.types";
import suppliers from "../fixtures/suppliers.list.json";
import items from "../fixtures/items.list.json";
import pos from "../fixtures/po.list.json";

function paginate<T>(arr: T[], { page=1, pageSize=10 }: Pagination): ListResponse<T> {
  const start = (page-1)*pageSize, end = start + pageSize;
  return { data: arr.slice(start, end), pagination: { page, pageSize, total: arr.length } };
}

export const mockAdapter: ERPAdapter = {
  id: "mock",
  name: "Mock Adapter",
  async health(){ return { ok: true }; },
  async listSuppliers(p){ return paginate(suppliers.data, ZPagination.parse(p)); },
  async listItems(p){ return paginate(items.data, ZPagination.parse(p)); },
  async listPurchaseOrders(p){ return paginate(pos.data, ZPagination.parse(p)); },
};
