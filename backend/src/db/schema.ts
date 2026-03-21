import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  password: text('password'),
  username: text('username').notNull().unique(),
  provider: text('provider').default('local'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey(),
  type: text('type').notNull(),
  category: text('category').notNull(),
  complexity: text('complexity').notNull(),
  time: integer('time').notNull(),
  content: text('content', { mode: 'json' }).notNull(),
  answerKey: text('answer_key', { mode: 'json' }).notNull(),
});

export const quizResults = sqliteTable('quiz_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => users.id),
  complexity: text('complexity').notNull(),
  totalScore: integer('total_score').notNull(),
  totalDuration: integer('total_duration').notNull(),
  details: text('details', { mode: 'json' }).notNull(),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});