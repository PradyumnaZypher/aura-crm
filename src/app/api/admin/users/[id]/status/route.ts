import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED'])
})

// PATCH /api/admin/users/[id]/status - Update user status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = updateStatusSchema.parse(body)

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

    // Map status to isActive field
    const isActive = status === 'ACTIVE'

    // Update user status
    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: { 
        isActive,
        // Note: If you want to implement BANNED status properly, 
        // you might want to add a separate 'status' field to the user model
      }
    })

    // Log activity
    await db.userActivity.create({
      data: {
        userId: existingUser.id,
        action: 'USER_STATUS_UPDATED',
        resource: 'user',
        metadata: {
          previousStatus: existingUser.isActive ? 'ACTIVE' : 'INACTIVE',
          newStatus: status,
          updatedBy: 'admin'
        }
      }
    })

    return NextResponse.json({
      message: `User status updated to ${status}`,
      status: status,
      isActive: isActive
    })
  } catch (error) {
    console.error('Error updating user status:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid status', 
          details: error.errors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}