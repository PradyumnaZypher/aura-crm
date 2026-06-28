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

    // Generate historical data for the last 24 hours
    const historicalData = []
    const now = Date.now()
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now - i * 60 * 60 * 1000).toISOString()
      historicalData.push({
        timestamp,
        cpu: Math.floor(Math.random() * 30) + 20,
        memory: Math.floor(Math.random() * 20) + 40,
        disk: Math.floor(Math.random() * 20) + 50,
        network: Math.floor(Math.random() * 40) + 10,
        responseTime: Math.floor(Math.random() * 200) + 100
      })
    }

    return NextResponse.json(historicalData)

  } catch (error) {
    console.error('Performance history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance history' },
      { status: 500 }
    )
  }
}