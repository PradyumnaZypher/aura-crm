'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Key, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Settings,
  Users,
  Clock,
  Ban,
  RefreshCw,
  Save,
  RotateCcw,
  Mail,
  Smartphone,
  Globe,
  Database,
  Activity
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SecuritySettings {
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    maxAge: number
    historyCount: number
  }
  sessionSettings: {
    timeoutMinutes: number
    maxConcurrentSessions: number
    requireReauth: boolean
    reauthTimeoutMinutes: number
  }
  loginSecurity: {
    maxAttempts: number
    lockoutDuration: number
    requireTwoFactor: boolean
    allowRememberMe: boolean
    ipWhitelist: string[]
    ipBlacklist: string[]
  }
  notifications: {
    failedLoginAttempts: boolean
    passwordChanges: boolean
    newDeviceLogin: boolean
    adminActions: boolean
    securityAlerts: boolean
    emailNotifications: boolean
    smsNotifications: boolean
  }
  auditSettings: {
    logLevel: 'basic' | 'detailed' | 'comprehensive'
    retentionDays: number
    logFailedRequests: boolean
    logApiCalls: boolean
    logDataAccess: boolean
  }
}

export default function SecuritySettings() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('password')
  const [newIPWhitelist, setNewIPWhitelist] = useState('')
  const [newIPBlacklist, setNewIPBlacklist] = useState('')
  const { toast } = useToast()

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/security/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        console.error('Failed to fetch security settings')
        // Set default values on error
        setSettings({
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false,
            maxAge: 90,
            historyCount: 5
          },
          sessionSettings: {
            timeoutMinutes: 30,
            maxConcurrentSessions: 3,
            requireReauth: false,
            reauthTimeoutMinutes: 15
          },
          loginSecurity: {
            maxAttempts: 5,
            lockoutDuration: 15,
            requireTwoFactor: false,
            allowRememberMe: true,
            ipWhitelist: [],
            ipBlacklist: []
          },
          notifications: {
            failedLoginAttempts: true,
            passwordChanges: true,
            newDeviceLogin: true,
            adminActions: true,
            securityAlerts: true,
            emailNotifications: true,
            smsNotifications: false
          },
          auditSettings: {
            logLevel: 'basic',
            retentionDays: 30,
            logFailedRequests: true,
            logApiCalls: false,
            logDataAccess: false
          }
        })
      }
    } catch (error) {
      console.error('Error fetching security settings:', error)
      // Set default values on error
      setSettings({
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          maxAge: 90,
          historyCount: 5
        },
        sessionSettings: {
          timeoutMinutes: 30,
          maxConcurrentSessions: 3,
          requireReauth: false,
          reauthTimeoutMinutes: 15
        },
        loginSecurity: {
          maxAttempts: 5,
          lockoutDuration: 15,
          requireTwoFactor: false,
          allowRememberMe: true,
          ipWhitelist: [],
          ipBlacklist: []
        },
        notifications: {
          failedLoginAttempts: true,
          passwordChanges: true,
          newDeviceLogin: true,
          adminActions: true,
          securityAlerts: true,
          emailNotifications: true,
          smsNotifications: false
        },
        auditSettings: {
          logLevel: 'basic',
          retentionDays: 30,
          logFailedRequests: true,
          logApiCalls: false,
          logDataAccess: false
        }
      })
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load security settings"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/security/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast({
        title: "Settings Saved",
        description: "Security settings have been updated successfully"
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save security settings"
      })
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = async () => {
    try {
      const response = await fetch('/api/admin/security/settings/defaults', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to reset settings')
      }

      const data = await response.json()
      setSettings(data)

      toast({
        title: "Settings Reset",
        description: "Security settings have been reset to defaults"
      })
    } catch (error) {
      console.error('Error resetting settings:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset security settings"
      })
    }
  }

  const addIPToWhitelist = () => {
    if (!settings || !newIPWhitelist.trim()) return

    setSettings({
      ...settings,
      loginSecurity: {
        ...settings.loginSecurity,
        ipWhitelist: [...(settings.loginSecurity?.ipWhitelist || []), newIPWhitelist.trim()]
      }
    })
    setNewIPWhitelist('')
  }

  const removeIPFromWhitelist = (ip: string) => {
    if (!settings) return

    setSettings({
      ...settings,
      loginSecurity: {
        ...settings.loginSecurity,
        ipWhitelist: (settings.loginSecurity?.ipWhitelist || []).filter(item => item !== ip)
      }
    })
  }

  const addIPToBlacklist = () => {
    if (!settings || !newIPBlacklist.trim()) return

    setSettings({
      ...settings,
      loginSecurity: {
        ...settings.loginSecurity,
        ipBlacklist: [...(settings.loginSecurity?.ipBlacklist || []), newIPBlacklist.trim()]
      }
    })
    setNewIPBlacklist('')
  }

  const removeIPFromBlacklist = (ip: string) => {
    if (!settings) return

    setSettings({
      ...settings,
      loginSecurity: {
        ...settings.loginSecurity,
        ipBlacklist: (settings.loginSecurity?.ipBlacklist || []).filter(item => item !== ip)
      }
    })
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load security settings</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-muted-foreground">Configure system security policies and settings</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="password">Password Policy</TabsTrigger>
          <TabsTrigger value="session">Session Settings</TabsTrigger>
          <TabsTrigger value="login">Login Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="audit">Audit Settings</TabsTrigger>
        </TabsList>

        {/* Password Policy */}
        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Password Policy
              </CardTitle>
              <CardDescription>
                Configure password requirements and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="minLength">Minimum Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    value={settings?.passwordPolicy?.minLength || 8}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordPolicy: {
                        ...settings?.passwordPolicy,
                        minLength: parseInt(e.target.value) || 8
                      }
                    })}
                    min="6"
                    max="128"
                  />
                </div>
                <div>
                  <Label htmlFor="maxAge">Password Expiry (days)</Label>
                  <Input
                    id="maxAge"
                    type="number"
                    value={settings?.passwordPolicy?.maxAge || 90}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordPolicy: {
                        ...settings?.passwordPolicy,
                        maxAge: parseInt(e.target.value) || 90
                      }
                    })}
                    min="0"
                    max="365"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="historyCount">Password History Count</Label>
                  <Input
                    id="historyCount"
                    type="number"
                    value={settings?.passwordPolicy?.historyCount || 5}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordPolicy: {
                        ...settings?.passwordPolicy,
                        historyCount: parseInt(e.target.value) || 5
                      }
                    })}
                    min="0"
                    max="24"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Uppercase Letters</Label>
                    <p className="text-sm text-muted-foreground">Passwords must contain at least one uppercase letter</p>
                  </div>
                  <Switch
                    checked={settings?.passwordPolicy?.requireUppercase || false}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      passwordPolicy: {
                        ...settings?.passwordPolicy,
                        requireUppercase: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Lowercase Letters</Label>
                    <p className="text-sm text-muted-foreground">Passwords must contain at least one lowercase letter</p>
                  </div>
                  <Switch
                    checked={settings?.passwordPolicy?.requireLowercase || false}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      passwordPolicy: {
                        ...settings?.passwordPolicy,
                        requireLowercase: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Numbers</Label>
                    <p className="text-sm text-muted-foreground">Passwords must contain at least one number</p>
                  </div>
                  <Switch
                    checked={settings?.passwordPolicy?.requireNumbers || false}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      passwordPolicy: {
                        ...settings?.passwordPolicy,
                        requireNumbers: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Special Characters</Label>
                    <p className="text-sm text-muted-foreground">Passwords must contain at least one special character</p>
                  </div>
                  <Switch
                    checked={settings?.passwordPolicy?.requireSpecialChars || false}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      passwordPolicy: {
                        ...settings?.passwordPolicy,
                        requireSpecialChars: checked
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session Settings */}
        <TabsContent value="session" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session Settings
              </CardTitle>
              <CardDescription>
                Configure user session management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="timeoutMinutes">Session Timeout (minutes)</Label>
                  <Input
                    id="timeoutMinutes"
                    type="number"
                    value={settings?.sessionSettings?.timeoutMinutes || 30}
                    onChange={(e) => setSettings({
                      ...settings,
                      sessionSettings: {
                        ...settings?.sessionSettings,
                        timeoutMinutes: parseInt(e.target.value) || 30
                      }
                    })}
                    min="5"
                    max="1440"
                  />
                </div>
                <div>
                  <Label htmlFor="maxConcurrentSessions">Max Concurrent Sessions</Label>
                  <Input
                    id="maxConcurrentSessions"
                    type="number"
                    value={settings?.sessionSettings?.maxConcurrentSessions || 3}
                    onChange={(e) => setSettings({
                      ...settings,
                      sessionSettings: {
                        ...settings?.sessionSettings,
                        maxConcurrentSessions: parseInt(e.target.value) || 3
                      }
                    })}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="reauthTimeoutMinutes">Re-authentication Timeout (minutes)</Label>
                  <Input
                    id="reauthTimeoutMinutes"
                    type="number"
                    value={settings?.sessionSettings?.reauthTimeoutMinutes || 15}
                    onChange={(e) => setSettings({
                      ...settings,
                      sessionSettings: {
                        ...settings?.sessionSettings,
                        reauthTimeoutMinutes: parseInt(e.target.value) || 15
                      }
                    })}
                    min="5"
                    max="120"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Re-authentication</Label>
                    <p className="text-sm text-muted-foreground">Require users to re-authenticate for sensitive actions</p>
                  </div>
                  <Switch
                    checked={settings?.sessionSettings?.requireReauth || false}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      sessionSettings: {
                        ...settings?.sessionSettings,
                        requireReauth: checked
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login Security */}
        <TabsContent value="login" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Login Security
              </CardTitle>
              <CardDescription>
                Configure login security measures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    value={settings?.loginSecurity?.maxAttempts || 5}
                    onChange={(e) => setSettings({
                      ...settings,
                      loginSecurity: {
                        ...settings?.loginSecurity,
                        maxAttempts: parseInt(e.target.value) || 5
                      }
                    })}
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={settings?.loginSecurity?.lockoutDuration || 15}
                    onChange={(e) => setSettings({
                      ...settings,
                      loginSecurity: {
                        ...settings?.loginSecurity,
                        lockoutDuration: parseInt(e.target.value) || 15
                      }
                    })}
                    min="1"
                    max="1440"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch
                    checked={settings?.loginSecurity?.requireTwoFactor || false}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      loginSecurity: {
                        ...settings?.loginSecurity,
                        requireTwoFactor: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow "Remember Me"</Label>
                    <p className="text-sm text-muted-foreground">Allow users to stay logged in</p>
                  </div>
                  <Switch
                    checked={settings?.loginSecurity?.allowRememberMe || false}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      loginSecurity: {
                        ...settings?.loginSecurity,
                        allowRememberMe: checked
                      }
                    })}
                  />
                </div>
              </div>

              {/* IP Whitelist */}
              <div>
                <Label>IP Whitelist</Label>
                <p className="text-sm text-muted-foreground">Allowed IP addresses for admin access</p>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter IP address (e.g., 192.168.1.1)"
                    value={newIPWhitelist}
                    onChange={(e) => setNewIPWhitelist(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addIPToWhitelist()}
                  />
                  <Button onClick={addIPToWhitelist}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(settings?.loginSecurity?.ipWhitelist || []).map((ip) => (
                    <Badge key={ip} variant="secondary" className="flex items-center gap-1">
                      {ip}
                      <button
                        onClick={() => removeIPFromWhitelist(ip)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* IP Blacklist */}
              <div>
                <Label>IP Blacklist</Label>
                <p className="text-sm text-muted-foreground">Blocked IP addresses</p>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter IP address (e.g., 192.168.1.1)"
                    value={newIPBlacklist}
                    onChange={(e) => setNewIPBlacklist(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addIPToBlacklist()}
                  />
                  <Button onClick={addIPToBlacklist}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(settings?.loginSecurity?.ipBlacklist || []).map((ip) => (
                    <Badge key={ip} variant="destructive" className="flex items-center gap-1">
                      {ip}
                      <button
                        onClick={() => removeIPFromBlacklist(ip)}
                        className="ml-1 hover:text-white"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Security Notifications
              </CardTitle>
              <CardDescription>
                Configure security event notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Failed Login Attempts</Label>
                    <p className="text-sm text-muted-foreground">Notify on failed login attempts</p>
                  </div>
                  <Switch
                    checked={settings.notifications.failedLoginAttempts}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        failedLoginAttempts: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Password Changes</Label>
                    <p className="text-sm text-muted-foreground">Notify on password changes</p>
                  </div>
                  <Switch
                    checked={settings.notifications.passwordChanges}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        passwordChanges: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Device Login</Label>
                    <p className="text-sm text-muted-foreground">Notify on login from new devices</p>
                  </div>
                  <Switch
                    checked={settings.notifications.newDeviceLogin}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        newDeviceLogin: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Admin Actions</Label>
                    <p className="text-sm text-muted-foreground">Notify on administrative actions</p>
                  </div>
                  <Switch
                    checked={settings.notifications.adminActions}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        adminActions: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify on security alerts</p>
                  </div>
                  <Switch
                    checked={settings.notifications.securityAlerts}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        securityAlerts: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        emailNotifications: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        smsNotifications: checked
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Settings */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Audit Settings
              </CardTitle>
              <CardDescription>
                Configure audit logging and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="logLevel">Log Level</Label>
                  <Select
                    value={settings.auditSettings.logLevel}
                    onValueChange={(value: 'basic' | 'detailed' | 'comprehensive') => setSettings({
                      ...settings,
                      auditSettings: {
                        ...settings.auditSettings,
                        logLevel: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="retentionDays">Log Retention (days)</Label>
                  <Input
                    id="retentionDays"
                    type="number"
                    value={settings.auditSettings.retentionDays}
                    onChange={(e) => setSettings({
                      ...settings,
                      auditSettings: {
                        ...settings.auditSettings,
                        retentionDays: parseInt(e.target.value) || 90
                      }
                    })}
                    min="7"
                    max="365"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Log Failed Requests</Label>
                    <p className="text-sm text-muted-foreground">Log failed API requests</p>
                  </div>
                  <Switch
                    checked={settings.auditSettings.logFailedRequests}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      auditSettings: {
                        ...settings.auditSettings,
                        logFailedRequests: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Log API Calls</Label>
                    <p className="text-sm text-muted-foreground">Log all API calls</p>
                  </div>
                  <Switch
                    checked={settings.auditSettings.logApiCalls}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      auditSettings: {
                        ...settings.auditSettings,
                        logApiCalls: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Log Data Access</Label>
                    <p className="text-sm text-muted-foreground">Log data access events</p>
                  </div>
                  <Switch
                    checked={settings.auditSettings.logDataAccess}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      auditSettings: {
                        ...settings.auditSettings,
                        logDataAccess: checked
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}