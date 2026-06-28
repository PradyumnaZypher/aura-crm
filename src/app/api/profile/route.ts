import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  notificationPreferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
  }).optional(),
})

// GET user profile
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      profile: user.profile,
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = profileUpdateSchema.parse(body)

    // Check if email is being changed and if it's already taken
    if (validatedData.email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: userId },
        },
      })

      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
    }

    // Update user and profile
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(validatedData.email && { email: validatedData.email }),
        profile: {
          upsert: {
            update: {
              ...(validatedData.firstName && { firstName: validatedData.firstName }),
              ...(validatedData.lastName && { lastName: validatedData.lastName }),
              ...(validatedData.phone && { phone: validatedData.phone }),
              ...(validatedData.company && { company: validatedData.company }),
              ...(validatedData.bio && { bio: validatedData.bio }),
              ...(validatedData.timezone && { timezone: validatedData.timezone }),
              ...(validatedData.language && { language: validatedData.language }),
              ...(validatedData.notificationPreferences && { 
                notificationPreferences: validatedData.notificationPreferences 
              }),
            },
            create: {
              firstName: validatedData.firstName || '',
              lastName: validatedData.lastName || '',
              phone: validatedData.phone || '',
              company: validatedData.company || '',
              bio: validatedData.bio || '',
              timezone: validatedData.timezone || 'UTC',
              language: validatedData.language || 'en',
              notificationPreferences: validatedData.notificationPreferences || {
                email: true,
                sms: false,
                push: true,
              },
            },
          },
        },
      },
      include: {
        profile: true,
      },
    })

    // Log activity
    await db.activity.create({
      data: {
        userId,
        action: 'PROFILE_UPDATED',
        resource: 'PROFILE',
        resourceType: 'USER',
        details: {
          updatedFields: Object.keys(validatedData),
        },
      },
    })

    // Remove sensitive information
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten()[0].message }, { status: 400 })
    }
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
