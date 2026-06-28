import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const statsQuerySchema = z.object({
  timeframe: z.enum(['day', 'week', 'month', 'year']).default('month'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { timeframe } = statsQuerySchema.parse({
      timeframe: searchParams.get('timeframe') || 'month'
    })

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate = new Date()
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get user statistics
    const totalUsers = await db.user.count()
    const activeUsers = await db.user.count({
      where: {
        isActive: true,
        lastLoginAt: {
          gte: startDate
        }
      }
    })

    // Get revenue estimation (based on active users and subscription model)
    const baseRevenuePerUser = 50 // Example: $50 per user per month
    const totalRevenue = activeUsers * baseRevenuePerUser

    // Calculate system health based on various factors
    const systemHealth = await calculateSystemHealth()

    // Get recent activities
    const recentActivity = await db.userActivity.findMany({
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

    // Format recent activities
    const formattedActivities = recentActivity.map(activity => ({
      id: activity.id,
      user: activity.user.name || activity.user.email,
      action: activity.action,
      time: formatRelativeTime(activity.createdAt),
      status: getActivityStatus(activity.action)
    }))

    // Get system metrics
    const systemMetrics = await getSystemMetrics()

    const stats = {
      totalUsers,
      activeUsers,
      totalRevenue,
      systemHealth,
      recentActivity: formattedActivities,
      systemMetrics,
      timeframe
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}

async function calculateSystemHealth(): Promise<number> {
  try {
    // Factor in various health metrics
    const factors: number[] = []

    // User activity factor (70% weight)
    const totalUsers = await db.user.count()
    const activeUsers = await db.user.count({
      where: { isActive: true }
    })
    const userActivityRatio = totalUsers > 0 ? activeUsers / totalUsers : 0
    factors.push(userActivityRatio * 0.7)

    // Recent errors factor (20% weight)
    const recentErrors = await db.userActivity.count({
      where: {
        action: { contains: 'error' },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    })
    const errorFactor = Math.max(0, 1 - (recentErrors / 100)) // Assume 100 errors is bad
    factors.push(errorFactor * 0.2)

    // System uptime factor (10% weight) - simulated
    factors.push(0.95 * 0.1) // 95% uptime

    return Math.round(factors.reduce((sum, factor) => sum + factor, 0) * 100)
  } catch (error) {
    console.error('Error calculating system health:', error)
    return 85 // Default health score
  }
}

async function getSystemMetrics() {
  // Simulate system metrics (in a real app, these would come from monitoring services)
  return {
    cpuUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
    memoryUsage: Math.floor(Math.random() * 40) + 40, // 40-80%
    diskUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
    uptime: formatUptime(process.uptime())
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMins = Math.floor(diffInMs / (1000 * 60))
  
  if (diffInMins < 1) return 'Just now'
  if (diffInMins < 60) return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`
  
  const diffInHours = Math.floor(diffInMins / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
}

function getActivityStatus(action: string): 'success' | 'error' | 'warning' {
  const lowerAction = action.toLowerCase()
  if (lowerAction.includes('error') || lowerAction.includes('failed')) return 'error'
  if (lowerAction.includes('warning') || lowerAction.includes('modified')) return 'warning'
  return 'success'
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)
  
  return `${days}d ${hours}h ${minutes}m`
}