import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
    
    // In production, verify JWT properly
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    // return decoded
    
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

    // Get database logs
    const logs = await getDatabaseLogs()
    
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Database logs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch database logs' },
      { status: 500 }
    )
  }
}

async function getDatabaseLogs() {
  try {
    // In production, you would have a dedicated database logs table
    // For now, we'll return mock logs with some realistic data
    
    const logs = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        level: 'INFO',
        message: 'Database connection established',
        user: 'admin',
        duration: 12
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        level: 'INFO',
        message: 'Query executed successfully',
        user: 'admin',
        duration: 8
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        level: 'WARNING',
        message: 'Slow query detected',
        user: 'system',
        duration: 2500
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        level: 'INFO',
        message: 'Table optimized',
        user: 'admin',
        duration: 1500
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        level: 'ERROR',
        message: 'Query failed: Syntax error',
        user: 'admin',
        duration: 5
      },
      {
        id: '6',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        level: 'INFO',
        message: 'Backup created successfully',
        user: 'system',
        duration: 3000
      },
      {
        id: '7',
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        level: 'INFO',
        message: 'Index rebuilt',
        user: 'admin',
        duration: 800
      },
      {
        id: '8',
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        level: 'WARNING',
        message: 'High memory usage detected',
        user: 'system',
        duration: 15
      },
      {
        id: '9',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        level: 'INFO',
        message: 'Statistics updated',
        user: 'admin',
        duration: 1200
      },
      {
        id: '10',
        timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        level: 'INFO',
        message: 'Cache cleared',
        user: 'admin',
        duration: 200
      }
    ]

    // Sort by timestamp (newest first)
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (error) {
    console.error('Error getting database logs:', error)
    return []
  }
}