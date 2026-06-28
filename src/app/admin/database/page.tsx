'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Database, 
  Activity, 
  Shield, 
  Download, 
  Upload, 
  Search,
  RefreshCw,
  Play,
  Save,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  HardDrive,
  Zap,
  FileText,
  Settings
} from 'lucide-react'

interface DatabaseStats {
  totalTables: number
  totalSize: string
  totalRows: number
  connections: number
  uptime: string
  lastBackup: string
}

interface Table {
  name: string
  rows: number
  size: string
  engine: string
  collation: string
}

interface QueryResult {
  columns: string[]
  rows: any[][]
  executionTime: number
  affectedRows: number
}

interface Backup {
  id: string
  filename: string
  size: string
  createdAt: string
  type: string
}

interface LogEntry {
  id: string
  timestamp: string
  level: 'INFO' | 'WARNING' | 'ERROR'
  message: string
  user: string
  duration?: number
}

export default function DatabaseManagement() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [query, setQuery] = useState('')
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [queryHistory, setQueryHistory] = useState<string[]>([])
  const [backups, setBackups] = useState<Backup[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [exportFormat, setExportFormat] = useState('sql')
  const [selectedTable, setSelectedTable] = useState('')

  // Fetch database stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/database/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  // Fetch tables
  const fetchTables = async () => {
    try {
      const response = await fetch('/api/admin/database/tables')
      if (response.ok) {
        const data = await response.json()
        setTables(data)
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error)
    }
  }

  // Fetch backups
  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/admin/database/backups')
      if (response.ok) {
        const data = await response.json()
        setBackups(data)
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error)
    }
  }

  // Fetch logs
  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/database/logs')
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  // Execute query
  const executeQuery = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/database/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      if (response.ok) {
        const data = await response.json()
        setQueryResult(data)
        setQueryHistory(prev => [query, ...prev.slice(0, 9)])
      } else {
        const error = await response.json()
        alert(`Query failed: ${error.message}`)
      }
    } catch (error) {
      console.error('Failed to execute query:', error)
      alert('Failed to execute query')
    } finally {
      setLoading(false)
    }
  }

  // Create backup
  const createBackup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/database/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'full',
          description: `Manual backup - ${new Date().toISOString()}`
        })
      })

      if (response.ok) {
        await fetchBackups()
        alert('Backup created successfully')
      } else {
        const error = await response.json()
        alert(`Backup failed: ${error.message}`)
      }
    } catch (error) {
      console.error('Failed to create backup:', error)
      alert('Failed to create backup')
    } finally {
      setLoading(false)
    }
  }

  // Optimize database
  const optimizeDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/database/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Database optimized successfully. ${data.message}`)
        await fetchStats()
      } else {
        const error = await response.json()
        alert(`Optimization failed: ${error.message}`)
      }
    } catch (error) {
      console.error('Failed to optimize database:', error)
      alert('Failed to optimize database')
    } finally {
      setLoading(false)
    }
  }

  // Export data
  const exportData = async () => {
    if (!selectedTable) {
      alert('Please select a table to export')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/database/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          table: selectedTable,
          format: exportFormat
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedTable}_export.${exportFormat}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const error = await response.json()
        alert(`Export failed: ${error.message}`)
      }
    } catch (error) {
      console.error('Failed to export data:', error)
      alert('Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  // Delete backup
  const deleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) return

    try {
      const response = await fetch(`/api/admin/database/backup/${backupId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchBackups()
        alert('Backup deleted successfully')
      } else {
        const error = await response.json()
        alert(`Delete failed: ${error.message}`)
      }
    } catch (error) {
      console.error('Failed to delete backup:', error)
      alert('Failed to delete backup')
    }
  }

  useEffect(() => {
    fetchStats()
    fetchTables()
    fetchBackups()
    fetchLogs()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Database Management</h1>
          <p className="text-slate-600 mt-2">Manage database operations, backups, and performance</p>
        </div>
        <Button onClick={fetchStats} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="query" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Query
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Backup
          </TabsTrigger>
          <TabsTrigger value="optimize" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Optimize
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalTables || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database Size</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSize || '0 MB'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalRows?.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connections</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.connections || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>Overview of all database tables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Table Name</th>
                      <th className="text-left p-2">Rows</th>
                      <th className="text-left p-2">Size</th>
                      <th className="text-left p-2">Engine</th>
                      <th className="text-left p-2">Collation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.map((table, index) => (
                      <tr key={index} className="border-b hover:bg-slate-50">
                        <td className="p-2 font-medium">{table.name}</td>
                        <td className="p-2">{table.rows.toLocaleString()}</td>
                        <td className="p-2">{table.size}</td>
                        <td className="p-2">{table.engine}</td>
                        <td className="p-2">{table.collation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query Tab */}
        <TabsContent value="query" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SQL Query Executor</CardTitle>
              <CardDescription>Execute SQL queries safely with monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">SQL Query</label>
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your SQL query here..."
                  className="min-h-[120px] font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={executeQuery} disabled={loading || !query.trim()}>
                  <Play className="w-4 h-4 mr-2" />
                  {loading ? 'Executing...' : 'Execute Query'}
                </Button>
                <Button variant="outline" onClick={() => setQuery('')}>
                  Clear
                </Button>
              </div>

              {queryResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Query Results</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>Execution time: {queryResult.executionTime}ms</span>
                      <span>Affected rows: {queryResult.affectedRows}</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          {queryResult.columns.map((col, index) => (
                            <th key={index} className="text-left p-2 border-b font-medium">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-slate-50">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="p-2 border-b">
                                {cell?.toString() || 'NULL'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {queryHistory.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Query History</h3>
                  <ScrollArea className="h-[200px] border rounded-lg p-4">
                    <div className="space-y-2">
                      {queryHistory.map((historyQuery, index) => (
                        <div
                          key={index}
                          className="p-2 bg-slate-50 rounded cursor-pointer hover:bg-slate-100 font-mono text-sm"
                          onClick={() => setQuery(historyQuery)}
                        >
                          {historyQuery}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Backup</CardTitle>
              <CardDescription>Create and manage database backups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button onClick={createBackup} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Backup'}
                </Button>
                <div className="text-sm text-slate-600">
                  Last backup: {stats?.lastBackup || 'Never'}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Backup History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Filename</th>
                        <th className="text-left p-2">Size</th>
                        <th className="text-left p-2">Created</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map((backup) => (
                        <tr key={backup.id} className="border-b hover:bg-slate-50">
                          <td className="p-2 font-medium">{backup.filename}</td>
                          <td className="p-2">{backup.size}</td>
                          <td className="p-2">{new Date(backup.createdAt).toLocaleString()}</td>
                          <td className="p-2">
                            <Badge variant="secondary">{backup.type}</Badge>
                          </td>
                          <td className="p-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteBackup(backup.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimize Tab */}
        <TabsContent value="optimize" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Optimization</CardTitle>
              <CardDescription>Optimize database performance and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Database optimization will rebuild indexes and update statistics. This may take several minutes on large databases.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <Button onClick={optimizeDatabase} disabled={loading}>
                  <Zap className="w-4 h-4 mr-2" />
                  {loading ? 'Optimizing...' : 'Optimize Database'}
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Optimization Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Rebuild indexes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Update table statistics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Optimize query cache</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Clean up temporary files</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-slate-600">
                      <p>• Regular optimization improves query performance</p>
                      <p>• Schedule optimization during low-traffic periods</p>
                      <p>• Monitor performance after optimization</p>
                      <p>• Keep recent backups before optimization</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>Export table data in various formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Table</label>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem key={table.name} value={table.name}>
                          {table.name} ({table.rows.toLocaleString()} rows)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Export Format</label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sql">SQL</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button onClick={exportData} disabled={loading || !selectedTable}>
                    <Download className="w-4 h-4 mr-2" />
                    {loading ? 'Exporting...' : 'Export Data'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">SQL Format</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">
                    Complete SQL INSERT statements for easy database restoration
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">JSON Format</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">
                    Structured JSON data ideal for application integration
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">CSV Format</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">
                    Comma-separated values perfect for spreadsheet applications
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Logs</CardTitle>
              <CardDescription>Monitor database operations and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={fetchLogs}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Logs
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Timestamp</th>
                        <th className="text-left p-2">Level</th>
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Message</th>
                        <th className="text-left p-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-slate-50">
                          <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="p-2">
                            <Badge 
                              variant={
                                log.level === 'ERROR' ? 'destructive' : 
                                log.level === 'WARNING' ? 'default' : 
                                'secondary'
                              }
                            >
                              {log.level}
                            </Badge>
                          </td>
                          <td className="p-2">{log.user}</td>
                          <td className="p-2">{log.message}</td>
                          <td className="p-2">{log.duration ? `${log.duration}ms` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}