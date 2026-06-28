import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
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
    
    return { error: 'Invalid token', status: 401 }
  } catch (error) {
    return { error: 'Invalid token', status: 401 }
  }
}

// POST /api/admin/system/cleanup - Cleanup system resources
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authResult = verifyJWT(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const cleanupSchema = z.object({
      cleanupActivities: z.boolean().default(true),
      cleanupSessions: z.boolean().default(true),
      olderThanDays: z.number().default(30)
    })

    const body = await request.json()
    const { cleanupActivities, cleanupSessions, olderThanDays } = cleanupSchema.parse(body)

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    let deletedActivities = 0
    let deletedSessions = 0

    // Cleanup old activities
    if (cleanupActivities) {
      const result = await db.userActivity.deleteMany({
        where: {
          createdAt: { lt: cutoffDate }
        }
      })
      deletedActivities = result.count
    }

    // Cleanup old sessions
    if (cleanupSessions) {
      const result = await db.userSession.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          isActive: false
        }
      })
      deletedSessions = result.count
    }

    return NextResponse.json({
      success: true,
      message: 'System cleanup completed successfully',
      cleanup: {
        deletedActivities,
        deletedSessions,
        cutoffDate: cutoffDate.toISOString()
      }
    })
  } catch (error) {
    console.error('System cleanup error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to perform system cleanup' },
      { status: 500 }
    )
  }
}