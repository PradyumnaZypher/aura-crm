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

// SQL injection protection and query validation
function validateQuery(query: string): { isValid: boolean; error?: string; queryType?: string } {
  const trimmedQuery = query.trim().toLowerCase()
  
  // Check for dangerous operations
  const dangerousPatterns = [
    /drop\s+database/i,
    /drop\s+table/i,
    /truncate\s+table/i,
    /delete\s+from\s+\w+\s*$/i, // DELETE without WHERE
    /update\s+\w+\s+set\s+\w+\s*=\s*[^;]*$/i, // UPDATE without WHERE
    /alter\s+table/i,
    /create\s+table/i,
    /grant\s+/i,
    /revoke\s+/i,
    /flush\s+/i,
    /reset\s+/i,
    /shutdown/i,
    /kill\s+/i,
    /\.\./i, // Directory traversal
    /into\s+outfile/i,
    /into\s+dumpfile/i,
    /load\s+data/i,
    /insert\s+into\s+\w+\s*values/i, // Basic INSERT (allow specific ones)
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      return { isValid: false, error: 'Dangerous operation detected' }
    }
  }

  // Determine query type
  let queryType = 'UNKNOWN'
  if (trimmedQuery.startsWith('select')) {
    queryType = 'SELECT'
  } else if (trimmedQuery.startsWith('show')) {
    queryType = 'SHOW'
  } else if (trimmedQuery.startsWith('describe') || trimmedQuery.startsWith('desc')) {
    queryType = 'DESCRIBE'
  } else if (trimmedQuery.startsWith('explain')) {
    queryType = 'EXPLAIN'
  } else if (trimmedQuery.startsWith('insert')) {
    queryType = 'INSERT'
  } else if (trimmedQuery.startsWith('update')) {
    queryType = 'UPDATE'
  } else if (trimmedQuery.startsWith('delete')) {
    queryType = 'DELETE'
  }

  // Only allow safe operations in production
  const allowedTypes = ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN']
  if (!allowedTypes.includes(queryType)) {
    return { isValid: false, error: `Query type '${queryType}' is not allowed` }
  }

  return { isValid: true, queryType }
}

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authResult = verifyJWT(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { query } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Validate query for security
    const validation = validateQuery(query)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Execute query with timeout
    const startTime = Date.now()
    const result = await executeQueryWithTimeout(query, 30000) // 30 second timeout
    const executionTime = Date.now() - startTime

    // Format the result
    const formattedResult = formatQueryResult(result, validation.queryType!)

    return NextResponse.json({
      ...formattedResult,
      executionTime,
      queryType: validation.queryType
    })

  } catch (error) {
    console.error('Query execution error:', error)
    
    let errorMessage = 'Query execution failed'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

async function executeQueryWithTimeout(query: string, timeoutMs: number): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Query execution timeout'))
    }, timeoutMs)

    try {
      let result
      
      // Use Prisma's queryRaw for SELECT queries
      if (query.trim().toLowerCase().startsWith('select') || 
          query.trim().toLowerCase().startsWith('show') ||
          query.trim().toLowerCase().startsWith('describe') ||
          query.trim().toLowerCase().startsWith('desc') ||
          query.trim().toLowerCase().startsWith('explain')) {
        result = await db.$queryRawUnsafe(query)
      } else {
        // For other operations, use transaction for safety
        result = await db.$transaction(async (tx) => {
          return await tx.$queryRawUnsafe(query)
        })
      }

      clearTimeout(timeout)
      resolve(result)
    } catch (error) {
      clearTimeout(timeout)
      reject(error)
    }
  })
}

function formatQueryResult(result: any, queryType: string) {
  if (!result) {
    return {
      columns: [],
      rows: [],
      affectedRows: 0
    }
  }

  // Handle different result types
  if (Array.isArray(result)) {
    if (result.length === 0) {
      return {
        columns: [],
        rows: [],
        affectedRows: 0
      }
    }

    // Get column names from the first row
    const columns = Object.keys(result[0] || {})
    const rows = result.map(row => 
      columns.map(col => row[col])
    )

    return {
      columns,
      rows,
      affectedRows: result.length
    }
  }

  // Handle single result (like INSERT, UPDATE, DELETE)
  if (typeof result === 'object' && result.affectedRows !== undefined) {
    return {
      columns: ['affectedRows'],
      rows: [[result.affectedRows]],
      affectedRows: result.affectedRows
    }
  }

  // Handle other cases
  return {
    columns: ['result'],
    rows: [[JSON.stringify(result)]],
    affectedRows: 1
  }
}