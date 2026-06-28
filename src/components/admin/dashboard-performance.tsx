'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Activity, 
  Cpu,
  HardDrive,
  MemoryStick,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Server,
  BarChart3,
  RefreshCw,
  Settings,
  Gauge,
  Timer,
  Database,
  Network,
  Monitor,
  Play,
  Pause,
  RotateCcw,
  Users,
  Download
} from 'lucide-react'

interface PerformanceMetrics {
  cpu: {
    usage: number
    cores: number
    temperature: number
    load: number[]
  }
  memory: {
    used: number
    total: number
    percentage: number
    swap: {
      used: number
      total: number
      percentage: number
    }
  }
  disk: {
    used: number
    total: number
    percentage: number
    readSpeed: number
    writeSpeed: number
  }
  network: {
    upload: number
    download: number
    latency: number
    packets: {
      sent: number
      received: number
    }
  }
  database: {
    connections: number
    queries: number
    slowQueries: number
    uptime: number
    cacheHitRate: number
  }
  application: {
    responseTime: number
    throughput: number
    errorRate: number
    activeUsers: number
  }
}

interface PerformanceAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  timestamp: string
  metric: string
  value: number
  threshold: number
}

interface HistoricalData {
  timestamp: string
  cpu: number
  memory: number
  disk: number
  network: number
  responseTime: number
}

export default function DashboardPerformanceTab() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000)

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch('/api/admin/performance/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error)
    }
  }

  const fetchPerformanceAlerts = async () => {
    try {
      const response = await fetch('/api/admin/performance/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error('Failed to fetch performance alerts:', error)
    }
  }

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch('/api/admin/performance/history')
      if (response.ok) {
        const data = await response.json()
        setHistoricalData(data)
      }
    } catch (error) {
      console.error('Failed to fetch historical data:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      fetchPerformanceMetrics(),
      fetchPerformanceAlerts(),
      fetchHistoricalData()
    ])
    setRefreshing(false)
  }

  const handleOptimize = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/performance/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Performance optimization completed! ${data.message}`)
        await handleRefresh()
      } else {
        alert('Failed to optimize performance')
      }
    } catch (error) {
      console.error('Failed to optimize performance:', error)
      alert('Failed to optimize performance')
    } finally {
      setLoading(false)
    }
  }

  const handleClearCache = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/performance/clear-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        alert('Cache cleared successfully!')
        await handleRefresh()
      } else {
        alert('Failed to clear cache')
      }
    } catch (error) {
      console.error('Failed to clear cache:', error)
      alert('Failed to clear cache')
    } finally {
      setLoading(false)
    }
  }

  const getHealthStatus = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return { status: 'critical', color: 'text-red-600 bg-red-100' }
    if (value >= thresholds.warning) return { status: 'warning', color: 'text-yellow-600 bg-yellow-100' }
    return { status: 'healthy', color: 'text-green-600 bg-green-100' }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatSpeed = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s'
  }

  useEffect(() => {
    handleRefresh()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      handleRefresh()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Performance Monitoring</h2>
          <p className="text-slate-600">Real-time system and application performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {autoRefresh ? 'Pause' : 'Resume'}
            </Button>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-1 border border-slate-300 rounded-md text-sm"
            >
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>
          </div>
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
            onClick={() => window.location.href = '/admin/performance'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Settings className="h-4 w-4 mr-2" />
            Full Performance Panel
          </Button>
        </div>
      </div>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.metric}:</strong> {alert.message} 
                <span className="ml-2 text-xs text-slate-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* System Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CPU */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.cpu.usage}%</div>
              <Progress value={metrics.cpu.usage} className="mt-2" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-600">
                  {metrics.cpu.cores} cores
                </span>
                <Badge className={getHealthStatus(metrics.cpu.usage, { warning: 70, critical: 90 }).color}>
                  {getHealthStatus(metrics.cpu.usage, { warning: 70, critical: 90 }).status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Memory */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.memory.percentage}%</div>
              <Progress value={metrics.memory.percentage} className="mt-2" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-600">
                  {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
                </span>
                <Badge className={getHealthStatus(metrics.memory.percentage, { warning: 80, critical: 95 }).color}>
                  {getHealthStatus(metrics.memory.percentage, { warning: 80, critical: 95 }).status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Disk */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.disk.percentage}%</div>
              <Progress value={metrics.disk.percentage} className="mt-2" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-600">
                  {formatBytes(metrics.disk.used)} / {formatBytes(metrics.disk.total)}
                </span>
                <Badge className={getHealthStatus(metrics.disk.percentage, { warning: 80, critical: 95 }).color}>
                  {getHealthStatus(metrics.disk.percentage, { warning: 80, critical: 95 }).status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Application Response Time */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.application.responseTime}ms</div>
              <div className="flex items-center gap-2 mt-2">
                {metrics.application.responseTime < 200 ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs text-slate-600">
                  {metrics.application.throughput} req/s
                </span>
              </div>
              <Badge className={getHealthStatus(metrics.application.responseTime, { warning: 500, critical: 1000 }).color}>
                {getHealthStatus(metrics.application.responseTime, { warning: 500, critical: 1000 }).status}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network & Database */}
        <Card>
          <CardHeader>
            <CardTitle>Network & Database</CardTitle>
            <CardDescription>Connectivity and database performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Network className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Network Upload</span>
                    </div>
                    <div className="text-lg font-semibold">{formatSpeed(metrics.network.upload)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Download className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Network Download</span>
                    </div>
                    <div className="text-lg font-semibold">{formatSpeed(metrics.network.download)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">DB Connections</span>
                    </div>
                    <div className="text-lg font-semibold">{metrics.database.connections}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">DB Queries/s</span>
                    </div>
                    <div className="text-lg font-semibold">{metrics.database.queries}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Latency</span>
                    </div>
                    <div className="text-lg font-semibold">{metrics.network.latency}ms</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Cache Hit Rate</span>
                    </div>
                    <div className="text-lg font-semibold">{metrics.database.cacheHitRate}%</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Application Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Application Metrics</CardTitle>
            <CardDescription>Application performance and user activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Active Users</span>
                    </div>
                    <div className="text-lg font-semibold">{metrics.application.activeUsers}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Gauge className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Throughput</span>
                    </div>
                    <div className="text-lg font-semibold">{metrics.application.throughput} req/s</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Error Rate</span>
                    </div>
                    <div className="text-lg font-semibold">{metrics.application.errorRate}%</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Slow Queries</span>
                    </div>
                    <div className="text-lg font-semibold">{metrics.database.slowQueries}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">System Load</span>
                    <span className="text-sm text-slate-600">
                      {metrics.cpu.load.map((load: number, i: number) => `${load.toFixed(2)} (${i}min)`).join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Temperature</span>
                    <span className="text-sm text-slate-600">{metrics.cpu.temperature}°C</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Actions</CardTitle>
          <CardDescription>Optimize and maintain system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={handleOptimize}
              disabled={loading}
            >
              <Zap className="h-6 w-6" />
              <span className="text-sm font-medium">Optimize System</span>
              <span className="text-xs opacity-90">Boost performance</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={handleClearCache}
              disabled={loading}
            >
              <RotateCcw className="h-6 w-6" />
              <span className="text-sm">Clear Cache</span>
              <span className="text-xs text-slate-600">Free up memory</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => window.location.href = '/admin/performance?tab=alerts'}
            >
              <AlertCircle className="h-6 w-6" />
              <span className="text-sm">Alert Rules</span>
              <span className="text-xs text-slate-600">Configure alerts</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => window.location.href = '/admin/performance?tab=reports'}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Reports</span>
              <span className="text-xs text-slate-600">View analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historical Performance Chart */}
      {historicalData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Historical performance data over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Performance chart visualization</p>
                <p className="text-sm text-slate-500 mt-2">
                  {historicalData.length} data points collected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}