'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Shield,
  ShieldAlert,
  Database,
  Settings,
  User,
  Mail,
  Key,
  Lock,
  Unlock,
  FileText,
  Calendar,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react'

interface AuditLog {
  id: string
  timestamp: string
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
  category: 'AUTHENTICATION' | 'AUTHORIZATION' | 'DATA_ACCESS' | 'SYSTEM' | 'SECURITY' | 'API' | 'USER_ACTION'
  message: string
  details: string
  userId?: string
  userEmail?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  requestId?: string
  resource?: string
  action?: string
  outcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL'
  duration?: number
  metadata: Record<string, any>
  stackTrace?: string
}

interface AuditStats {
  totalLogs: number
  logsByLevel: Record<string, number>
  logsByCategory: Record<string, number>
  logsByOutcome: Record<string, number>
  averageDuration: number
  errorRate: number
  topUsers: Array<{ userId: string; email: string; count: number }>
  topIPs: Array<{ ip: string; count: number; location?: string }>
  recentErrors: AuditLog[]
}

export default function SecurityAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('logs')
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    category: '',
    outcome: '',
    dateRange: '',
    userId: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)

  const fetchLogs = async (page = 1) => {
    try {
      setRefreshing(true)
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      })

      const response = await fetch(`/api/admin/security/audit?${queryParams}`)
      const data = await response.json()
      
      setLogs(data.logs || [])
      setTotalPages(data.totalPages || 1)
      setTotalLogs(data.total || 0)
      setCurrentPage(data.currentPage || 1)

    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/security/audit/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching audit stats:', error)
    }
  }

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchLogs(1)
  }, [filters])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'DEBUG': return <Info className="h-4 w-4 text-gray-500" />
      case 'INFO': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'WARN': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'ERROR': return <XCircle className="h-4 w-4 text-red-500" />
      case 'FATAL': return <ShieldAlert className="h-4 w-4 text-red-600" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'DEBUG': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'INFO': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'WARN': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ERROR': return 'bg-red-100 text-red-800 border-red-200'
      case 'FATAL': return 'bg-red-100 text-red-900 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AUTHENTICATION': return <Lock className="h-4 w-4 text-blue-500" />
      case 'AUTHORIZATION': return <Shield className="h-4 w-4 text-green-500" />
      case 'DATA_ACCESS': return <Database className="h-4 w-4 text-purple-500" />
      case 'SYSTEM': return <Settings className="h-4 w-4 text-gray-500" />
      case 'SECURITY': return <ShieldAlert className="h-4 w-4 text-red-500" />
      case 'API': return <Zap className="h-4 w-4 text-orange-500" />
      case 'USER_ACTION': return <User className="h-4 w-4 text-indigo-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'SUCCESS': return 'bg-green-100 text-green-800 border-green-200'
      case 'FAILURE': return 'bg-red-100 text-red-800 border-red-200'
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const exportLogs = async () => {
    try {
      const queryParams = new URLSearchParams({
        export: 'true',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      })

      const response = await fetch(`/api/admin/security/audit/export?${queryParams}`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Error exporting logs:', error)
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      level: '',
      category: '',
      outcome: '',
      dateRange: '',
      userId: ''
    })
  }

  const formatMetadata = (metadata: Record<string, any>) => {
    try {
      return JSON.stringify(metadata, null, 2)
    } catch {
      return String(metadata)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Audit Logs</h1>
          <p className="text-muted-foreground">Comprehensive audit trail for security and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportLogs}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            onClick={() => {
              fetchLogs(currentPage)
              fetchStats()
            }}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Audit Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {showFilters && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      placeholder="Search logs..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select value={filters.level} onValueChange={(value) => setFilters({ ...filters, level: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All levels</SelectItem>
                        <SelectItem value="DEBUG">Debug</SelectItem>
                        <SelectItem value="INFO">Info</SelectItem>
                        <SelectItem value="WARN">Warning</SelectItem>
                        <SelectItem value="ERROR">Error</SelectItem>
                        <SelectItem value="FATAL">Fatal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All categories</SelectItem>
                        <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                        <SelectItem value="AUTHORIZATION">Authorization</SelectItem>
                        <SelectItem value="DATA_ACCESS">Data Access</SelectItem>
                        <SelectItem value="SYSTEM">System</SelectItem>
                        <SelectItem value="SECURITY">Security</SelectItem>
                        <SelectItem value="API">API</SelectItem>
                        <SelectItem value="USER_ACTION">User Action</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="outcome">Outcome</Label>
                    <Select value={filters.outcome} onValueChange={(value) => setFilters({ ...filters, outcome: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="All outcomes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All outcomes</SelectItem>
                        <SelectItem value="SUCCESS">Success</SelectItem>
                        <SelectItem value="FAILURE">Failure</SelectItem>
                        <SelectItem value="PARTIAL">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateRange">Date Range</Label>
                    <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="All time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="7days">Last 7 days</SelectItem>
                        <SelectItem value="30days">Last 30 days</SelectItem>
                        <SelectItem value="90days">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      placeholder="User ID"
                      value={filters.userId}
                      onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Showing {logs.length} of {totalLogs} logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getLevelIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getLevelColor(log.level)}>
                            {log.level}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(log.category)}
                            <span className="text-sm">{log.category}</span>
                          </div>
                          <Badge className={getOutcomeColor(log.outcome)}>
                            {log.outcome}
                          </Badge>
                          {log.duration && (
                            <span className="text-xs text-muted-foreground">
                              {log.duration}ms
                            </span>
                          )}
                        </div>
                        <div className="font-medium mb-1">{log.message}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {log.details}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          {log.userId && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{log.userEmail || log.userId}</span>
                            </div>
                          )}
                          {log.ipAddress && (
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              <span>{log.ipAddress}</span>
                            </div>
                          )}
                          {log.action && (
                            <div>
                              <strong>Action:</strong> {log.action}
                            </div>
                          )}
                          {log.resource && (
                            <div>
                              <strong>Resource:</strong> {log.resource}
                            </div>
                          )}
                        </div>
                        {(log.metadata && Object.keys(log.metadata).length > 0) || log.stackTrace ? (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              View details
                            </summary>
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <div className="mt-2">
                                <strong className="text-xs">Metadata:</strong>
                                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                                  {formatMetadata(log.metadata)}
                                </pre>
                              </div>
                            )}
                            {log.stackTrace && (
                              <div className="mt-2">
                                <strong className="text-xs">Stack Trace:</strong>
                                <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-x-auto text-red-800">
                                  {log.stackTrace}
                                </pre>
                              </div>
                            )}
                          </details>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchLogs(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchLogs(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          {stats && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalLogs}</div>
                    <p className="text-xs text-muted-foreground">
                      All audit entries
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.errorRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      Failed operations
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.averageDuration.toFixed(0)}ms</div>
                    <p className="text-xs text-muted-foreground">
                      Response time
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.recentErrors.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Last 24 hours
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Logs by Level */}
                <Card>
                  <CardHeader>
                    <CardTitle>Logs by Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(stats.logsByLevel).map(([level, count]) => (
                        <div key={level} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getLevelIcon(level)}
                            <span className="text-sm font-medium">{level}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  level === 'ERROR' || level === 'FATAL' ? 'bg-red-500' :
                                  level === 'WARN' ? 'bg-yellow-500' :
                                  level === 'INFO' ? 'bg-blue-500' : 'bg-gray-500'
                                }`}
                                style={{ width: `${(count / stats.totalLogs) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground w-12 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Logs by Category */}
                <Card>
                  <CardHeader>
                    <CardTitle>Logs by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(stats.logsByCategory).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            <span className="text-sm font-medium">{category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(count / stats.totalLogs) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground w-12 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Users */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.topUsers.map((user, index) => (
                        <div key={user.userId} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <div>
                              <div className="text-sm font-medium">{user.email}</div>
                              <div className="text-xs text-muted-foreground">{user.userId}</div>
                            </div>
                          </div>
                          <Badge variant="secondary">{user.count} actions</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top IPs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top IP Addresses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.topIPs.map((ip, index) => (
                        <div key={ip.ip} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <div>
                              <div className="text-sm font-medium">{ip.ip}</div>
                              {ip.location && (
                                <div className="text-xs text-muted-foreground">{ip.location}</div>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary">{ip.count} requests</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Errors */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Errors</CardTitle>
                  <CardDescription>
                    Most recent error and fatal level logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {stats.recentErrors.map((log) => (
                      <div key={log.id} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {getLevelIcon(log.level)}
                          <Badge className={getLevelColor(log.level)}>
                            {log.level}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm font-medium mb-1">{log.message}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.details}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}