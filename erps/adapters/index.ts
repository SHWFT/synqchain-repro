import type { ERPAdapter, ERPAdapterID } from "./adapter.types";
import { mockAdapter } from "./mock.adapter";
import { fileFixtureAdapter } from "./file-fixture.adapter";
import { epicorAdapter } from "./epicor.adapter";
import { netsuiteAdapter } from "./netsuite.adapter";
import { sapS4Adapter } from "./sap-s4.adapter";
import { dynamicsBCAdapter } from "./dynamics-bc.adapter";

const adapters: Record<ERPAdapterID, ERPAdapter> = {
  "mock": mockAdapter,
  "file-fixture": fileFixtureAdapter,
  "epicor": epicorAdapter,
  "netsuite": netsuiteAdapter,
  "sap-s4": sapS4Adapter,
  "dynamics-bc": dynamicsBCAdapter,
};

export function getERPAdapter(id?: ERPAdapterID): ERPAdapter {
  const adapterId = id || 
    (process.env.NEXT_PUBLIC_ERP_ADAPTER as ERPAdapterID) || 
    "file-fixture";
  
  const adapter = adapters[adapterId];
  
  if (!adapter) {
    throw new Error(
      `Unknown ERP adapter: ${adapterId}. Available adapters: ${Object.keys(adapters).join(', ')}`
    );
  }
  
  return adapter;
}

export function listAvailableAdapters(): { id: ERPAdapterID; name: string; configured: boolean }[] {
  return Object.entries(adapters).map(([id, adapter]) => ({
    id: id as ERPAdapterID,
    name: adapter.name,
    configured: id === "mock" || id === "file-fixture" ? true : isAdapterConfigured(id as ERPAdapterID)
  }));
}

function isAdapterConfigured(id: ERPAdapterID): boolean {
  const env = process.env;
  
  switch (id) {
    case "epicor":
      return !!(env.EPICOR_BASE_URL && env.EPICOR_API_KEY);
    case "netsuite":
      return !!(env.NETSUITE_ACCOUNT_ID && env.NETSUITE_CLIENT_ID && env.NETSUITE_CLIENT_SECRET);
    case "sap-s4":
      return !!(env.SAP_S4_BASE_URL && env.SAP_S4_USERNAME && env.SAP_S4_PASSWORD);
    case "dynamics-bc":
      return !!(env.DYNAMICS_BC_TENANT && env.DYNAMICS_BC_CLIENT_ID && env.DYNAMICS_BC_CLIENT_SECRET);
    default:
      return false;
  }
}

// Re-export types and adapters for convenience
export type { ERPAdapter, ERPAdapterID } from "./adapter.types";
export { 
  mockAdapter,
  fileFixtureAdapter,
  epicorAdapter,
  netsuiteAdapter,
  sapS4Adapter,
  dynamicsBCAdapter
};






