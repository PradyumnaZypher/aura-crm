import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Define role permissions
const ROLE_PERMISSIONS = {
  ADMIN: [
    'user_management',
    'system_settings',
    'database_management',
    'security_management',
    'analytics_view',
    'performance_monitoring',
    'backup_restore',
    'audit_logs'
  ],
  MANAGER: [
    'team_management',
    'client_management',
    'reports_view',
    'lead_management',
    'campaign_management',
    'user_view'
  ],
  CLIENT: [
    'dashboard',
    'profile',
    'own_data',
    'support_tickets'
  ]
}

// GET /api/admin/users/roles - Get all roles and their permissions
export async function GET() {
  try {
    // Get user count by role
    const roleStats = await db.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    })

    const rolesWithStats = Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
      role,
      permissions,
      userCount: roleStats.find(stat => stat.role === role)?._count.id || 0,
      description: getRoleDescription(role)
    }))

    return NextResponse.json({
      roles: rolesWithStats,
      totalRoles: Object.keys(ROLE_PERMISSIONS).length
    })
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users/roles/migrate - Bulk update user roles
export async function POST(request: NextRequest) {
  try {
    const { userIds, newRole } = await request.json()

    if (!userIds || !Array.isArray(userIds) || !newRole) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    if (!Object.keys(ROLE_PERMISSIONS).includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Update users' roles
    const result = await db.user.updateMany({
      where: {
        id: {
          in: userIds
        }
      },
      data: {
        role: newRole
      }
    })

    // Log activities for each user
    await Promise.all(userIds.map(userId => 
      db.userActivity.create({
        data: {
          userId,
          action: 'ROLE_CHANGED',
          resource: 'user',
          metadata: {
            newRole,
            changedBy: 'admin',
            bulkUpdate: true
          }
        }
      })
    ))

    return NextResponse.json({
      message: `Successfully updated ${result.count} users to ${newRole} role`,
      updatedCount: result.count
    })
  } catch (error) {
    console.error('Error updating user roles:', error)
    return NextResponse.json(
      { error: 'Failed to update user roles' },
      { status: 500 }
    )
  }
}

function getRoleDescription(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'Full system access with all administrative privileges'
    case 'MANAGER':
      return 'Team and client management with reporting capabilities'
    case 'CLIENT':
      return 'Basic access to personal dashboard and profile'
    default:
      return 'Unknown role'
  }
}