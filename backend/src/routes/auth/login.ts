import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';

import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function login(req: Request, res: Response) {
  const { password, username } = req.body;

  try {
    const [user] = await db.select().from(users).where(eq(users.username, username));

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    const isPasswordValid = user.password ? await bcrypt.compare(password, user.password) : false;

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    const token = sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        provider: user.provider,
        username: user.username,
      },
    });
  } catch {
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
}
