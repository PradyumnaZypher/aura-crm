import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

interface SystemConfig {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    supportPhone: string
    timezone: string
    language: string
    maintenanceMode: boolean
    debugMode: boolean
  }
  security: {
    passwordMinLength: number
    passwordRequireUppercase: boolean
    passwordRequireLowercase: boolean
    passwordRequireNumbers: boolean
    passwordRequireSymbols: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    twoFactorEnabled: boolean
    ipWhitelist: string[]
    allowedOrigins: string[]
  }
  email: {
    smtpHost: string
    smtpPort: number
    smtpUsername: string
    smtpPassword: string
    smtpEncryption: 'none' | 'ssl' | 'tls'
    fromEmail: string
    fromName: string
    emailNotificationsEnabled: boolean
  }
  notifications: {
    emailAlerts: boolean
    smsAlerts: boolean
    pushNotifications: boolean
    slackWebhook: string
    discordWebhook: string
    alertThresholds: {
      failedLogins: number
      cpuUsage: number
      memoryUsage: number
      diskUsage: number
    }
  }
  backup: {
    autoBackup: boolean
    backupFrequency: 'daily' | 'weekly' | 'monthly'
    retentionDays: number
    backupLocation: 'local' | 'cloud'
    cloudProvider: 'aws' | 'gcp' | 'azure'
    cloudCredentials: {
      accessKey: string
      secretKey: string
      bucket: string
      region: string
    }
  }
  api: {
    rateLimitEnabled: boolean
    rateLimitRequests: number
    rateLimitWindow: number
    apiKeyRequired: boolean
    corsEnabled: boolean
    apiVersion: string
    documentationEnabled: boolean
  }
}

const defaultConfig: SystemConfig = {
  general: {
    siteName: 'AI CRM System',
    siteDescription: 'Advanced AI-powered management system',
    contactEmail: 'admin@z.ai',
    supportPhone: '+1-555-0123',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false,
    debugMode: false
  },
  security: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    twoFactorEnabled: false,
    ipWhitelist: [],
    allowedOrigins: []
  },
  email: {
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpEncryption: 'tls',
    fromEmail: 'noreply@z.ai',
    fromName: 'Z.ai System',
    emailNotificationsEnabled: true
  },
  notifications: {
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    slackWebhook: '',
    discordWebhook: '',
    alertThresholds: {
      failedLogins: 5,
      cpuUsage: 80,
      memoryUsage: 85,
      diskUsage: 90
    }
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    backupLocation: 'local',
    cloudProvider: 'aws',
    cloudCredentials: {
      accessKey: '',
      secretKey: '',
      bucket: '',
      region: 'us-east-1'
    }
  },
  api: {
    rateLimitEnabled: true,
    rateLimitRequests: 100,
    rateLimitWindow: 15,
    apiKeyRequired: false,
    corsEnabled: true,
    apiVersion: 'v1',
    documentationEnabled: true
  }
}

// GET - Fetch system configuration
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get config from database first
    let config = await db.systemConfig.findFirst()
    
    // If no config exists, create default config
    if (!config) {
      config = await db.systemConfig.create({
        data: {
          config: defaultConfig,
          updatedBy: session.user.id
        }
      })
    }

    return NextResponse.json(config.config)
  } catch (error) {
    console.error('Error fetching system config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system configuration' },
      { status: 500 }
    )
  }
}

// PUT - Update system configuration
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the configuration data
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid configuration data' },
        { status: 400 }
      )
    }

    // Get existing config
    let existingConfig = await db.systemConfig.findFirst()
    
    if (existingConfig) {
      // Merge with existing config
      const updatedConfig = { ...existingConfig.config, ...body }
      
      // Update the configuration
      const updated = await db.systemConfig.update({
        where: { id: existingConfig.id },
        data: {
          config: updatedConfig,
          updatedBy: session.user.id
        }
      })
      
      return NextResponse.json(updated.config)
    } else {
      // Create new configuration
      const newConfig = { ...defaultConfig, ...body }
      
      const created = await db.systemConfig.create({
        data: {
          config: newConfig,
          updatedBy: session.user.id
        }
      })
      
      return NextResponse.json(created.config)
    }
  } catch (error) {
    console.error('Error updating system config:', error)
    return NextResponse.json(
      { error: 'Failed to update system configuration' },
      { status: 500 }
    )
  }
}