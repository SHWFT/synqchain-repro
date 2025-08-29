import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  PurchaseOrder,
  POComment,
  ASN,
  Receipt,
  Invoice,
  ChangeOrder,
  POStatus,
} from '@/erps/mapping/common.types';
import { getItem, setItem } from '@/lib/storage';

// Store state interface
interface POState {
  // Data
  purchaseOrders: PurchaseOrder[];
  comments: POComment[];
  asns: ASN[];
  receipts: Receipt[];
  invoices: Invoice[];
  changeOrders: ChangeOrder[];

  // Loading states
  loading: boolean;
  error: string | null;

  // Filters
  filters: {
    status: POStatus[];
    supplierId: string;
    searchQuery: string;
  };

  // Actions
  setPurchaseOrders: (pos: PurchaseOrder[]) => void;
  addPurchaseOrder: (po: PurchaseOrder) => void;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => void;

  // Comments
  addComment: (comment: POComment) => void;
  getComments: (poId: string, lineId?: string) => POComment[];

  // ASNs
  addASN: (asn: ASN) => void;
  getASNs: (poId: string) => ASN[];

  // Receipts
  addReceipt: (receipt: Receipt) => void;
  getReceipts: (poId: string) => Receipt[];

  // Invoices
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  getInvoices: (poId: string) => Invoice[];

  // Change Orders
  addChangeOrder: (changeOrder: ChangeOrder) => void;
  updateChangeOrder: (id: string, updates: Partial<ChangeOrder>) => void;
  getChangeOrders: (poId: string) => ChangeOrder[];

  // Filters
  setFilters: (filters: Partial<POState['filters']>) => void;
  clearFilters: () => void;

  // Computed selectors
  getFilteredPOs: () => PurchaseOrder[];
  getPOById: (id: string) => PurchaseOrder | undefined;
  getMyApprovals: (userId: string) => PurchaseOrder[];
  getPOsBySupplier: (supplierId: string) => PurchaseOrder[];

  // Derived stats
  getTotalSpend: () => number;
  getOpenPOCount: () => number;
  getPendingApprovalsCount: (userId: string) => number;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetStore: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

// Default filters
const defaultFilters = {
  status: [] as POStatus[],
  supplierId: '',
  searchQuery: '',
};

// Create the store
export const usePOStore = create<POState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    purchaseOrders: [],
    comments: [],
    asns: [],
    receipts: [],
    invoices: [],
    changeOrders: [],
    loading: false,
    error: null,
    filters: defaultFilters,

    // Purchase Order actions
    setPurchaseOrders: (purchaseOrders) => set({ purchaseOrders }),

    addPurchaseOrder: (po) =>
      set((state) => ({
        purchaseOrders: [...state.purchaseOrders, po],
      })),

    updatePurchaseOrder: (id, updates) =>
      set((state) => ({
        purchaseOrders: state.purchaseOrders.map((po) =>
          po.id === id
            ? { ...po, ...updates, updatedAt: new Date().toISOString() }
            : po
        ),
      })),

    deletePurchaseOrder: (id) =>
      set((state) => ({
        purchaseOrders: state.purchaseOrders.filter((po) => po.id !== id),
      })),

    // Comments
    addComment: (comment) =>
      set((state) => ({
        comments: [...state.comments, comment],
      })),

    getComments: (poId, lineId) => {
      const { comments } = get();
      return comments
        .filter(
          (comment) =>
            comment.poId === poId &&
            (lineId ? comment.lineId === lineId : !comment.lineId)
        )
        .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    },

    // ASNs
    addASN: (asn) =>
      set((state) => ({
        asns: [...state.asns, asn],
      })),

    getASNs: (poId) => {
      const { asns } = get();
      return asns.filter((asn) => asn.poId === poId);
    },

    // Receipts
    addReceipt: (receipt) =>
      set((state) => ({
        receipts: [...state.receipts, receipt],
      })),

    getReceipts: (poId) => {
      const { receipts } = get();
      return receipts.filter((receipt) => receipt.poId === poId);
    },

    // Invoices
    addInvoice: (invoice) =>
      set((state) => ({
        invoices: [...state.invoices, invoice],
      })),

    updateInvoice: (id, updates) =>
      set((state) => ({
        invoices: state.invoices.map((invoice) =>
          invoice.id === id ? { ...invoice, ...updates } : invoice
        ),
      })),

    getInvoices: (poId) => {
      const { invoices } = get();
      return invoices.filter((invoice) => invoice.poId === poId);
    },

    // Change Orders
    addChangeOrder: (changeOrder) =>
      set((state) => ({
        changeOrders: [...state.changeOrders, changeOrder],
      })),

    updateChangeOrder: (id, updates) =>
      set((state) => ({
        changeOrders: state.changeOrders.map((co) =>
          co.id === id ? { ...co, ...updates } : co
        ),
      })),

    getChangeOrders: (poId) => {
      const { changeOrders } = get();
      return changeOrders.filter((co) => co.poId === poId);
    },

    // Filters
    setFilters: (newFilters) =>
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
      })),

    clearFilters: () => set({ filters: defaultFilters }),

    // Computed selectors
    getFilteredPOs: () => {
      const { purchaseOrders, filters } = get();

      return purchaseOrders.filter((po) => {
        // Status filter
        if (filters.status.length > 0 && !filters.status.includes(po.status)) {
          return false;
        }

        // Supplier filter
        if (filters.supplierId && po.supplierId !== filters.supplierId) {
          return false;
        }

        // Search query filter
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          const searchableText = [
            po.number,
            po.supplierName,
            po.buyer,
            po.requester,
          ]
            .join(' ')
            .toLowerCase();

          if (!searchableText.includes(query)) {
            return false;
          }
        }

        return true;
      });
    },

    getPOById: (id) => {
      const { purchaseOrders } = get();
      return purchaseOrders.find((po) => po.id === id);
    },

    getMyApprovals: (userId) => {
      const { purchaseOrders } = get();
      return purchaseOrders.filter(
        (po) => po.status === 'pending_approval' && po.buyer === userId
      );
    },

    getPOsBySupplier: (supplierId) => {
      const { purchaseOrders } = get();
      return purchaseOrders.filter((po) => po.supplierId === supplierId);
    },

    // Derived stats
    getTotalSpend: () => {
      const { purchaseOrders } = get();
      return purchaseOrders.reduce((total, po) => total + po.total, 0);
    },

    getOpenPOCount: () => {
      const { purchaseOrders } = get();
      return purchaseOrders.filter(
        (po) => !['received_closed', 'cancelled'].includes(po.status)
      ).length;
    },

    getPendingApprovalsCount: (userId) => {
      const { getMyApprovals } = get();
      return getMyApprovals(userId).length;
    },

    // Utility
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    resetStore: () =>
      set({
        purchaseOrders: [],
        comments: [],
        asns: [],
        receipts: [],
        invoices: [],
        changeOrders: [],
        loading: false,
        error: null,
        filters: defaultFilters,
      }),

    loadFromStorage: () => {
      try {
        const data = getItem('synqchain-po-data', null);
        if (data) {
          set({
            purchaseOrders: data.purchaseOrders || [],
            comments: data.comments || [],
            asns: data.asns || [],
            receipts: data.receipts || [],
            invoices: data.invoices || [],
            changeOrders: data.changeOrders || [],
          });
        }
      } catch (error) {
        console.error('Failed to load PO data from storage:', error);
      }
    },

    saveToStorage: () => {
      try {
        const {
          purchaseOrders,
          comments,
          asns,
          receipts,
          invoices,
          changeOrders,
        } = get();
        const data = {
          purchaseOrders,
          comments,
          asns,
          receipts,
          invoices,
          changeOrders,
          version: '1.0',
          timestamp: new Date().toISOString(),
        };
        setItem('synqchain-po-data', data);
      } catch (error) {
        console.error('Failed to save PO data to storage:', error);
      }
    },
  }))
);

// Auto-save to localStorage on changes
usePOStore.subscribe(
  (state) => state.purchaseOrders,
  () => {
    usePOStore.getState().saveToStorage();
  }
);

usePOStore.subscribe(
  (state) => state.comments,
  () => {
    usePOStore.getState().saveToStorage();
  }
);

usePOStore.subscribe(
  (state) => state.asns,
  () => {
    usePOStore.getState().saveToStorage();
  }
);

usePOStore.subscribe(
  (state) => state.receipts,
  () => {
    usePOStore.getState().saveToStorage();
  }
);

usePOStore.subscribe(
  (state) => state.invoices,
  () => {
    usePOStore.getState().saveToStorage();
  }
);

usePOStore.subscribe(
  (state) => state.changeOrders,
  () => {
    usePOStore.getState().saveToStorage();
  }
);

// Load seed data on first load
const loadSeedData = async () => {
  try {
    const stored = getItem('synqchain-po-data', null);
    if (!stored) {
      // Load seed data
      const [
        poData,
        asnData,
        receiptData,
        invoiceData,
        commentData,
        changeData,
      ] = await Promise.all([
        fetch('/data/seed/po/po.list.json')
          .then((r) => r.json())
          .catch(() => []),
        fetch('/data/seed/po/asn.list.json')
          .then((r) => r.json())
          .catch(() => []),
        fetch('/data/seed/po/receipt.list.json')
          .then((r) => r.json())
          .catch(() => []),
        fetch('/data/seed/po/invoice.list.json')
          .then((r) => r.json())
          .catch(() => []),
        fetch('/data/seed/po/comments.list.json')
          .then((r) => r.json())
          .catch(() => []),
        fetch('/data/seed/po/changes.list.json')
          .then((r) => r.json())
          .catch(() => []),
      ]);

      const state = usePOStore.getState();
      state.setPurchaseOrders(poData);
      state.asns = asnData;
      state.receipts = receiptData;
      state.invoices = invoiceData;
      state.comments = commentData;
      state.changeOrders = changeData;
      state.saveToStorage();

      console.log('🌱 Loaded PO seed data');
    } else {
      usePOStore.getState().loadFromStorage();
    }
  } catch (error) {
    console.error('Failed to load seed data:', error);
    usePOStore.getState().loadFromStorage();
  }
};

// Load initial data
if (typeof window !== 'undefined') {
  loadSeedData();
}
