import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

// Simple JWT verification (same as middleware)
function verifyJWT(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.cookies.get('token')?.value

  if (!token) {
    return { success: false, error: 'No token provided' }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
    if (decoded.role !== 'ADMIN') {
      return { success: false, error: 'Insufficient permissions' }
    }
    
    return { success: true, user: decoded }
  } catch (error) {
    return { success: false, error: 'Invalid token' }
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Security alerts API called')
    
    // Verify admin authentication using JWT (same as middleware)
    const authResult = verifyJWT(request)
    console.log('Alerts auth result:', authResult.success ? 'Success' : authResult.error)
    
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get recent security-related activities as alerts
    const alerts = await db.userActivity.findMany({
      where: {
        action: {
          in: ['security_alert', 'failed_login', 'blocked_attempt', 'multiple_failed_logins']
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })

    // Transform activities into alerts
    const transformedAlerts = alerts.map(activity => {
      let type = 'medium'
      let title = 'Security Alert'
      let description = activity.details || 'Security event detected'

      switch (activity.action) {
        case 'failed_login':
          type = 'medium'
          title = 'Failed Login Attempt'
          description = `Failed login attempt for ${activity.user?.email || 'unknown user'}`
          break
        case 'blocked_attempt':
          type = 'high'
          title = 'Blocked Attempt'
          description = `Blocked suspicious activity from ${activity.ipAddress}`
          break
        case 'multiple_failed_logins':
          type = 'high'
          title = 'Multiple Failed Logins'
          description = `Multiple failed login attempts detected`
          break
        case 'security_alert':
          type = 'high'
          title = 'Security Alert'
          description = activity.details || 'Security event detected'
          break
      }

      return {
        id: activity.id,
        type,
        title,
        description,
        timestamp: activity.createdAt.toISOString(),
        resolved: false // Would be determined by a resolution status field
      }
    })

    return NextResponse.json(transformedAlerts)

  } catch (error) {
    console.error('Error fetching security alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security alerts' },
      { status: 500 }
    )
  }
}