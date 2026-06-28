import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const importDataSchema = z.object({
  version: z.string().optional(),
  exportedAt: z.string().optional(),
  settings: z.object({
    general: z.any().optional(),
    userManagement: z.any().optional(),
    security: z.any().optional(),
    email: z.any().optional(),
    notifications: z.any().optional(),
    backup: z.any().optional()
  })
})

// POST /api/admin/settings/import - Import settings from JSON
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { version, exportedAt, settings } = importDataSchema.parse(body)

    console.log('Importing settings:', {
      version,
      exportedAt,
      categories: Object.keys(settings)
    })

    // In a real app, you would update each category in the database
    // For now, just simulate the import process
    const importResults = []
    
    for (const [category, config] of Object.entries(settings)) {
      try {
        // Simulate database update
        // await db.settings.upsert({
        //   where: { category },
        //   update: { config },
        //   create: { category, config }
        // })
        
        importResults.push({
          category,
          status: 'success',
          message: `${category} settings imported successfully`
        })
      } catch (error) {
        importResults.push({
          category,
          status: 'error',
          message: `Failed to import ${category} settings: ${error.message}`
        })
      }
    }

    const successCount = importResults.filter(r => r.status === 'success').length
    const errorCount = importResults.filter(r => r.status === 'error').length

    // Log the import activity
    // await db.userActivity.create({
    //   data: {
    //     userId: 'system',
    //     action: 'SETTINGS_IMPORTED',
    //     resource: 'settings',
    //     details: `Settings import completed: ${successCount} success, ${errorCount} errors`,
    //     metadata: { 
    //       version,
    //       exportedAt,
    //       results: importResults
    //     }
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: `Settings import completed`,
      summary: {
        total: importResults.length,
        success: successCount,
        errors: errorCount
      },
      results: importResults
    })

  } catch (error) {
    console.error('Error importing settings:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid import format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to import settings' },
      { status: 500 }
    )
  }
}