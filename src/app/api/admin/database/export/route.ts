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

    const { format = 'json', includeData = true, includeStructure = true, tables } = await request.json()
    
    if (!['json', 'csv', 'sql'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Supported formats: json, csv, sql' }, { status: 400 })
    }

    // Export database
    const exportData = await exportDatabase(format, includeData, includeStructure, tables)
    
    // Set appropriate headers for file download
    const headers = new Headers()
    const filename = `database_export_${new Date().toISOString().split('T')[0]}.${format}`
    
    if (format === 'json') {
      headers.set('Content-Type', 'application/json')
    } else if (format === 'csv') {
      headers.set('Content-Type', 'text/csv')
    } else {
      headers.set('Content-Type', 'application/sql')
    }
    
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    
    return new NextResponse(exportData, {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('Database export error:', error)
    return NextResponse.json(
      { error: 'Failed to export database' },
      { status: 500 }
    )
  }
}

async function exportDatabase(format: string, includeData: boolean, includeStructure: boolean, tables?: string[]) {
  try {
    // Get tables to export
    const tablesToExport = tables || await getTableNames()
    
    if (format === 'json') {
      return await exportAsJSON(tablesToExport, includeData, includeStructure)
    } else if (format === 'csv') {
      return await exportAsCSV(tablesToExport, includeData)
    } else if (format === 'sql') {
      return await exportAsSQL(tablesToExport, includeData, includeStructure)
    }
    
    throw new Error('Unsupported format')
  } catch (error) {
    console.error('Error exporting database:', error)
    throw error
  }
}

async function getTableNames() {
  const tables = await db.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  ` as any[]
  
  return tables.map((t: any) => t.table_name)
}

async function exportAsJSON(tables: string[], includeData: boolean, includeStructure: boolean) {
  const exportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      includeData,
      includeStructure,
      tables
    },
    structure: {} as any,
    data: {} as any
  }

  if (includeStructure) {
    for (const tableName of tables) {
      try {
        const createTable = await db.$queryRawUnsafe(`SHOW CREATE TABLE \`${tableName}\``) as any[]
        exportData.structure[tableName] = createTable[0]?.['Create Table'] || ''
      } catch (error) {
        console.error(`Error getting structure for table ${tableName}:`, error)
        exportData.structure[tableName] = ''
      }
    }
  }

  if (includeData) {
    for (const tableName of tables) {
      try {
        const data = await db.$queryRawUnsafe(`SELECT * FROM \`${tableName}\``) as any[]
        exportData.data[tableName] = data
      } catch (error) {
        console.error(`Error getting data for table ${tableName}:`, error)
        exportData.data[tableName] = []
      }
    }
  }

  return JSON.stringify(exportData, null, 2)
}

async function exportAsCSV(tables: string[], includeData: boolean) {
  if (!includeData) {
    throw new Error('CSV export requires data to be included')
  }

  const csvData = []
  
  for (const tableName of tables) {
    try {
      const data = await db.$queryRawUnsafe(`SELECT * FROM \`${tableName}\``) as any[]
      
      if (data.length === 0) {
        csvData.push(`# Table: ${tableName} (no data)`)
        csvData.push('')
        continue
      }

      csvData.push(`# Table: ${tableName}`)
      
      // Headers
      const headers = Object.keys(data[0])
      csvData.push(headers.join(','))
      
      // Data rows
      for (const row of data) {
        const values = headers.map(header => {
          const value = row[header]
          if (value === null) return 'NULL'
          if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`
          if (value instanceof Date) return `"${value.toISOString().slice(0, 19).replace('T', ' ')}'`
          return String(value)
        })
        csvData.push(values.join(','))
      }
      
      csvData.push('')
    } catch (error) {
      console.error(`Error exporting table ${tableName} as CSV:`, error)
      csvData.push(`# Error exporting table ${tableName}: ${error}`)
      csvData.push('')
    }
  }
  
  return csvData.join('\n')
}

async function exportAsSQL(tables: string[], includeData: boolean, includeStructure: boolean) {
  let sqlContent = `-- Database Export\n`
  sqlContent += `-- Generated: ${new Date().toISOString()}\n`
  sqlContent += `-- Tables: ${tables.join(', ')}\n\n`

  if (includeStructure) {
    sqlContent += `-- Database Structure\n\n`
    
    for (const tableName of tables) {
      try {
        const createTable = await db.$queryRawUnsafe(`SHOW CREATE TABLE \`${tableName}\``) as any[]
        
        if (createTable.length > 0) {
          sqlContent += `-- Table structure for \`${tableName}\`\n`
          sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`
          sqlContent += createTable[0]['Create Table'] + ';\n\n'
        }
      } catch (error) {
        console.error(`Error getting structure for table ${tableName}:`, error)
        sqlContent += `-- Error getting structure for table ${tableName}\n\n`
      }
    }
  }

  if (includeData) {
    sqlContent += `-- Data Insertion\n\n`
    
    for (const tableName of tables) {
      try {
        const data = await db.$queryRawUnsafe(`SELECT * FROM \`${tableName}\``) as any[]
        
        if (data.length === 0) {
          sqlContent += `-- No data in table \`${tableName}\`\n\n`
          continue
        }

        sqlContent += `-- Data for table \`${tableName}\`\n`
        
        for (const row of data) {
          const columns = Object.keys(row)
          const values = columns.map(col => {
            const val = row[col]
            if (val === null) return 'NULL'
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`
            return String(val)
          })
          
          sqlContent += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});\n`
        }
        
        sqlContent += '\n'
      } catch (error) {
        console.error(`Error getting data for table ${tableName}:`, error)
        sqlContent += `-- Error getting data for table ${tableName}\n\n`
      }
    }
  }

  return sqlContent
}