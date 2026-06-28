'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Phone, 
  MessageSquare, 
  Bot, 
  Send, 
  Clock, 
  TrendingUp,
  AlertCircle,
  Sparkles,
  X
} from 'lucide-react'

interface Lead {
  id: string
  firstName: string
  lastName: string
  company?: string
  phone?: string
  status: string
}

interface AIInteractionsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export default function AIInteractionsModal({ isOpen, onClose, userId }: AIInteractionsModalProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<string>('')
  const [interactionType, setInteractionType] = useState<'call' | 'sms' | 'insights'>('call')
  const [message, setMessage] = useState('')
  const [customScript, setCustomScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    if (isOpen) {
      fetchLeads()
    }
  }, [isOpen])

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/leads', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads || [])
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }

  const handleInitiateAICall = async () => {
    if (!selectedLead) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/ai/calls/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leadId: selectedLead,
          customScript: customScript || undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult({
          type: 'call',
          success: true,
          data: data.data
        })
      } else {
        setResult({
          type: 'call',
          success: false,
          error: 'Failed to initiate AI call'
        })
      }
    } catch (error) {
      setResult({
        type: 'call',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendAISMS = async () => {
    if (!selectedLead || !message) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/ai/sms/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leadId: selectedLead,
          message,
          tone: 'professional'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult({
          type: 'sms',
          success: true,
          data: data.data
        })
      } else {
        setResult({
          type: 'sms',
          success: false,
          error: 'Failed to send AI SMS'
        })
      }
    } catch (error) {
      setResult({
        type: 'sms',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateInsights = async () => {
    if (!selectedLead) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/ai/insights/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leadId: selectedLead
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult({
          type: 'insights',
          success: true,
          data: data.data
        })
      } else {
        setResult({
          type: 'insights',
          success: false,
          error: 'Failed to generate insights'
        })
      }
    } catch (error) {
      setResult({
        type: 'insights',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    switch (interactionType) {
      case 'call':
        handleInitiateAICall()
        break
      case 'sms':
        handleSendAISMS()
        break
      case 'insights':
        handleGenerateInsights()
        break
    }
  }

  const resetForm = () => {
    setSelectedLead('')
    setMessage('')
    setCustomScript('')
    setResult(null)
    setLoading(false)
  }

  const selectedLeadData = leads.find(lead => lead.id === selectedLead)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" />
            AI Interactions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Interaction Type Selection */}
          <div className="flex gap-2">
            <Button
              variant={interactionType === 'call' ? 'default' : 'outline'}
              onClick={() => setInteractionType('call')}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-2" />
              AI Call
            </Button>
            <Button
              variant={interactionType === 'sms' ? 'default' : 'outline'}
              onClick={() => setInteractionType('sms')}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              AI SMS
            </Button>
            <Button
              variant={interactionType === 'insights' ? 'default' : 'outline'}
              onClick={() => setInteractionType('insights')}
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Insights
            </Button>
          </div>

          {/* Lead Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Lead</label>
            <Select value={selectedLead} onValueChange={setSelectedLead}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a lead..." />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.firstName} {lead.lastName} {lead.company && `(${lead.company})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lead Info */}
          {selectedLeadData && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {selectedLeadData.firstName} {selectedLeadData.lastName}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {selectedLeadData.company && `${selectedLeadData.company} • `}
                      {selectedLeadData.phone}
                    </p>
                  </div>
                  <Badge variant={selectedLeadData.status === 'NEW' ? 'default' : 'secondary'}>
                    {selectedLeadData.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interaction Specific Fields */}
          {interactionType === 'call' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Custom Script (Optional)
              </label>
              <Textarea
                placeholder="Enter a custom script for the AI call, or leave blank to use AI-generated script..."
                value={customScript}
                onChange={(e) => setCustomScript(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {interactionType === 'sms' && (
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <Textarea
                placeholder="Enter your message, and AI will enhance it..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedLead || loading || (interactionType === 'sms' && !message)}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>Processing...</>
            ) : (
              <>
                {interactionType === 'call' && <><Phone className="w-4 h-4 mr-2" />Initiate AI Call</>}
                {interactionType === 'sms' && <><Send className="w-4 h-4 mr-2" />Send AI SMS</>}
                {interactionType === 'insights' && <><Sparkles className="w-4 h-4 mr-2" />Generate Insights</>}
              </>
            )}
          </Button>

          {/* Result Display */}
          {result && (
            <Card className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.success ? 'Success!' : 'Error'}
                    </h4>
                    {result.success ? (
                      <div className="mt-2 space-y-2">
                        {result.type === 'call' && (
                          <>
                            <p className="text-sm text-green-700">
                              AI call initiated successfully!
                            </p>
                            <p className="text-xs text-green-600">
                              Call ID: {result.data.call.id}
                            </p>
                            <p className="text-xs text-green-600">
                              Status: {result.data.call.status}
                            </p>
                          </>
                        )}
                        {result.type === 'sms' && (
                          <>
                            <p className="text-sm text-green-700">
                              AI-enhanced SMS sent successfully!
                            </p>
                            <div className="bg-white p-2 rounded border border-green-200">
                              <p className="text-sm">{result.data.aiResponse}</p>
                            </div>
                            <p className="text-xs text-green-600">
                              Sentiment: {result.data.sentiment}
                            </p>
                          </>
                        )}
                        {result.type === 'insights' && (
                          <>
                            <p className="text-sm text-green-700">
                              AI insights generated successfully!
                            </p>
                            <div className="space-y-1">
                              <p className="text-xs text-green-600">
                                Sentiment: {result.data.insights.sentiment}
                              </p>
                              <p className="text-xs text-green-600">
                                Interest Level: {result.data.insights.interestLevel}
                              </p>
                              {result.data.insights.riskFactors.length > 0 && (
                                <p className="text-xs text-green-600">
                                  Risk Factors: {result.data.insights.riskFactors.join(', ')}
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-red-700 mt-1">{result.error}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}