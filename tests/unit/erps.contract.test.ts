import { describe, it, expect, beforeEach } from "vitest";
import { mockAdapter } from "@/erps/adapters/mock.adapter";
import { fileFixtureAdapter } from "@/erps/adapters/file-fixture.adapter";
import { epicorAdapter } from "@/erps/adapters/epicor.adapter";
import { ZSupplier, ZItem, ZPurchaseOrder } from "@/erps/mapping/common.types";

describe("ERP Adapter Contract Tests", () => {
  describe("Mock Adapter", () => {
    beforeEach(() => {
      mockAdapter.configure({});
    });

    it("should return healthy status", async () => {
      const health = await mockAdapter.health();
      expect(health.ok).toBe(true);
    });

    it("should list suppliers with valid schema", async () => {
      const result = await mockAdapter.listSuppliers({ limit: 5 });
      
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.total).toBe("number");
      
      // Validate each supplier against schema
      result.data.forEach(supplier => {
        expect(() => ZSupplier.parse(supplier)).not.toThrow();
      });
    });

    it("should list items with valid schema", async () => {
      const result = await mockAdapter.listItems({ limit: 5 });
      
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.data)).toBe(true);
      
      result.data.forEach(item => {
        expect(() => ZItem.parse(item)).not.toThrow();
      });
    });

    it("should list purchase orders with valid schema", async () => {
      const result = await mockAdapter.listPurchaseOrders({ limit: 5 });
      
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.data)).toBe(true);
      
      result.data.forEach(po => {
        expect(() => ZPurchaseOrder.parse(po)).not.toThrow();
      });
    });

    it("should create and retrieve purchase order", async () => {
      const newPO = {
        number: "TEST-PO-001",
        supplierId: "supplier-1",
        status: "open" as const,
        currency: "USD",
        total: 1500.00,
      };

      const created = await mockAdapter.createPurchaseOrder(newPO);
      expect(created).toHaveProperty("id");
      expect(created.number).toBe(newPO.number);
      expect(created.total).toBe(newPO.total);

      const retrieved = await mockAdapter.getPurchaseOrder(created.id);
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.number).toBe(newPO.number);
    });

    it("should validate input with Zod schemas", async () => {
      // Test invalid pagination
      expect(async () => {
        await mockAdapter.listSuppliers({ limit: -1 });
      }).rejects.toThrow();

      // Test invalid purchase order creation
      expect(async () => {
        await mockAdapter.createPurchaseOrder({
          number: "", // Invalid empty string
          supplierId: "supplier-1",
          status: "open" as const,
          currency: "USD",
          total: -100, // Invalid negative total
        });
      }).rejects.toThrow();
    });
  });

  describe("File Fixture Adapter", () => {
    beforeEach(() => {
      fileFixtureAdapter.configure({});
    });

    it("should return healthy status", async () => {
      const health = await fileFixtureAdapter.health();
      expect(health.ok).toBe(true);
      expect(health.message).toContain("read-only");
    });

    it("should list suppliers from fixtures", async () => {
      const result = await fileFixtureAdapter.listSuppliers();
      
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("total");
      expect(result.data.length).toBeGreaterThan(0);
      
      // Validate schema compliance
      result.data.forEach(supplier => {
        expect(() => ZSupplier.parse(supplier)).not.toThrow();
      });
    });

    it("should throw NotImplemented for write operations", async () => {
      await expect(fileFixtureAdapter.createPurchaseOrder({
        number: "TEST-001",
        supplierId: "supplier-1",
        status: "open",
        currency: "USD",
        total: 1000,
      })).rejects.toThrow("NotImplementedError");
    });
  });

  describe("Epicor Adapter (Stub)", () => {
    beforeEach(() => {
      epicorAdapter.configure({
        EPICOR_BASE_URL: "https://test.epicor.com",
        EPICOR_API_KEY: "test-key",
      });
    });

    it("should validate configuration", async () => {
      // With valid config, health should throw NotImplemented (not config error)
      await expect(epicorAdapter.health()).rejects.toThrow("NotImplementedError");
      
      // Test configuration validation
      epicorAdapter.configure({});
      const health = await epicorAdapter.health().catch(e => ({ ok: false, message: e.message }));
      expect(health.ok).toBe(false);
      expect(health.message).toContain("not configured");
    });

    it("should validate input parameters even when not implemented", async () => {
      // Should validate input before throwing NotImplemented
      await expect(epicorAdapter.listSuppliers({ limit: -1 })).rejects.toThrow("Validation");
    });

    it("should provide clear NotImplemented messages", async () => {
      try {
        await epicorAdapter.listSuppliers();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("NotImplemented");
        expect((error as Error).message).toContain("Epicor");
      }
    });
  });
});

describe("ERP Adapter Validation", () => {
  it("should normalize data correctly", () => {
    const validSupplier = {
      id: "test-1",
      name: "Test Supplier",
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    const normalized = mockAdapter.normalize(validSupplier, ZSupplier);
    expect(normalized).toEqual(validSupplier);
  });

  it("should throw ValidationError for invalid data", () => {
    const invalidSupplier = {
      id: "",
      name: "",
      status: "invalid-status",
    };

    expect(() => {
      mockAdapter.normalize(invalidSupplier, ZSupplier);
    }).toThrow("ValidationError");
  });
});






