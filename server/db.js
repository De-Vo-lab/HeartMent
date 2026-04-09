import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'heartmend.db');

const db = new Database(dbPath, { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    partnerName TEXT,
    duration TEXT,
    whoEnded TEXT,
    story TEXT,
    feeling TEXT,
    need TEXT,
    mode TEXT,
    createdAt INTEGER
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sessionId TEXT,
    role TEXT,
    content TEXT,
    timestamp INTEGER,
    FOREIGN KEY(sessionId) REFERENCES sessions(id)
  );
`);

export default db;
