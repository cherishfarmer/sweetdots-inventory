import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sendInventoryReport } from '@/lib/email';

// GET all submissions with pagination
export async function GET(request: NextRequest) {
  try {
    requireAuth(request);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // morning, night, or all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [limit, offset];

    if (type && type !== 'all') {
      whereClause = 'WHERE submission_type = $3';
      params.push(type);
    }

    const result = await query(
        `SELECT 
        s.id,
        s.submission_type as "submissionType",
        s.submitted_at as "submittedAt",
        s.submission_date as "submissionDate",
        s.notes,
        s.supplies_received as "suppliesReceived",
        s.supplies_note as "suppliesNote",
        s.employee_name as "employeeName",
        u.name as "submittedByName"
      FROM inventory_submissions s
      JOIN users u ON s.submitted_by = u.id
      ${whereClause}
      ORDER BY s.submitted_at DESC
      LIMIT $1 OFFSET $2`,
        params
    );

    // Get total count
    const countResult = await query(
        `SELECT COUNT(*) as total FROM inventory_submissions ${whereClause}`,
        type && type !== 'all' ? [type] : []
    );

    return NextResponse.json({
      submissions: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Get submissions error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
    );
  }
}

// POST create new submission (REMOVED duplicate check)
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const {
      submissionType,
      employeeName,
      notes,
      suppliesReceived,
      suppliesNote,
      items,
    } = await request.json();

    // Validation
    if (!submissionType || !employeeName || !items || items.length === 0) {
      return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
      );
    }

    if (!['morning', 'night'].includes(submissionType)) {
      return NextResponse.json(
          { error: 'Invalid submission type' },
          { status: 400 }
      );
    }

    // Get current date
    const submissionDate = new Date().toISOString().split('T')[0];

    // REMOVED: Duplicate submission check - now allows multiple submissions per day/shift

    // Begin transaction
    await query('BEGIN');

    try {
      // Create submission record
      const submissionResult = await query(
          `INSERT INTO inventory_submissions 
         (submission_type, submitted_by, submission_date, employee_name, notes, supplies_received, supplies_note)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, submitted_at`,
          [submissionType, user.id, submissionDate, employeeName, notes || null, suppliesReceived || false, suppliesNote || null]
      );

      const submissionId = submissionResult.rows[0].id;
      const submittedAt = submissionResult.rows[0].submitted_at;

      // Create snapshots and update current quantities
      const criticalItems = [];
      const allItemsForEmail = [];

      for (const item of items) {
        // Get current item details
        const itemResult = await query(
            `SELECT i.name, i.par_level, c.name as category_name
           FROM items i
           JOIN categories c ON i.category_id = c.id
           WHERE i.id = $1`,
            [item.id]
        );

        if (itemResult.rows.length === 0) {
          throw new Error(`Item ${item.id} not found`);
        }

        const itemDetails = itemResult.rows[0];

        // Create snapshot
        await query(
            `INSERT INTO inventory_snapshots 
           (submission_id, item_id, item_name, category_name, quantity_at_submission, par_level)
           VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              submissionId,
              item.id,
              itemDetails.name,
              itemDetails.category_name,
              item.quantity,
              itemDetails.par_level,
            ]
        );

        // Update current quantity
        await query(
            'UPDATE items SET current_quantity = $1 WHERE id = $2',
            [item.quantity, item.id]
        );

        // Track for email
        const itemForEmail = {
          categoryName: itemDetails.category_name,
          itemName: itemDetails.name,
          quantity: item.quantity,
          parLevel: itemDetails.par_level,
        };

        allItemsForEmail.push(itemForEmail);

        if (item.quantity < itemDetails.par_level) {
          criticalItems.push(itemForEmail);
        }
      }

      // Commit transaction
      await query('COMMIT');

      // Send email report
      try {
        await sendInventoryReport({
          submissionType,
          submissionDate: new Date(submittedAt),
          employeeName,
          notes: notes || null,
          suppliesReceived: suppliesReceived || false,
          suppliesNote: suppliesNote || null,
          items: allItemsForEmail,
          criticalItems,
        });
      } catch (emailError) {
        console.error('Failed to send email, but submission was successful:', emailError);
        // Don't fail the request if email fails
      }

      return NextResponse.json({
        message: 'Inventory submitted successfully',
        submissionId,
        submittedAt,
        criticalItemsCount: criticalItems.length,
      }, { status: 201 });

    } catch (error) {
      // Rollback on error
      await query('ROLLBACK');
      throw error;
    }

  } catch (error: any) {
    console.error('Create submission error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
    );
  }
}
