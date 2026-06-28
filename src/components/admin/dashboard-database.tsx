'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Database, 
  Activity, 
  HardDrive,
  Zap,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  Server,
  BarChart3,
  Play,
  Download,
  Trash2,
  Settings
} from 'lucide-react'

interface DatabaseStats {
  totalTables: number
  totalSize: string
  totalRows: number
  connections: number
  uptime: string
  lastBackup: string
  status: 'healthy' | 'warning' | 'error'
  backupCount: number
  indexCount: number
  slowQueries: number
  version: string
  queryCache: number
  maxConnections: number
}

interface RecentQuery {
  id: string
  query: string
  duration: number
  timestamp: string
  status: 'success' | 'error'
}

interface BackupInfo {
  id: string
  filename: string
  size: string
  createdAt: string
  type: string
}

export default function DashboardDatabaseTab() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([])
  const [recentBackups, setRecentBackups] = useState<BackupInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

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

  const fetchRecentQueries = async () => {
    try {
      const response = await fetch('/api/admin/database/logs')
      if (response.ok) {
        const logs = await response.json()
        const queries = logs.slice(0, 5).map((log: any) => ({
          id: log.id,
          query: log.message,
          duration: log.duration || 0,
          timestamp: log.timestamp,
          status: log.level === 'ERROR' ? 'error' : 'success'
        }))
        setRecentQueries(queries)
      }
    } catch (error) {
      console.error('Failed to fetch recent queries:', error)
    }
  }

  const fetchRecentBackups = async () => {
    try {
      const response = await fetch('/api/admin/database/backups')
      if (response.ok) {
        const backups = await response.json()
        setRecentBackups(backups.slice(0, 3))
      }
    } catch (error) {
      console.error('Failed to fetch recent backups:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      fetchDatabaseStats(),
      fetchRecentQueries(),
      fetchRecentBackups()
    ])
    setRefreshing(false)
  }

  const handleQuickBackup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/database/quick-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'quick',
          description: `Quick dashboard backup - ${new Date().toISOString()}`
        })
      })

      if (response.ok) {
        const data = await response.json()
        await fetchRecentBackups()
        await fetchDatabaseStats()
        alert(`Quick backup created successfully! ${data.message}`)
      } else {
        const error = await response.json()
        alert(`Failed to create backup: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to create backup:', error)
      alert('Failed to create backup')
    } finally {
      setLoading(false)
    }
  }

  const handleOptimize = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/database/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Database optimized successfully! ${data.message}`)
        await fetchDatabaseStats()
      } else {
        alert('Failed to optimize database')
      }
    } catch (error) {
      console.error('Failed to optimize database:', error)
      alert('Failed to optimize database')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleRefresh()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getConnectionStatus = () => {
    if (!stats) return { color: 'bg-gray-500', text: 'Unknown' }
    const percentage = (stats.connections / stats.maxConnections) * 100
    if (percentage < 70) return { color: 'bg-green-500', text: 'Normal' }
    if (percentage < 90) return { color: 'bg-yellow-500', text: 'High' }
    return { color: 'bg-red-500', text: 'Critical' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Database Management</h2>
          <p className="text-slate-600">Monitor and manage your database performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => window.location.href = '/admin/database'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Settings className="h-4 w-4 mr-2" />
            Full Database Panel
          </Button>
        </div>
      </div>

      {/* Database Status Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Status</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(stats.status)}>
                  {stats.status.charAt(0).toUpperCase() + stats.status.slice(1)}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Version {stats.version}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTables}</div>
              <p className="text-xs text-slate-600">
                {stats.totalRows.toLocaleString()} total rows
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Size</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSize}</div>
              <p className="text-xs text-slate-600">
                {stats.indexCount} indexes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connections</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{stats.connections}</div>
                <div className={`w-2 h-2 rounded-full ${getConnectionStatus().color}`}></div>
              </div>
              <p className="text-xs text-slate-600">
                {getConnectionStatus().text} • {stats.maxConnections} max
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators and health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connection Usage</span>
                  <span className="text-sm text-slate-600">
                    {Math.round((stats.connections / stats.maxConnections) * 100)}%
                  </span>
                </div>
                <Progress value={(stats.connections / stats.maxConnections) * 100} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Query Cache Hit Rate</span>
                  <span className="text-sm text-slate-600">{stats.queryCache}%</span>
                </div>
                <Progress value={stats.queryCache} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Slow Queries</span>
                  <span className={`text-sm ${stats.slowQueries > 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.slowQueries}
                  </span>
                </div>
                <Progress value={Math.min(stats.slowQueries * 10, 100)} className={stats.slowQueries > 10 ? 'bg-red-100' : ''} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <span className="text-sm text-slate-600">{stats.uptime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-slate-600">System running</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common database operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={handleQuickBackup}
              disabled={loading}
            >
              <Save className="h-6 w-6" />
              <span className="text-sm font-medium">Quick Backup</span>
              <span className="text-xs opacity-90">Create backup now</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={handleOptimize}
              disabled={loading}
            >
              <Zap className="h-6 w-6" />
              <span className="text-sm">Optimize</span>
              <span className="text-xs text-slate-600">Boost performance</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => window.location.href = '/admin/database?tab=query'}
            >
              <Play className="h-6 w-6" />
              <span className="text-sm">Run Query</span>
              <span className="text-xs text-slate-600">Execute SQL</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => window.location.href = '/admin/database?tab=export'}
            >
              <Download className="h-6 w-6" />
              <span className="text-sm">Export Data</span>
              <span className="text-xs text-slate-600">Download tables</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Queries</CardTitle>
            <CardDescription>Latest database operations</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {recentQueries.map((query) => (
                  <div key={query.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      query.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{query.query}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
                          {new Date(query.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-500">{query.duration}ms</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Backups */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Backups</CardTitle>
            <CardDescription>Latest database backups</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {recentBackups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{backup.filename}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
                          {new Date(backup.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-500">{backup.size}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {backup.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats && stats.status !== 'healthy' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {stats.status === 'warning' 
              ? 'Database performance is degraded. Consider optimizing or checking slow queries.'
              : 'Database requires immediate attention. Check connections and query performance.'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}