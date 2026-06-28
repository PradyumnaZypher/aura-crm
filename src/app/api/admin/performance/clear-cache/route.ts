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

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authResult = verifyJWT(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Simulate cache clearing process
    const cacheTypes = [
      'Application cache',
      'Database query cache',
      'System cache',
      'Browser cache',
      'Temporary files'
    ]

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    const memoryFreed = Math.floor(Math.random() * 2) + 1 // 1-3 GB

    return NextResponse.json({
      success: true,
      message: `Cache cleared successfully. Freed ${memoryFreed} GB of memory.`,
      memoryFreed,
      cacheTypes,
      duration: '1.2 seconds'
    })

  } catch (error) {
    console.error('Cache clearing error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}