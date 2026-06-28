import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Create sample users for testing
    const sampleUsers = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'ADMIN' as const,
        firstName: 'Admin',
        lastName: 'User',
        company: 'Z.ai',
        department: 'IT',
        position: 'System Administrator'
      },
      {
        email: 'manager@example.com',
        password: 'manager123',
        name: 'Manager User',
        role: 'MANAGER' as const,
        firstName: 'Manager',
        lastName: 'User',
        company: 'Z.ai',
        department: 'Sales',
        position: 'Sales Manager'
      },
      {
        email: 'client@example.com',
        password: 'client123',
        name: 'Client User',
        role: 'CLIENT' as const,
        firstName: 'Client',
        lastName: 'User',
        company: 'Client Corp',
        department: 'Marketing',
        position: 'Marketing Director'
      }
    ]

    const createdUsers = []

    for (const userData of sampleUsers) {
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: userData.email }
      })

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10)
        
        const user = await db.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
            role: userData.role,
            profile: {
              create: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                company: userData.company,
                department: userData.department,
                position: userData.position,
              }
            }
          },
          include: {
            profile: true
          }
        })

        // Create some sample activities
        await db.userActivity.createMany({
          data: [
            {
              userId: user.id,
              action: 'User login',
              resource: 'Authentication',
              metadata: { loginMethod: 'email' }
            },
            {
              userId: user.id,
              action: 'Dashboard viewed',
              resource: 'Dashboard',
              metadata: { dashboardType: user.role.toLowerCase() }
            }
          ]
        })

        createdUsers.push(user)
      }
    }

    // Create some additional sample activities
    const activities = [
      { action: 'User created', resource: 'User Management' },
      { action: 'Settings updated', resource: 'System Configuration' },
      { action: 'Report generated', resource: 'Analytics' },
      { action: 'Database backup created', resource: 'System Maintenance' },
      { action: 'Failed login attempt', resource: 'Authentication' }
    ]

    for (const activity of activities) {
      await db.userActivity.create({
        data: {
          userId: createdUsers[0]?.id || 'system',
          action: activity.action,
          resource: activity.resource,
          metadata: { timestamp: new Date().toISOString() }
        }
      })
    }

    return NextResponse.json({
      message: 'Sample data created successfully',
      users: createdUsers.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role
      }))
    })
  } catch (error) {
    console.error('Error creating sample data:', error)
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    )
  }
}