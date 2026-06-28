'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import DatabaseManagement from '@/components/admin/database-management'
import { 
  Settings, 
  Database, 
  Shield, 
  Activity, 
  Download, 
  Upload, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  HardDrive,
  Wifi,
  Users,
  Trash2,
  Save
} from 'lucide-react'

interface SystemInfo {
  stats: {
    totalUsers: number
    activeUsers: number
    totalActivities: number
    totalSessions: number
    recentLogins: number
  }
  health: {
    overall: string
    checks: Array<{
      name: string
      status: string
      responseTime: number
    }>
    averageResponseTime: number
    uptime: number
    memoryUsage: any
    version: string
  }
  config: {
    siteName: string
    siteDescription: string
    allowRegistration: boolean
    requireEmailVerification: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    lockoutDuration: number
    passwordMinLength: number
    requireStrongPassword: boolean
    maintenanceMode: boolean
    maintenanceMessage: string
  }
  database: {
    provider: string
    tables: {
      users: number
      user_activities: number
      user_sessions: number
      teams: number
      leads: number
    }
    totalRecords: number
  }
  recentActivities: Array<{
    id: string
    user: string
    role: string
    action: string
    resource: string
    timestamp: string
    metadata: any
  }>
}

export default function SystemManagementTab() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState({
    siteName: '',
    siteDescription: '',
    allowRegistration: true,
    requireEmailVerification: false,
    sessionTimeout: 24 * 60 * 60 * 1000,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
    passwordMinLength: 6,
    requireStrongPassword: false,
    maintenanceMode: false,
    maintenanceMessage: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSystemInfo()
  }, [])

  const fetchSystemInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/system')
      if (!response.ok) throw new Error('Failed to fetch system info')
      
      const data = await response.json()
      setSystemInfo(data)
      setConfig(data.config)
    } catch (error) {
      console.error('Error fetching system info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/system', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        throw new Error('Failed to save configuration')
      }

      // Show success message
      alert('Configuration saved successfully!')
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateBackup = async () => {
    try {
      const response = await fetch('/api/admin/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `backup_${new Date().toISOString().split('T')[0]}`,
          description: 'Automatic system backup'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create backup')
      }

      const data = await response.json()
      alert(`Backup created successfully: ${data.backup.name}`)
    } catch (error) {
      console.error('Error creating backup:', error)
      alert('Failed to create backup')
    }
  }

  const handleCleanup = async () => {
    try {
      const response = await fetch('/api/admin/system/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cleanupActivities: true,
          cleanupSessions: true,
          olderThanDays: 30
        })
      })

      if (!response.ok) {
        throw new Error('Failed to perform cleanup')
      }

      const data = await response.json()
      alert(`Cleanup completed: Removed ${data.cleanup.deletedActivities} activities and ${data.cleanup.deletedSessions} sessions`)
      fetchSystemInfo()
    } catch (error) {
      console.error('Error performing cleanup:', error)
      alert('Failed to perform cleanup')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!systemInfo) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Failed to load system information</p>
        <Button onClick={fetchSystemInfo} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo.stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-slate-600">
              {systemInfo.stats.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{systemInfo.health.overall}</div>
            <p className="text-xs text-slate-600">
              {systemInfo.health.averageResponseTime}ms avg response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Records</CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo.database.totalRecords.toLocaleString()}</div>
            <p className="text-xs text-slate-600">
              Across {Object.keys(systemInfo.database.tables).length} tables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(systemInfo.health.uptime / 86400)}d
            </div>
            <p className="text-xs text-slate-600">
              {Math.floor((systemInfo.health.uptime % 86400) / 3600)}h {Math.floor((systemInfo.health.uptime % 3600) / 60)}m
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Manage system settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">General Settings</h3>
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={config.siteName}
                      onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Input
                      id="siteDescription"
                      value={config.siteDescription}
                      onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Registration</Label>
                      <p className="text-sm text-slate-600">Enable user self-registration</p>
                    </div>
                    <Switch
                      checked={config.allowRegistration}
                      onCheckedChange={(checked) => setConfig({ ...config, allowRegistration: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-slate-600">Verify email addresses</p>
                    </div>
                    <Switch
                      checked={config.requireEmailVerification}
                      onCheckedChange={(checked) => setConfig({ ...config, requireEmailVerification: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Security Settings</h3>
                  <div>
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={config.maxLoginAttempts}
                      onChange={(e) => setConfig({ ...config, maxLoginAttempts: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                    <Input
                      id="lockoutDuration"
                      type="number"
                      value={config.lockoutDuration / 60000}
                      onChange={(e) => setConfig({ ...config, lockoutDuration: parseInt(e.target.value) * 60000 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="passwordMinLength">Min Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={config.passwordMinLength}
                      onChange={(e) => setConfig({ ...config, passwordMinLength: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Strong Password</Label>
                      <p className="text-sm text-slate-600">Enforce password complexity</p>
                    </div>
                    <Switch
                      checked={config.requireStrongPassword}
                      onCheckedChange={(checked) => setConfig({ ...config, requireStrongPassword: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveConfig} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Monitor system performance and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Service Status</h3>
                  <div className="space-y-3">
                    {systemInfo.health.checks.map((check, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            check.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="font-medium">{check.name}</span>
                        </div>
                        <div className="text-sm text-slate-600">
                          {check.responseTime}ms
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Memory Usage</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>RSS</span>
                        <span>{(systemInfo.health.memoryUsage.rss / 1024 / 1024).toFixed(1)} MB</span>
                      </div>
                      <Progress value={(systemInfo.health.memoryUsage.rss / 1024 / 1024 / 500) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Heap Used</span>
                        <span>{(systemInfo.health.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)} MB</span>
                      </div>
                      <Progress value={(systemInfo.health.memoryUsage.heapUsed / systemInfo.health.memoryUsage.heapTotal) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>External</span>
                        <span>{(systemInfo.health.memoryUsage.external / 1024 / 1024).toFixed(1)} MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseManagement />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup Management</CardTitle>
                <CardDescription>Create and manage system backups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleCreateBackup} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
                <p className="text-sm text-slate-600">
                  Backups include all user data, activities, and system configuration.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Cleanup</CardTitle>
                <CardDescription>Remove old data and optimize performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleCleanup} variant="outline" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cleanup Old Data
                </Button>
                <p className="text-sm text-slate-600">
                  Remove activities and sessions older than 30 days to improve performance.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}