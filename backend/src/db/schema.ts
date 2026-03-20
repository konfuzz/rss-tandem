import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password'),
  username: text('username').notNull(),
  provider: text('provider').default('local'),
  createdAt: text('created_at').default(new Date().toISOString()),
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