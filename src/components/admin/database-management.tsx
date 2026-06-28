"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Database, 
  Activity, 
  HardDrive, 
  Download, 
  Upload, 
  Settings, 
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Zap,
  Shield,
  Play,
  Pause,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Copy,
  FileDown,
  FileUp,
  Server,
  Cpu,
  MemoryStick,
  Wifi,
  Users,
  Table,
  Key,
  Lock,
  Unlock,
  DatabaseBackup,
  RefreshCcw
} from 'lucide-react'

interface DatabaseStats {
  totalSize: string
  tableCount: number
  totalRows: number
  indexCount: number
  backupCount: number
  lastBackup: string
  status: 'healthy' | 'warning' | 'error'
  uptime: string
  connections: number
  queryCache: number
  version: string
  engine: string
  charset: string
  collation: string
  maxConnections: number
  cacheHitRate: number
  slowQueries: number
  uptimeSeconds: number
}

interface BackupItem {
  id: string
  filename: string
  size: string
  createdAt: string
  type: 'manual' | 'automatic'
  status: 'completed' | 'failed' | 'in_progress'
  description?: string
  tables?: string[]
}

interface QueryResult {
  columns: string[]
  rows: any[][]
  executionTime: number
  affectedRows: number
  queryType: string
}

interface TableInfo {
  name: string
  rows: number
  size: string
  engine: string
  collation: string
  autoIncrement?: number
  comment?: string
  indexes: number
  dataSize: string
  indexSize: string
}

interface DatabaseLog {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
  query?: string
  duration?: number
}

export default function DatabaseManagement() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [backups, setBackups] = useState<BackupItem[]>([])
  const [tables, setTables] = useState<TableInfo[]>([])
  const [logs, setLogs] = useState<DatabaseLog[]>([])
  const [query, setQuery] = useState('')
  const [queryHistory, setQueryHistory] = useState<string[]>([])
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isQueryLoading, setIsQueryLoading] = useState(false)
  const [selectedTable, setSelectedTable] = useState('')
  const [backupName, setBackupName] = useState('')
  const [backupDescription, setBackupDescription] = useState('')
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [dbPassword, setDbPassword] = useState('')
  const [selectedBackup, setSelectedBackup] = useState<BackupItem | null>(null)
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false)

  useEffect(() => {
    fetchDatabaseStats()
    fetchBackups()
    fetchTables()
    fetchLogs()
    
    if (isRealTimeEnabled) {
      const interval = setInterval(() => {
        fetchDatabaseStats()
        fetchLogs()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isRealTimeEnabled])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const fetchDatabaseStats = async () => {
    try {
      const response = await fetch('/api/admin/database/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch database stats:', error)
    }
  }

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

  const executeQuery = async () => {
    if (!query.trim()) return

    setIsQueryLoading(true)
    try {
      const response = await fetch('/api/admin/database/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      if (response.ok) {
        const data = await response.json()
        setQueryResult(data)
        
        // Add to query history
        setQueryHistory(prev => [query, ...prev.slice(0, 9)])
        
        showMessage('success', `Query executed successfully. Returned ${data.rows.length} rows in ${data.executionTime}ms`)
      } else {
        const error = await response.json()
        showMessage('error', error.error || "Unknown error occurred")
      }
    } catch (error) {
      showMessage('error', "Network error occurred")
    } finally {
      setIsQueryLoading(false)
    }
  }

  const createBackup = async () => {
    if (!backupName.trim()) {
      showMessage('error', 'Please enter a backup name')
      return
    }

    setIsCreatingBackup(true)
    try {
      const response = await fetch('/api/admin/database/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: backupName,
          description: backupDescription,
          includeData: true,
          includeStructure: true
        })
      })

      if (response.ok) {
        showMessage('success', "Database backup has been created")
        setBackupName('')
        setBackupDescription('')
        fetchBackups()
        fetchDatabaseStats()
      } else {
        const error = await response.json()
        showMessage('error', error.error || "Unknown error occurred")
      }
    } catch (error) {
      showMessage('error', "Network error occurred")
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const restoreBackup = async (backupId: string) => {
    if (!dbPassword) {
      showMessage('error', 'Please enter database password for security')
      return
    }

    setIsRestoring(true)
    try {
      const response = await fetch('/api/admin/database/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          backupId,
          password: dbPassword,
          confirmAction: true
        })
      })

      if (response.ok) {
        showMessage('success', "Database has been restored from backup")
        setDbPassword('')
        fetchDatabaseStats()
        fetchTables()
      } else {
        const error = await response.json()
        showMessage('error', error.error || "Unknown error occurred")
      }
    } catch (error) {
      showMessage('error', "Network error occurred")
    } finally {
      setIsRestoring(false)
    }
  }

  const optimizeDatabase = async () => {
    setIsOptimizing(true)
    try {
      const response = await fetch('/api/admin/database/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          optimizeTables: true,
          rebuildIndexes: true,
          updateStatistics: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        showMessage('success', `Optimized ${data.optimizedTables} tables in ${data.executionTime}ms`)
        fetchDatabaseStats()
        fetchTables()
      } else {
        const error = await response.json()
        showMessage('error', error.error || "Unknown error occurred")
      }
    } catch (error) {
      showMessage('error', "Network error occurred")
    } finally {
      setIsOptimizing(false)
    }
  }

  const exportDatabase = async (format: 'sql' | 'json' | 'csv') => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/admin/database/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          format,
          includeData: true,
          includeStructure: true,
          tables: selectedTable ? [selectedTable] : undefined
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `database_export_${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        showMessage('success', `Database exported as ${format.toUpperCase()}`)
      } else {
        const error = await response.json()
        showMessage('error', error.error || "Unknown error occurred")
      }
    } catch (error) {
      showMessage('error', "Network error occurred")
    } finally {
      setIsExporting(false)
    }
  }

  const deleteBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/admin/database/backup/${backupId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showMessage('success', "Backup deleted successfully")
        fetchBackups()
      } else {
        const error = await response.json()
        showMessage('error', error.error || "Unknown error occurred")
      }
    } catch (error) {
      showMessage('error', "Network error occurred")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'info': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Database Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Size</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSize}</div>
              <p className="text-xs text-muted-foreground">
                {stats.tableCount} tables, {stats.totalRows.toLocaleString()} rows
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <div className={getStatusColor(stats.status)}>
                {getStatusIcon(stats.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{stats.status}</div>
              <p className="text-xs text-muted-foreground">
                Uptime: {stats.uptime}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cacheHitRate}%</div>
              <p className="text-xs text-muted-foreground">
                Cache hit rate • {stats.slowQueries} slow queries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connections</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.connections}/{stats.maxConnections}</div>
              <Progress value={(stats.connections / stats.maxConnections) * 100} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="query">Query</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="optimize">Optimize</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Database Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Information
                </CardTitle>
                <CardDescription>
                  Core database configuration and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Version:</span>
                      <span className="text-sm">{stats.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Engine:</span>
                      <span className="text-sm">{stats.engine}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Charset:</span>
                      <span className="text-sm">{stats.charset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Collation:</span>
                      <span className="text-sm">{stats.collation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Max Connections:</span>
                      <span className="text-sm">{stats.maxConnections}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Real-time Monitoring:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                      >
                        {isRealTimeEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tables Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="h-5 w-5" />
                  Database Tables
                </CardTitle>
                <CardDescription>
                  Overview of all database tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {tables.map((table) => (
                      <div key={table.name} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{table.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {table.rows.toLocaleString()} rows • {table.size} • {table.indexes} indexes
                          </div>
                        </div>
                        <Badge variant="outline">{table.engine}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Recent Backups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Backups
              </CardTitle>
              <CardDescription>
                Latest database backups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {backups.slice(0, 5).map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{backup.filename}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(backup.createdAt).toLocaleDateString()} • {backup.size} • {backup.type}
                      </div>
                      {backup.description && (
                        <div className="text-xs text-muted-foreground">{backup.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={backup.type === 'automatic' ? 'default' : 'secondary'}>
                        {backup.type}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedBackup(backup)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SQL Query Executor
              </CardTitle>
              <CardDescription>
                Execute custom SQL queries on the database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query">SQL Query</Label>
                <Textarea
                  id="query"
                  placeholder="Enter your SQL query here..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-32 font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={executeQuery} disabled={isQueryLoading || !query.trim()}>
                  {isQueryLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Execute Query
                </Button>
                <Button variant="outline" onClick={() => setQuery('')}>
                  Clear
                </Button>
                <Button variant="outline" onClick={() => setQuery('SELECT * FROM users LIMIT 10')}>
                  Sample Query
                </Button>
              </div>

              {/* Query History */}
              {queryHistory.length > 0 && (
                <div className="space-y-2">
                  <Label>Query History</Label>
                  <div className="space-y-1">
                    {queryHistory.map((historyQuery, index) => (
                      <div
                        key={index}
                        className="p-2 text-xs font-mono bg-muted rounded cursor-pointer hover:bg-muted/80"
                        onClick={() => setQuery(historyQuery)}
                      >
                        {historyQuery}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {queryResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Query Results</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {queryResult.rows.length} rows
                      </Badge>
                      <Badge variant="outline">
                        {queryResult.executionTime}ms
                      </Badge>
                      <Badge variant="outline">
                        {queryResult.queryType}
                      </Badge>
                    </div>
                  </div>
                  <ScrollArea className="h-64 border rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          {queryResult.columns.map((col) => (
                            <th key={col} className="p-2 text-left font-medium">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.rows.map((row, index) => (
                          <tr key={index} className="border-t">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="p-2">
                                {cell !== null ? String(cell) : 'NULL'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseBackup className="h-5 w-5" />
                Create Backup
              </CardTitle>
              <CardDescription>
                Create a new database backup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="backupName">Backup Name</Label>
                  <Input
                    id="backupName"
                    placeholder="Enter backup name..."
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupDescription">Description</Label>
                  <Input
                    id="backupDescription"
                    placeholder="Optional description..."
                    value={backupDescription}
                    onChange={(e) => setBackupDescription(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={createBackup} disabled={isCreatingBackup || !backupName.trim()}>
                {isCreatingBackup ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Create Backup
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Backup History
              </CardTitle>
              <CardDescription>
                View and manage previous backups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {backups.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{backup.filename}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(backup.createdAt).toLocaleString()} • {backup.size} • {backup.type}
                        </div>
                        {backup.description && (
                          <div className="text-xs text-muted-foreground">{backup.description}</div>
                        )}
                        {backup.tables && (
                          <div className="text-xs text-muted-foreground">
                            Tables: {backup.tables.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          backup.status === 'completed' ? 'default' :
                          backup.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {backup.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedBackup(backup)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={backup.status !== 'completed'}
                            >
                              <Upload className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Restore Database</DialogTitle>
                              <DialogDescription>
                                This action will restore the database from the selected backup. 
                                Please enter the database password to confirm.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="password">Database Password</Label>
                                <div className="relative">
                                  <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter database password"
                                    value={dbPassword}
                                    onChange={(e) => setDbPassword(e.target.value)}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Cancel</Button>
                                <Button
                                  onClick={() => restoreBackup(backup.id)}
                                  disabled={isRestoring || !dbPassword}
                                >
                                  {isRestoring ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Upload className="mr-2 h-4 w-4" />
                                  )}
                                  Restore
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteBackup(backup.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Database Optimization
              </CardTitle>
              <CardDescription>
                Optimize database performance and clean up unused data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Table Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Optimize table structures and rebuild indexes
                  </p>
                  <Button onClick={optimizeDatabase} disabled={isOptimizing}>
                    {isOptimizing ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="mr-2 h-4 w-4" />
                    )}
                    Optimize All
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Update Statistics</h4>
                  <p className="text-sm text-muted-foreground">
                    Update table statistics for better query planning
                  </p>
                  <Button variant="outline" disabled={isOptimizing}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Update Stats
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Clean Up</h4>
                  <p className="text-sm text-muted-foreground">
                    Remove unused data and optimize storage
                  </p>
                  <Button variant="outline" disabled={isOptimizing}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clean Up
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 border rounded">
                <h4 className="font-medium mb-2">Optimization Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Regular optimization improves query performance</li>
                  <li>• Best performed during low-traffic periods</li>
                  <li>• Creates temporary locks on affected tables</li>
                  <li>• Always create a backup before major optimizations</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5" />
                Export Database
              </CardTitle>
              <CardDescription>
                Export database data in various formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tableSelect">Select Table (Optional)</Label>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger>
                      <SelectValue placeholder="All tables" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All tables</SelectItem>
                      {tables.map((table) => (
                        <SelectItem key={table.name} value={table.name}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Button
                  onClick={() => exportDatabase('sql')}
                  disabled={isExporting}
                  className="h-auto p-4 flex flex-col gap-2"
                >
                  <FileDown className="h-6 w-6" />
                  <span className="text-sm">Export as SQL</span>
                  <span className="text-xs opacity-90">Full database dump</span>
                </Button>
                <Button
                  onClick={() => exportDatabase('json')}
                  disabled={isExporting}
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                >
                  <FileDown className="h-6 w-6" />
                  <span className="text-sm">Export as JSON</span>
                  <span className="text-xs opacity-90">Structured data</span>
                </Button>
                <Button
                  onClick={() => exportDatabase('csv')}
                  disabled={isExporting}
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                >
                  <FileDown className="h-6 w-6" />
                  <span className="text-sm">Export as CSV</span>
                  <span className="text-xs opacity-90">Tabular format</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Database Logs
              </CardTitle>
              <CardDescription>
                Recent database operations and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getLogLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">{log.message}</div>
                        {log.query && (
                          <div className="text-xs font-mono bg-muted p-1 rounded mt-1">
                            {log.query}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                          {log.duration && ` • ${log.duration}ms`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Backup Details Dialog */}
      <Dialog open={!!selectedBackup} onOpenChange={() => setSelectedBackup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected backup
            </DialogDescription>
          </DialogHeader>
          {selectedBackup && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="font-medium">Filename:</span>
                  <span>{selectedBackup.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Size:</span>
                  <span>{selectedBackup.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Created:</span>
                  <span>{new Date(selectedBackup.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <Badge variant={selectedBackup.type === 'automatic' ? 'default' : 'secondary'}>
                    {selectedBackup.type}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant={
                    selectedBackup.status === 'completed' ? 'default' :
                    selectedBackup.status === 'failed' ? 'destructive' : 'secondary'
                  }>
                    {selectedBackup.status}
                  </Badge>
                </div>
                {selectedBackup.description && (
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="text-sm text-muted-foreground mt-1">{selectedBackup.description}</p>
                  </div>
                )}
                {selectedBackup.tables && (
                  <div>
                    <span className="font-medium">Tables:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedBackup.tables.map((table) => (
                        <Badge key={table} variant="outline" className="text-xs">
                          {table}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedBackup(null)}>
                  Close
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}