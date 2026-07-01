'use client'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, FileText, Plus, Calendar, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

/** Thin inner component that reads search params — must be inside <Suspense> in Next.js 15 */
function SearchParamsReader({ onActionNew }: { onActionNew: () => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      onActionNew()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
  return null
}

interface Interaction {
  id: string
  type: string
  title: string
  description?: string
  duration?: number
  createdAt: string
  metadata?: any
}

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    duration: 30,
    scheduledFor: ''
  })
  const [submitting, setSubmitting] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    fetchInteractions()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchInteractions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/interactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setInteractions(data.interactions || [])
      }
    } catch (error) {
      console.error('Error fetching interactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setInteractions([data.interaction, ...interactions])
        setShowCreateModal(false)
        setFormData({
          type: '',
          title: '',
          description: '',
          duration: 30,
          scheduledFor: ''
        })
        
        // Trigger storage event for cross-tab updates
        localStorage.setItem('interaction_created', Date.now().toString())
        localStorage.removeItem('interaction_created')
        
        // Remove the action parameter from URL
        router.replace('/interactions')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create interaction')
      }
    } catch (error) {
      console.error('Error creating interaction:', error)
      alert('Failed to create interaction')
    } finally {
      setSubmitting(false)
    }
  }

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />
      case 'email': return <Mail className="w-4 h-4" />
      case 'meeting': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-600'
      case 'email': return 'bg-green-100 text-green-600'
      case 'meeting': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* SearchParamsReader must live inside Suspense — Next.js 15 requirement */}
      <Suspense fallback={null}>
        <SearchParamsReader onActionNew={() => setShowCreateModal(true)} />
      </Suspense>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/client/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Interactions</h1>
              <p className="text-slate-600">Manage your client interactions and communications</p>
            </div>
          </div>
          
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Interaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Interaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter interaction title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter interaction details"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      min="1"
                      max="480"
                    />
                  </div>

                  {(formData.type === 'call' || formData.type === 'meeting') && (
                    <div>
                      <Label htmlFor="scheduledFor">Scheduled For</Label>
                      <Input
                        id="scheduledFor"
                        type="datetime-local"
                        value={formData.scheduledFor}
                        onChange={(e) => setFormData({...formData, scheduledFor: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting || !formData.type || !formData.title}>
                    {submitting ? 'Creating...' : 'Create Interaction'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{interactions.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Calls</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {interactions.filter(i => i.type === 'call').length}
                  </p>
                </div>
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Emails</p>
                  <p className="text-2xl font-bold text-green-600">
                    {interactions.filter(i => i.type === 'email').length}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Meetings</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {interactions.filter(i => i.type === 'meeting').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-3 bg-slate-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : interactions.length > 0 ? (
              <div className="space-y-4">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getInteractionColor(interaction.type)}`}>
                      {getInteractionIcon(interaction.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{interaction.title}</p>
                        <Badge variant="secondary" className="text-xs">
                          {interaction.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{interaction.description}</p>
                      {interaction.duration && (
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-400">{interaction.duration} minutes</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-slate-500">
                        {new Date(interaction.createdAt).toLocaleDateString()}
                      </span>
                      <div className="text-xs text-slate-400">
                        {new Date(interaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No interactions yet</h3>
                <p className="text-slate-600 mb-4">Start tracking your client interactions</p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Interaction
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}