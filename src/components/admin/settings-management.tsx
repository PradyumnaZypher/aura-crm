'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  Users, 
  Shield, 
  Bell, 
  Mail, 
  Database, 
  Globe,
  Lock,
  UserPlus,
  Save,
  RefreshCw,
  Upload,
  Download,
  Trash2,
  Plus,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    siteUrl: string
    logoUrl: string
    faviconUrl: string
    defaultLanguage: string
    timezone: string
    dateFormat: string
    timeFormat: string
  }
  userManagement: {
    allowRegistration: boolean
    requireEmailVerification: boolean
    requireAdminApproval: boolean
    defaultUserRole: string
    sessionTimeout: number
    maxLoginAttempts: number
    lockoutDuration: number
    passwordMinLength: number
    requireStrongPassword: boolean
    passwordExpiry: number
    allowSocialLogin: boolean
  }
  security: {
    enableTwoFactor: boolean
    forceTwoFactor: boolean
    sessionSecure: boolean
    corsOrigins: string[]
    rateLimiting: boolean
    rateLimitRequests: number
    rateLimitWindow: number
    enableAuditLog: boolean
    dataRetentionDays: number
  }
  email: {
    smtpHost: string
    smtpPort: number
    smtpUser: string
    smtpPassword: string
    smtpSecure: boolean
    fromEmail: string
    fromName: string
    replyTo: string
    emailTemplates: boolean
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    smsNotifications: boolean
    newUserNotification: boolean
    loginAlerts: boolean
    systemAlerts: boolean
    maintenanceAlerts: boolean
  }
  backup: {
    autoBackup: boolean
    backupFrequency: string
    backupRetention: number
    backupLocation: string
    encryptionEnabled: boolean
    includeUserData: boolean
    includeSystemData: boolean
  }
}

interface UserTemplate {
  id: string
  name: string
  role: string
  permissions: string[]
  defaultSettings: any
}

export default function SettingsManagementTab() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: '',
      siteDescription: '',
      siteUrl: '',
      logoUrl: '',
      faviconUrl: '',
      defaultLanguage: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    },
    userManagement: {
      allowRegistration: true,
      requireEmailVerification: false,
      requireAdminApproval: false,
      defaultUserRole: 'CLIENT',
      sessionTimeout: 24 * 60 * 60 * 1000,
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000,
      passwordMinLength: 8,
      requireStrongPassword: true,
      passwordExpiry: 90,
      allowSocialLogin: false
    },
    security: {
      enableTwoFactor: false,
      forceTwoFactor: false,
      sessionSecure: true,
      corsOrigins: [],
      rateLimiting: true,
      rateLimitRequests: 100,
      rateLimitWindow: 15,
      enableAuditLog: true,
      dataRetentionDays: 365
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      smtpSecure: true,
      fromEmail: '',
      fromName: '',
      replyTo: '',
      emailTemplates: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      newUserNotification: true,
      loginAlerts: true,
      systemAlerts: true,
      maintenanceAlerts: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      backupLocation: 'local',
      encryptionEnabled: true,
      includeUserData: true,
      includeSystemData: true
    }
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSmtpPassword, setShowSmtpPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  // User management states
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([])
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false)
  const [bulkUserDialogOpen, setBulkUserDialogOpen] = useState(false)
  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'CLIENT',
    department: '',
    position: '',
    company: '',
    phone: '',
    sendWelcomeEmail: true,
    isActive: true
  })
  const [bulkUserCsv, setBulkUserCsv] = useState('')

  useEffect(() => {
    fetchSettings()
    fetchUserTemplates()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserTemplates = async () => {
    try {
      const response = await fetch('/api/admin/settings/user-templates')
      if (!response.ok) throw new Error('Failed to fetch user templates')
      
      const data = await response.json()
      setUserTemplates(data)
    } catch (error) {
      console.error('Error fetching user templates:', error)
    }
  }

  const handleSaveSettings = async (category: string) => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          settings: settings[category as keyof SystemSettings]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      // Show success message
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/admin/settings/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFormData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create user')
      }

      setCreateUserDialogOpen(false)
      resetUserForm()
      alert('User created successfully!')
    } catch (error) {
      console.error('Error creating user:', error)
      alert(error.message || 'Failed to create user')
    }
  }

  const handleBulkCreateUsers = async () => {
    try {
      const response = await fetch('/api/admin/settings/bulk-create-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: bulkUserCsv })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create users')
      }

      const data = await response.json()
      setBulkUserDialogOpen(false)
      setBulkUserCsv('')
      alert(`Successfully created ${data.created} users. ${data.failed || 0} failed.`)
    } catch (error) {
      console.error('Error creating users:', error)
      alert(error.message || 'Failed to create users')
    }
  }

  const resetUserForm = () => {
    setUserFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'CLIENT',
      department: '',
      position: '',
      company: '',
      phone: '',
      sendWelcomeEmail: true,
      isActive: true
    })
  }

  const handleExportSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/export')
      if (!response.ok) throw new Error('Failed to export settings')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'settings-backup.json'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting settings:', error)
      alert('Failed to export settings')
    }
  }

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedSettings = JSON.parse(text)
      
      const response = await fetch('/api/admin/settings/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importedSettings)
      })

      if (!response.ok) {
        throw new Error('Failed to import settings')
      }

      await fetchSettings()
      alert('Settings imported successfully!')
    } catch (error) {
      console.error('Error importing settings:', error)
      alert('Failed to import settings')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-slate-600">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportSettings}
              />
            </label>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic site configuration and appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, siteName: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.general.siteDescription}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, siteDescription: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input
                      id="siteUrl"
                      value={settings.general.siteUrl}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, siteUrl: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="defaultLanguage">Default Language</Label>
                    <Select value={settings.general.defaultLanguage} onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, defaultLanguage: value }
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.general.timezone} onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, timezone: value }
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select value={settings.general.dateFormat} onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, dateFormat: value }
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('general')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Settings */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Configure user registration, authentication, and management settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Registration Settings</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Registration</Label>
                      <p className="text-sm text-slate-600">Enable user self-registration</p>
                    </div>
                    <Switch
                      checked={settings.userManagement.allowRegistration}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        userManagement: { ...settings.userManagement, allowRegistration: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-slate-600">Verify email addresses</p>
                    </div>
                    <Switch
                      checked={settings.userManagement.requireEmailVerification}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        userManagement: { ...settings.userManagement, requireEmailVerification: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Admin Approval</Label>
                      <p className="text-sm text-slate-600">Admin approval for new users</p>
                    </div>
                    <Switch
                      checked={settings.userManagement.requireAdminApproval}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        userManagement: { ...settings.userManagement, requireAdminApproval: checked }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="defaultUserRole">Default User Role</Label>
                    <Select value={settings.userManagement.defaultUserRole} onValueChange={(value) => setSettings({
                      ...settings,
                      userManagement: { ...settings.userManagement, defaultUserRole: value }
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLIENT">Client</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Password Settings</h3>
                  <div>
                    <Label htmlFor="passwordMinLength">Min Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings.userManagement.passwordMinLength}
                      onChange={(e) => setSettings({
                        ...settings,
                        userManagement: { ...settings.userManagement, passwordMinLength: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      value={settings.userManagement.passwordExpiry}
                      onChange={(e) => setSettings({
                        ...settings,
                        userManagement: { ...settings.userManagement, passwordExpiry: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Strong Password</Label>
                      <p className="text-sm text-slate-600">Enforce password complexity</p>
                    </div>
                    <Switch
                      checked={settings.userManagement.requireStrongPassword}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        userManagement: { ...settings.userManagement, requireStrongPassword: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Social Login</Label>
                      <p className="text-sm text-slate-600">Enable OAuth login</p>
                    </div>
                    <Switch
                      checked={settings.userManagement.allowSocialLogin}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        userManagement: { ...settings.userManagement, allowSocialLogin: checked }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Quick User Actions */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Quick User Actions</h3>
                <div className="flex items-center gap-4">
                  <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Single User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                          Add a new user to the system with enhanced options
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="col-span-2">
                          <Label htmlFor="userEmail">Email *</Label>
                          <Input
                            id="userEmail"
                            type="email"
                            value={userFormData.email}
                            onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                            placeholder="user@example.com"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="userPassword">Password *</Label>
                          <div className="relative">
                            <Input
                              id="userPassword"
                              type={showPassword ? "text" : "password"}
                              value={userFormData.password}
                              onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                              placeholder="••••••••"
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
                        <div>
                          <Label htmlFor="userFirstName">First Name</Label>
                          <Input
                            id="userFirstName"
                            value={userFormData.firstName}
                            onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <Label htmlFor="userLastName">Last Name</Label>
                          <Input
                            id="userLastName"
                            value={userFormData.lastName}
                            onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                            placeholder="Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="userRole">Role *</Label>
                          <Select value={userFormData.role} onValueChange={(value: any) => setUserFormData({ ...userFormData, role: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CLIENT">Client</SelectItem>
                              <SelectItem value="MANAGER">Manager</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="userCompany">Company</Label>
                          <Input
                            id="userCompany"
                            value={userFormData.company}
                            onChange={(e) => setUserFormData({ ...userFormData, company: e.target.value })}
                            placeholder="Acme Corp"
                          />
                        </div>
                        <div>
                          <Label htmlFor="userDepartment">Department</Label>
                          <Input
                            id="userDepartment"
                            value={userFormData.department}
                            onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                            placeholder="Sales"
                          />
                        </div>
                        <div>
                          <Label htmlFor="userPosition">Position</Label>
                          <Input
                            id="userPosition"
                            value={userFormData.position}
                            onChange={(e) => setUserFormData({ ...userFormData, position: e.target.value })}
                            placeholder="Manager"
                          />
                        </div>
                        <div>
                          <Label htmlFor="userPhone">Phone</Label>
                          <Input
                            id="userPhone"
                            value={userFormData.phone}
                            onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div className="flex items-center justify-between col-span-2">
                          <div>
                            <Label>Send Welcome Email</Label>
                            <p className="text-sm text-slate-600">Send welcome email to new user</p>
                          </div>
                          <Switch
                            checked={userFormData.sendWelcomeEmail}
                            onCheckedChange={(checked) => setUserFormData({ ...userFormData, sendWelcomeEmail: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between col-span-2">
                          <div>
                            <Label>Active Status</Label>
                            <p className="text-sm text-slate-600">User will be active immediately</p>
                          </div>
                          <Switch
                            checked={userFormData.isActive}
                            onCheckedChange={(checked) => setUserFormData({ ...userFormData, isActive: checked })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateUserDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateUser}>Create User</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={bulkUserDialogOpen} onOpenChange={setBulkUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Add Users
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Bulk Create Users</DialogTitle>
                        <DialogDescription>
                          Create multiple users from CSV data. Format: email,firstName,lastName,role,company,department,position,phone
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="bulkUserCsv">CSV Data</Label>
                        <Textarea
                          id="bulkUserCsv"
                          value={bulkUserCsv}
                          onChange={(e) => setBulkUserCsv(e.target.value)}
                          placeholder="john@example.com,John,Doe,CLIENT,Acme Corp,Sales,Manager,+15551234567&#10;jane@example.com,Jane,Smith,MANAGER,Tech Inc,Engineering,Lead,+15559876543"
                          className="min-h-32"
                        />
                        <p className="text-sm text-slate-600 mt-2">
                          Each line should contain user data in the specified order. Role can be CLIENT, MANAGER, or ADMIN.
                        </p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkUserDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleBulkCreateUsers}>Create Users</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="flex justify-end border-t pt-6">
                <Button onClick={() => handleSaveSettings('userManagement')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security policies and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Two-Factor Auth</Label>
                      <p className="text-sm text-slate-600">2FA for enhanced security</p>
                    </div>
                    <Switch
                      checked={settings.security.enableTwoFactor}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: { ...settings.security, enableTwoFactor: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Force Two-Factor Auth</Label>
                      <p className="text-sm text-slate-600">Require 2FA for all users</p>
                    </div>
                    <Switch
                      checked={settings.security.forceTwoFactor}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: { ...settings.security, forceTwoFactor: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Secure Sessions</Label>
                      <p className="text-sm text-slate-600">Use secure cookies</p>
                    </div>
                    <Switch
                      checked={settings.security.sessionSecure}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: { ...settings.security, sessionSecure: checked }
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Rate Limiting</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Rate Limiting</Label>
                      <p className="text-sm text-slate-600">Limit request frequency</p>
                    </div>
                    <Switch
                      checked={settings.security.rateLimiting}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: { ...settings.security, rateLimiting: checked }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rateLimitRequests">Max Requests</Label>
                    <Input
                      id="rateLimitRequests"
                      type="number"
                      value={settings.security.rateLimitRequests}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, rateLimitRequests: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rateLimitWindow">Window (minutes)</Label>
                    <Input
                      id="rateLimitWindow"
                      type="number"
                      value={settings.security.rateLimitWindow}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, rateLimitWindow: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('security')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">SMTP Settings</h3>
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={settings.email.smtpHost}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpHost: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpPort: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={settings.email.smtpUser}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpUser: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <div className="relative">
                      <Input
                        id="smtpPassword"
                        type={showSmtpPassword ? "text" : "password"}
                        value={settings.email.smtpPassword}
                        onChange={(e) => setSettings({
                          ...settings,
                          email: { ...settings.email, smtpPassword: e.target.value }
                        })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      >
                        {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Settings</h3>
                  <div>
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, fromEmail: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={settings.email.fromName}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, fromName: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="replyTo">Reply-To Email</Label>
                    <Input
                      id="replyTo"
                      type="email"
                      value={settings.email.replyTo}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, replyTo: e.target.value }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Use Secure SMTP</Label>
                      <p className="text-sm text-slate-600">Use SSL/TLS</p>
                    </div>
                    <Switch
                      checked={settings.email.smtpSecure}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpSecure: checked }
                      })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('email')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Channels</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-slate-600">Send email alerts</p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, emailNotifications: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-slate-600">Browser push notifications</p>
                    </div>
                    <Switch
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, pushNotifications: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-slate-600">Text message alerts</p>
                    </div>
                    <Switch
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, smsNotifications: checked }
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Alert Types</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New User Notifications</Label>
                      <p className="text-sm text-slate-600">Alert on new user registration</p>
                    </div>
                    <Switch
                      checked={settings.notifications.newUserNotification}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, newUserNotification: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Login Alerts</Label>
                      <p className="text-sm text-slate-600">Alert on suspicious logins</p>
                    </div>
                    <Switch
                      checked={settings.notifications.loginAlerts}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, loginAlerts: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>System Alerts</Label>
                      <p className="text-sm text-slate-600">System health and errors</p>
                    </div>
                    <Switch
                      checked={settings.notifications.systemAlerts}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, systemAlerts: checked }
                      })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('notifications')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup Settings</CardTitle>
              <CardDescription>Configure automated backups and data retention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Backup Configuration</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Backup</Label>
                      <p className="text-sm text-slate-600">Enable automatic backups</p>
                    </div>
                    <Switch
                      checked={settings.backup.autoBackup}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, autoBackup: checked }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select value={settings.backup.backupFrequency} onValueChange={(value) => setSettings({
                      ...settings,
                      backup: { ...settings.backup, backupFrequency: value }
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="backupRetention">Retention Period (days)</Label>
                    <Input
                      id="backupRetention"
                      type="number"
                      value={settings.backup.backupRetention}
                      onChange={(e) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, backupRetention: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Backup Options</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Encryption</Label>
                      <p className="text-sm text-slate-600">Encrypt backup files</p>
                    </div>
                    <Switch
                      checked={settings.backup.encryptionEnabled}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, encryptionEnabled: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Include User Data</Label>
                      <p className="text-sm text-slate-600">Backup user information</p>
                    </div>
                    <Switch
                      checked={settings.backup.includeUserData}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, includeUserData: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Include System Data</Label>
                      <p className="text-sm text-slate-600">Backup system configuration</p>
                    </div>
                    <Switch
                      checked={settings.backup.includeSystemData}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, includeSystemData: checked }
                      })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('backup')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}