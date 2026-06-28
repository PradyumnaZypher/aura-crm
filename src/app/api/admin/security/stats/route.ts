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
    console.log('Security stats API called')
    
    // Verify admin authentication using JWT (same as middleware)
    const authResult = verifyJWT(request)
    console.log('Auth result:', authResult.success ? 'Success' : authResult.error)
    
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get total users
    const totalUsers = await db.user.count()
    
    // Get active users (logged in within last 24 hours)
    const activeUsers = await db.user.count({
      where: {
        lastLoginAt: {
          gte: yesterday
        }
      }
    })

    // Get failed login attempts in last 24 hours
    const failedLogins = await db.userActivity.count({
      where: {
        action: 'failed_login',
        createdAt: {
          gte: yesterday
        }
      }
    })

    // Get suspicious activities (high severity security events)
    const suspiciousActivities = await db.userActivity.count({
      where: {
        action: {
          in: ['security_alert', 'blocked_attempt', 'multiple_failed_logins']
        },
        createdAt: {
          gte: yesterday
        }
      }
    })

    // Get blocked IPs (this would come from a security settings table)
    // For now, we'll simulate this with some sample data
    const blockedIPs = 5

    // Get active sessions
    const activeSessions = await db.userSession.count({
      where: {
        isActive: true,
        expiresAt: {
          gt: now
        }
      }
    })

    // Get password strength distribution
    const allUsers = await db.user.findMany({
      select: {
        password: true
      }
    })

    const passwordStrength = {
      strong: 0,
      medium: 0,
      weak: 0
    }

    allUsers.forEach(user => {
      const password = user.password
      let score = 0
      
      if (password.length >= 8) score++
      if (password.length >= 12) score++
      if (/[A-Z]/.test(password)) score++
      if (/[a-z]/.test(password)) score++
      if (/[0-9]/.test(password)) score++
      if (/[^A-Za-z0-9]/.test(password)) score++

      if (score >= 4) passwordStrength.strong++
      else if (score >= 2) passwordStrength.medium++
      else passwordStrength.weak++
    })

    // Calculate security score
    const securityScore = Math.min(100, Math.max(0, 
      100 - (failedLogins * 2) - (suspiciousActivities * 5) + (passwordStrength.strong * 2)
    ))

    // Get threats blocked (simulated data)
    const threatsBlocked = await db.userActivity.count({
      where: {
        action: 'blocked_attempt',
        createdAt: {
          gte: lastMonth
        }
      }
    })

    const stats = {
      totalUsers,
      activeUsers,
      failedLogins,
      suspiciousActivities,
      blockedIPs,
      activeSessions,
      passwordStrength,
      securityScore,
      threatsBlocked,
      lastSecurityScan: now.toISOString()
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching security stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security statistics' },
      { status: 500 }
    )
  }
}