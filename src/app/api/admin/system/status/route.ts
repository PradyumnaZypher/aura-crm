import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import fs from 'fs'
import os from 'os'

// GET - Get system status
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get database statistics
    const userCount = await db.user.count()
    const activeUserCount = await db.user.count({ where: { isActive: true } })
    const sessionCount = await db.userSession.count({ where: { isActive: true } })
    const activityCount = await db.userActivity.count()

    // Get system information
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      uptime: os.uptime(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      cpus: os.cpus().length,
      loadavg: os.loadavg(),
      hostname: os.hostname(),
      networkInterfaces: os.networkInterfaces()
    }

    // Calculate memory usage percentage
    const memoryUsage = ((systemInfo.totalmem - systemInfo.freemem) / systemInfo.totalmem) * 100

    // Get disk usage (simplified)
    let diskUsage = 0
    try {
      const stats = fs.statSync('.')
      diskUsage = 0 // Would need more complex logic for actual disk usage
    } catch (error) {
      console.error('Error getting disk usage:', error)
    }

    // Get recent activities
    const recentActivities = await db.userActivity.findMany({
      take: 10,
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

    const status = {
      timestamp: new Date().toISOString(),
      database: {
        userCount,
        activeUserCount,
        sessionCount,
        activityCount
      },
      system: {
        ...systemInfo,
        memoryUsage: Math.round(memoryUsage * 100) / 100,
        diskUsage
      },
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        user: activity.user.name || activity.user.email,
        action: activity.action,
        resource: activity.resource,
        timestamp: activity.createdAt
      }))
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error fetching system status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system status' },
      { status: 500 }
    )
  }
}