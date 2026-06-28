'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  MessageSquare, 
  HelpCircle, 
  Settings, 
  Phone, 
  Mail, 
  Calendar,
  Activity,
  Bell,
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  X,
  Plus
} from 'lucide-react'

interface EnhancedNavbarProps {
  userName?: string
  userAvatar?: string
  onLogout?: () => void
}

export default function EnhancedNavbar({ userName, userAvatar, onLogout }: EnhancedNavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSupportOpen, setIsSupportOpen] = useState(false)
  const [isInteractionsOpen, setIsInteractionsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [interactions, setInteractions] = useState<any[]>([])
  const [supportTickets, setSupportTickets] = useState<any[]>([])

  useEffect(() => {
    fetchNavbarData()
  }, [])

  const fetchNavbarData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch interactions
      const interactionsResponse = await fetch('/api/interactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (interactionsResponse.ok) {
        const data = await interactionsResponse.json()
        setInteractions(data.interactions || [])
      }

      // Fetch support tickets
      const ticketsResponse = await fetch('/api/support-tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (ticketsResponse.ok) {
        const data = await ticketsResponse.json()
        setSupportTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Error fetching navbar data:', error)
    }
  }

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    company: 'Acme Corp',
    bio: 'Software developer passionate about AI',
    timezone: 'UTC',
    language: 'en',
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
    }
  })

  // Support ticket form state
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    tags: ''
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'activity': return Activity
      case 'call': return Phone
      case 'message': return MessageSquare
      default: return FileText
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setNotification({ type: 'success', message: 'Profile updated successfully!' })
      setIsProfileOpen(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to update profile' })
    } finally {
      setIsLoading(false)
    }
  }

  const createSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketForm.title.trim() || !ticketForm.description.trim()) {
      setNotification({ type: 'error', message: 'Please fill in all required fields' })
      return
    }
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setNotification({ type: 'success', message: 'Support ticket created successfully!' })
      setIsSupportOpen(false)
      setTicketForm({
        title: '',
        description: '',
        category: 'GENERAL',
        priority: 'MEDIUM',
        tags: ''
      })
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to create ticket' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-4">
        {/* Interactions Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsInteractionsOpen(true)}
          className="relative"
        >
          <Activity className="h-4 w-4 mr-2" />
          Interactions
          {interactions.length > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {interactions.length}
            </Badge>
          )}
        </Button>

        {/* Support Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSupportOpen(true)}
          className="relative"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Support
          {supportTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {supportTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length}
            </Badge>
          )}
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>
                  {userName?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>
              Manage your personal information and preferences
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={updateProfile} className="space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileForm.company}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={profileForm.timezone} onValueChange={(value) => setProfileForm(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={profileForm.language} onValueChange={(value) => setProfileForm(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
                  </div>
                  <Switch
                    checked={profileForm.notificationPreferences.email}
                    onCheckedChange={(checked) => setProfileForm(prev => ({
                      ...prev,
                      notificationPreferences: { ...prev.notificationPreferences, email: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive text messages for urgent updates</p>
                  </div>
                  <Switch
                    checked={profileForm.notificationPreferences.sms}
                    onCheckedChange={(checked) => setProfileForm(prev => ({
                      ...prev,
                      notificationPreferences: { ...prev.notificationPreferences, sms: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={profileForm.notificationPreferences.push}
                    onCheckedChange={(checked) => setProfileForm(prev => ({
                      ...prev,
                      notificationPreferences: { ...prev.notificationPreferences, push: checked }
                    }))}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsProfileOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Support Modal */}
      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Support Center</DialogTitle>
            <DialogDescription>
              Manage your support tickets and get help
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="tickets" className="w-full">
            <TabsList>
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="new">New Ticket</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tickets" className="space-y-4">
              <div className="space-y-3">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{ticket.title}</h4>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Ticket #{ticket.ticketNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {ticket._count?.replies > 0 && (
                          <Badge variant="outline">
                            {ticket._count.replies} replies
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="new" className="space-y-4">
              <form onSubmit={createSupportTicket} className="space-y-4">
                <div>
                  <Label htmlFor="title">Subject</Label>
                  <Input
                    id="title"
                    value={ticketForm.title}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={ticketForm.category} onValueChange={(value: any) => setTicketForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TECHNICAL">Technical</SelectItem>
                        <SelectItem value="BILLING">Billing</SelectItem>
                        <SelectItem value="ACCOUNT">Account</SelectItem>
                        <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                        <SelectItem value="GENERAL">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={ticketForm.priority} onValueChange={(value: any) => setTicketForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Please provide as much detail as possible"
                    rows={5}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (optional)</Label>
                  <Input
                    id="tags"
                    value={ticketForm.tags}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., urgent, login, payment"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsSupportOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Ticket'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Interactions Modal */}
      <Dialog open={isInteractionsOpen} onOpenChange={setIsInteractionsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle>Interaction History</DialogTitle>
                <DialogDescription>
                  Your recent activity and communications
                </DialogDescription>
              </div>
              <Button 
                onClick={() => {
                  setIsInteractionsOpen(false)
                  window.location.href = '/interactions?action=new'
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Interaction
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {interactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No interactions yet</h3>
                <p className="text-slate-600 mb-4">Start tracking your client interactions</p>
                <Button 
                  onClick={() => {
                    setIsInteractionsOpen(false)
                    window.location.href = '/interactions?action=new'
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Interaction
                </Button>
              </div>
            ) : (
              interactions.map((interaction) => {
                const Icon = getInteractionIcon(interaction.type)
                return (
                  <div key={interaction.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{interaction.title}</h4>
                        <Badge variant="outline" className="capitalize">
                          {interaction.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {interaction.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(interaction.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}