import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { SignJWT } from 'jose';

import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const secret = new TextEncoder().encode(JWT_SECRET);

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

    const token = await new SignJWT({ userId: String(user.id) })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

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
