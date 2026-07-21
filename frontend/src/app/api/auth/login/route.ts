import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  await initDB();
  const { email, name, password } = await request.json();
  try {
    const pool = getPool();
    let userResult = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    let user = userResult.rows[0];
    if (!user) {
      const result = await pool.query(
        'INSERT INTO Users (email, name, password_hash, provider) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, name || email.split('@')[0], password, 'local']
      );
      user = result.rows[0];
    } else {
      if (user.password_hash !== password) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    }
    const token = generateToken(user);
    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, provider: user.provider } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
