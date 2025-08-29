import { getDB } from "../db";

export type POStatus = 
  | "DRAFT" 
  | "PENDING_APPROVAL" 
  | "APPROVED" 
  | "ACKNOWLEDGED" 
  | "IN_FULFILLMENT"
  | "SHIPPED" 
  | "DELIVERED" 
  | "INVOICED" 
  | "PAID" 
  | "CLOSED";

export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId?: string;
  status: POStatus;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePOInput {
  number: string;
  supplierId?: string;
  status?: POStatus;
  total?: number;
  currency?: string;
}

export interface UpdatePOInput extends Partial<CreatePOInput> {}

export interface ListPOInput {
  page: number;
  pageSize: number;
  status?: POStatus;
  supplierId?: string;
}

export interface POEvent {
  id: string;
  poId: string;
  type: string;
  payload: any;
  createdAt: string;
}

export class PORepo {
  private db = getDB();

  constructor() {
    // Ensure the tables exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id TEXT PRIMARY KEY,
        number TEXT NOT NULL UNIQUE,
        supplierId TEXT,
        status TEXT DEFAULT 'DRAFT',
        total REAL DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS po_events (
        id TEXT PRIMARY KEY,
        poId TEXT NOT NULL,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (poId) REFERENCES purchase_orders (id)
      )
    `);
  }

  list({ page, pageSize, status, supplierId }: ListPOInput) {
    const offset = (page - 1) * pageSize;
    
    let query = `
      SELECT * FROM purchase_orders 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (supplierId) {
      query += ` AND supplierId = ?`;
      params.push(supplierId);
    }

    query += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    const data = this.db.prepare(query).all(...params) as PurchaseOrder[];
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM purchase_orders WHERE 1=1`;
    const countParams: any[] = [];
    
    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }

    if (supplierId) {
      countQuery += ` AND supplierId = ?`;
      countParams.push(supplierId);
    }
    
    const { total } = this.db.prepare(countQuery).get(...countParams) as { total: number };

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
      }
    };
  }

  create(input: CreatePOInput): PurchaseOrder {
    const id = `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO purchase_orders (id, number, supplierId, status, total, currency, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      input.number,
      input.supplierId || null,
      input.status || 'DRAFT',
      input.total || 0,
      input.currency || 'USD',
      now,
      now
    );

    // Create initial event
    this.createEvent(id, 'created', { 
      message: 'Purchase Order created',
      status: input.status || 'DRAFT'
    });

    return this.findById(id)!;
  }

  findById(id: string): PurchaseOrder | null {
    const stmt = this.db.prepare(`SELECT * FROM purchase_orders WHERE id = ?`);
    return stmt.get(id) as PurchaseOrder | null;
  }

  update(id: string, patch: UpdatePOInput): PurchaseOrder | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(patch).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (updates.length === 0) return existing;

    updates.push('updatedAt = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE purchase_orders 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...params);

    // Create update event if status changed
    if (patch.status && patch.status !== existing.status) {
      this.createEvent(id, 'status_changed', {
        message: `Status changed from ${existing.status} to ${patch.status}`,
        previousStatus: existing.status,
        newStatus: patch.status
      });
    }

    return this.findById(id);
  }

  submit(id: string, notes?: string): PurchaseOrder | null {
    const existing = this.findById(id);
    if (!existing) return null;
    
    if (existing.status !== 'DRAFT') {
      throw new Error('Only DRAFT purchase orders can be submitted');
    }

    const updated = this.update(id, { status: 'PENDING_APPROVAL' });
    
    this.createEvent(id, 'submitted', {
      message: 'Purchase Order submitted for approval',
      notes,
      previousStatus: 'DRAFT',
      newStatus: 'PENDING_APPROVAL'
    });

    return updated;
  }

  approve(id: string, notes?: string): PurchaseOrder | null {
    const existing = this.findById(id);
    if (!existing) return null;
    
    if (existing.status !== 'PENDING_APPROVAL') {
      throw new Error('Only PENDING_APPROVAL purchase orders can be approved');
    }

    const updated = this.update(id, { status: 'APPROVED' });
    
    this.createEvent(id, 'approved', {
      message: 'Purchase Order approved',
      notes,
      previousStatus: 'PENDING_APPROVAL',
      newStatus: 'APPROVED'
    });

    return updated;
  }

  createEvent(poId: string, type: string, payload: any): POEvent {
    const id = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO po_events (id, poId, type, payload, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, poId, type, JSON.stringify(payload), now);

    return {
      id,
      poId,
      type,
      payload,
      createdAt: now
    };
  }

  getEvents(poId: string, page: number = 1, pageSize: number = 20) {
    const offset = (page - 1) * pageSize;

    const data = this.db.prepare(`
      SELECT * FROM po_events 
      WHERE poId = ?
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `).all(poId, pageSize, offset) as POEvent[];

    const { total } = this.db.prepare(`
      SELECT COUNT(*) as total FROM po_events WHERE poId = ?
    `).get(poId) as { total: number };

    return {
      data: data.map(event => ({
        ...event,
        payload: JSON.parse(event.payload)
      })),
      pagination: {
        page,
        pageSize,
        total,
      }
    };
  }

  remove(id: string): boolean {
    // Remove events first
    this.db.prepare(`DELETE FROM po_events WHERE poId = ?`).run(id);
    
    // Remove PO
    const stmt = this.db.prepare(`DELETE FROM purchase_orders WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
