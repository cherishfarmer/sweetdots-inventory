import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAuth, requireAdmin } from '../../../../lib/auth';

// PUT update item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const { id } = params;
    const body = await request.json();

    // Employees can only update quantity
    if (user.role === 'employee') {
      if (body.currentQuantity === undefined) {
        return NextResponse.json(
          { error: 'Employees can only update quantity' },
          { status: 403 }
        );
      }

      const result = await query(
        'UPDATE items SET current_quantity = $1 WHERE id = $2 RETURNING *',
        [body.currentQuantity, id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ item: result.rows[0] });
    }

    // Admins can update everything
    const { name, categoryId, parLevel, currentQuantity } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (categoryId !== undefined) {
      updates.push(`category_id = $${paramIndex++}`);
      values.push(categoryId);
    }

    if (parLevel !== undefined) {
      updates.push(`par_level = $${paramIndex++}`);
      values.push(parLevel);
    }

    if (currentQuantity !== undefined) {
      updates.push(`current_quantity = $${paramIndex++}`);
      values.push(currentQuantity);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(id);

    const result = await query(
      `UPDATE items SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ item: result.rows[0] });
  } catch (error: any) {
    console.error('Update item error:', error);
    
    if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Item name already exists in this category' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(request);

    const { id } = params;

    const result = await query(
      'DELETE FROM items WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error: any) {
    console.error('Delete item error:', error);
    
    if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
