import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth'

// Default security settings
const defaultSettings = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    maxAge: 90,
    historyCount: 5
  },
  sessionSettings: {
    timeoutMinutes: 30,
    maxConcurrentSessions: 3,
    requireReauth: true,
    reauthTimeoutMinutes: 15
  },
  loginSecurity: {
    maxAttempts: 5,
    lockoutDuration: 15,
    requireTwoFactor: false,
    allowRememberMe: true,
    ipWhitelist: [],
    ipBlacklist: []
  },
  notifications: {
    failedLoginAttempts: true,
    passwordChanges: true,
    newDeviceLogin: true,
    adminActions: true,
    securityAlerts: true,
    emailNotifications: true,
    smsNotifications: false
  },
  auditSettings: {
    logLevel: 'detailed',
    retentionDays: 90,
    logFailedRequests: true,
    logApiCalls: true,
    logDataAccess: false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Log the reset
    console.log('Security settings reset to defaults by admin:', authResult.user?.id)

    return NextResponse.json(defaultSettings)

  } catch (error) {
    console.error('Error resetting security settings:', error)
    return NextResponse.json(
      { error: 'Failed to reset security settings' },
      { status: 500 }
    )
  }
}