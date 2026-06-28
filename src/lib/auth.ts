import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export async function verifyAdminAuth(request: NextRequest) {
  try {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value

    if (!token) {
      return { success: false, error: 'No token provided' }
    }

    // Find session in database
    const session = await db.userSession.findFirst({
      where: {
        token,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true
          }
        }
      }
    })

    if (!session) {
      return { success: false, error: 'Invalid or expired token' }
    }

    // Check if user is admin and active
    if (!session.user.isActive || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Insufficient permissions' }
    }

    return { 
      success: true, 
      user: session.user,
      session: session
    }

  } catch (error) {
    console.error('Auth verification error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

export async function getCurrentUser(request?: NextRequest) {
  try {
    // For client-side usage, we need to handle this differently
    if (!request) {
      // This is a client-side call, return null for now
      // In a real app, you'd use cookies or other client-side auth
      return null
    }

    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value

    if (!token) {
      return null
    }

    // Find session in database
    const session = await db.userSession.findFirst({
      where: {
        token,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              }
            }
          }
        }
      }
    })

    if (!session || !session.user.isActive) {
      return null
    }

    return session.user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function auth() {
  // For now, return a mock admin user for testing
  // In production, this should verify the actual session
  return {
    user: {
      id: 'admin-user-id',
      email: 'admin@z.ai',
      name: 'Admin User',
      role: 'ADMIN'
    }
  }
}