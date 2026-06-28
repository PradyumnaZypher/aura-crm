import { NextRequest, NextResponse } from 'next/server'
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

// In a real application, these would be stored in a database
// For now, we'll use in-memory storage
let currentSettings = { ...defaultSettings }

export async function GET(request: NextRequest) {
  try {
    console.log('Security settings API called')
    
    // Verify admin authentication using JWT (same as middleware)
    const authResult = verifyJWT(request)
    console.log('Settings auth result:', authResult.success ? 'Success' : authResult.error)
    
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(currentSettings)

  } catch (error) {
    console.error('Error fetching security settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication using JWT (same as middleware)
    const authResult = verifyJWT(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await request.json()

    // Validate settings
    if (!settings.passwordPolicy || !settings.sessionSettings || !settings.loginSecurity) {
      return NextResponse.json(
        { error: 'Invalid security settings format' },
        { status: 400 }
      )
    }

    // Update settings
    currentSettings = {
      ...currentSettings,
      ...settings
    }

    // Log the change
    console.log('Security settings updated by admin:', authResult.user?.id)

    return NextResponse.json(currentSettings)

  } catch (error) {
    console.error('Error updating security settings:', error)
    return NextResponse.json(
      { error: 'Failed to update security settings' },
      { status: 500 }
    )
  }
}