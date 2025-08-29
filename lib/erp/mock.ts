import { randomUUID } from 'node:crypto';
import { Adapter } from './adapter';
import { ZKpisResponse } from '../contracts/kpis';
import {
  ZProject,
  ZSupplier,
  ZPurchaseOrder,
  ZActivityItem,
  ZERPHealth,
} from '../contracts/core';

const SEED = process.env.MOCK_SEED === '1';

type DB = {
  projects: Array<ReturnType<typeof ZProject.parse>>;
  suppliers: Array<ReturnType<typeof ZSupplier.parse>>;
  pos: Array<ReturnType<typeof ZPurchaseOrder.parse>>;
  activity: Array<ReturnType<typeof ZActivityItem.parse>>;
  erp: ReturnType<typeof ZERPHealth.parse>;
  kpis: ReturnType<typeof ZKpisResponse.parse>;
};

const db: DB = {
  projects: [],
  suppliers: [],
  pos: [],
  activity: [],
  erp: [],
  kpis: {
    cards: {
      totalSpend: 0,
      platformSavings: 0,
      activeProjects: 0,
      activeSuppliers: 0,
    },
    series: {
      projectsCompletedMonthly: { labels: [], values: [] },
      savingsMonthly: { labels: [], values: [] },
    },
  },
};

if (SEED) {
  const now = new Date().toISOString();
  db.projects = [
    ZProject.parse({
      id: randomUUID(),
      name: 'Manufacturing Equipment Procurement',
      status: 'in-progress',
      budget: 250000,
      createdAt: now,
    }),
    ZProject.parse({
      id: randomUUID(),
      name: 'IT Infrastructure Upgrade',
      status: 'in-progress',
      budget: 120000,
      createdAt: now,
    }),
  ];
  db.suppliers = [
    ZSupplier.parse({
      id: randomUUID(),
      name: 'TechSource Global',
      status: 'active',
      createdAt: now,
    }),
    ZSupplier.parse({
      id: randomUUID(),
      name: 'Acme Manufacturing',
      status: 'active',
      createdAt: now,
    }),
  ];
  db.pos = [
    ZPurchaseOrder.parse({
      id: randomUUID(),
      amount: 8300,
      status: 'submitted',
      createdAt: now,
    }),
  ];
  db.activity = [
    ZActivityItem.parse({
      id: randomUUID(),
      kind: 'project',
      title:
        'Manufacturing Equipment Procurement project updated with new savings target',
      date: now,
    }),
    ZActivityItem.parse({
      id: randomUUID(),
      kind: 'supplier',
      title: 'New supplier TechSource Global added to the platform',
      date: now,
    }),
    ZActivityItem.parse({
      id: randomUUID(),
      kind: 'system',
      title: 'ERP integration health check completed successfully',
      date: now,
    }),
  ];
  db.erp = [
    { name: 'Epicor', status: 'connected' },
    { name: 'NetSuite', status: 'mock' },
    { name: 'SAP S/4HANA', status: 'mock' },
    { name: 'Dynamics BC', status: 'mock' },
  ];
  db.kpis = {
    cards: {
      totalSpend: 425000,
      platformSavings: 35200,
      activeProjects: db.projects.length,
      activeSuppliers: db.suppliers.length,
    },
    series: {
      projectsCompletedMonthly: {
        labels: ['Jan', 'Feb', 'Mar'],
        values: [1, 3, 2],
      },
      savingsMonthly: {
        labels: ['Jan', 'Feb', 'Mar'],
        values: [3000, 12000, 20200],
      },
    },
  };
}

export const mockAdapter: Adapter = {
  async getKpis() {
    return db.kpis;
  },
  async getActivity() {
    return db.activity;
  },
  async getERPHealth() {
    return db.erp;
  },

  async listProjects() {
    return db.projects;
  },
  async getProject(id) {
    return db.projects.find((p) => p.id === id) ?? null;
  },
  async createProject(input) {
    const p = ZProject.parse({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    });
    db.projects.push(p);
    return p;
  },
  async updateProject(id, input) {
    const i = db.projects.findIndex((p) => p.id === id);
    if (i < 0) throw new Error('not found');
    db.projects[i] = { ...db.projects[i], ...input };
    return db.projects[i];
  },
  async deleteProject(id) {
    db.projects = db.projects.filter((p) => p.id !== id);
    return { ok: true };
  },

  async listSuppliers() {
    return db.suppliers;
  },
  async createSupplier(input) {
    const s = ZSupplier.parse({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    });
    db.suppliers.push(s);
    return s;
  },
  async updateSupplier(id, input) {
    const i = db.suppliers.findIndex((s) => s.id === id);
    if (i < 0) throw new Error('not found');
    db.suppliers[i] = { ...db.suppliers[i], ...input };
    return db.suppliers[i];
  },
  async deleteSupplier(id) {
    db.suppliers = db.suppliers.filter((s) => s.id !== id);
    return { ok: true };
  },

  async listPOs() {
    return db.pos;
  },
  async submitPO(id) {
    const po = db.pos.find((x) => x.id === id);
    if (!po) throw new Error('not found');
    po.status = 'submitted';
    return po;
  },
  async approvePO(id) {
    const po = db.pos.find((x) => x.id === id);
    if (!po) throw new Error('not found');
    po.status = 'approved';
    return po;
  },
};
