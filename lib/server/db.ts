import Database from "better-sqlite3";

let db: Database.Database | null = null;

export function getDB() {
  if (!db) {
    db = new Database(process.env.SQLITE_DB_PATH || "./prisma/dev.db", { fileMustExist: true });
    db.pragma("journal_mode = WAL");
  }
  return db;
}
