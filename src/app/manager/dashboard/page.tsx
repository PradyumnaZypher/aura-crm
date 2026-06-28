'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { 
  Users, 
  TrendingUp, 
  Target, 
  Phone, 
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  FileText,
  DollarSign,
  Activity
} from 'lucide-react'

interface DashboardStats {
  teamMembers: number
  activeLeads: number
  conversionRate: number
  monthlyRevenue: number
  teamPerformance: any[]
  recentLeads: any[]
  campaigns: any[]
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    teamMembers: 0,
    activeLeads: 0,
    conversionRate: 0,
    monthlyRevenue: 0,
    teamPerformance: [],
    recentLeads: [],
    campaigns: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setStats({
            teamMembers: 12,
            activeLeads: 48,
            conversionRate: 24.5,
            monthlyRevenue: 32500,
            teamPerformance: [
              { id: 1, name: 'John Doe', role: 'Sales Rep', leads: 12, conversions: 3, rate: 25 },
              { id: 2, name: 'Jane Smith', role: 'Sales Rep', leads: 15, conversions: 5, rate: 33.3 },
              { id: 3, name: 'Mike Johnson', role: 'Sales Rep', leads: 8, conversions: 2, rate: 25 },
              { id: 4, name: 'Sarah Wilson', role: 'Sales Rep', leads: 10, conversions: 1, rate: 10 },
              { id: 5, name: 'Tom Brown', role: 'Sales Rep', leads: 14, conversions: 4, rate: 28.6 }
            ],
            recentLeads: [
              { id: 1, name: 'Acme Corp', status: 'Qualified', value: 15000, assignedTo: 'John Doe', lastContact: '2 hours ago' },
              { id: 2, name: 'Tech Solutions', status: 'Contacted', value: 8000, assignedTo: 'Jane Smith', lastContact: '4 hours ago' },
              { id: 3, name: 'Global Industries', status: 'New', value: 25000, assignedTo: 'Mike Johnson', lastContact: '1 day ago' },
              { id: 4, name: 'StartUp Inc', status: 'Proposal', value: 12000, assignedTo: 'Sarah Wilson', lastContact: '3 days ago' },
              { id: 5, name: 'Enterprise Co', status: 'Negotiation', value: 50000, assignedTo: 'Tom Brown', lastContact: '5 days ago' }
            ],
            campaigns: [
              { id: 1, name: 'Q1 Outreach', status: 'Active', leads: 45, conversions: 12, startDate: '2024-01-01' },
              { id: 2, name: 'Tech Summit', status: 'Active', leads: 32, conversions: 8, startDate: '2024-01-15' },
              { id: 3, name: 'Holiday Special', status: 'Completed', leads: 28, conversions: 7, startDate: '2023-12-01' }
            ]
          })
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Qualified': return 'bg-green-100 text-green-800'
      case 'Contacted': return 'bg-blue-100 text-blue-800'
      case 'New': return 'bg-gray-100 text-gray-800'
      case 'Proposal': return 'bg-yellow-100 text-yellow-800'
      case 'Negotiation': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout userRole="manager">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Manager Dashboard</h1>
              <p className="text-slate-600">Team performance and lead management</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>MN</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Manager User</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.teamMembers}</div>
              <p className="text-xs text-slate-600">
                <span className="text-green-600">+2</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLeads}</div>
              <p className="text-xs text-slate-600">
                <span className="text-green-600">+15%</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-slate-600">
                <span className="text-green-600">+3.2%</span> improvement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-slate-600">
                <span className="text-green-600">+18%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                  <CardDescription>Top performers this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.teamPerformance.slice(0, 5).map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-slate-600">{member.leads} leads</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{member.conversions}/{member.leads}</p>
                          <p className="text-xs text-slate-600">{member.rate}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Leads */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Leads</CardTitle>
                  <CardDescription>Latest lead updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentLeads.slice(0, 5).map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{lead.name}</p>
                          <p className="text-xs text-slate-600">{lead.assignedTo} • {lead.lastContact}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                          <p className="text-xs text-slate-600 mt-1">${lead.value.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <UserPlus className="h-6 w-6" />
                    <span className="text-sm">Add Team Member</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <Target className="h-6 w-6" />
                    <span className="text-sm">Assign Lead</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">New Campaign</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">View Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Manage your team members and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.teamPerformance.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-slate-600">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-lg font-semibold">{member.leads}</p>
                          <p className="text-xs text-slate-600">Leads</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold">{member.conversions}</p>
                          <p className="text-xs text-slate-600">Conversions</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold">{member.rate}%</p>
                          <p className="text-xs text-slate-600">Rate</p>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Pipeline</CardTitle>
                <CardDescription>Manage and track all leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{lead.name}</h3>
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          Assigned to {lead.assignedTo} • Last contact {lead.lastContact}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold">${lead.value.toLocaleString()}</p>
                          <p className="text-xs text-slate-600">Value</p>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Management</CardTitle>
                <CardDescription>Manage your marketing campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{campaign.name}</h3>
                          <Badge variant={campaign.status === 'Active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          Started {campaign.startDate} • {campaign.conversions}/{campaign.leads} conversions
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            {campaign.leads > 0 ? Math.round((campaign.conversions / campaign.leads) * 100) : 0}%
                          </p>
                          <p className="text-xs text-slate-600">Conversion Rate</p>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}