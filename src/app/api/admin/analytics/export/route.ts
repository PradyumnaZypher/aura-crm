import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { format, subDays } from 'date-fns'

// GET - Export analytics data as CSV
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'

    // Calculate date range
    const endDate = new Date()
    const startDate = subDays(endDate, range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90)

    // Fetch data for export
    const users = await db.user.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        profile: true
      }
    })

    const activities = await db.userActivity.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const sessions = await db.userSession.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Generate CSV content
    const csvContent = generateCSV(users, activities, sessions, range)

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${range}-${format(new Date(), 'yyyy-MM-dd')}.csv"`
      }
    })

  } catch (error) {
    console.error('Error exporting analytics:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    )
  }
}

function generateCSV(users: any[], activities: any[], sessions: any[], range: string) {
  const headers = [
    'Report Type',
    'Date Range',
    'Generated At',
    '',
    'Users Summary',
    'Total Users',
    'Active Users',
    'New Users',
    '',
    'Activities Summary',
    'Total Activities',
    'Unique Actions',
    '',
    'Sessions Summary',
    'Total Sessions',
    'Avg Session Duration',
    '',
    'User Details',
    'User ID',
    'Name',
    'Email',
    'Role',
    'Status',
    'Created At',
    'Last Login',
    'Department',
    'Position'
  ]

  const summaryData = [
    'Analytics Report',
    range,
    format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    '',
    'Users',
    users.length.toString(),
    users.filter(u => u.isActive).length.toString(),
    users.filter(u => u.createdAt >= new Date(Date.now() - (range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000)).length.toString(),
    '',
    'Activities',
    activities.length.toString(),
    new Set(activities.map(a => a.action)).size.toString(),
    '',
    'Sessions',
    sessions.length.toString(),
    '30 minutes', // Mock data
    ''
  ]

  const userRows = users.map(user => [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'User',
    user.id,
    user.name || '',
    user.email,
    user.role,
    user.isActive ? 'Active' : 'Inactive',
    format(user.createdAt, 'yyyy-MM-dd HH:mm:ss'),
    user.lastLoginAt ? format(user.lastLoginAt, 'yyyy-MM-dd HH:mm:ss') : 'Never',
    user.profile?.department || '',
    user.profile?.position || ''
  ])

  const allRows = [headers, summaryData, ...userRows]
  
  return allRows.map(row => 
    row.map(cell => {
      // Escape commas and quotes in CSV cells
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`
      }
      return cell
    }).join(',')
  ).join('\n')
}