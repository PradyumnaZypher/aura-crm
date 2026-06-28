'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Key,
  Mail,
  Shield,
  UserCheck,
  UserX,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Building,
  Phone,
  MapPin,
  UserPlus,
  Users2,
  Crown,
  Briefcase,
  User,
  Zap,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'MANAGER' | 'CLIENT'
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
  profile: {
    firstName: string | null
    lastName: string | null
    phone: string | null
    company: string | null
    department: string | null
    position: string | null
    avatar: string | null
    bio: string | null
    address: string | null
    city: string | null
    country: string | null
  } | null
  _count: {
    sessions: number
    activities: number
  }
}

interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface UserTemplate {
  id: string
  name: string
  description: string
  role: 'ADMIN' | 'MANAGER' | 'CLIENT'
  permissions: string[]
  defaultSettings: {
    sendWelcomeEmail: boolean
    requirePasswordChange: boolean
    isActive: boolean
  }
}

const userTemplates: UserTemplate[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access and user management',
    role: 'ADMIN',
    permissions: ['*'],
    defaultSettings: {
      sendWelcomeEmail: true,
      requirePasswordChange: true,
      isActive: true
    }
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Team management and reporting access',
    role: 'MANAGER',
    permissions: ['team_management', 'reports', 'client_management'],
    defaultSettings: {
      sendWelcomeEmail: true,
      requirePasswordChange: false,
      isActive: true
    }
  },
  {
    id: 'client',
    name: 'Client',
    description: 'Basic client access to personal dashboard',
    role: 'CLIENT',
    permissions: ['dashboard', 'profile'],
    defaultSettings: {
      sendWelcomeEmail: true,
      requirePasswordChange: false,
      isActive: true
    }
  },
  {
    id: 'sales',
    name: 'Sales Representative',
    description: 'Sales focused client management',
    role: 'CLIENT',
    permissions: ['dashboard', 'profile', 'lead_management'],
    defaultSettings: {
      sendWelcomeEmail: true,
      requirePasswordChange: false,
      isActive: true
    }
  },
  {
    id: 'support',
    name: 'Support Agent',
    description: 'Customer support and ticket management',
    role: 'CLIENT',
    permissions: ['dashboard', 'profile', 'support_tickets'],
    defaultSettings: {
      sendWelcomeEmail: true,
      requirePasswordChange: false,
      isActive: true
    }
  }
]

export default function EnhancedUserManagementTab() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // Enhanced dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [bulkCreateDialogOpen, setBulkCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<UserTemplate | null>(null)

  // Enhanced form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    department: '',
    position: '',
    role: 'CLIENT' as 'ADMIN' | 'MANAGER' | 'CLIENT',
    bio: '',
    address: '',
    city: '',
    country: '',
    avatar: '',
    sendWelcomeEmail: true,
    requirePasswordChange: false,
    isActive: true
  })

  // UI states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [bulkUserCsv, setBulkUserCsv] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { isActive: statusFilter })
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')
      
      const data: UsersResponse = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.firstName && !formData.lastName) {
      errors.name = 'At least first name or last name is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateUser = async () => {
    console.log('handleCreateUser called', formData)
    if (!validateForm()) {
      console.log('Form validation failed', formErrors)
      return
    }

    try {
      setIsCreating(true)
      console.log('Sending user creation request...')
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          role: formData.role,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          company: formData.company,
          department: formData.department,
          position: formData.position,
          sendWelcomeEmail: formData.sendWelcomeEmail,
          requirePasswordChange: formData.requirePasswordChange,
          isActive: formData.isActive
        })
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const error = await response.json()
        console.error('API Error:', error)
        throw new Error(error.error || 'Failed to create user')
      }

      const newUser = await response.json()
      console.log('User created successfully:', newUser)
      setCreateDialogOpen(false)
      resetForm()
      fetchUsers()
      
      // Show success message
      alert(`User ${newUser.email} created successfully!`)
    } catch (error) {
      console.error('Error creating user:', error)
      alert(error.message || 'Failed to create user')
    } finally {
      setIsCreating(false)
    }
  }

  const handleBulkCreateUsers = async () => {
    if (!bulkUserCsv.trim()) {
      alert('Please enter CSV data')
      return
    }

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
      setBulkCreateDialogOpen(false)
      setBulkUserCsv('')
      fetchUsers()
      
      alert(`Bulk creation completed: ${data.created} users created, ${data.failed} failed`)
    } catch (error) {
      console.error('Error creating users:', error)
      alert(error.message || 'Failed to create users')
    }
  }

  const handleTemplateSelect = (template: UserTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      ...formData,
      role: template.role,
      sendWelcomeEmail: template.defaultSettings.sendWelcomeEmail,
      requirePasswordChange: template.defaultSettings.requirePasswordChange,
      isActive: template.defaultSettings.isActive
    })
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, password, confirmPassword: password })
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      company: '',
      department: '',
      position: '',
      role: 'CLIENT',
      bio: '',
      address: '',
      city: '',
      country: '',
      avatar: '',
      sendWelcomeEmail: true,
      requirePasswordChange: false,
      isActive: true
    })
    setSelectedTemplate(null)
    setFormErrors({})
  }

  const toggleRowExpansion = (userId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedRows(newExpanded)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200'
      case 'MANAGER': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CLIENT': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Crown className="h-3 w-3" />
      case 'MANAGER': return <Briefcase className="h-3 w-3" />
      case 'CLIENT': return <User className="h-3 w-3" />
      default: return <User className="h-3 w-3" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-slate-600">Manage system users, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={bulkCreateDialogOpen} onOpenChange={setBulkCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Import Users</DialogTitle>
                <DialogDescription>
                  Import multiple users from CSV data. Format: email,firstName,lastName,role,company,department,position,phone
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="bulkUserCsv">CSV Data</Label>
                <Textarea
                  id="bulkUserCsv"
                  value={bulkUserCsv}
                  onChange={(e) => setBulkUserCsv(e.target.value)}
                  placeholder="john@example.com,John,Doe,CLIENT,Acme Corp,Sales,Manager,+15551234567&#10;jane@example.com,Jane,Smith,MANAGER,Tech Inc,Engineering,Lead,+15559876543"
                  className="min-h-32 font-mono text-sm"
                />
                <p className="text-sm text-slate-600 mt-2">
                  Each line should contain user data in the specified order. Role can be CLIENT, MANAGER, or ADMIN.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBulkCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkCreateUsers}>Import Users</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                onClick={() => {
                  console.log('Add User button clicked')
                  setCreateDialogOpen(true)
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system with enhanced configuration options
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="template" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="template">Quick Start</TabsTrigger>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="template" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userTemplates.map((template) => (
                      <Card 
                        key={template.id} 
                        className={`cursor-pointer transition-all ${
                          selectedTemplate?.id === template.id 
                            ? 'ring-2 ring-blue-500 bg-blue-50' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(template.role)}
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                          </div>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <Badge className={getRoleBadgeColor(template.role)}>
                              {template.role}
                            </Badge>
                            <div className="text-xs text-slate-600">
                              <div>• Welcome Email: {template.defaultSettings.sendWelcomeEmail ? 'Yes' : 'No'}</div>
                              <div>• Password Change: {template.defaultSettings.requirePasswordChange ? 'Required' : 'Optional'}</div>
                              <div>• Active: {template.defaultSettings.isActive ? 'Yes' : 'No'}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="user@example.com"
                        className={formErrors.email ? 'border-red-500' : ''}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="John"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Doe"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Enter secure password"
                          className={formErrors.password ? 'border-red-500 pr-20' : 'pr-20'}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-10 top-0 h-full px-3 hover:bg-transparent"
                          onClick={generatePassword}
                        >
                          <Zap className="h-4 w-4" />
                        </Button>
                      </div>
                      {formErrors.password && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Confirm password"
                          className={formErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CLIENT">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Client
                            </div>
                          </SelectItem>
                          <SelectItem value="MANAGER">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              Manager
                            </div>
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4" />
                              Administrator
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Acme Corporation"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Sales"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="Sales Manager"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Brief description about the user..."
                        className="min-h-20"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Main St"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="New York"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="United States"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="avatar">Avatar URL</Label>
                      <Input
                        id="avatar"
                        value={formData.avatar}
                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Account Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Send Welcome Email</Label>
                          <p className="text-sm text-slate-600">Send a welcome email to the new user</p>
                        </div>
                        <Switch
                          checked={formData.sendWelcomeEmail}
                          onCheckedChange={(checked) => setFormData({ ...formData, sendWelcomeEmail: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Require Password Change</Label>
                          <p className="text-sm text-slate-600">User must change password on first login</p>
                        </div>
                        <Switch
                          checked={formData.requirePasswordChange}
                          onCheckedChange={(checked) => setFormData({ ...formData, requirePasswordChange: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Active Status</Label>
                          <p className="text-sm text-slate-600">User can login immediately</p>
                        </div>
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateUser} 
                  disabled={isCreating}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users by name, email, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Admin
                  </div>
                </SelectItem>
                <SelectItem value="MANAGER">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Manager
                  </div>
                </SelectItem>
                <SelectItem value="CLIENT">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="true">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Active
                  </div>
                </SelectItem>
                <SelectItem value="false">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-red-600" />
                    Inactive
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => fetchUsers()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <React.Fragment key={user.id}>
                  <TableRow className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profile?.avatar || `https://ui-avatars.com/api/?name=${user.profile?.firstName}+${user.profile?.lastName}&background=random`} />
                          <AvatarFallback>
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-900">
                            {user.name || `${user.profile?.firstName} ${user.profile?.lastName}` || 'Unknown'}
                          </div>
                          <div className="text-sm text-slate-600">{user.email}</div>
                          {user.profile?.company && (
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {user.profile.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.isActive ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">Active</span>
                          </>
                        ) : (
                          <>
                            <UserX className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-700">Inactive</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.profile?.phone && (
                          <div className="text-sm text-slate-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.profile.phone}
                          </div>
                        )}
                        {user.profile?.department && (
                          <div className="text-xs text-slate-500">
                            {user.profile.department}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.lastLoginAt ? (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Clock className="h-3 w-3" />
                            {new Date(user.lastLoginAt).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-slate-400">Never</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Sessions:</span>
                          <Badge variant="outline" className="text-xs">
                            {user._count.sessions}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Activities:</span>
                          <Badge variant="outline" className="text-xs">
                            {user._count.activities}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(user.id)}
                        >
                          {expandedRows.has(user.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {expandedRows.has(user.id) && (
                    <TableRow className="bg-slate-50">
                      <TableCell colSpan={7} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium mb-2">Profile Information</h4>
                            <div className="space-y-1">
                              {user.profile?.firstName && (
                                <div><span className="text-slate-600">First Name:</span> {user.profile.firstName}</div>
                              )}
                              {user.profile?.lastName && (
                                <div><span className="text-slate-600">Last Name:</span> {user.profile.lastName}</div>
                              )}
                              {user.profile?.position && (
                                <div><span className="text-slate-600">Position:</span> {user.profile.position}</div>
                              )}
                              {user.profile?.bio && (
                                <div><span className="text-slate-600">Bio:</span> {user.profile.bio}</div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Location</h4>
                            <div className="space-y-1">
                              {user.profile?.address && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {user.profile.address}
                                </div>
                              )}
                              {user.profile?.city && (
                                <div><span className="text-slate-600">City:</span> {user.profile.city}</div>
                              )}
                              {user.profile?.country && (
                                <div><span className="text-slate-600">Country:</span> {user.profile.country}</div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Account Details</h4>
                            <div className="space-y-1">
                              <div><span className="text-slate-600">User ID:</span> 
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 ml-1"
                                  onClick={() => copyToClipboard(user.id)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <div><span className="text-slate-600">Created:</span> {new Date(user.createdAt).toLocaleDateString()}</div>
                              <div><span className="text-slate-600">Status:</span> 
                                <Badge className={user.isActive ? 'bg-green-100 text-green-800 ml-1' : 'bg-red-100 text-red-800 ml-1'}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Enhanced Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} users
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8"
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}