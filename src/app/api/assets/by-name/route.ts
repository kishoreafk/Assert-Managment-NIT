import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const item_name = searchParams.get('item_name');
    if (!item_name) {
      return NextResponse.json({ error: 'Missing item_name parameter' }, { status: 400 });
    }
    const [rows] = await pool.query('SELECT * FROM assets WHERE item_name = ?', [item_name]);
    return NextResponse.json(rows);
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Database error', details }, { status: 500 });
  }
} 