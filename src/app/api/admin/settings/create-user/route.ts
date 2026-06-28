import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

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

// POST /api/admin/settings/create-user - Create a single user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userData = createUserDataSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // Create the user
    const newUser = await db.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}` 
          : userData.firstName || userData.lastName || null,
        role: userData.role,
        isActive: userData.isActive,
        profile: {
          create: {
            firstName: userData.firstName || null,
            lastName: userData.lastName || null,
            company: userData.company || null,
            department: userData.department || null,
            position: userData.position || null,
            phone: userData.phone || null
          }
        }
      },
      include: {
        profile: true
      }
    })

    // Log the user creation
    await db.userActivity.create({
      data: {
        userId: 'system', // System action
        action: 'USER_CREATED',
        resource: 'user',
        details: `Created user: ${userData.email}`,
        metadata: { 
          role: userData.role,
          source: 'admin_settings',
          sendWelcomeEmail: userData.sendWelcomeEmail
        }
      }
    })

    // Send welcome email if requested (in a real app)
    if (userData.sendWelcomeEmail) {
      // TODO: Implement email sending
      console.log(`Welcome email would be sent to: ${userData.email}`)
    }

    // Return the created user without password
    const { password, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Error creating user:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}