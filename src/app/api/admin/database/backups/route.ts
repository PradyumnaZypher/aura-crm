import { NextRequest, NextResponse } from 'next/server'

// JWT verification function (consistent with middleware)
function verifyJWT(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.cookies.get('token')?.value

  if (!token) {
    return { error: 'No token provided', status: 401 }
  }

  try {
    // For demo purposes, we'll accept the demo token
    if (token === 'demo-admin-token') {
      return { userId: 'admin', email: 'admin@demo.com', role: 'admin' }
    }
    
    return { error: 'Invalid token', status: 401 }
  } catch (error) {
    return { error: 'Invalid token', status: 401 }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const authResult = verifyJWT(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Simulate backup data
    const backups = [
      {
        id: 'backup_1',
        filename: 'database_backup_2024_01_15_10_30.sql',
        size: '245 MB',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'automatic',
        status: 'completed'
      },
      {
        id: 'backup_2',
        filename: 'database_backup_2024_01_14_10_30.sql',
        size: '242 MB',
        createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
        type: 'automatic',
        status: 'completed'
      },
      {
        id: 'backup_3',
        filename: 'manual_backup_before_update.sql',
        size: '248 MB',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'manual',
        status: 'completed'
      },
      {
        id: 'backup_4',
        filename: 'database_backup_2024_01_13_10_30.sql',
        size: '239 MB',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'automatic',
        status: 'completed'
      },
      {
        id: 'backup_5',
        filename: 'database_backup_2024_01_12_10_30.sql',
        size: '235 MB',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'automatic',
        status: 'completed'
      },
      {
        id: 'backup_6',
        filename: 'weekly_backup_2024_01_11.sql',
        size: '231 MB',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'automatic',
        status: 'completed'
      },
      {
        id: 'backup_7',
        filename: 'database_backup_2024_01_11_10_30.sql',
        size: '228 MB',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'automatic',
        status: 'completed'
      },
      {
        id: 'backup_8',
        filename: 'monthly_backup_2024_01_01.sql',
        size: '210 MB',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'automatic',
        status: 'completed'
      }
    ]

    return NextResponse.json(backups)
  } catch (error) {
    console.error('Database backups error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch database backups' },
      { status: 500 }
    )
  }
}