import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';

// GET submission details with snapshots
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAuth(request);

    const { id } = params;

    // Get submission details
    const submissionResult = await query(
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
      WHERE s.id = $1`,
      [id]
    );

    if (submissionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Get snapshots
    const snapshotsResult = await query(
      `SELECT 
        id,
        item_id as "itemId",
        item_name as "itemName",
        category_name as "categoryName",
        quantity_at_submission as "quantity",
        par_level as "parLevel"
      FROM inventory_snapshots
      WHERE submission_id = $1
      ORDER BY category_name, item_name`,
      [id]
    );

    return NextResponse.json({
      submission: submissionResult.rows[0],
      snapshots: snapshotsResult.rows,
    });
  } catch (error: any) {
    console.error('Get submission details error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
