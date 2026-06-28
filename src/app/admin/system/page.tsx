'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Settings, 
  Database, 
  Mail, 
  Shield, 
  Bell, 
  Globe, 
  Save, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Key,
  Users,
  Smartphone,
  Cloud,
  Lock,
  Eye,
  EyeOff,
  Activity,
  Server,
  HardDrive,
  Cpu
} from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { toast } from 'sonner'

interface SystemConfig {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    supportPhone: string
    timezone: string
    language: string
    maintenanceMode: boolean
    debugMode: boolean
  }
  security: {
    passwordMinLength: number
    passwordRequireUppercase: boolean
    passwordRequireLowercase: boolean
    passwordRequireNumbers: boolean
    passwordRequireSymbols: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    twoFactorEnabled: boolean
    ipWhitelist: string[]
    allowedOrigins: string[]
  }
  email: {
    smtpHost: string
    smtpPort: number
    smtpUsername: string
    smtpPassword: string
    smtpEncryption: 'none' | 'ssl' | 'tls'
    fromEmail: string
    fromName: string
    emailNotificationsEnabled: boolean
  }
  notifications: {
    emailAlerts: boolean
    smsAlerts: boolean
    pushNotifications: boolean
    slackWebhook: string
    discordWebhook: string
    alertThresholds: {
      failedLogins: number
      cpuUsage: number
      memoryUsage: number
      diskUsage: number
    }
  }
  backup: {
    autoBackup: boolean
    backupFrequency: 'daily' | 'weekly' | 'monthly'
    retentionDays: number
    backupLocation: 'local' | 'cloud'
    cloudProvider: 'aws' | 'gcp' | 'azure'
    cloudCredentials: {
      accessKey: string
      secretKey: string
      bucket: string
      region: string
    }
  }
  api: {
    rateLimitEnabled: boolean
    rateLimitRequests: number
    rateLimitWindow: number
    apiKeyRequired: boolean
    corsEnabled: boolean
    apiVersion: string
    documentationEnabled: boolean
  }
}

interface SystemStatus {
  timestamp: string
  database: {
    userCount: number
    activeUserCount: number
    sessionCount: number
    activityCount: number
  }
  system: {
    platform: string
    arch: string
    uptime: number
    totalmem: number
    freemem: number
    cpus: number
    loadavg: number[]
    hostname: string
    memoryUsage: number
    diskUsage: number
  }
  recentActivities: Array<{
    id: string
    user: string
    action: string
    resource: string
    timestamp: string
  }>
}

export default function SystemConfigPage() {
  const [config, setConfig] = useState<SystemConfig>({
    general: {
      siteName: 'AI CRM System',
      siteDescription: 'Advanced AI-powered management system',
      contactEmail: 'admin@z.ai',
      supportPhone: '+1-555-0123',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false,
      debugMode: false
    },
    security: {
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSymbols: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      twoFactorEnabled: false,
      ipWhitelist: [],
      allowedOrigins: []
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      smtpEncryption: 'tls',
      fromEmail: 'noreply@z.ai',
      fromName: 'Z.ai System',
      emailNotificationsEnabled: true
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      slackWebhook: '',
      discordWebhook: '',
      alertThresholds: {
        failedLogins: 5,
        cpuUsage: 80,
        memoryUsage: 85,
        diskUsage: 90
      }
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      backupLocation: 'local',
      cloudProvider: 'aws',
      cloudCredentials: {
        accessKey: '',
        secretKey: '',
        bucket: '',
        region: 'us-east-1'
      }
    },
    api: {
      rateLimitEnabled: true,
      rateLimitRequests: 100,
      rateLimitWindow: 15,
      apiKeyRequired: false,
      corsEnabled: true,
      apiVersion: 'v1',
      documentationEnabled: true
    }
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({})
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [refreshingStatus, setRefreshingStatus] = useState(false)

  useEffect(() => {
    fetchConfig()
    fetchSystemStatus()
  }, [])

  const fetchSystemStatus = async () => {
    try {
      setRefreshingStatus(true)
      const response = await fetch('/api/admin/system/status')
      if (!response.ok) throw new Error('Failed to fetch system status')
      const data = await response.json()
      setSystemStatus(data)
    } catch (error) {
      console.error('Error fetching system status:', error)
      toast.error('Failed to load system status')
    } finally {
      setRefreshingStatus(false)
    }
  }

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/system/config')
      if (!response.ok) throw new Error('Failed to fetch config')
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      console.error('Error fetching config:', error)
      toast.error('Failed to load system configuration')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async (section?: keyof SystemConfig) => {
    try {
      setSaving(true)
      const configToSave = section ? { [section]: config[section] } : config
      
      const response = await fetch('/api/admin/system/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configToSave)
      })

      if (!response.ok) throw new Error('Failed to save config')
      
      toast.success(section ? `${section} configuration saved` : 'All configurations saved')
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const testEmailConfig = async () => {
    try {
      const response = await fetch('/api/admin/system/test/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config.email)
      })

      const result = await response.json()
      setTestResults(prev => ({
        ...prev,
        email: result
      }))
      
      if (result.success) {
        toast.success('Email test successful')
      } else {
        toast.error('Email test failed: ' + result.message)
      }
    } catch (error) {
      console.error('Error testing email:', error)
      toast.error('Email test failed')
    }
  }

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">System Configuration</h1>
            <p className="text-slate-600 mt-2">Manage system settings and preferences</p>
          </div>
          <Button 
            onClick={() => saveConfig()} 
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save All'}
          </Button>
        </div>

        {/* System Status Card */}
        {systemStatus && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Status
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSystemStatus}
                  disabled={refreshingStatus}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshingStatus ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <CardDescription>
                Real-time system monitoring and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Database Stats */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold">Database</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Users</span>
                      <Badge variant="secondary">{systemStatus.database.userCount}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Active Users</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {systemStatus.database.activeUserCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Active Sessions</span>
                      <Badge variant="outline">{systemStatus.database.sessionCount}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Activities</span>
                      <Badge variant="outline">{systemStatus.database.activityCount}</Badge>
                    </div>
                  </div>
                </div>

                {/* System Resources */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-purple-600" />
                    <h3 className="font-semibold">System Resources</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>{systemStatus.system.memoryUsage.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={systemStatus.system.memoryUsage} 
                        className="h-2"
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>CPU Cores</span>
                      <Badge variant="outline">{systemStatus.system.cpus}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Platform</span>
                      <Badge variant="outline">{systemStatus.system.platform}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Uptime</span>
                      <span className="text-xs text-slate-600">
                        {Math.floor(systemStatus.system.uptime / 3600)}h {Math.floor((systemStatus.system.uptime % 3600) / 60)}m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Storage */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-orange-600" />
                    <h3 className="font-semibold">Storage</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Memory</span>
                      <span className="text-xs text-slate-600">
                        {(systemStatus.system.totalmem / 1024 / 1024 / 1024).toFixed(1)} GB
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Free Memory</span>
                      <span className="text-xs text-slate-600">
                        {(systemStatus.system.freemem / 1024 / 1024 / 1024).toFixed(1)} GB
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Hostname</span>
                      <span className="text-xs text-slate-600 truncate">
                        {systemStatus.system.hostname}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    <h3 className="font-semibold">Recent Activities</h3>
                  </div>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {systemStatus.recentActivities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="text-xs">
                        <div className="font-medium truncate">{activity.user}</div>
                        <div className="text-slate-600 truncate">
                          {activity.action} {activity.resource && `- ${activity.resource}`}
                        </div>
                        <div className="text-slate-400">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                    {systemStatus.recentActivities.length === 0 && (
                      <div className="text-xs text-slate-500">No recent activities</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Backup
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic system configuration and site settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={config.general.siteName}
                      onChange={(e) => updateConfig('general', 'siteName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={config.general.contactEmail}
                      onChange={(e) => updateConfig('general', 'contactEmail', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportPhone">Support Phone</Label>
                    <Input
                      id="supportPhone"
                      value={config.general.supportPhone}
                      onChange={(e) => updateConfig('general', 'supportPhone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={config.general.timezone} onValueChange={(value) => updateConfig('general', 'timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={config.general.siteDescription}
                    onChange={(e) => updateConfig('general', 'siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-slate-600">Put the site in maintenance mode</p>
                  </div>
                  <Switch
                    checked={config.general.maintenanceMode}
                    onCheckedChange={(checked) => updateConfig('general', 'maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-slate-600">Enable debug logging and verbose output</p>
                  </div>
                  <Switch
                    checked={config.general.debugMode}
                    onCheckedChange={(checked) => updateConfig('general', 'debugMode', checked)}
                  />
                </div>

                <Button onClick={() => saveConfig('general')} disabled={saving}>
                  Save General Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security policies and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={config.security.passwordMinLength}
                      onChange={(e) => updateConfig('security', 'passwordMinLength', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={config.security.maxLoginAttempts}
                      onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={config.security.sessionTimeout}
                      onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Password Requirements</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Require Uppercase Letters</Label>
                      <Switch
                        checked={config.security.passwordRequireUppercase}
                        onCheckedChange={(checked) => updateConfig('security', 'passwordRequireUppercase', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Require Lowercase Letters</Label>
                      <Switch
                        checked={config.security.passwordRequireLowercase}
                        onCheckedChange={(checked) => updateConfig('security', 'passwordRequireLowercase', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Require Numbers</Label>
                      <Switch
                        checked={config.security.passwordRequireNumbers}
                        onCheckedChange={(checked) => updateConfig('security', 'passwordRequireNumbers', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Require Symbols</Label>
                      <Switch
                        checked={config.security.passwordRequireSymbols}
                        onCheckedChange={(checked) => updateConfig('security', 'passwordRequireSymbols', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-slate-600">Enable 2FA for all users</p>
                      </div>
                      <Switch
                        checked={config.security.twoFactorEnabled}
                        onCheckedChange={(checked) => updateConfig('security', 'twoFactorEnabled', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={() => saveConfig('security')} disabled={saving}>
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Configuration
                </CardTitle>
                <CardDescription>Configure SMTP settings for email delivery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={config.email.smtpHost}
                      onChange={(e) => updateConfig('email', 'smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={config.email.smtpPort}
                      onChange={(e) => updateConfig('email', 'smtpPort', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input
                      id="smtpUsername"
                      value={config.email.smtpUsername}
                      onChange={(e) => updateConfig('email', 'smtpUsername', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <div className="relative">
                      <Input
                        id="smtpPassword"
                        type={showPasswords.smtp ? 'text' : 'password'}
                        value={config.email.smtpPassword}
                        onChange={(e) => updateConfig('email', 'smtpPassword', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => togglePasswordVisibility('smtp')}
                      >
                        {showPasswords.smtp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={config.email.fromEmail}
                      onChange={(e) => updateConfig('email', 'fromEmail', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={config.email.fromName}
                      onChange={(e) => updateConfig('email', 'fromName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpEncryption">SMTP Encryption</Label>
                  <Select value={config.email.smtpEncryption} onValueChange={(value: 'none' | 'ssl' | 'tls') => updateConfig('email', 'smtpEncryption', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-slate-600">Enable email notifications</p>
                  </div>
                  <Switch
                    checked={config.email.emailNotificationsEnabled}
                    onCheckedChange={(checked) => updateConfig('email', 'emailNotificationsEnabled', checked)}
                  />
                </div>

                {testResults.email && (
                  <Alert className={testResults.email.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {testResults.email.message}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => saveConfig('email')} disabled={saving}>
                    Save Email Settings
                  </Button>
                  <Button variant="outline" onClick={testEmailConfig}>
                    Test Email Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure system alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Notification Channels</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Email Alerts</Label>
                      <Switch
                        checked={config.notifications.emailAlerts}
                        onCheckedChange={(checked) => updateConfig('notifications', 'emailAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>SMS Alerts</Label>
                      <Switch
                        checked={config.notifications.smsAlerts}
                        onCheckedChange={(checked) => updateConfig('notifications', 'smsAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Push Notifications</Label>
                      <Switch
                        checked={config.notifications.pushNotifications}
                        onCheckedChange={(checked) => updateConfig('notifications', 'pushNotifications', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                    <Input
                      id="slackWebhook"
                      value={config.notifications.slackWebhook}
                      onChange={(e) => updateConfig('notifications', 'slackWebhook', e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discordWebhook">Discord Webhook URL</Label>
                    <Input
                      id="discordWebhook"
                      value={config.notifications.discordWebhook}
                      onChange={(e) => updateConfig('notifications', 'discordWebhook', e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Alert Thresholds</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="failedLogins">Failed Logins Alert</Label>
                      <Input
                        id="failedLogins"
                        type="number"
                        value={config.notifications.alertThresholds.failedLogins}
                        onChange={(e) => updateConfig('notifications', 'alertThresholds', {
                          ...config.notifications.alertThresholds,
                          failedLogins: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpuUsage">CPU Usage Alert (%)</Label>
                      <Input
                        id="cpuUsage"
                        type="number"
                        value={config.notifications.alertThresholds.cpuUsage}
                        onChange={(e) => updateConfig('notifications', 'alertThresholds', {
                          ...config.notifications.alertThresholds,
                          cpuUsage: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memoryUsage">Memory Usage Alert (%)</Label>
                      <Input
                        id="memoryUsage"
                        type="number"
                        value={config.notifications.alertThresholds.memoryUsage}
                        onChange={(e) => updateConfig('notifications', 'alertThresholds', {
                          ...config.notifications.alertThresholds,
                          memoryUsage: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diskUsage">Disk Usage Alert (%)</Label>
                      <Input
                        id="diskUsage"
                        type="number"
                        value={config.notifications.alertThresholds.diskUsage}
                        onChange={(e) => updateConfig('notifications', 'alertThresholds', {
                          ...config.notifications.alertThresholds,
                          diskUsage: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={() => saveConfig('notifications')} disabled={saving}>
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Settings */}
          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup Configuration
                </CardTitle>
                <CardDescription>Configure automated backup settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Backup</Label>
                      <p className="text-sm text-slate-600">Enable automatic backups</p>
                    </div>
                    <Switch
                      checked={config.backup.autoBackup}
                      onCheckedChange={(checked) => updateConfig('backup', 'autoBackup', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select value={config.backup.backupFrequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => updateConfig('backup', 'backupFrequency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retentionDays">Retention Days</Label>
                      <Input
                        id="retentionDays"
                        type="number"
                        value={config.backup.retentionDays}
                        onChange={(e) => updateConfig('backup', 'retentionDays', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backupLocation">Backup Location</Label>
                    <Select value={config.backup.backupLocation} onValueChange={(value: 'local' | 'cloud') => updateConfig('backup', 'backupLocation', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local Storage</SelectItem>
                        <SelectItem value="cloud">Cloud Storage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {config.backup.backupLocation === 'cloud' && (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <Label>Cloud Storage Configuration</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Cloud Provider</Label>
                          <Select value={config.backup.cloudProvider} onValueChange={(value: 'aws' | 'gcp' | 'azure') => updateConfig('backup', 'cloudProvider', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aws">AWS S3</SelectItem>
                              <SelectItem value="gcp">Google Cloud</SelectItem>
                              <SelectItem value="azure">Azure Blob</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bucket">Bucket Name</Label>
                          <Input
                            id="bucket"
                            value={config.backup.cloudCredentials.bucket}
                            onChange={(e) => updateConfig('backup', 'cloudCredentials', {
                              ...config.backup.cloudCredentials,
                              bucket: e.target.value
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="region">Region</Label>
                          <Input
                            id="region"
                            value={config.backup.cloudCredentials.region}
                            onChange={(e) => updateConfig('backup', 'cloudCredentials', {
                              ...config.backup.cloudCredentials,
                              region: e.target.value
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accessKey">Access Key</Label>
                          <Input
                            id="accessKey"
                            value={config.backup.cloudCredentials.accessKey}
                            onChange={(e) => updateConfig('backup', 'cloudCredentials', {
                              ...config.backup.cloudCredentials,
                              accessKey: e.target.value
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="secretKey">Secret Key</Label>
                          <div className="relative">
                            <Input
                              id="secretKey"
                              type={showPasswords.secretKey ? 'text' : 'password'}
                              value={config.backup.cloudCredentials.secretKey}
                              onChange={(e) => updateConfig('backup', 'cloudCredentials', {
                                ...config.backup.cloudCredentials,
                                secretKey: e.target.value
                              })}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2"
                              onClick={() => togglePasswordVisibility('secretKey')}
                            >
                              {showPasswords.secretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={() => saveConfig('backup')} disabled={saving}>
                  Save Backup Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Settings */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Configuration
                </CardTitle>
                <CardDescription>Configure API settings and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Rate Limiting</Label>
                      <p className="text-sm text-slate-600">Enable API rate limiting</p>
                    </div>
                    <Switch
                      checked={config.api.rateLimitEnabled}
                      onCheckedChange={(checked) => updateConfig('api', 'rateLimitEnabled', checked)}
                    />
                  </div>

                  {config.api.rateLimitEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="rateLimitRequests">Requests per Window</Label>
                        <Input
                          id="rateLimitRequests"
                          type="number"
                          value={config.api.rateLimitRequests}
                          onChange={(e) => updateConfig('api', 'rateLimitRequests', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rateLimitWindow">Window (minutes)</Label>
                        <Input
                          id="rateLimitWindow"
                          type="number"
                          value={config.api.rateLimitWindow}
                          onChange={(e) => updateConfig('api', 'rateLimitWindow', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>API Key Required</Label>
                      <p className="text-sm text-slate-600">Require API key for access</p>
                    </div>
                    <Switch
                      checked={config.api.apiKeyRequired}
                      onCheckedChange={(checked) => updateConfig('api', 'apiKeyRequired', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>CORS Enabled</Label>
                      <p className="text-sm text-slate-600">Enable Cross-Origin Resource Sharing</p>
                    </div>
                    <Switch
                      checked={config.api.corsEnabled}
                      onCheckedChange={(checked) => updateConfig('api', 'corsEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>API Documentation</Label>
                      <p className="text-sm text-slate-600">Enable public API documentation</p>
                    </div>
                    <Switch
                      checked={config.api.documentationEnabled}
                      onCheckedChange={(checked) => updateConfig('api', 'documentationEnabled', checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="apiVersion">API Version</Label>
                    <Select value={config.api.apiVersion} onValueChange={(value) => updateConfig('api', 'apiVersion', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v1">v1</SelectItem>
                        <SelectItem value="v2">v2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={() => saveConfig('api')} disabled={saving}>
                  Save API Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}