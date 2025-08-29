import { z } from "zod";
import type { ERPAdapter, ERPAdapterID } from "./adapter.types";
import type { Supplier, Item, PurchaseOrder, Pagination, ListResponse } from "../mapping/common.types";
import { ZPagination, ZPurchaseOrder } from "../mapping/common.types";
import { ValidationError, NotImplementedError } from "./adapter.types";

/**
 * Microsoft Dynamics 365 Business Central Adapter (Stub Implementation)
 * 
 * Intended Integration:
 * - Business Central API v2.0
 * - OAuth 2.0 authentication
 * - Rate limiting: 6,000 requests per 5 minutes per user
 * 
 * Key API Endpoints (when implemented):
 * - GET /companies({id})/vendors - List vendors
 * - GET /companies({id})/items - List items
 * - GET /companies({id})/purchaseOrders - List purchase orders
 * - POST /companies({id})/purchaseOrders - Create purchase order
 */
class DynamicsBCAdapter implements ERPAdapter {
  id: ERPAdapterID = "dynamics-bc";
  name = "Dynamics 365 Business Central Adapter";
  
  private config: {
    tenantId?: string;
    clientId?: string;
    clientSecret?: string;
    environment?: string;
    companyId?: string;
  } = {};

  configure(env: Record<string, string | undefined>): void {
    this.config = {
      tenantId: env.DYNAMICS_BC_TENANT,
      clientId: env.DYNAMICS_BC_CLIENT_ID,
      clientSecret: env.DYNAMICS_BC_CLIENT_SECRET,
      environment: env.DYNAMICS_BC_ENVIRONMENT || 'production',
      companyId: env.DYNAMICS_BC_COMPANY_ID,
    };
  }

  async health(): Promise<{ ok: boolean; message?: string }> {
    if (!this.config.tenantId || !this.config.clientId) {
      return { 
        ok: false, 
        message: "Dynamics BC adapter not configured: missing required OAuth credentials" 
      };
    }
    
    throw new NotImplementedError(
      this.name,
      "health",
      "Live Dynamics BC integration not implemented. Use mock adapter for testing."
    );
  }

  normalize<T>(input: unknown, schema: z.ZodType<T>): T {
    try {
      return schema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          `Validation failed: ${error.errors.map(e => e.message).join(', ')}`,
          error.errors
        );
      }
      throw new ValidationError('Unknown validation error', error);
    }
  }

  async listSuppliers(pagination?: Pagination): Promise<ListResponse<Supplier>> {
    const validated = pagination ? this.normalize(pagination, ZPagination) : {};
    throw new NotImplementedError(
      this.name, 
      "listSuppliers", 
      "Would query Business Central API /companies({id})/vendors"
    );
  }

  async listItems(pagination?: Pagination): Promise<ListResponse<Item>> {
    const validated = pagination ? this.normalize(pagination, ZPagination) : {};
    throw new NotImplementedError(
      this.name, 
      "listItems", 
      "Would query Business Central API /companies({id})/items"
    );
  }

  async listPurchaseOrders(pagination?: Pagination): Promise<ListResponse<PurchaseOrder>> {
    const validated = pagination ? this.normalize(pagination, ZPagination) : {};
    throw new NotImplementedError(
      this.name, 
      "listPurchaseOrders", 
      "Would query Business Central API /companies({id})/purchaseOrders"
    );
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    throw new NotImplementedError(
      this.name, 
      "getPurchaseOrder", 
      `Would fetch Business Central purchase order ${id}`
    );
  }

  async createPurchaseOrder(po: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const validated = this.normalize(po, ZPurchaseOrder.partial());
    throw new NotImplementedError(
      this.name, 
      "createPurchaseOrder", 
      "Would create Business Central purchase order"
    );
  }

  async updatePurchaseOrder(id: string, patch: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const validated = this.normalize(patch, ZPurchaseOrder.partial());
    throw new NotImplementedError(
      this.name, 
      "updatePurchaseOrder", 
      `Would update Business Central purchase order ${id}`
    );
  }
}

export const dynamicsBCAdapter = new DynamicsBCAdapter();






