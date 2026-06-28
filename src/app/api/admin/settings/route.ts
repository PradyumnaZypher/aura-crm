import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

const settingsSchema = z.object({
  category: z.enum(['general', 'userManagement', 'security', 'email', 'notifications', 'backup']),
  settings: z.any()
})

const createUserDataSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'CLIENT']),
  department: z.string().optional(),
  position: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  sendWelcomeEmail: z.boolean().default(true),
  isActive: z.boolean().default(true)
})

const bulkCreateUsersSchema = z.object({
  csvData: z.string()
})

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

// GET /api/admin/settings - Fetch all settings
export async function GET() {
  try {
    // In a real app, you would fetch from database
    // For now, return default settings
    return NextResponse.json(defaultSettings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, settings: newSettings } = settingsSchema.parse(body)

    // In a real app, you would update in database
    console.log(`Updating ${category} settings:`, newSettings)

    // Simulate database update
    // await db.settings.upsert({
    //   where: { category },
    //   update: { config: newSettings },
    //   create: { category, config: newSettings }
    // })

    return NextResponse.json({
      success: true,
      message: `${category} settings updated successfully`,
      category,
      settings: newSettings
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

// POST /api/admin/settings - Bulk create users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { csvData } = bulkCreateUsersSchema.parse(body)

    if (!csvData) {
      return NextResponse.json(
        { error: 'CSV data is required' },
        { status: 400 }
      )
    }

    // Parse CSV data
    const lines = csvData.trim().split('\n')
    let created = 0
    let failed = 0
    const errors = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const parts = line.split(',').map(part => part.trim())
      if (parts.length < 1) {
        errors.push(`Line ${i + 1}: Invalid format`)
        failed++
        continue
      }

      const [email, firstName, lastName, role, company, department, position, phone] = parts
      
      try {
        // Validate required fields
        if (!email || !email.includes('@')) {
          throw new Error('Invalid email')
        }

        // Check if user already exists
        const existingUser = await db.user.findUnique({
          where: { email }
        })

        if (existingUser) {
          throw new Error('User already exists')
        }

        // Create user with default password
        const defaultPassword = 'tempPassword123'
        const hashedPassword = await bcrypt.hash(defaultPassword, 10)

        const userData = {
          email,
          password: hashedPassword,
          name: firstName && lastName ? `${firstName} ${lastName}` : null,
          role: (role || 'CLIENT').toUpperCase() as 'ADMIN' | 'MANAGER' | 'CLIENT',
          isActive: true,
          profile: {
            create: {
              firstName: firstName || null,
              lastName: lastName || null,
              company: company || null,
              department: department || null,
              position: position || null,
              phone: phone || null
            }
          }
        }

        await db.user.create({ data: userData })
        created++

        // Log the creation
        await db.userActivity.create({
          data: {
            userId: 'system', // System action
            action: 'USER_CREATED',
            resource: 'user',
            details: `Bulk created user: ${email}`,
            metadata: { source: 'bulk_import', line: i + 1 }
          }
        })

      } catch (error) {
        errors.push(`Line ${i + 1}: ${error.message}`)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk user creation completed`,
      created,
      failed,
      errors: errors.slice(0, 10) // Return first 10 errors
    })

  } catch (error) {
    console.error('Error in bulk user creation:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create users' },
      { status: 500 }
    )
  }
}