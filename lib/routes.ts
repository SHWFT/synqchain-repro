export const routes = {
  auth: {
    login: "/login",
  },
  app: {
    dashboard: "/dashboard",
    projects: "/projects",
    suppliers: "/suppliers",
    analytics: "/analytics",
    settings: "/settings",
    connectorPlayground: "/connector-playground",
    // PO Management routes
    po: "/po",
    poNew: "/po/new",
    poDetail: (id: string) => `/po/${id}`,
    approvals: "/approvals",
    supplierPortal: "/supplier-portal",
  },
  api: {
    health: "/api/health",
    erp: {
      suppliers: "/api/erps/mock/suppliers",
      items: "/api/erps/mock/items",
      purchaseOrders: "/api/erps/mock/purchase-orders",
    },
    // PO Management APIs
    po: {
      health: "/api/po/health",
      list: "/api/po/list",
      create: "/api/po/create",
      get: (id: string) => `/api/po/${id}/get`,
      update: (id: string) => `/api/po/${id}/update`,
      cancel: (id: string) => `/api/po/${id}/cancel`,
      acknowledge: (id: string) => `/api/po/${id}/acknowledge`,
      changeRequest: (id: string) => `/api/po/${id}/change/request`,
      changeApprove: (id: string, changeId: string) => `/api/po/${id}/change/${changeId}/approve`,
      // ASN routes
      asnList: (id: string) => `/api/po/${id}/asn/list`,
      asnCreate: (id: string) => `/api/po/${id}/asn/create`,
      // Receipt routes
      receiptList: (id: string) => `/api/po/${id}/receipt/list`,
      receiptCreate: (id: string) => `/api/po/${id}/receipt/create`,
      // Invoice routes
      invoiceList: (id: string) => `/api/po/${id}/invoice/list`,
      invoiceCreate: (id: string) => `/api/po/${id}/invoice/create`,
      invoiceMatch: (invId: string) => `/api/po/invoice/${invId}/match`,
    },
  },
} as const;
