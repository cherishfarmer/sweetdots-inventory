import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin, hashPassword } from '@/lib/auth';

// GET all users
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    const result = await query(
        `SELECT id, name, email, role, created_at as "createdAt"
       FROM users
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ users: result.rows });
  } catch (error: any) {
    console.error('Get users error:', error);

    if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
    );
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const { name, email, password, role } = await request.json();

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
          { error: 'All fields are required' },
          { status: 400 }
      );
    }

    if (!['employee', 'admin'].includes(role)) {
      return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const result = await query(
        `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at as "createdAt"`,
        [name, email, password_hash, role]
    );

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Create user error:', error);

    if (error.message === 'Unauthorized' || error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.code === '23505') {
      return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
      );
    }

    return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
    );
  }
}
