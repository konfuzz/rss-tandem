import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'fs';

import { questions } from './schema.js';

const sqlite = new BetterSqlite3('sqlite.db');
const db = drizzle(sqlite);

async function seed() {
  const rawData = fs.readFileSync('./data/questions.json', 'utf8');
  const data = JSON.parse(rawData);

  console.log('Seeding started...');

  for (const q of data) {
    await db
      .insert(questions)
      .values({
        answerKey: q.answerKey, // И это тоже
        category: q.category,
        complexity: q.complexity,
        content: q.content, // Теперь берем из вложенного объекта
        id: q.id,
        time: q.time,
        type: q.type,
      })
      .onConflictDoUpdate({
        set: {
          answerKey: q.answerKey,
          category: q.category,
          complexity: q.complexity,
          content: q.content,
          time: q.time,
          type: q.type,
        },
        target: questions.id,
      });
  }
  console.log('✅ Done!');
}

seed();
