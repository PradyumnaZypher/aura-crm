import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

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
})

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6),
})

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.id },
      include: {
        profile: true,
        _count: {
          select: {
            sessions: true,
            activities: true,
            teamMembers: true,
            managedTeams: true,
            assignedLeads: true,
            campaigns: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailTaken = await db.user.findUnique({
        where: { email: validatedData.email }
      })

      if (emailTaken) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 409 }
        )
      }
    }

    // Separate user data and profile data
    const { firstName, lastName, phone, company, department, position, ...userData } = validatedData
    const profileData = { firstName, lastName, phone, company, department, position }

    // Update user and profile
    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: {
        ...userData,
        profile: {
          update: profileData
        }
      },
      include: {
        profile: true
      }
    })

    // Log activity
    await db.userActivity.create({
      data: {
        userId: existingUser.id,
        action: 'User updated by admin',
        resource: 'User',
        metadata: {
          updatedFields: Object.keys(validatedData),
          updatedBy: 'admin'
        }
      }
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating user:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user (cascade delete will handle related records)
    await db.user.delete({
      where: { id: params.id }
    })

    // Log activity (before deletion, so we still have the user info)
    await db.userActivity.create({
      data: {
        userId: existingUser.id,
        action: 'User deleted by admin',
        resource: 'User',
        metadata: {
          deletedUserEmail: existingUser.email,
          deletedUserRole: existingUser.role
        }
      }
    })

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users/[id]/reset-password - Reset user password
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { newPassword } = resetPasswordSchema.parse(body)

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await db.user.update({
      where: { id: params.id },
      data: { password: hashedPassword }
    })

    // Log activity
    await db.userActivity.create({
      data: {
        userId: existingUser.id,
        action: 'Password reset by admin',
        resource: 'User',
        metadata: {
          resetBy: 'admin'
        }
      }
    })

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error resetting password:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}