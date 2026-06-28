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
    // Verify admin authentication using JWT (same as middleware)
    const authResult = verifyJWT(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Get all activities for stats calculation
    const allActivities = await db.userActivity.findMany({
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
      take: 1000 // Limit for performance
    })

    // Calculate stats
    const totalLogs = allActivities.length

    // Logs by level
    const logsByLevel = {
      'DEBUG': 0,
      'INFO': 0,
      'WARN': 0,
      'ERROR': 0,
      'FATAL': 0
    }

    // Logs by category
    const logsByCategory = {
      'AUTHENTICATION': 0,
      'AUTHORIZATION': 0,
      'DATA_ACCESS': 0,
      'SYSTEM': 0,
      'SECURITY': 0,
      'API': 0,
      'USER_ACTION': 0
    }

    // Logs by outcome
    const logsByOutcome = {
      'SUCCESS': 0,
      'FAILURE': 0,
      'PARTIAL': 0
    }

    let totalDuration = 0
    let durationCount = 0

    // Process activities
    allActivities.forEach(activity => {
      // Determine level
      let level = 'INFO'
      switch (activity.action) {
        case 'failed_login':
        case 'security_alert':
        case 'blocked_attempt':
          level = 'ERROR'
          break
        case 'admin_action':
        case 'account_deleted':
          level = 'WARN'
          break
        case 'login':
        case 'logout':
        case 'password_change':
          level = 'INFO'
          break
        default:
          level = 'INFO'
      }
      logsByLevel[level]++

      // Determine category
      let category = 'USER_ACTION'
      switch (activity.action) {
        case 'login':
        case 'failed_login':
        case 'logout':
          category = 'AUTHENTICATION'
          break
        case 'admin_action':
          category = 'AUTHORIZATION'
          break
        case 'security_alert':
        case 'blocked_attempt':
        case 'password_change':
          category = 'SECURITY'
          break
        default:
          category = 'USER_ACTION'
      }
      logsByCategory[category]++

      // Determine outcome
      let outcome = 'SUCCESS'
      if (activity.action.includes('failed') || activity.action.includes('blocked')) {
        outcome = 'FAILURE'
      }
      logsByOutcome[outcome]++

      // Simulate duration
      const duration = Math.floor(Math.random() * 1000)
      totalDuration += duration
      durationCount++
    })

    // Calculate error rate
    const errorRate = totalLogs > 0 ? ((logsByLevel.ERROR + logsByLevel.FATAL) / totalLogs) * 100 : 0

    // Calculate average duration
    const averageDuration = durationCount > 0 ? totalDuration / durationCount : 0

    // Get top users
    const userCounts: Record<string, { email: string; count: number }> = {}
    allActivities.forEach(activity => {
      if (activity.userId) {
        if (!userCounts[activity.userId]) {
          userCounts[activity.userId] = {
            email: activity.user?.email || 'unknown@example.com',
            count: 0
          }
        }
        userCounts[activity.userId].count++
      }
    })

    const topUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([userId, data]) => ({
        userId,
        email: data.email,
        count: data.count
      }))

    // Get top IPs
    const ipCounts: Record<string, { count: number; location?: string }> = {}
    allActivities.forEach(activity => {
      if (activity.ipAddress) {
        if (!ipCounts[activity.ipAddress]) {
          ipCounts[activity.ipAddress] = { count: 0 }
        }
        ipCounts[activity.ipAddress].count++
      }
    })

    const topIPs = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([ip, data]) => ({
        ip,
        count: data.count,
        location: 'Unknown' // Would be determined by IP geolocation
      }))

    // Get recent errors
    const recentErrors = allActivities
      .filter(activity => 
        activity.action === 'failed_login' || 
        activity.action === 'security_alert' || 
        activity.action === 'blocked_attempt'
      )
      .slice(0, 20)
      .map(activity => ({
        id: activity.id,
        timestamp: activity.createdAt.toISOString(),
        level: activity.action === 'security_alert' ? 'ERROR' : 'WARN',
        category: 'SECURITY',
        message: `${activity.action.replace('_', ' ').toUpperCase()} - ${activity.user?.name || 'Unknown User'}`,
        details: activity.details || `${activity.action} performed`,
        userId: activity.userId,
        userEmail: activity.user?.email,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
        sessionId: activity.sessionId,
        requestId: activity.id,
        resource: activity.resource,
        action: activity.action,
        outcome: 'FAILURE' as const,
        duration: Math.floor(Math.random() * 1000),
        metadata: activity.metadata || {},
        stackTrace: activity.action === 'security_alert' ? 'Simulated stack trace for error' : undefined
      }))

    const stats = {
      totalLogs,
      logsByLevel,
      logsByCategory,
      logsByOutcome,
      averageDuration,
      errorRate,
      topUsers,
      topIPs,
      recentErrors
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching audit stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit statistics' },
      { status: 500 }
    )
  }
}