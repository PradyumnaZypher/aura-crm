import { NextRequest, NextResponse } from 'next/server'

// Default settings
const defaultSettings = {
  general: {
    siteName: 'AI CRM System',
    siteDescription: 'AI-powered business intelligence platform',
    siteUrl: 'https://z.ai',
    logoUrl: '',
    faviconUrl: '',
    defaultLanguage: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  },
  userManagement: {
    allowRegistration: true,
    requireEmailVerification: false,
    requireAdminApproval: false,
    defaultUserRole: 'CLIENT',
    sessionTimeout: 24 * 60 * 60 * 1000,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
    passwordMinLength: 8,
    requireStrongPassword: true,
    passwordExpiry: 90,
    allowSocialLogin: false
  },
  security: {
    enableTwoFactor: false,
    forceTwoFactor: false,
    sessionSecure: true,
    corsOrigins: [],
    rateLimiting: true,
    rateLimitRequests: 100,
    rateLimitWindow: 15,
    enableAuditLog: true,
    dataRetentionDays: 365
  },
  email: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: '',
    fromName: '',
    replyTo: '',
    emailTemplates: true
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    newUserNotification: true,
    loginAlerts: true,
    systemAlerts: true,
    maintenanceAlerts: true
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    backupLocation: 'local',
    encryptionEnabled: true,
    includeUserData: true,
    includeSystemData: true
  }
}

// GET /api/admin/settings/export - Export settings as JSON
export async function GET() {
  try {
    // In a real app, you would fetch from database
    // For now, return default settings
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: defaultSettings
    }

    // Create JSON string
    const jsonString = JSON.stringify(exportData, null, 2)

    // Return as downloadable file
    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="settings-backup-${new Date().toISOString().split('T')[0]}.json"`
      }
    })

  } catch (error) {
    console.error('Error exporting settings:', error)
    return NextResponse.json(
      { error: 'Failed to export settings' },
      { status: 500 }
    )
  }
}