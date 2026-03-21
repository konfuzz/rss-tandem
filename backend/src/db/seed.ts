import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { questions } from './schema.js';
import fs from 'fs';

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

async function seed() {
  const rawData = fs.readFileSync('./data/questions.json', 'utf8');
  const data = JSON.parse(rawData);

  console.log('Seeding started...');

  for (const q of data) {
    await db.insert(questions).values({
      id: q.id,
      type: q.type,
      category: q.category,
      complexity: q.complexity,
      time: q.time,
      content: q.content,     // Теперь берем из вложенного объекта
      answerKey: q.answerKey  // И это тоже
    }).onConflictDoUpdate({
      target: questions.id,
      set: {
        type: q.type,
        category: q.category,
        complexity: q.complexity,
        time: q.time,
        content: q.content,
        answerKey: q.answerKey
      }
    });
  }
  console.log('✅ Done!');
}

seed();