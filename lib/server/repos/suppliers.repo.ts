import { getDB } from "../db";

export interface Supplier {
  id: string;
  name: string;
  category?: string;
  region?: string;
  currency?: string;
  status: string;
  rating?: number;
  leadTimeDays?: number;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierInput {
  name: string;
  category?: string;
  region?: string;
  currency?: string;
  status?: string;
  rating?: number;
  leadTimeDays?: number;
  tags?: string[];
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {}

export interface ListSuppliersInput {
  page: number;
  pageSize: number;
  search?: string;
}

export class SuppliersRepo {
  private db = getDB();

  constructor() {
    // Ensure the table exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        region TEXT,
        currency TEXT,
        status TEXT DEFAULT 'Active',
        rating REAL,
        leadTimeDays INTEGER,
        tags TEXT DEFAULT '[]',
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      )
    `);
  }

  list({ page, pageSize, search }: ListSuppliersInput) {
    const offset = (page - 1) * pageSize;
    
    let query = `
      SELECT * FROM suppliers 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (name LIKE ? OR category LIKE ? OR region LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY name ASC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    const data = this.db.prepare(query).all(...params) as Supplier[];
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM suppliers WHERE 1=1`;
    const countParams: any[] = [];
    
    if (search) {
      countQuery += ` AND (name LIKE ? OR category LIKE ? OR region LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    const { total } = this.db.prepare(countQuery).get(...countParams) as { total: number };

    return {
      data: data.map(s => ({ ...s, tags: JSON.parse(s.tags || '[]') })),
      pagination: {
        page,
        pageSize,
        total,
      }
    };
  }

  create(input: CreateSupplierInput): Supplier {
    const id = `sup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO suppliers (id, name, category, region, currency, status, rating, leadTimeDays, tags, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      input.name,
      input.category || null,
      input.region || null,
      input.currency || null,
      input.status || 'Active',
      input.rating || null,
      input.leadTimeDays || null,
      JSON.stringify(input.tags || []),
      now,
      now
    );

    return this.findById(id)!;
  }

  findById(id: string): Supplier | null {
    const stmt = this.db.prepare(`SELECT * FROM suppliers WHERE id = ?`);
    const supplier = stmt.get(id) as Supplier | undefined;
    
    if (!supplier) return null;
    
    return {
      ...supplier,
      tags: JSON.parse(supplier.tags || '[]')
    };
  }

  update(id: string, patch: UpdateSupplierInput): Supplier | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(patch).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'tags') {
          updates.push(`${key} = ?`);
          params.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = ?`);
          params.push(value);
        }
      }
    });

    if (updates.length === 0) return existing;

    updates.push('updatedAt = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE suppliers 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...params);
    return this.findById(id);
  }

  remove(id: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM suppliers WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
