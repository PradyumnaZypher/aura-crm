import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalSessions: number
    totalActivities: number
    avgSessionDuration: number
    bounceRate: number
    conversionRate: number
    pageViews: number
    uniqueVisitors: number
  }
  userGrowth: Array<{
    date: string
    users: number
    activeUsers: number
    newUsers: number
  }>
  userActivity: Array<{
    hour: string
    activities: number
    sessions: number
  }>
  userDemographics: {
    roles: Array<{
      name: string
      count: number
      percentage: number
    }>
    departments: Array<{
      name: string
      count: number
      percentage: number
    }>
  }
  deviceStats: {
    desktop: number
    mobile: number
    tablet: number
    unknown: number
  }
  browserStats: Array<{
    name: string
    count: number
    percentage: number
  }>
  topPages: Array<{
    path: string
    views: number
    uniqueViews: number
    avgTimeOnPage: number
    bounceRate: number
  }>
  performanceMetrics: {
    avgResponseTime: number
    errorRate: number
    uptime: number
    throughput: number
  }
  recentActivities: Array<{
    id: string
    user: string
    action: string
    resource: string
    timestamp: string
    ip: string
    userAgent: string
  }>
}

// GET - Fetch analytics data
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'

    // Calculate date range
    const endDate = new Date()
    const startDate = subDays(endDate, range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90)

    // Fetch overview data
    const totalUsers = await db.user.count()
    const activeUsers = await db.user.count({ 
      where: { 
        isActive: true,
        lastLoginAt: {
          gte: startDate
        }
      } 
    })
    const totalSessions = await db.userSession.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })
    const totalActivities = await db.userActivity.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    // Generate user growth data
    const userGrowth = []
    for (let i = 0; i < (range === '24h' ? 24 : range === '7d' ? 7 : range === '30d' ? 30 : 90); i++) {
      const date = range === '24h' 
        ? subDays(endDate, i)
        : subDays(endDate, i)
      
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)
      
      const users = await db.user.count({
        where: {
          createdAt: {
            lte: dayEnd
          }
        }
      })
      
      const activeUsers = await db.user.count({
        where: {
          isActive: true,
          lastLoginAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      })
      
      const newUsers = await db.user.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      })

      userGrowth.unshift({
        date: format(date, range === '24h' ? 'HH:mm' : 'MMM dd'),
        users,
        activeUsers,
        newUsers
      })
    }

    // Generate hourly activity data
    const userActivity = []
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date()
      hourStart.setHours(hour, 0, 0, 0)
      const hourEnd = new Date()
      hourEnd.setHours(hour, 59, 59, 999)

      const activities = await db.userActivity.count({
        where: {
          createdAt: {
            gte: hourStart,
            lte: hourEnd
          }
        }
      })

      const sessions = await db.userSession.count({
        where: {
          createdAt: {
            gte: hourStart,
            lte: hourEnd
          }
        }
      })

      userActivity.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        activities,
        sessions
      })
    }

    // Fetch user demographics
    const userRoles = await db.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    const roles = userRoles.map(item => ({
      name: item.role,
      count: item._count.role,
      percentage: (item._count.role / totalUsers) * 100
    }))

    // Mock department data (since we don't have department field directly)
    const departments = [
      { name: 'Engineering', count: Math.floor(totalUsers * 0.4), percentage: 40 },
      { name: 'Sales', count: Math.floor(totalUsers * 0.25), percentage: 25 },
      { name: 'Marketing', count: Math.floor(totalUsers * 0.2), percentage: 20 },
      { name: 'Support', count: Math.floor(totalUsers * 0.15), percentage: 15 }
    ]

    // Mock device stats
    const deviceStats = {
      desktop: Math.floor(totalUsers * 0.6),
      mobile: Math.floor(totalUsers * 0.3),
      tablet: Math.floor(totalUsers * 0.08),
      unknown: Math.floor(totalUsers * 0.02)
    }

    // Mock browser stats
    const browserStats = [
      { name: 'Chrome', count: Math.floor(totalUsers * 0.65), percentage: 65 },
      { name: 'Firefox', count: Math.floor(totalUsers * 0.15), percentage: 15 },
      { name: 'Safari', count: Math.floor(totalUsers * 0.12), percentage: 12 },
      { name: 'Edge', count: Math.floor(totalUsers * 0.08), percentage: 8 }
    ]

    // Mock top pages
    const topPages = [
      { path: '/admin/dashboard', views: 1250, uniqueViews: 890, avgTimeOnPage: 180, bounceRate: 0.25 },
      { path: '/admin/users', views: 980, uniqueViews: 650, avgTimeOnPage: 240, bounceRate: 0.20 },
      { path: '/admin/analytics', views: 750, uniqueViews: 520, avgTimeOnPage: 300, bounceRate: 0.15 },
      { path: '/admin/system', views: 620, uniqueViews: 410, avgTimeOnPage: 420, bounceRate: 0.18 },
      { path: '/login', views: 450, uniqueViews: 380, avgTimeOnPage: 120, bounceRate: 0.35 }
    ]

    // Mock performance metrics
    const performanceMetrics = {
      avgResponseTime: 120 + Math.floor(Math.random() * 80),
      errorRate: 0.01 + Math.random() * 0.02,
      uptime: 0.995 + Math.random() * 0.004,
      throughput: 150 + Math.floor(Math.random() * 100)
    }

    // Fetch recent activities
    const recentActivities = await db.userActivity.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const formattedActivities = recentActivities.map(activity => ({
      id: activity.id,
      user: activity.user.name || activity.user.email,
      action: activity.action,
      resource: activity.resource,
      timestamp: activity.createdAt.toISOString(),
      ip: activity.ipAddress || 'Unknown',
      userAgent: activity.userAgent || 'Unknown'
    }))

    const analyticsData: AnalyticsData = {
      overview: {
        totalUsers,
        activeUsers,
        totalSessions,
        totalActivities,
        avgSessionDuration: 1800, // 30 minutes in seconds
        bounceRate: 0.25,
        conversionRate: 0.15,
        pageViews: 5000 + Math.floor(Math.random() * 2000),
        uniqueVisitors: activeUsers
      },
      userGrowth,
      userActivity,
      userDemographics: {
        roles,
        departments
      },
      deviceStats,
      browserStats,
      topPages,
      performanceMetrics,
      recentActivities: formattedActivities
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}