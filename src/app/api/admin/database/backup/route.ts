import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

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

    const { name, description, includeData = true, includeStructure = true } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Backup name is required' }, { status: 400 })
    }

    // Create backup
    const backup = await createDatabaseBackup(name, description, includeData, includeStructure)
    
    return NextResponse.json(backup)
  } catch (error) {
    console.error('Database backup error:', error)
    return NextResponse.json(
      { error: 'Failed to create database backup' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const authResult = verifyJWT(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Get backup list
    const backups = await getBackupList()
    
    return NextResponse.json(backups)
  } catch (error) {
    console.error('Database backup list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backup list' },
      { status: 500 }
    )
  }
}

async function createDatabaseBackup(name: string, description?: string, includeData = true, includeStructure = true) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupId = `backup_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
    const filename = `${name}_${timestamp}.sql`
    
    // Get all tables
    const tables = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY table_name
    ` as any[]

    let backupContent = `-- Database Backup: ${name}\n`
    backupContent += `-- Generated: ${new Date().toISOString()}\n`
    backupContent += `-- Description: ${description || 'No description provided'}\n`
    backupContent += `-- Backup ID: ${backupId}\n\n`

    if (includeStructure) {
      backupContent += `-- Database Structure\n\n`
      
      for (const table of tables) {
        const tableName = table.table_name
        
        // Get CREATE TABLE statement
        const createTable = await db.$queryRawUnsafe(`SHOW CREATE TABLE \`${tableName}\``) as any[]
        
        if (createTable.length > 0) {
          backupContent += `-- Table structure for \`${tableName}\`\n`
          backupContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`
          backupContent += createTable[0]['Create Table'] + ';\n\n'
        }
      }
    }

    if (includeData) {
      backupContent += `-- Data Insertion\n\n`
      
      for (const table of tables) {
        const tableName = table.table_name
        
        // Get table data
        const data = await db.$queryRawUnsafe(`SELECT * FROM \`${tableName}\``) as any[]
        
        if (data.length > 0) {
          backupContent += `-- Data for table \`${tableName}\`\n`
          
          for (const row of data) {
            const columns = Object.keys(row)
            const values = columns.map(col => {
              const val = row[col]
              if (val === null) return 'NULL'
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`
              if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`
              return String(val)
            })
            
            backupContent += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});\n`
          }
          
          backupContent += '\n'
        }
      }
    }

    // Save backup to file system
    const backupDir = join(process.cwd(), 'backups')
    await mkdir(backupDir, { recursive: true })
    const backupPath = join(backupDir, filename)
    await writeFile(backupPath, backupContent, 'utf8')

    // Save backup metadata to database (you would create a backups table in production)
    const backupSize = Buffer.byteLength(backupContent, 'utf8')
    const sizeFormatted = backupSize > 1024 * 1024 
      ? `${(backupSize / (1024 * 1024)).toFixed(2)} MB` 
      : `${(backupSize / 1024).toFixed(2)} KB`

    // For now, return the backup info
    return {
      id: backupId,
      filename,
      size: sizeFormatted,
      createdAt: new Date().toISOString(),
      type: 'manual',
      status: 'completed',
      description,
      tables: tables.map((t: any) => t.table_name),
      path: backupPath
    }
  } catch (error) {
    console.error('Error creating backup:', error)
    throw error
  }
}

async function getBackupList() {
  try {
    // In production, this would query a backups table
    // For now, return mock data with some realistic backups
    return [
      {
        id: 'backup_2024-01-15_10_30_00_abc123',
        filename: 'daily_backup_2024-01-15.sql',
        size: '2.4 MB',
        createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
        type: 'automatic',
        status: 'completed',
        description: 'Daily automatic backup',
        tables: ['users', 'user_profiles', 'user_activities', 'user_sessions']
      },
      {
        id: 'backup_2024-01-14_10_30_00_def456',
        filename: 'daily_backup_2024-01-14.sql',
        size: '2.3 MB',
        createdAt: new Date('2024-01-14T10:30:00Z').toISOString(),
        type: 'automatic',
        status: 'completed',
        description: 'Daily automatic backup',
        tables: ['users', 'user_profiles', 'user_activities', 'user_sessions']
      },
      {
        id: 'backup_2024-01-13_15_45_00_ghi789',
        filename: 'pre_update_backup.sql',
        size: '2.5 MB',
        createdAt: new Date('2024-01-13T15:45:00Z').toISOString(),
        type: 'manual',
        status: 'completed',
        description: 'Backup before system update',
        tables: ['users', 'user_profiles', 'user_activities', 'user_sessions', 'teams', 'leads']
      },
      {
        id: 'backup_2024-01-12_10_30_00_jkl012',
        filename: 'daily_backup_2024-01-12.sql',
        size: '2.2 MB',
        createdAt: new Date('2024-01-12T10:30:00Z').toISOString(),
        type: 'automatic',
        status: 'completed',
        description: 'Daily automatic backup',
        tables: ['users', 'user_profiles', 'user_activities', 'user_sessions']
      },
      {
        id: 'backup_2024-01-11_10_30_00_mno345',
        filename: 'daily_backup_2024-01-11.sql',
        size: '2.1 MB',
        createdAt: new Date('2024-01-11T10:30:00Z').toISOString(),
        type: 'automatic',
        status: 'completed',
        description: 'Daily automatic backup',
        tables: ['users', 'user_profiles', 'user_activities', 'user_sessions']
      }
    ]
  } catch (error) {
    console.error('Error getting backup list:', error)
    return []
  }
}