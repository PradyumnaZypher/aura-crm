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

    // Simulate performance alerts
    const alerts = [
      {
        id: '1',
        type: 'warning' as const,
        message: 'CPU usage is above 70%',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        metric: 'CPU Usage',
        value: 75,
        threshold: 70
      },
      {
        id: '2',
        type: 'info' as const,
        message: 'Database cache hit rate is optimal',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        metric: 'Cache Hit Rate',
        value: 95,
        threshold: 90
      },
      {
        id: '3',
        type: 'error' as const,
        message: 'Response time exceeds 1000ms threshold',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        metric: 'Response Time',
        value: 1200,
        threshold: 1000
      }
    ]

    return NextResponse.json(alerts)

  } catch (error) {
    console.error('Performance alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance alerts' },
      { status: 500 }
    )
  }
}