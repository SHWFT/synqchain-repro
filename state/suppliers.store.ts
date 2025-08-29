import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";

export interface Supplier {
  id: string;
  name: string;
  category?: string;
  region?: string;
  currency?: string;
  status: "active" | "inactive" | "pending";
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

interface SuppliersState {
  suppliers: Supplier[];
  isLoading: boolean;
  loadSuppliers: () => void;
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  getSupplier: (id: string) => Supplier | undefined;
}

const defaultSuppliers: Supplier[] = [
  {
    id: "supp-1",
    name: "Industrial Solutions Inc",
    category: "Manufacturing",
    region: "North America",
    currency: "USD",
    status: "active",
    contactEmail: "contact@industrialsolutions.com",
    contactPhone: "+1-555-0123",
    address: "123 Industrial Blvd, Detroit, MI 48201",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
  },
  {
    id: "supp-2",
    name: "TechSource Global",
    category: "IT & Technology",
    region: "Global",
    currency: "USD",
    status: "active",
    contactEmail: "procurement@techsource.com",
    contactPhone: "+1-555-0456",
    address: "456 Tech Park, San Jose, CA 95110",
    createdAt: "2024-01-12T11:00:00Z",
    updatedAt: "2024-02-01T09:15:00Z",
  },
  {
    id: "supp-3",
    name: "European Logistics Ltd",
    category: "Logistics",
    region: "Europe",
    currency: "EUR",
    status: "pending",
    contactEmail: "info@eurolog.eu",
    contactPhone: "+44-20-7946-0958",
    address: "789 Warehouse St, London, UK",
    createdAt: "2024-02-05T08:00:00Z",
    updatedAt: "2024-02-05T08:00:00Z",
  },
];

export const useSuppliersStore = create<SuppliersState>()(
  persist(
    (set, get) => ({
      suppliers: [],
      isLoading: false,

      loadSuppliers: () => {
        set({ isLoading: true });
        // Simulate API call
        setTimeout(() => {
          const existingSuppliers = get().suppliers;
          if (existingSuppliers.length === 0) {
            set({ suppliers: defaultSuppliers, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        }, 100);
      },

      addSupplier: (supplierData) => {
        const newSupplier: Supplier = {
          ...supplierData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          suppliers: [...state.suppliers, newSupplier],
        }));
      },

      updateSupplier: (id, updates) => {
        set((state) => ({
          suppliers: state.suppliers.map((supplier) =>
            supplier.id === id
              ? { ...supplier, ...updates, updatedAt: new Date().toISOString() }
              : supplier
          ),
        }));
      },

      deleteSupplier: (id) => {
        set((state) => ({
          suppliers: state.suppliers.filter((supplier) => supplier.id !== id),
        }));
      },

      getSupplier: (id) => {
        return get().suppliers.find((supplier) => supplier.id === id);
      },
    }),
    {
      name: "synqchain-suppliers",
    }
  )
);