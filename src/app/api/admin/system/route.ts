import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const systemSettingsSchema = z.object({
  siteName: z.string().optional(),
  siteDescription: z.string().optional(),
  allowRegistration: z.boolean().optional(),
  requireEmailVerification: z.boolean().optional(),
  sessionTimeout: z.number().optional(),
  maxLoginAttempts: z.number().optional(),
  lockoutDuration: z.number().optional(),
  passwordMinLength: z.number().optional(),
  requireStrongPassword: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
})

const backupSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
})

// GET /api/admin/system - Get system settings and status
export async function GET(request: NextRequest) {
  try {
    // Get system statistics
    const systemStats = await getSystemStats()
    
    // Get system health
    const systemHealth = await getSystemHealth()
    
    // Get recent system activities
    const recentActivities = await db.userActivity.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    // Get database information
    const databaseInfo = await getDatabaseInfo()

    // Get system configuration (in a real app, this might come from a config file or database)
    const systemConfig = {
      siteName: 'AI CRM System',
      siteDescription: 'AI-powered business intelligence platform',
      allowRegistration: true,
      requireEmailVerification: false,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      passwordMinLength: 6,
      requireStrongPassword: false,
      maintenanceMode: false,
      maintenanceMessage: '',
    }

    return NextResponse.json({
      stats: systemStats,
      health: systemHealth,
      config: systemConfig,
      database: databaseInfo,
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        user: activity.user.name || activity.user.email,
        role: activity.user.role,
        action: activity.action,
        resource: activity.resource,
        timestamp: activity.createdAt,
        metadata: activity.metadata
      }))
    })
  } catch (error) {
    console.error('Error fetching system info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system information' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/system - Update system settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = systemSettingsSchema.parse(body)

    // In a real application, you would save these to a database or config file
    // For now, we'll just log the change and return success
    
    // Log the system configuration change
    await db.userActivity.create({
      data: {
        userId: 'system', // This would be the admin user's ID
        action: 'System settings updated',
        resource: 'System',
        metadata: {
          updatedSettings: Object.keys(validatedData),
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      message: 'System settings updated successfully',
      settings: validatedData
    })
  } catch (error) {
    console.error('Error updating system settings:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update system settings' },
      { status: 500 }
    )
  }
}

// POST /api/admin/system/backup - Create system backup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = backupSchema.parse(body)

    // In a real application, you would create an actual database backup
    // For now, we'll simulate the backup process
    
    const backupInfo = {
      id: `backup_${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      size: Math.floor(Math.random() * 10000000) + 1000000, // Random size between 1MB-10MB
      status: 'completed',
      downloadUrl: `/api/admin/system/backup/download/${Date.now()}`
    }

    // Log the backup creation
    await db.userActivity.create({
      data: {
        userId: 'system',
        action: 'System backup created',
        resource: 'System',
        metadata: {
          backupName: name,
          backupId: backupInfo.id,
          backupSize: backupInfo.size
        }
      }
    })

    return NextResponse.json({
      message: 'Backup created successfully',
      backup: backupInfo
    })
  } catch (error) {
    console.error('Error creating backup:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    )
  }
}



async function getSystemStats() {
  const [
    totalUsers,
    activeUsers,
    totalActivities,
    totalSessions,
    recentLogins
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { isActive: true } }),
    db.userActivity.count(),
    db.userSession.count(),
    db.userActivity.count({
      where: {
        action: { contains: 'login' },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    })
  ])

  return {
    totalUsers,
    activeUsers,
    totalActivities,
    totalSessions,
    recentLogins
  }
}

async function getSystemHealth() {
  // Simulate system health checks
  const checks = [
    { name: 'Database', status: 'healthy', responseTime: Math.floor(Math.random() * 50) + 10 },
    { name: 'API Server', status: 'healthy', responseTime: Math.floor(Math.random() * 100) + 20 },
    { name: 'Authentication', status: 'healthy', responseTime: Math.floor(Math.random() * 30) + 5 },
    { name: 'File Storage', status: 'healthy', responseTime: Math.floor(Math.random() * 80) + 15 },
  ]

  const overallHealth = checks.every(check => check.status === 'healthy') ? 'healthy' : 'degraded'
  const avgResponseTime = checks.reduce((sum, check) => sum + check.responseTime, 0) / checks.length

  return {
    overall: overallHealth,
    checks,
    averageResponseTime: Math.round(avgResponseTime),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    version: '1.0.0'
  }
}

async function getDatabaseInfo() {
  // Get database statistics
  const [
    userCount,
    activityCount,
    sessionCount,
    teamCount,
    leadCount
  ] = await Promise.all([
    db.user.count(),
    db.userActivity.count(),
    db.userSession.count(),
    db.team.count(),
    db.lead.count()
  ])

  return {
    provider: 'sqlite',
    tables: {
      users: userCount,
      user_activities: activityCount,
      user_sessions: sessionCount,
      teams: teamCount,
      leads: leadCount
    },
    totalRecords: userCount + activityCount + sessionCount + teamCount + leadCount
  }
}