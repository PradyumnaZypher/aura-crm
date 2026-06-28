'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Building, 
  Shield, 
  Crown, 
  Briefcase, 
  Zap,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface QuickAddUserProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface UserTemplate {
  id: string
  name: string
  description: string
  role: 'ADMIN' | 'MANAGER' | 'CLIENT'
  icon: React.ReactNode
  color: string
  defaults: {
    sendWelcomeEmail: boolean
    requirePasswordChange: boolean
    isActive: boolean
  }
}

const userTemplates: UserTemplate[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    role: 'ADMIN',
    icon: <Crown className="h-4 w-4" />,
    color: 'bg-red-100 text-red-800 border-red-200',
    defaults: {
      sendWelcomeEmail: true,
      requirePasswordChange: true,
      isActive: true
    }
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Team management access',
    role: 'MANAGER',
    icon: <Briefcase className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    defaults: {
      sendWelcomeEmail: true,
      requirePasswordChange: false,
      isActive: true
    }
  },
  {
    id: 'client',
    name: 'Client',
    description: 'Basic user access',
    role: 'CLIENT',
    icon: <User className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 border-green-200',
    defaults: {
      sendWelcomeEmail: true,
      requirePasswordChange: false,
      isActive: true
    }
  }
]

export default function QuickAddUser({ open, onOpenChange, onSuccess }: QuickAddUserProps) {
  const { toast } = useToast()
  const [selectedTemplate, setSelectedTemplate] = useState<UserTemplate | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createdUser, setCreatedUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    company: '',
    role: 'CLIENT' as 'ADMIN' | 'MANAGER' | 'CLIENT',
    sendWelcomeEmail: true,
    requirePasswordChange: false,
    isActive: true
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, password })
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

    if (!formData.firstName && !formData.lastName) {
      errors.name = 'At least first name or last name is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleTemplateSelect = (template: UserTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      ...formData,
      role: template.role,
      sendWelcomeEmail: template.defaults.sendWelcomeEmail,
      requirePasswordChange: template.defaults.requirePasswordChange,
      isActive: template.defaults.isActive
    })
  }

  const handleCreateUser = async () => {
    if (!validateForm()) return

    try {
      setIsCreating(true)
      setError(null)

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
          company: formData.company,
          sendWelcomeEmail: formData.sendWelcomeEmail,
          requirePasswordChange: formData.requirePasswordChange,
          isActive: formData.isActive
        })
      })

      const responseData = await response.json()

      if (!response.ok) {
        if (responseData.details) {
          if (Array.isArray(responseData.details)) {
            // Validation errors
            const errorMessages = responseData.details.map((err: any) => 
              `${err.field}: ${err.message}`
            ).join(', ')
            throw new Error(errorMessages)
          } else {
            // Single error message
            throw new Error(responseData.details)
          }
        } else {
          throw new Error(responseData.error || 'Failed to create user')
        }
      }

      const newUser = responseData
      setCreatedUser(newUser)
      
      // Show success toast
      toast({
        title: 'User Created Successfully!',
        description: `${newUser.email} has been added as a ${newUser.role}`,
      })
      
      // Reset form after successful creation
      setTimeout(() => {
        resetForm()
        setCreatedUser(null)
        onOpenChange(false)
        onSuccess?.()
      }, 2000)

    } catch (error) {
      console.error('Error creating user:', error)
      setError(error.message || 'Failed to create user')
      
      // Show error toast
      toast({
        variant: "destructive",
        title: 'Failed to Create User',
        description: error.message || 'An unexpected error occurred'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      company: '',
      role: 'CLIENT',
      sendWelcomeEmail: true,
      requirePasswordChange: false,
      isActive: true
    })
    setSelectedTemplate(null)
    setFormErrors({})
    setError(null)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200'
      case 'MANAGER': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CLIENT': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Quick Add User
          </DialogTitle>
          <DialogDescription>
            Quickly create a new user account with essential information
          </DialogDescription>
        </DialogHeader>

        {createdUser ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">User Created Successfully!</h3>
            <p className="text-slate-600 mb-1">{createdUser.email}</p>
            <Badge className={getRoleBadgeColor(createdUser.role)}>
              {createdUser.role}
            </Badge>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Template Selection */}
            <div>
              <Label className="text-sm font-medium mb-3 block">User Type</Label>
              <div className="grid grid-cols-3 gap-3">
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
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">{template.icon}</div>
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-slate-600 mt-1">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    className={`pl-10 ${formErrors.email ? 'border-red-500' : ''}`}
                  />
                </div>
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

              {formErrors.name && (
                <div className="col-span-2">
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter secure password"
                  className={`pl-10 pr-20 ${formErrors.password ? 'border-red-500' : ''}`}
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

            {/* Additional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company name"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Client</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Send Welcome Email</Label>
                  <p className="text-sm text-slate-600">Send account details to user</p>
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

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!createdUser && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}