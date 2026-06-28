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
    console.log('Security activities API called')
    
    // Verify admin authentication using JWT (same as middleware)
    const authResult = verifyJWT(request)
    console.log('Activities auth result:', authResult.success ? 'Success' : authResult.error)
    
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const action = searchParams.get('action') || ''
    const status = searchParams.get('status') || ''
    const severity = searchParams.get('severity') || ''
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
        { ipAddress: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (action) {
      where.action = action
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

    // Get activities
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

    // Transform data
    const transformedActivities = activities.map(activity => {
      // Determine status based on action
      let status = 'info'
      if (activity.action === 'login' || activity.action === 'account_created') {
        status = 'success'
      } else if (activity.action === 'failed_login' || activity.action === 'account_deleted') {
        status = 'danger'
      } else if (activity.action === 'password_change' || activity.action === 'security_alert') {
        status = 'warning'
      }

      // Determine severity
      let severity = 'low'
      if (activity.action === 'failed_login' || activity.action === 'security_alert') {
        severity = 'high'
      } else if (activity.action === 'admin_action') {
        severity = 'medium'
      }

      return {
        id: activity.id,
        type: activity.action,
        user: activity.user?.name || 'Unknown',
        email: activity.user?.email || 'unknown@example.com',
        ip: activity.ipAddress,
        location: 'Unknown', // Would be determined by IP geolocation
        timestamp: activity.createdAt.toISOString(),
        status,
        severity,
        details: activity.details || `${activity.action} performed`,
        userId: activity.userId,
        resource: activity.resource,
        action: activity.action,
        metadata: activity.metadata || {}
      }
    })

    // Filter by status and severity if specified
    let filteredActivities = transformedActivities
    if (status) {
      filteredActivities = filteredActivities.filter(a => a.status === status)
    }
    if (severity) {
      filteredActivities = filteredActivities.filter(a => a.severity === severity)
    }

    // Handle export
    if (exportData) {
      const csv = [
        'ID,Type,User,Email,IP,Location,Timestamp,Status,Severity,Details',
        ...filteredActivities.map(activity => 
          `"${activity.id}","${activity.type}","${activity.user}","${activity.email}","${activity.ip}","${activity.location}","${activity.timestamp}","${activity.status}","${activity.severity}","${activity.details}"`
        )
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="activity-logs-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    const totalPages = Math.ceil(filteredActivities.length / limit)
    const paginatedActivities = filteredActivities.slice(skip, skip + limit)

    return NextResponse.json({
      logs: paginatedActivities,
      total: filteredActivities.length,
      totalPages,
      currentPage: page
    })

  } catch (error) {
    console.error('Error fetching security activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security activities' },
      { status: 500 }
    )
  }
}