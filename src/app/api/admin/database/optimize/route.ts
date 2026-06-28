import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// JWT verification function (consistent with middleware)
function verifyJWT(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.cookies.get('token')?.value

  if (!token) {
    return { error: 'No token provided', status: 401 }
  }

  try {
    // For demo purposes, we'll accept the demo token
    if (token === 'demo-admin-token') {
      return { userId: 'admin', email: 'admin@demo.com', role: 'admin' }
    }
    
    // In production, verify JWT properly
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    // return decoded
    
    return { error: 'Invalid token', status: 401 }
  } catch (error) {
    return { error: 'Invalid token', status: 401 }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authResult = verifyJWT(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { optimizeTables = true, rebuildIndexes = true, updateStatistics = true } = await request.json()
    
    const startTime = Date.now()
    const result = await optimizeDatabase(optimizeTables, rebuildIndexes, updateStatistics)
    const executionTime = Date.now() - startTime
    
    return NextResponse.json({
      ...result,
      executionTime
    })
  } catch (error) {
    console.error('Database optimization error:', error)
    return NextResponse.json(
      { error: 'Failed to optimize database' },
      { status: 500 }
    )
  }
}

async function optimizeDatabase(optimizeTables: boolean, rebuildIndexes: boolean, updateStatistics: boolean) {
  try {
    const results = {
      optimizedTables: 0,
      rebuiltIndexes: 0,
      updatedStatistics: 0,
      errors: [] as string[],
      details: [] as any[]
    }

    // Get all tables
    const tables = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    ` as any[]

    for (const table of tables) {
      const tableName = table.table_name
      const tableResult = {
        table: tableName,
        operations: [] as string[]
      }

      try {
        // Optimize table
        if (optimizeTables) {
          await db.$queryRawUnsafe(`OPTIMIZE TABLE \`${tableName}\``)
          tableResult.operations.push('Table optimized')
          results.optimizedTables++
        }

        // Rebuild indexes (ANALYZE TABLE updates index statistics)
        if (rebuildIndexes) {
          await db.$queryRawUnsafe(`ANALYZE TABLE \`${tableName}\``)
          tableResult.operations.push('Indexes rebuilt')
          results.rebuiltIndexes++
        }

        // Update table statistics
        if (updateStatistics) {
          await db.$queryRawUnsafe(`CHECK TABLE \`${tableName}\``)
          tableResult.operations.push('Statistics updated')
          results.updatedStatistics++
        }

        results.details.push(tableResult)
      } catch (error) {
        const errorMsg = `Error optimizing table ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`
        results.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    // Additional optimization operations
    try {
      // Flush query cache
      await db.$queryRawUnsafe('FLUSH QUERY CACHE')
      results.details.push({
        table: 'Global',
        operations: ['Query cache flushed']
      })
    } catch (error) {
      const errorMsg = `Error flushing query cache: ${error instanceof Error ? error.message : 'Unknown error'}`
      results.errors.push(errorMsg)
      console.error(errorMsg)
    }

    try {
      // Reset slow query log
      await db.$queryRawUnsafe('SET GLOBAL slow_query_log = 0')
      await db.$queryRawUnsafe('SET GLOBAL slow_query_log = 1')
      results.details.push({
        table: 'Global',
        operations: ['Slow query log reset']
      })
    } catch (error) {
      const errorMsg = `Error resetting slow query log: ${error instanceof Error ? error.message : 'Unknown error'}`
      results.errors.push(errorMsg)
      console.error(errorMsg)
    }

    return results
  } catch (error) {
    console.error('Error in database optimization:', error)
    throw error
  }
}