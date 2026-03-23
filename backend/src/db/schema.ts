import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  id: integer('id').primaryKey({ autoIncrement: true }),
  password: text('password'),
  provider: text('provider').default('local'),
  username: text('username').notNull().unique(),
});

export const questions = sqliteTable('questions', {
  answerKey: text('answer_key', { mode: 'json' }).notNull(),
  category: text('category').notNull(),
  complexity: text('complexity').notNull(),
  content: text('content', { mode: 'json' }).notNull(),
  id: integer('id').primaryKey(),
  time: integer('time').notNull(),
  type: text('type').notNull(),
});

export const quizResults = sqliteTable('quiz_results', {
  complexity: text('complexity').notNull(),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  details: text('details', { mode: 'json' }).notNull(),
  id: integer('id').primaryKey({ autoIncrement: true }),
  totalDuration: integer('total_duration').notNull(),
  totalScore: integer('total_score').notNull(),
  userId: text('user_id').references(() => users.id),
});
