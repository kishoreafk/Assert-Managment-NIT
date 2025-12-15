import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2/promise';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }
    type UserRow = RowDataPacket & {
      id: number;
      name: string;
      email: string;
      password_hash: string;
      role: 'hod' | 'employee';
      created_at?: string;
    };

    const [users] = await pool.query<UserRow[]>('SELECT * FROM users WHERE email = ?', [email]);
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    // For now, just return user info (excluding password_hash)
    const { password_hash: _passwordHash, ...userInfo } = user;
    return NextResponse.json({ user: userInfo });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Login failed', details }, { status: 500 });
  }
} 