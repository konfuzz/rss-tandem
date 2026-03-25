import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';

import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { RegisterSchema } from '../../types/schemas.js';

export async function register(req: Request, res: Response) {
  const result = RegisterSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
      success: false
    });
  }

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
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Такой пользователь уже существует' });
      }
    }

    res.status(500).json({ error: 'Что-то пошло не так при регистрации' });
  }
}
