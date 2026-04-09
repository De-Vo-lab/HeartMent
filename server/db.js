import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'heartmend.db');

const db = new Database(dbPath, { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    createdAt INTEGER
  );

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

// Safe migrations for existing SQLite database 
try {
  db.exec('ALTER TABLE sessions ADD COLUMN userId TEXT REFERENCES users(id);');
} catch (error) {
  // Column already exists
}

try {
  db.exec("ALTER TABLE sessions ADD COLUMN language TEXT DEFAULT 'English';");
} catch (error) {
  // Column already exists
}

export default db;
