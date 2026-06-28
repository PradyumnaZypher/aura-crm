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

    // Simulate real-time performance metrics
    const metrics = {
      cpu: {
        usage: Math.floor(Math.random() * 30) + 20, // 20-50%
        cores: 8,
        temperature: Math.floor(Math.random() * 20) + 45, // 45-65°C
        load: [
          parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          parseFloat((Math.random() * 2 + 0.5).toFixed(2))
        ]
      },
      memory: {
        used: Math.floor(Math.random() * 4) + 6, // 6-10 GB
        total: 16,
        percentage: Math.floor(Math.random() * 20) + 40, // 40-60%
        swap: {
          used: Math.floor(Math.random() * 2), // 0-2 GB
          total: 4,
          percentage: Math.floor(Math.random() * 30) // 0-30%
        }
      },
      disk: {
        used: Math.floor(Math.random() * 100) + 200, // 200-300 GB
        total: 500,
        percentage: Math.floor(Math.random() * 20) + 50, // 50-70%
        readSpeed: Math.floor(Math.random() * 100) + 50, // 50-150 MB/s
        writeSpeed: Math.floor(Math.random() * 80) + 40 // 40-120 MB/s
      },
      network: {
        upload: Math.floor(Math.random() * 10) + 5, // 5-15 MB/s
        download: Math.floor(Math.random() * 50) + 20, // 20-70 MB/s
        latency: Math.floor(Math.random() * 20) + 5, // 5-25 ms
        packets: {
          sent: Math.floor(Math.random() * 1000) + 500, // 500-1500
          received: Math.floor(Math.random() * 2000) + 1000 // 1000-3000
        }
      },
      database: {
        connections: Math.floor(Math.random() * 20) + 10, // 10-30
        queries: Math.floor(Math.random() * 500) + 200, // 200-700 queries/s
        slowQueries: Math.floor(Math.random() * 5), // 0-5
        uptime: Math.floor(Math.random() * 1000000) + 500000, // 500k-1.5M seconds
        cacheHitRate: Math.floor(Math.random() * 15) + 85 // 85-100%
      },
      application: {
        responseTime: Math.floor(Math.random() * 200) + 100, // 100-300ms
        throughput: Math.floor(Math.random() * 100) + 50, // 50-150 req/s
        errorRate: Math.floor(Math.random() * 2), // 0-2%
        activeUsers: Math.floor(Math.random() * 50) + 20 // 20-70
      }
    }

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Performance metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    )
  }
}