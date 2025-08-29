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

class FileFixtureAdapter implements ERPAdapter {
  id: ERPAdapterID = "file-fixture";
  name = "File Fixture Adapter";
  
  private fixtures: {
    suppliers: Supplier[];
    items: Item[];
    purchaseOrders: PurchaseOrder[];
  } = {
    suppliers: [],
    items: [],
    purchaseOrders: []
  };

  constructor() {
    this.loadFixtures();
  }

  configure(env: Record<string, string | undefined>): void {
    // File fixture adapter doesn't need configuration
  }

  async health(): Promise<{ ok: boolean; message?: string }> {
    return { 
      ok: true, 
      message: "File fixture adapter ready (read-only)" 
    };
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
    const { limit = 50, offset = 0 } = validated;
    
    const data = this.fixtures.suppliers.slice(offset, offset + limit);
    return {
      data,
      total: this.fixtures.suppliers.length
    };
  }

  async listItems(pagination?: Pagination): Promise<ListResponse<Item>> {
    const validated = pagination ? this.normalize(pagination, ZPagination) : {};
    const { limit = 50, offset = 0 } = validated;
    
    const data = this.fixtures.items.slice(offset, offset + limit);
    return {
      data,
      total: this.fixtures.items.length
    };
  }

  async listPurchaseOrders(pagination?: Pagination): Promise<ListResponse<PurchaseOrder>> {
    const validated = pagination ? this.normalize(pagination, ZPagination) : {};
    const { limit = 50, offset = 0 } = validated;
    
    const data = this.fixtures.purchaseOrders.slice(offset, offset + limit);
    return {
      data,
      total: this.fixtures.purchaseOrders.length
    };
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const po = this.fixtures.purchaseOrders.find(p => p.id === id);
    if (!po) {
      throw new Error(`Purchase order with ID ${id} not found in fixtures`);
    }
    return po;
  }

  async createPurchaseOrder(po: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    throw new NotImplementedError(
      this.name, 
      "createPurchaseOrder", 
      "File fixture adapter is read-only"
    );
  }

  async updatePurchaseOrder(id: string, patch: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    throw new NotImplementedError(
      this.name, 
      "updatePurchaseOrder", 
      "File fixture adapter is read-only"
    );
  }

  private async loadFixtures(): Promise<void> {
    // In a real implementation, this would load from JSON files
    // For now, we'll use hardcoded fixtures that match the expected format
    this.fixtures = {
      suppliers: [
        {
          id: 'fixture-supplier-1',
          name: 'Fixture Supplier Alpha',
          category: 'Manufacturing',
          region: 'Global',
          currency: 'USD',
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'fixture-supplier-2',
          name: 'Fixture Supplier Beta',
          category: 'Services',
          region: 'North America',
          currency: 'CAD',
          status: 'active',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        }
      ],
      items: [
        {
          id: 'fixture-item-1',
          sku: 'FIX-WIDGET-001',
          description: 'Fixture Test Widget',
          uom: 'EA',
          price: 10.00,
          currency: 'USD'
        },
        {
          id: 'fixture-item-2',
          sku: 'FIX-COMPONENT-002',
          description: 'Fixture Test Component',
          uom: 'PCS',
          price: 75.50,
          currency: 'USD'
        }
      ],
      purchaseOrders: [
        {
          id: 'fixture-po-1',
          number: 'FIX-PO-001',
          supplierId: 'fixture-supplier-1',
          status: 'open',
          currency: 'USD',
          total: 1000.00,
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z'
        }
      ]
    };
  }
}

export const fileFixtureAdapter = new FileFixtureAdapter();






