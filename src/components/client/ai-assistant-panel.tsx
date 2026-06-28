'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Phone, 
  MessageSquare, 
  Bot, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  BarChart3,
  Sparkles,
  Play,
  Pause,
  Mic
} from 'lucide-react'

interface AICall {
  id: string
  leadName: string
  status: string
  duration?: number
  sentiment?: string
  createdAt: string
}

interface AIInsight {
  id: string
  type: string
  content: string
  confidence: number
  createdAt: string
}

interface AIAssistantPanelProps {
  userId: string
}

export default function AIAssistantPanel({ userId }: AIAssistantPanelProps) {
  const [activeCalls, setActiveCalls] = useState<AICall[]>([])
  const [recentInsights, setRecentInsights] = useState<AIInsight[]>([])
  const [callAnalytics, setCallAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState<string | null>('calls')

  useEffect(() => {
    fetchAIData()
  }, [userId])

  const fetchAIData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch active AI calls
      const callsResponse = await fetch('/api/ai/calls/history?status=IN_PROGRESS&limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (callsResponse.ok) {
        const callsData = await callsResponse.json()
        setActiveCalls(callsData.data.calls || [])
      }

      // Fetch recent AI insights
      const insightsResponse = await fetch('/api/ai/insights/generate?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json()
        setRecentInsights(insightsData.data.insights || [])
      }

      // Fetch call analytics
      const analyticsResponse = await fetch('/api/ai/calls/analytics?timeframe=7d', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setCallAnalytics(analyticsData.data)
      }
    } catch (error) {
      console.error('Error fetching AI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const initiateAICall = async (leadId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/ai/calls/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leadId })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('AI call initiated:', result)
        fetchAIData() // Refresh data
      }
    } catch (error) {
      console.error('Error initiating AI call:', error)
    }
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100'
      case 'negative': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'SENTIMENT': return <TrendingUp className="w-4 h-4" />
      case 'RISK': return <AlertCircle className="w-4 h-4" />
      case 'OPPORTUNITY': return <Sparkles className="w-4 h-4" />
      default: return <Bot className="w-4 h-4" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'SENTIMENT': return 'text-blue-600 bg-blue-100'
      case 'RISK': return 'text-red-600 bg-red-100'
      case 'OPPORTUNITY': return 'text-green-600 bg-green-100'
      default: return 'text-purple-600 bg-purple-100'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" />
            AI Assistant
            <Badge variant="secondary" className="ml-2">
              Powered by Z.ai
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {callAnalytics && (
              <>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {callAnalytics.overview.totalCalls}
                  </div>
                  <p className="text-sm text-blue-600">AI Calls This Week</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {callAnalytics.overview.successRate}%
                  </div>
                  <p className="text-sm text-green-600">Success Rate</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {recentInsights.length}
                  </div>
                  <p className="text-sm text-purple-600">AI Insights</p>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-6">
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setExpandedSection('calls')}
            >
              <Phone className="w-4 h-4 mr-2" />
              AI Call
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setExpandedSection('insights')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Insights
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setExpandedSection('analytics')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active AI Calls */}
      {expandedSection === 'calls' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Active AI Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeCalls.length > 0 ? (
              <div className="space-y-4">
                {activeCalls.map((call) => (
                  <div key={call.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{call.leadName}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Badge variant={call.status === 'IN_PROGRESS' ? 'default' : 'secondary'}>
                          {call.status.replace('_', ' ')}
                        </Badge>
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
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Pause className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mic className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Phone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No active AI calls</p>
                <p className="text-sm text-slate-400 mb-4">Start an AI-powered conversation</p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start AI Call
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent AI Insights */}
      {expandedSection === 'insights' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Recent AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentInsights.length > 0 ? (
              <div className="space-y-4">
                {recentInsights.map((insight) => (
                  <div key={insight.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getInsightColor(insight.type)}`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {insight.type}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{insight.content}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(insight.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No AI insights yet</p>
                <p className="text-sm text-slate-400 mb-4">Generate insights from your interactions</p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Insights
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Analytics Summary */}
      {expandedSection === 'analytics' && callAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              AI Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Call Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(callAnalytics.breakdowns.purpose).map(([purpose, count]) => (
                    <div key={purpose} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{purpose.replace('_', ' ')}</span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Sentiment Analysis</h4>
                <div className="space-y-2">
                  {Object.entries(callAnalytics.breakdowns.sentiment).map(([sentiment, count]) => (
                    <div key={sentiment} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{sentiment}</span>
                      <Badge className={getSentimentColor(sentiment)}>
                        {count as number}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}