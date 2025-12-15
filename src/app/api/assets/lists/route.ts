import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT item_name, SUM(quantity) as total_quantity FROM assets GROUP BY item_name'
    );
    return NextResponse.json(rows);
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Database error', details }, { status: 500 });
  }
} 