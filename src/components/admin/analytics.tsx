'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Download,
  RefreshCw,
  Calendar,
  PieChart,
  LineChart
} from 'lucide-react'

interface AnalyticsData {
  type: string
  timeframe: string
  data: any
  generatedAt: string
}

export default function AnalyticsTab() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('month')
  const [chartType, setChartType] = useState('users')

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe, chartType])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?timeframe=${timeframe}&type=${chartType}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/export?timeframe=${timeframe}&type=${chartType}`)
      if (!response.ok) throw new Error('Failed to export data')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${chartType}-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
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
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Reports</h2>
          <p className="text-slate-600">View detailed analytics and generate reports</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24h</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Type Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Analytics Type:</span>
        <div className="flex gap-2">
          {['users', 'revenue', 'activity', 'performance'].map((type) => (
            <Button
              key={type}
              variant={chartType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Analytics Content */}
      {analyticsData && (
        <div className="space-y-6">
          {chartType === 'users' && <UserAnalytics data={analyticsData.data} />}
          {chartType === 'revenue' && <RevenueAnalytics data={analyticsData.data} />}
          {chartType === 'activity' && <ActivityAnalytics data={analyticsData.data} />}
          {chartType === 'performance' && <PerformanceAnalytics data={analyticsData.data} />}
        </div>
      )}

      {/* Last Updated */}
      {analyticsData && (
        <div className="text-center text-sm text-slate-500">
          Last updated: {new Date(analyticsData.generatedAt).toLocaleString()}
        </div>
      )}
    </div>
  )
}

function UserAnalytics({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>New users over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border border-dashed border-slate-300 rounded">
            <div className="text-center">
              <LineChart className="h-12 w-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">User growth chart</p>
              <p className="text-sm text-slate-500">
                {data.userGrowth?.length || 0} data points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Distribution</CardTitle>
          <CardDescription>Users by role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.roleDistribution?.map((role: any) => (
              <div key={role.role} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    role.role === 'ADMIN' ? 'bg-red-500' :
                    role.role === 'MANAGER' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <span className="font-medium">{role.role}</span>
                </div>
                <Badge variant="secondary">{role._count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Users</CardTitle>
          <CardDescription>User activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border border-dashed border-slate-300 rounded">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Active users chart</p>
              <p className="text-sm text-slate-500">
                {data.activeUsers?.length || 0} data points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
          <CardDescription>Key user metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span className="font-medium">
                {data.userGrowth?.reduce((sum: number, item: any) => sum + item.newUsers, 0) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>New Users (Period):</span>
              <span className="font-medium">
                {data.userGrowth?.reduce((sum: number, item: any) => sum + item.newUsers, 0) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Growth Rate:</span>
              <span className="font-medium text-green-600">+12%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RevenueAnalytics({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Revenue metrics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Current MRR:</span>
              <span className="font-medium text-green-600">
                ${data.metrics?.currentMRR?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Current ARR:</span>
              <span className="font-medium text-green-600">
                ${data.metrics?.currentARR?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Revenue/User:</span>
              <span className="font-medium">
                ${data.metrics?.averageRevenuePerUser || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Active Users:</span>
              <span className="font-medium">
                {data.metrics?.activeUsers || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border border-dashed border-slate-300 rounded">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Revenue trend chart</p>
              <p className="text-sm text-slate-500">
                {data.revenueOverTime?.length || 0} data points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ActivityAnalytics({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Volume</CardTitle>
          <CardDescription>System activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border border-dashed border-slate-300 rounded">
            <div className="text-center">
              <Activity className="h-12 w-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Activity volume chart</p>
              <p className="text-sm text-slate-500">
                {data.activityVolume?.length || 0} data points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Activities</CardTitle>
          <CardDescription>Most common actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topActivities?.slice(0, 5).map((activity: any) => (
              <div key={activity.action} className="flex items-center justify-between">
                <span className="text-sm truncate">{activity.action}</span>
                <Badge variant="secondary">{activity._count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Active Users</CardTitle>
          <CardDescription>Users with most activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.mostActiveUsers?.slice(0, 5).map((user: any) => (
              <div key={user.userId} className="flex items-center justify-between">
                <span className="text-sm">
                  {user.userDetails?.name || user.userDetails?.email || 'Unknown'}
                </span>
                <Badge variant="secondary">{user._count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PerformanceAnalytics({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>System performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span className="font-medium">{data.overview?.totalUsers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Users:</span>
              <span className="font-medium">{data.overview?.activeUsers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Activities:</span>
              <span className="font-medium">{data.overview?.totalActivities || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Error Rate:</span>
              <span className="font-medium text-red-600">
                {data.overview?.errorRate?.toFixed(2) || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Engagement Rate:</span>
              <span className="font-medium text-green-600">
                {data.overview?.engagementRate?.toFixed(2) || 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Usage</CardTitle>
          <CardDescription>Most used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.featureUsage?.slice(0, 5).map((feature: any) => (
              <div key={feature.action} className="flex items-center justify-between">
                <span className="text-sm truncate">{feature.action}</span>
                <Badge variant="secondary">{feature._count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}