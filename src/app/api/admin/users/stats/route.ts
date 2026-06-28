import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/users/stats - Get user statistics and analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'month'

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate: Date

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get basic user counts
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      managerUsers,
      clientUsers,
      recentUsers,
      usersWithSessions,
      usersWithActivities
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { isActive: false } }),
      db.user.count({ where: { role: 'ADMIN' } }),
      db.user.count({ where: { role: 'MANAGER' } }),
      db.user.count({ where: { role: 'CLIENT' } }),
      db.user.count({ where: { createdAt: { gte: startDate } } }),
      db.user.count({ where: { sessions: { some: {} } } }),
      db.user.count({ where: { activities: { some: {} } } })
    ])

    // Get user growth data
    const userGrowth = await db.user.groupBy({
      by: ['role'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        id: true
      }
    })

    // Get top active users
    const topActiveUsers = await db.user.findMany({
      take: 10,
      where: { isActive: true },
      include: {
        _count: {
          select: {
            sessions: true,
            activities: true
          }
        },
        profile: true
      },
      orderBy: {
        activities: {
          _count: 'desc'
        }
      }
    })

    // Get recent user registrations
    const recentRegistrations = await db.user.findMany({
      take: 10,
      where: {
        createdAt: { gte: startDate }
      },
      include: {
        profile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get department distribution
    const departmentDistribution = await db.userProfile.groupBy({
      by: ['department'],
      where: {
        department: { not: null }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Get company distribution
    const companyDistribution = await db.userProfile.groupBy({
      by: ['company'],
      where: {
        company: { not: null }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Calculate engagement metrics
    const totalSessions = await db.userSession.count()
    const totalActivities = await db.userActivity.count()
    const avgSessionsPerUser = totalUsers > 0 ? totalSessions / totalUsers : 0
    const avgActivitiesPerUser = totalUsers > 0 ? totalActivities / totalUsers : 0

    const stats = {
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        recentUsers,
        engagementRate: totalUsers > 0 ? ((usersWithActivities / totalUsers) * 100).toFixed(1) : '0'
      },
      roleDistribution: {
        admin: adminUsers,
        manager: managerUsers,
        client: clientUsers
      },
      growth: {
        newUsers: recentUsers,
        growthByRole: userGrowth.map(growth => ({
          role: growth.role,
          count: growth._count.id
        }))
      },
      activity: {
        totalSessions,
        totalActivities,
        avgSessionsPerUser: avgSessionsPerUser.toFixed(1),
        avgActivitiesPerUser: avgActivitiesPerUser.toFixed(1),
        activeUsers: usersWithSessions,
        engagedUsers: usersWithActivities
      },
      topUsers: topActiveUsers.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name || `${user.profile?.firstName} ${user.profile?.lastName}`,
        role: user.role,
        company: user.profile?.company,
        sessions: user._count.sessions,
        activities: user._count.activities,
        lastLogin: user.lastLoginAt
      })),
      recentRegistrations: recentRegistrations.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name || `${user.profile?.firstName} ${user.profile?.lastName}`,
        role: user.role,
        company: user.profile?.company,
        createdAt: user.createdAt
      })),
      demographics: {
        departments: departmentDistribution.map(dept => ({
          name: dept.department,
          count: dept._count.id
        })),
        companies: companyDistribution.map(company => ({
          name: company.company,
          count: company._count.id
        }))
      },
      timeframe
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    )
  }
}