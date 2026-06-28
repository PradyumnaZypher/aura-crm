import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

const bulkCreateUsersSchema = z.object({
  csvData: z.string()
})

// POST /api/admin/settings/bulk-create-users - Bulk create users from CSV
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { csvData } = bulkCreateUsersSchema.parse(body)

    if (!csvData || csvData.trim().length === 0) {
      return NextResponse.json(
        { error: 'CSV data is required' },
        { status: 400 }
      )
    }

    // Parse CSV data
    const lines = csvData.trim().split('\n')
    let created = 0
    let failed = 0
    const errors = []
    const createdUsers = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const parts = line.split(',').map(part => part.trim())
      if (parts.length < 1) {
        errors.push(`Line ${i + 1}: Invalid format - at least email is required`)
        failed++
        continue
      }

      const [email, firstName, lastName, role, company, department, position, phone] = parts
      
      try {
        // Validate required fields
        if (!email || !email.includes('@')) {
          throw new Error('Invalid email address')
        }

        // Check if user already exists
        const existingUser = await db.user.findUnique({
          where: { email }
        })

        if (existingUser) {
          throw new Error('User with this email already exists')
        }

        // Validate role
        const validRole = ['ADMIN', 'MANAGER', 'CLIENT'].includes((role || 'CLIENT').toUpperCase())
          ? (role || 'CLIENT').toUpperCase() as 'ADMIN' | 'MANAGER' | 'CLIENT'
          : 'CLIENT'

        // Create user with default password
        const defaultPassword = 'tempPassword123'
        const hashedPassword = await bcrypt.hash(defaultPassword, 10)

        const userData = {
          email,
          password: hashedPassword,
          name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || null,
          role: validRole,
          isActive: true,
          profile: {
            create: {
              firstName: firstName || null,
              lastName: lastName || null,
              company: company || null,
              department: department || null,
              position: position || null,
              phone: phone || null
            }
          }
        }

        const newUser = await db.user.create({
          data: userData,
          include: {
            profile: true
          }
        })

        createdUsers.push({
          email,
          name: newUser.name,
          role: newUser.role,
          defaultPassword
        })

        created++

        // Log the creation
        await db.userActivity.create({
          data: {
            userId: 'system', // System action
            action: 'USER_CREATED',
            resource: 'user',
            details: `Bulk created user: ${email}`,
            metadata: { 
              source: 'bulk_import', 
              line: i + 1,
              role: validRole
            }
          }
        })

      } catch (error) {
        console.error(`Error processing line ${i + 1}:`, error)
        errors.push(`Line ${i + 1}: ${error.message}`)
        failed++
      }
    }

    // Log the bulk import activity
    await db.userActivity.create({
      data: {
        userId: 'system',
        action: 'BULK_USER_IMPORT',
        resource: 'user',
        details: `Bulk user import completed: ${created} created, ${failed} failed`,
        metadata: { 
          totalLines: lines.length,
          created,
          failed,
          errors: errors.slice(0, 5) // Store first 5 errors
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Bulk user creation completed`,
      summary: {
        total: lines.length,
        created,
        failed,
        successRate: lines.length > 0 ? ((created / lines.length) * 100).toFixed(1) + '%' : '0%'
      },
      createdUsers: createdUsers.map(user => ({
        email: user.email,
        name: user.name,
        role: user.role,
        defaultPassword: user.defaultPassword
      })),
      errors: errors.slice(0, 10), // Return first 10 errors
      totalErrors: errors.length
    })

  } catch (error) {
    console.error('Error in bulk user creation:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create users' },
      { status: 500 }
    )
  }
}