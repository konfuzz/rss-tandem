import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';

import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';

export async function register(req: Request, res: Response) {
  const { password, username } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db
      .insert(users)
      .values({
        password: hashedPassword,
        username,
      })
      .returning();

    res.json({ message: 'Welcome to InterVue!', success: true });
  } catch {
    res.status(400).json({ error: 'Username already taken' });
  }
}
