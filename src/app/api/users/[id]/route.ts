import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    const affectedRows = (result as { affectedRows?: number }).affectedRows ?? 0;

    if (affectedRows === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to delete user', details }, { status: 500 });
  }
}
