import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const demoLoginSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'CLIENT'])
})

const demoUsers = {
  ADMIN: {
    email: 'admin@demo.com',
    name: 'Demo Admin',
    firstName: 'Admin',
    lastName: 'User',
    company: 'Demo Corp',
    position: 'System Administrator'
  },
  MANAGER: {
    email: 'manager@demo.com',
    name: 'Demo Manager',
    firstName: 'Manager',
    lastName: 'User',
    company: 'Demo Corp',
    position: 'Team Manager'
  },
  CLIENT: {
    email: 'client@demo.com',
    name: 'Demo Client',
    firstName: 'Client',
    lastName: 'User',
    company: 'Client Company',
    position: 'Customer'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Demo login request body:', body) // Debug log
    
    const { role } = demoLoginSchema.parse(body)
    console.log('Parsed role:', role) // Debug log

    const demoUser = demoUsers[role]
    const password = 'demo123'

    // Find or create demo user
    let user = await db.user.findUnique({
      where: { email: demoUser.email },
      include: {
        profile: true
      }
    })

    if (!user) {
      // Create demo user if doesn't exist
      const hashedPassword = await bcrypt.hash(password, 10)
      
      user = await db.user.create({
        data: {
          email: demoUser.email,
          password: hashedPassword,
          name: demoUser.name,
          role: role as any,
          isActive: true,
          profile: {
            create: {
              firstName: demoUser.firstName,
              lastName: demoUser.lastName,
              company: demoUser.company,
              position: demoUser.position,
              phone: '+1 (555) 123-4567',
              bio: `Demo ${role.toLowerCase()} account for testing purposes`
            }
          }
        },
        include: {
          profile: true
        }
      })
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Log activity
    await db.userActivity.create({
      data: {
        userId: user.id,
        action: 'DEMO_LOGIN',
        resource: 'AUTH',
        metadata: { role },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    // Create session
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await db.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    // Prepare user response
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: user.profile,
      lastLoginAt: user.lastLoginAt
    }

    return NextResponse.json({
      message: 'Demo login successful',
      token,
      user: userResponse
    })

  } catch (error) {
    console.error('Demo login error:', error)
    
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', error.errors)
      return NextResponse.json(
        { 
          message: 'Invalid role specified', 
          errors: error.errors,
          received: error.errors[0]?.received || 'unknown'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    )
  }
}