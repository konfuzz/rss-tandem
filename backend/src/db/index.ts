import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema.js';

const sqlite = new BetterSqlite3('sqlite.db');
export const db = drizzle(sqlite, { schema });
