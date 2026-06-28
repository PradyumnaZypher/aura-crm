import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'CLIENT']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  sendWelcomeEmail: z.boolean().default(true),
  requirePasswordChange: z.boolean().default(false),
  isActive: z.boolean().default(true)
}).refine((data) => data.firstName || data.lastName || data.name, {
  message: 'At least first name, last name, or full name is required',
  path: ['name']
})

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'CLIENT']).optional(),
  isActive: z.boolean().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
})

const usersQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'CLIENT']).optional().or(z.literal('')),
  isActive: z.string().optional(),
})

// GET /api/admin/users - List users with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters manually
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined
    const role = searchParams.get('role') || undefined
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
        { profile: { company: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (role && role !== '') {
      where.role = role
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    // Get users with their profiles
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          profile: true,
          _count: {
            select: {
              sessions: true,
              activities: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'User already exists', 
          details: `A user with email ${validatedData.email} is already registered in the system.` 
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Prepare user data
    const userName = validatedData.name || `${validatedData.firstName} ${validatedData.lastName}`.trim()
    
    // Create user
    const user = await db.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: userName || null,
        role: validatedData.role,
        isActive: validatedData.isActive,
        profile: {
          create: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            phone: validatedData.phone,
            company: validatedData.company,
            department: validatedData.department,
            position: validatedData.position,
            bio: validatedData.bio,
            address: validatedData.address,
            city: validatedData.city,
            country: validatedData.country,
            avatar: validatedData.avatar || null,
          }
        }
      },
      include: {
        profile: true
      }
    })

    // Log activity
    await db.userActivity.create({
      data: {
        userId: user.id,
        action: 'USER_CREATED',
        resource: 'user',
        metadata: {
          createdUserEmail: user.email,
          createdUserRole: user.role,
          sendWelcomeEmail: validatedData.sendWelcomeEmail,
          requirePasswordChange: validatedData.requirePasswordChange,
          isActive: validatedData.isActive,
          source: 'admin_dashboard',
          details: `User ${user.email} created by admin`
        }
      }
    })

    // Send welcome email if requested (in a real app)
    if (validatedData.sendWelcomeEmail) {
      // TODO: Implement email sending
      console.log(`Welcome email would be sent to: ${user.email}`)
    }

    // Create password reset token if password change is required
    if (validatedData.requirePasswordChange) {
      // TODO: Implement password reset token generation
      console.log(`Password change required for: ${user.email}`)
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      ...userWithoutPassword,
      message: 'User created successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating user:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.message
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        details: 'An unexpected error occurred while creating the user. Please try again.'
      },
      { status: 500 }
    )
  }
}