import { z } from "zod";
import type { 
  ERPAdapter, 
  ERPAdapterID 
} from "./adapter.types";
import type { 
  Supplier, 
  Item, 
  PurchaseOrder, 
  Pagination, 
  ListResponse 
} from "../mapping/common.types";
import { 
  ZSupplier, 
  ZItem, 
  ZPurchaseOrder,
  ZPagination 
} from "../mapping/common.types";
import { ValidationError, NotImplementedError } from "./adapter.types";

/**
 * Epicor ERP Adapter (Stub Implementation)
 * 
 * Intended Integration:
 * - REST API endpoints via Epicor REST Services
 * - BAQ (Business Activity Query) for custom data access
 * - Authentication: API Key or OAuth 2.0
 * - Rate limiting: Respect Epicor's API rate limits
 * 
 * Key Endpoints (when implemented):
 * - GET /api/v1/Erp.BO.VendorSvc/Vendors - List suppliers
 * - GET /api/v1/Erp.BO.PartSvc/Parts - List items/parts
 * - GET /api/v1/Erp.BO.POSvc/POs - List purchase orders
 * - POST /api/v1/Erp.BO.POSvc/POs - Create purchase order
 * 
 * Mapping Notes:
 * - Vendor.VendorID -> Supplier.id
 * - Vendor.Name -> Supplier.name
 * - Part.PartNum -> Item.sku
 * - POHeader.PONum -> PurchaseOrder.number
 */
class EpicorAdapter implements ERPAdapter {
  id: ERPAdapterID = "epicor";
  name = "Epicor ERP Adapter";
  
  private config: {
    baseUrl?: string;
    apiKey?: string;
    company?: string;
  } = {};

  configure(env: Record<string, string | undefined>): void {
    this.config = {
      baseUrl: env.EPICOR_BASE_URL,
      apiKey: env.EPICOR_API_KEY,
      company: env.EPICOR_COMPANY || 'EPIC06'
    };
  }

  async health(): Promise<{ ok: boolean; message?: string }> {
    if (!this.config.baseUrl || !this.config.apiKey) {
      return { 
        ok: false, 
        message: "Epicor adapter not configured: missing EPICOR_BASE_URL or EPICOR_API_KEY" 
      };
    }
    
    // TODO: Implement actual health check by calling Epicor's health endpoint
    throw new NotImplementedError(
      this.name,
      "health",
      "Live Epicor integration not implemented. Configure mock or file-fixture adapter for testing."
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
    // Validate input parameters
    const validated = pagination ? this.normalize(pagination, ZPagination) : {};
    
    throw new NotImplementedError(
      this.name,
      "listSuppliers",
      "Would call GET /api/v1/Erp.BO.VendorSvc/Vendors with pagination and map Vendor records to Supplier schema"
    );
  }

  async listItems(pagination?: Pagination): Promise<ListResponse<Item>> {
    const validated = pagination ? this.normalize(pagination, ZPagination) : {};
    
    throw new NotImplementedError(
      this.name,
      "listItems", 
      "Would call GET /api/v1/Erp.BO.PartSvc/Parts with pagination and map Part records to Item schema"
    );
  }

  async listPurchaseOrders(pagination?: Pagination): Promise<ListResponse<PurchaseOrder>> {
    const validated = pagination ? this.normalize(pagination, ZPagination) : {};
    
    throw new NotImplementedError(
      this.name,
      "listPurchaseOrders",
      "Would call GET /api/v1/Erp.BO.POSvc/POs with pagination and map POHeader records to PurchaseOrder schema"
    );
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    throw new NotImplementedError(
      this.name,
      "getPurchaseOrder",
      `Would call GET /api/v1/Erp.BO.POSvc/POs('${id}') and map POHeader to PurchaseOrder schema`
    );
  }

  async createPurchaseOrder(po: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    // Validate input
    const validated = this.normalize(po, ZPurchaseOrder.partial());
    
    throw new NotImplementedError(
      this.name,
      "createPurchaseOrder",
      "Would call POST /api/v1/Erp.BO.POSvc/POs with mapped PurchaseOrder data to Epicor POHeader format"
    );
  }

  async updatePurchaseOrder(id: string, patch: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const validated = this.normalize(patch, ZPurchaseOrder.partial());
    
    throw new NotImplementedError(
      this.name,
      "updatePurchaseOrder",
      `Would call PATCH /api/v1/Erp.BO.POSvc/POs('${id}') with mapped data`
    );
  }

  /**
   * Future implementation helpers for Epicor-specific mapping
   */
  private mapVendorToSupplier(vendor: any): Supplier {
    // Example mapping logic for when live integration is implemented
    return {
      id: vendor.VendorID,
      name: vendor.Name,
      category: vendor.PurPoint, // Primary purchase point
      region: vendor.Country,
      currency: vendor.CurrencyCode,
      status: vendor.Inactive ? 'inactive' : 'active',
      createdAt: vendor.SysDate || new Date().toISOString(),
      updatedAt: vendor.SysDate || new Date().toISOString()
    };
  }

  private mapPartToItem(part: any): Item {
    return {
      id: part.PartNum,
      sku: part.PartNum,
      description: part.PartDescription,
      uom: part.IUM, // Inventory Unit of Measure
      price: part.StdUnitCost || 0,
      currency: 'USD' // Would need to be derived from company settings
    };
  }

  private mapPOHeaderToPurchaseOrder(poHeader: any): PurchaseOrder {
    return {
      id: poHeader.PONum.toString(),
      number: poHeader.PONum.toString(),
      supplierId: poHeader.VendorID,
      status: this.mapEpicorPOStatus(poHeader.OpenOrder, poHeader.VoidOrder),
      currency: poHeader.CurrencyCode,
      total: poHeader.DocTotalOrder || 0,
      createdAt: poHeader.OrderDate || new Date().toISOString(),
      updatedAt: poHeader.SysDate || new Date().toISOString()
    };
  }

  private mapEpicorPOStatus(openOrder: boolean, voidOrder: boolean): PurchaseOrder['status'] {
    if (voidOrder) return 'cancelled';
    if (openOrder) return 'open';
    return 'closed';
  }
}

export const epicorAdapter = new EpicorAdapter();






