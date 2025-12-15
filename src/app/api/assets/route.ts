import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM assets');
    return NextResponse.json(rows);
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Database error', details }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      year_of_purchase,
      item_name,
      quantity,
      inventory_number,
      room_number,
      floor_number,
      building_block,
      remarks,
      department_origin
    } = await req.json();
    if (!item_name || !quantity || !inventory_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    await pool.query(
      `INSERT INTO assets (year_of_purchase, item_name, quantity, inventory_number, room_number, floor_number, building_block, remarks, department_origin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [year_of_purchase, item_name, quantity, inventory_number, room_number, floor_number, building_block, remarks, department_origin || 'own']
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to add asset', details }, { status: 500 });
  }
} 