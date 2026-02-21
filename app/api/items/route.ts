import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';

// GET all items
export async function GET(request: NextRequest) {
  try {
    requireAuth(request);

    const result = await query(`
      SELECT 
        i.id,
        i.name,
        i.category_id as "categoryId",
        i.par_level as "parLevel",
        i.current_quantity as "currentQuantity",
        i.sort_order as "sortOrder",
        c.name as "categoryName"
      FROM items i
      JOIN categories c ON i.category_id = c.id
      ORDER BY c.sort_order, i.sort_order, i.name
    `);

    return NextResponse.json({ items: result.rows });
  } catch (error: any) {
    console.error('Get items error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new item
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const { name, categoryId, parLevel } = await request.json();

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Get max sort order for category
    const maxOrder = await query(
      'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM items WHERE category_id = $1',
      [categoryId]
    );

    const result = await query(
      `INSERT INTO items (name, category_id, par_level, current_quantity, sort_order) 
       VALUES ($1, $2, $3, 0, $4) RETURNING *`,
      [name.trim(), categoryId, parLevel || 0, maxOrder.rows[0].max_order + 1]
    );

    return NextResponse.json({ item: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Create item error:', error);
    
    if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Item already exists in this category' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
