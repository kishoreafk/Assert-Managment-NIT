import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    const { password } = (await req.json()) as { password?: string };
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [password_hash, id]
    );

    const affectedRows = (result as { affectedRows?: number }).affectedRows ?? 0;
    if (affectedRows === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to reset password', details }, { status: 500 });
  }
}
