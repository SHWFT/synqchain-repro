import { getDB } from "../db";

export interface Project {
  id: string;
  name: string;
  description?: string;
  client?: string;
  priority?: string;
  savingsTarget?: number;
  startDate?: string;
  dueDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  client?: string;
  priority?: string;
  savingsTarget?: number;
  startDate?: string;
  dueDate?: string;
  status?: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}

export interface ListProjectsInput {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}

export class ProjectsRepo {
  private db = getDB();

  constructor() {
    // Ensure the table exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        client TEXT,
        priority TEXT,
        savingsTarget REAL,
        startDate TEXT,
        dueDate TEXT,
        status TEXT DEFAULT 'Planning',
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      )
    `);
  }

  list({ page, pageSize, search, status }: ListProjectsInput) {
    const offset = (page - 1) * pageSize;
    
    let query = `
      SELECT * FROM projects 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ? OR client LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    const data = this.db.prepare(query).all(...params) as Project[];
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM projects WHERE 1=1`;
    const countParams: any[] = [];
    
    if (search) {
      countQuery += ` AND (name LIKE ? OR description LIKE ? OR client LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
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

  create(input: CreateProjectInput): Project {
    const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO projects (id, name, description, client, priority, savingsTarget, startDate, dueDate, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      input.name,
      input.description || null,
      input.client || null,
      input.priority || null,
      input.savingsTarget || null,
      input.startDate || null,
      input.dueDate || null,
      input.status || 'Planning',
      now,
      now
    );

    return this.findById(id)!;
  }

  findById(id: string): Project | null {
    const stmt = this.db.prepare(`SELECT * FROM projects WHERE id = ?`);
    return stmt.get(id) as Project | null;
  }

  update(id: string, patch: UpdateProjectInput): Project | null {
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
      UPDATE projects 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...params);
    return this.findById(id);
  }

  remove(id: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM projects WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
