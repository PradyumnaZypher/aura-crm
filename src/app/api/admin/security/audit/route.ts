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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const level = searchParams.get('level') || ''
    const category = searchParams.get('category') || ''
    const outcome = searchParams.get('outcome') || ''
    const dateRange = searchParams.get('dateRange') || ''
    const userId = searchParams.get('userId') || ''
    const exportData = searchParams.get('export') === 'true'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { details: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (userId) {
      where.userId = userId
    }

    // Date range filtering
    if (dateRange) {
      const now = new Date()
      let startDate: Date | undefined

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
          const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          where.createdAt = {
            gte: startDate,
            lt: endDate
          }
          break
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
      }

      if (startDate && dateRange !== 'yesterday') {
        where.createdAt = {
          gte: startDate
        }
      }
    }

    // Get user activities as audit logs
    const activities = await db.userActivity.findMany({
      where,
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
      skip,
      take: limit
    })

    // Get total count
    const total = await db.userActivity.count({ where })

    // Transform to audit log format
    const auditLogs = activities.map(activity => {
      // Determine log level based on action
      let logLevel = 'INFO'
      let category = 'USER_ACTION'
      let outcome = 'SUCCESS'

      switch (activity.action) {
        case 'login':
          logLevel = 'INFO'
          category = 'AUTHENTICATION'
          outcome = 'SUCCESS'
          break
        case 'failed_login':
          logLevel = 'WARN'
          category = 'AUTHENTICATION'
          outcome = 'FAILURE'
          break
        case 'logout':
          logLevel = 'INFO'
          category = 'AUTHENTICATION'
          outcome = 'SUCCESS'
          break
        case 'password_change':
          logLevel = 'INFO'
          category = 'SECURITY'
          outcome = 'SUCCESS'
          break
        case 'account_created':
          logLevel = 'INFO'
          category = 'USER_ACTION'
          outcome = 'SUCCESS'
          break
        case 'account_updated':
          logLevel = 'INFO'
          category = 'USER_ACTION'
          outcome = 'SUCCESS'
          break
        case 'account_deleted':
          logLevel = 'WARN'
          category = 'USER_ACTION'
          outcome = 'SUCCESS'
          break
        case 'admin_action':
          logLevel = 'WARN'
          category = 'ADMIN_ACTION'
          outcome = 'SUCCESS'
          break
        case 'security_alert':
          logLevel = 'ERROR'
          category = 'SECURITY'
          outcome = 'FAILURE'
          break
        case 'blocked_attempt':
          logLevel = 'ERROR'
          category = 'SECURITY'
          outcome = 'FAILURE'
          break
        default:
          logLevel = 'INFO'
          category = 'USER_ACTION'
          outcome = 'SUCCESS'
      }

      return {
        id: activity.id,
        timestamp: activity.createdAt.toISOString(),
        level: logLevel as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL',
        category: category as 'AUTHENTICATION' | 'AUTHORIZATION' | 'DATA_ACCESS' | 'SYSTEM' | 'SECURITY' | 'API' | 'USER_ACTION',
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
        outcome: outcome as 'SUCCESS' | 'FAILURE' | 'PARTIAL',
        duration: Math.floor(Math.random() * 1000), // Simulated duration
        metadata: activity.metadata || {},
        stackTrace: logLevel === 'ERROR' ? 'Simulated stack trace for error' : undefined
      }
    })

    // Filter by level, category, and outcome if specified
    let filteredLogs = auditLogs
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level)
    }
    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category)
    }
    if (outcome) {
      filteredLogs = filteredLogs.filter(log => log.outcome === outcome)
    }

    // Handle export
    if (exportData) {
      const csv = [
        'ID,Timestamp,Level,Category,Message,Details,User,Email,IP,Action,Outcome',
        ...filteredLogs.map(log => 
          `"${log.id}","${log.timestamp}","${log.level}","${log.category}","${log.message}","${log.details}","${log.userEmail || ''}","${log.userEmail || ''}","${log.ipAddress || ''}","${log.action || ''}","${log.outcome}"`
        )
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    const totalPages = Math.ceil(filteredLogs.length / limit)
    const paginatedLogs = filteredLogs.slice(skip, skip + limit)

    return NextResponse.json({
      logs: paginatedLogs,
      total: filteredLogs.length,
      totalPages,
      currentPage: page
    })

  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}