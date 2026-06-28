'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import EnhancedNavbar from '@/components/ui/enhanced-navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Phone, 
  MessageSquare, 
  Bot, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  Activity,
  Clock,
  Target,
  Zap,
  Users,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalCalls: number
    completedCalls: number
    successRate: number
    averageDuration: number
  }
  breakdowns: {
    sentiment: Record<string, number>
    purpose: Record<string, number>
  }
  dailyStats: Array<{
    date: string
    totalCalls: number
    completedCalls: number
    avgDuration: number
  }>
  recentCalls: Array<{
    id: string
    leadName: string
    company?: string
    purpose: string
    status: string
    duration?: number
    sentiment?: string
    createdAt: string
  }>
  timeframe: string
}

export default function ClientAnalytics() {
  const [userName, setUserName] = useState<string>('')
  const [userAvatar, setUserAvatar] = useState<string>('')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserName(user.name || user.profile?.firstName + ' ' + user.profile?.lastName || 'User')
      setUserAvatar(user.profile?.avatar || '')
    }
    
    fetchAnalytics()
  }, [timeframe])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/ai/calls/analytics?timeframe=${timeframe}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalytics()
  }

  const exportData = () => {
    if (!analyticsData) return
    
    const csvContent = [
      ['Date', 'Total Calls', 'Completed Calls', 'Success Rate', 'Avg Duration'],
      ...analyticsData.dailyStats.map(stat => [
        stat.date,
        stat.totalCalls.toString(),
        stat.completedCalls.toString(),
        `${((stat.completedCalls / stat.totalCalls) * 100).toFixed(1)}%`,
        `${stat.avgDuration}s`
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100'
      case 'negative': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="w-4 h-4 text-green-600" />
    if (current < previous) return <ArrowDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  if (loading) {
    return (
      <DashboardLayout userRole="client">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-100 rounded-lg p-6">
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="client">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AI Analytics Dashboard</h1>
              <p className="text-slate-600">Monitor your AI-powered interactions and performance</p>
            </div>
            <EnhancedNavbar 
              userName={userName}
              userAvatar={userAvatar}
              onLogout={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.href = '/login'
              }}
            />
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-600" />
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportData}
              disabled={!analyticsData}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {analyticsData && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    Total AI Calls
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {analyticsData.timeframe}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData.overview.totalCalls}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI-powered conversations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-600" />
                    Success Rate
                  </CardTitle>
                  <div className="flex items-center">
                    {analyticsData.overview.successRate >= 80 ? (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.overview.successRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analyticsData.overview.completedCalls} of {analyticsData.overview.totalCalls} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    Avg Duration
                  </CardTitle>
                  <Activity className="w-4 h-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {analyticsData.overview.averageDuration}s
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average call length
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Bot className="w-4 h-4 text-orange-600" />
                    AI Insights
                  </CardTitle>
                  <Zap className="w-4 h-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {Object.values(analyticsData.breakdowns.sentiment).reduce((a, b) => a + b, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sentiment analyses
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Call Purpose Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Call Purpose Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.breakdowns.purpose).map(([purpose, count]) => {
                      const total = Object.values(analyticsData.breakdowns.purpose).reduce((a, b) => a + b, 0)
                      const percentage = total > 0 ? (count / total) * 100 : 0
                      
                      return (
                        <div key={purpose} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium capitalize">
                              {purpose.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-slate-600">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Sentiment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.breakdowns.sentiment).map(([sentiment, count]) => {
                      const total = Object.values(analyticsData.breakdowns.sentiment).reduce((a, b) => a + b, 0)
                      const percentage = total > 0 ? (count / total) * 100 : 0
                      
                      return (
                        <div key={sentiment} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium capitalize">
                              {sentiment}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge className={getSentimentColor(sentiment)}>
                                {count}
                              </Badge>
                              <span className="text-sm text-slate-600">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                sentiment === 'positive' ? 'bg-green-600' :
                                sentiment === 'negative' ? 'bg-red-600' : 'bg-gray-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent AI Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.recentCalls.length > 0 ? (
                  <div className="space-y-4">
                    {analyticsData.recentCalls.map((call) => (
                      <div key={call.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{call.leadName}</p>
                            {call.company && (
                              <span className="text-sm text-slate-600">({call.company})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="capitalize">{call.purpose.replace('_', ' ')}</span>
                            {call.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {call.duration}s
                              </span>
                            )}
                            {call.sentiment && (
                              <Badge className={getSentimentColor(call.sentiment)}>
                                {call.sentiment}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-500">
                            {new Date(call.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No AI activity yet</p>
                    <p className="text-sm text-slate-400">Start using AI-powered features to see analytics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}