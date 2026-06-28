import { NextRequest, NextResponse } from 'next/server'

// User templates for quick user creation
const userTemplates = [
  {
    id: 'client-template',
    name: 'Standard Client',
    role: 'CLIENT',
    permissions: ['view_dashboard', 'view_profile', 'edit_profile'],
    defaultSettings: {
      isActive: true,
      sendWelcomeEmail: true,
      defaultPassword: false
    }
  },
  {
    id: 'manager-template',
    name: 'Team Manager',
    role: 'MANAGER',
    permissions: ['view_dashboard', 'view_profile', 'edit_profile', 'manage_team', 'view_reports'],
    defaultSettings: {
      isActive: true,
      sendWelcomeEmail: true,
      defaultPassword: false
    }
  },
  {
    id: 'admin-template',
    name: 'System Administrator',
    role: 'ADMIN',
    permissions: ['*'], // All permissions
    defaultSettings: {
      isActive: true,
      sendWelcomeEmail: true,
      defaultPassword: false
    }
  },
  {
    id: 'sales-rep-template',
    name: 'Sales Representative',
    role: 'CLIENT',
    permissions: ['view_dashboard', 'view_profile', 'edit_profile', 'manage_leads'],
    defaultSettings: {
      isActive: true,
      sendWelcomeEmail: true,
      defaultPassword: false
    }
  },
  {
    id: 'support-agent-template',
    name: 'Support Agent',
    role: 'CLIENT',
    permissions: ['view_dashboard', 'view_profile', 'edit_profile', 'manage_tickets'],
    defaultSettings: {
      isActive: true,
      sendWelcomeEmail: true,
      defaultPassword: false
    }
  }
]

// GET /api/admin/settings/user-templates - Fetch user templates
export async function GET() {
  try {
    return NextResponse.json(userTemplates)
  } catch (error) {
    console.error('Error fetching user templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user templates' },
      { status: 500 }
    )
  }
}

// POST /api/admin/settings/user-templates - Create new user template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.role) {
      return NextResponse.json(
        { error: 'Name and role are required' },
        { status: 400 }
      )
    }

    const newTemplate = {
      id: `template-${Date.now()}`,
      name: body.name,
      role: body.role,
      permissions: body.permissions || [],
      defaultSettings: body.defaultSettings || {}
    }

    // In a real app, you would save to database
    // await db.userTemplate.create({ data: newTemplate })

    console.log('Created user template:', newTemplate)

    return NextResponse.json({
      success: true,
      message: 'User template created successfully',
      template: newTemplate
    })

  } catch (error) {
    console.error('Error creating user template:', error)
    return NextResponse.json(
      { error: 'Failed to create user template' },
      { status: 500 }
    )
  }
}