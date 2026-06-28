'use client'
import VapiCallButton from '@/components/VapiCallButton' // This import is already correct
// import AIChatButton from '@/components/AIChatButton'; // 1. Import
import AIChatTrigger from '@/components/AIChatTrigger';
import ExternalChatTrigger from '@/components/ExternalChatTrigger';
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardLayout from '@/components/layout/dashboard-layout'
import EnhancedUserManagementTab from '@/components/admin/enhanced-user-management'
import SystemManagementTab from '@/components/admin/system-management'
import AnalyticsTab from '@/components/admin/analytics'
import SettingsManagementTab from '@/components/admin/settings-management'
import DashboardDatabaseTab from '@/components/admin/dashboard-database'
import DashboardPerformanceTab from '@/components/admin/dashboard-performance'
import QuickAddUser from '@/components/admin/quick-add-user'
import FloatingAddUserButton from '@/components/admin/floating-add-user-button'
import {
  Users,
  Activity,
  DollarSign,
  Server,
  RefreshCw,
  Zap,
  Database,
  Settings,
  Shield,
  UserPlus,
} from 'lucide-react'
import OutboundCallButton from '@/components/OutboundCallButton' // ----- NEW IMPORT ADDED -----

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  systemHealth: number
  recentActivity: Array<{
    id: string
    user: string
    action: string
    time: string
    status: 'success' | 'error' | 'warning'
  }>
  systemMetrics: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    uptime: string
  }
  timeframe: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    systemHealth: 0,
    recentActivity: [],
    systemMetrics: {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      uptime: '0d 0h 0m',
    },
    timeframe: 'month',
  })
  const [databaseStats, setDatabaseStats] = useState<any>(null)
  const [performanceStats, setPerformanceStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeframe, setTimeframe] = useState('month')
  const [activeTab, setActiveTab] = useState('overview')
  const [quickAddUserOpen, setQuickAddUserOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [timeframe])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [dashboardResponse, databaseResponse, performanceResponse] = await Promise.all([
        fetch(`/api/admin/dashboard/stats?timeframe=${timeframe}`),
        fetch('/api/admin/database/stats'),
        fetch('/api/admin/performance/metrics'),
      ])

      if (!dashboardResponse.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await dashboardResponse.json()
      setStats(data)

      if (databaseResponse.ok) {
        const dbData = await databaseResponse.json()
        setDatabaseStats(dbData)
      }

      if (performanceResponse.ok) {
        const perfData = await performanceResponse.json()
        setPerformanceStats(perfData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserCreated = () => {
    fetchDashboardData()
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDashboardData()
    setIsRefreshing(false)
  }

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'addUser':
          setQuickAddUserOpen(true)
          break
        case 'security':
          window.location.href = '/admin/security'
          break
        case 'database':
          setActiveTab('database')
          break
        case 'performance':
          setActiveTab('performance')
          break
        default:
          console.log('Unknown action:', action)
      }
    } catch (error) {
      console.error('Error handling quick action:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600">System overview and management</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-1 border border-slate-300 rounded-md text-sm"
              >
                <option value="day">Last 24 hours</option>
                <option value="week">Last week</option>
                <option value="month">Last month</option>
                <option value="year">Last year</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                />{' '}
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTabChange('settings')}
              >
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Button>

              {/* ----- VAPI BUTTON ADDED HERE ----- */}
              <VapiCallButton />
              <AIChatTrigger />
              <ExternalChatTrigger />
              {/* <AIChatButton /> */}
              {/* ---------------------------------- */}

              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Admin User</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {/* Total Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-slate-600">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-slate-600">
                <span className="text-green-600">+8%</span> from last week
              </p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-slate-600">
                <span className="text-green-600">+23%</span> from last month
              </p>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Server className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.systemHealth}%</div>
              <Progress value={stats.systemHealth} className="mt-2" />
            </CardContent>
          </Card>

          {/* Database */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              <Database className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {databaseStats ? databaseStats.totalTables : 0}
              </div>
              <p className="text-xs text-slate-600">
                {databaseStats ? databaseStats.totalSize : '0 MB'} •{' '}
                <span
                  className={`ml-1 ${
                    databaseStats?.status === 'healthy'
                      ? 'text-green-600'
                      : databaseStats?.status === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {databaseStats?.status || 'Unknown'}
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Zap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performanceStats ? performanceStats.cpu.usage : 0}%
              </div>
              <p className="text-xs text-slate-600">
                CPU •{' '}
                <span
                  className={`ml-1 ${
                    performanceStats?.cpu.usage > 80
                      ? 'text-red-600'
                      : performanceStats?.cpu.usage > 60
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                >
                  {performanceStats?.cpu.usage > 80
                    ? 'High'
                    : performanceStats?.cpu.usage > 60
                    ? 'Medium'
                    : 'Good'}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system activities and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.status === 'success'
                              ? 'bg-green-500'
                              : activity.status === 'error'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                          }`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.user}</p>
                          <p className="text-xs text-slate-600">{activity.action}</p>
                        </div>
                        <span className="text-xs text-slate-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>System Metrics</CardTitle>
                  <CardDescription>Real-time system performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">CPU Usage</span>
                        <span className="text-sm text-slate-600">
                          {stats.systemMetrics.cpuUsage}%
                        </span>
                      </div>
                      <Progress value={stats.systemMetrics.cpuUsage} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Memory Usage</span>
                        <span className="text-sm text-slate-600">
                          {stats.systemMetrics.memoryUsage}%
                        </span>
                      </div>
                      <Progress value={stats.systemMetrics.memoryUsage} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Disk Usage</span>
                        <span className="text-sm text-slate-600">
                          {stats.systemMetrics.diskUsage}%
                        </span>
                      </div>
                      <Progress value={stats.systemMetrics.diskUsage} />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium">Uptime</span>
                      <span className="text-sm text-slate-600">
                        {stats.systemMetrics.uptime}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Button
                    className="h-auto p-4 flex flex-col gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
                    onClick={() => setQuickAddUserOpen(true)}
                  >
                    <UserPlus className="h-6 w-6" />
                    <span className="text-sm font-medium">Add User</span>
                    <span className="text-xs opacity-90">Quick create</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => (window.location.href = '/admin/users')}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm">User Mgmt</span>
                    <span className="text-xs opacity-90">Full control</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => handleQuickAction('security')}
                  >
                    <Shield className="h-6 w-6" />
                    <span className="text-sm">Security</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => handleQuickAction('database')}
                  >
                    <Database className="h-6 w-6" />
                    <span className="text-sm">Database</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => handleQuickAction('performance')}
                  >
                    <Zap className="h-6 w-6" />
                    <span className="text-sm">Performance</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ----- OUTBOUND CALL COMPONENT ADDED HERE ----- */}
            <OutboundCallButton />
            {/* ------------------------------------------- */}

          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <EnhancedUserManagementTab />
          </TabsContent>
          <TabsContent value="database" className="space-y-6">
            <DashboardDatabaseTab />
          </TabsContent>
          <TabsContent value="performance" className="space-y-6">
            <DashboardPerformanceTab />
          </TabsContent>
          <TabsContent value="system" className="space-y-6">
            <SystemManagementTab />
          </TabsContent>
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab />
          </TabsContent>
          <TabsContent value="settings" className="space-y-6">
            <SettingsManagementTab />
          </TabsContent>
        </Tabs>
      </div>

      <QuickAddUser
        open={quickAddUserOpen}
        onOpenChange={setQuickAddUserOpen}
        onSuccess={handleUserCreated}
      />
      <FloatingAddUserButton onSuccess={handleUserCreated} />
    </DashboardLayout>
  )
}