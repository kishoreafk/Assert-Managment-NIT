import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users');
    return NextResponse.json(rows);
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Database error', details }, { status: 500 });
  }
} 