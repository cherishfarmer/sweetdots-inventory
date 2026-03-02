import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { requireAuth, requireAdmin } from '../../../lib/auth';

// GET all categories with items
export async function GET(request: NextRequest) {
  try {
    requireAuth(request);

    const result = await query(`
      SELECT 
        c.id,
        c.name,
        c.sort_order,
        json_agg(
          json_build_object(
            'id', i.id,
            'name', i.name,
            'currentQuantity', i.current_quantity,
            'parLevel', i.par_level,
            'sortOrder', i.sort_order
          ) ORDER BY i.sort_order, i.name
        ) FILTER (WHERE i.id IS NOT NULL) as items
      FROM categories c
      LEFT JOIN items i ON c.id = i.category_id
      GROUP BY c.id
      ORDER BY c.sort_order, c.name
    `);

    return NextResponse.json({ categories: result.rows });
  } catch (error: any) {
    console.error('Get categories error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const { name } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Get max sort order
    const maxOrder = await query(
      'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM categories'
    );

    const result = await query(
      'INSERT INTO categories (name, sort_order) VALUES ($1, $2) RETURNING *',
      [name.trim(), maxOrder.rows[0].max_order + 1]
    );

    return NextResponse.json({ category: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Create category error:', error);
    
    if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
