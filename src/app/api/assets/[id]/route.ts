import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'Invalid asset id' }, { status: 400 });
    }

    const body = (await req.json()) as Partial<{
      year_of_purchase: number;
      item_name: string;
      quantity: number;
      inventory_number: string;
      room_number: string;
      floor_number: string;
      building_block: string;
      remarks: string;
      department_origin: 'own' | 'other';
    }>;

    const allowedKeys: Array<keyof typeof body> = [
      'year_of_purchase',
      'item_name',
      'quantity',
      'inventory_number',
      'room_number',
      'floor_number',
      'building_block',
      'remarks',
      'department_origin',
    ];

    const updates: string[] = [];
    const values: unknown[] = [];

    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE assets SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // mysql2 returns OkPacket-like object
    const affectedRows = (result as { affectedRows?: number }).affectedRows ?? 0;
    if (affectedRows === 0) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update asset', details }, { status: 500 });
  }
}
