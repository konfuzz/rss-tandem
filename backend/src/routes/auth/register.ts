import { Request, Response } from 'express';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import bcrypt from 'bcryptjs';

export async function register(req: Request, res: Response) {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.insert(users).values({
      username,
      password: hashedPassword,
    }).returning();

    res.json({ success: true, message: 'Welcome to InterVue!' });
  } catch (e) {
    res.status(400).json({ error: 'Username already taken' });
  }
}