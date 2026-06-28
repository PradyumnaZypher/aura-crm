'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  Lock,
  Unlock,
  Key,
  Users,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  Settings,
  FileText
} from 'lucide-react'

interface SecurityStats {
  totalUsers: number
  activeUsers: number
  failedLogins: number
  suspiciousActivities: number
  blockedIPs: number
  activeSessions: number
  passwordStrength: {
    strong: number
    medium: number
    weak: number
  }
  securityScore: number
  threatsBlocked: number
  lastSecurityScan: string
}

interface RecentActivity {
  id: string
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'security_alert' | 'blocked_attempt'
  user: string
  email: string
  ip: string
  location: string
  timestamp: string
  status: 'success' | 'warning' | 'danger'
  details: string
}

interface SecurityAlert {
  id: string
  type: 'high' | 'medium' | 'low'
  title: string
  description: string
  timestamp: string
  resolved: boolean
}

export default function SecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchSecurityData = async () => {
    try {
      setRefreshing(true)
      
      // Fetch security stats
      const statsResponse = await fetch('/api/admin/security/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      } else {
        console.error('Failed to fetch security stats')
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          failedLogins: 0,
          suspiciousActivities: 0,
          blockedIPs: 0,
          activeSessions: 0,
          passwordStrength: {
            strong: 0,
            medium: 0,
            weak: 0
          },
          securityScore: 0,
          threatsBlocked: 0,
          lastSecurityScan: new Date().toISOString()
        })
      }

      // Fetch recent activities
      const activitiesResponse = await fetch('/api/admin/security/activities')
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        setRecentActivities(Array.isArray(activitiesData) ? activitiesData : [])
      } else {
        console.error('Failed to fetch activities')
        setRecentActivities([])
      }

      // Fetch security alerts
      const alertsResponse = await fetch('/api/admin/security/alerts')
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setSecurityAlerts(Array.isArray(alertsData) ? alertsData : [])
      } else {
        console.error('Failed to fetch alerts')
        setSecurityAlerts([])
      }

    } catch (error) {
      console.error('Error fetching security data:', error)
      // Set default values on error
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        failedLogins: 0,
        suspiciousActivities: 0,
        blockedIPs: 0,
        activeSessions: 0,
        passwordStrength: {
          strong: 0,
          medium: 0,
          weak: 0
        },
        securityScore: 0,
        threatsBlocked: 0,
        lastSecurityScan: new Date().toISOString()
      })
      setRecentActivities([])
      setSecurityAlerts([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'logout': return <EyeOff className="h-4 w-4 text-blue-500" />
      case 'failed_login': return <XCircle className="h-4 w-4 text-red-500" />
      case 'password_change': return <Key className="h-4 w-4 text-yellow-500" />
      case 'security_alert': return <ShieldAlert className="h-4 w-4 text-red-500" />
      case 'blocked_attempt': return <ShieldX className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'danger': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'low': return <AlertCircle className="h-4 w-4 text-blue-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSecurityScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
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
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage system security</p>
        </div>
        <Button 
          onClick={fetchSecurityData}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Security Score Overview */}
      {stats && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Score Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-4xl font-bold ${getSecurityScoreColor(stats?.securityScore || 0)}`}>
                  {stats?.securityScore || 0}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {getSecurityScoreLabel(stats?.securityScore || 0)} Security Status
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Last Scan</div>
                <div className="text-sm">{new Date(stats?.lastSecurityScan || Date.now()).toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeUsers || 0} active now
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.failedLogins || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
              <ShieldX className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.blockedIPs || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently blocked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
              <ShieldCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.threatsBlocked || 0}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Strength Distribution */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password Strength Distribution
            </CardTitle>
            <CardDescription>
              Overview of user password security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.passwordStrength?.strong || 0}</div>
                <div className="text-sm text-muted-foreground">Strong</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(stats?.totalUsers || 0) > 0 ? ((stats.passwordStrength?.strong || 0) / (stats?.totalUsers || 1)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.passwordStrength?.medium || 0}</div>
                <div className="text-sm text-muted-foreground">Medium</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${(stats?.totalUsers || 0) > 0 ? ((stats.passwordStrength?.medium || 0) / (stats?.totalUsers || 1)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.passwordStrength?.weak || 0}</div>
                <div className="text-sm text-muted-foreground">Weak</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${(stats?.totalUsers || 0) > 0 ? ((stats.passwordStrength?.weak || 0) / (stats?.totalUsers || 1)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest security-related activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{activity.user}</span>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activity.email} • {activity.ip}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.details}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Security Alerts
            </CardTitle>
            <CardDescription>
              Active security alerts and warnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {securityAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${alert.resolved ? 'opacity-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{alert.title}</span>
                        <Badge className={getAlertColor(alert.type)}>
                          {alert.type}
                        </Badge>
                        {alert.resolved && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {alert.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}