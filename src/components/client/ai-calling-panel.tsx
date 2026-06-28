'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Bot, User, Clock, MessageSquare, PhoneCall } from 'lucide-react'
import { toast } from 'sonner'

interface AICallingPanelProps {
  isOpen: boolean
  onClose: () => void
  leadId?: string
  leadName?: string
  leadPhone?: string
}

interface CallState {
  status: 'idle' | 'connecting' | 'ringing' | 'in-progress' | 'completed' | 'failed'
  duration: number
  isMuted: boolean
  isSpeakerOn: boolean
  transcript: Array<{
    speaker: 'user' | 'ai'
    text: string
    timestamp: Date
  }>
  sentiment: {
    score: number
    label: string
  }
}

export default function AICallingPanel({ isOpen, onClose, leadId, leadName, leadPhone }: AICallingPanelProps) {
  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    duration: 0,
    isMuted: false,
    isSpeakerOn: true,
    transcript: [],
    sentiment: { score: 0, label: 'neutral' }
  })
  const [isAIEnabled, setIsAIEnabled] = useState(true)
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (callState.status === 'in-progress') {
      const timer = setInterval(() => {
        setCallState(prev => ({ ...prev, duration: prev.duration + 1 }))
      }, 1000)
      setCallTimer(timer)
    } else {
      if (callTimer) {
        clearInterval(callTimer)
        setCallTimer(null)
      }
    }

    return () => {
      if (callTimer) {
        clearInterval(callTimer)
      }
    }
  }, [callState.status])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const initiateCall = async () => {
    if (!leadPhone) {
      toast.error('No phone number available for this lead')
      return
    }

    try {
      setCallState(prev => ({ ...prev, status: 'connecting' }))
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/ai/call/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          leadId,
          phoneNumber: leadPhone,
          enableAI: isAIEnabled
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCallState(prev => ({ 
          ...prev, 
          status: 'ringing',
          transcript: [{
            speaker: 'ai',
            text: data.script || 'Hello! This is an AI assistant calling from AI CRM System. How are you today?',
            timestamp: new Date()
          }]
        }))
        
        // Simulate call connection
        setTimeout(() => {
          setCallState(prev => ({ ...prev, status: 'in-progress' }))
          toast.success('Call connected')
        }, 2000)
      } else {
        throw new Error('Failed to initiate call')
      }
    } catch (error) {
      console.error('Call initiation error:', error)
      setCallState(prev => ({ ...prev, status: 'failed' }))
      toast.error('Failed to initiate call')
    }
  }

  const endCall = async () => {
    try {
      if (callState.status === 'in-progress') {
        const token = localStorage.getItem('token')
        await fetch('/api/ai/call/end', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            leadId,
            duration: callState.duration,
            transcript: callState.transcript,
            sentiment: callState.sentiment
          })
        })
      }

      setCallState(prev => ({ ...prev, status: 'completed' }))
      toast.success('Call ended successfully')
      
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Call ending error:', error)
      toast.error('Failed to end call properly')
    }
  }

  const toggleMute = () => {
    setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }))
  }

  const toggleSpeaker = () => {
    setCallState(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }))
  }

  const simulateUserMessage = (message: string) => {
    if (callState.status !== 'in-progress') return

    const newUserMessage = {
      speaker: 'user' as const,
      text: message,
      timestamp: new Date()
    }

    setCallState(prev => ({
      ...prev,
      transcript: [...prev.transcript, newUserMessage]
    }))

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "I understand. Let me help you with that.",
        "That's a great point! Let me address your concern.",
        "Thank you for sharing that information.",
        "I appreciate your feedback on this matter.",
        "Let me make sure I understand your needs correctly."
      ]

      const aiResponse = {
        speaker: 'ai' as const,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date()
      }

      setCallState(prev => ({
        ...prev,
        transcript: [...prev.transcript, aiResponse]
      }))
    }, 1500)
  }

  const getStatusColor = () => {
    switch (callState.status) {
      case 'connecting': return 'text-yellow-600'
      case 'ringing': return 'text-blue-600'
      case 'in-progress': return 'text-green-600'
      case 'completed': return 'text-gray-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusText = () => {
    switch (callState.status) {
      case 'connecting': return 'Connecting...'
      case 'ringing': return 'Ringing...'
      case 'in-progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'failed': return 'Failed'
      default: return 'Ready to Call'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl">AI Calling Interface</CardTitle>
                <p className="text-blue-100">
                  {leadName ? `Calling ${leadName}` : 'AI Assistant'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20">
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Call Status */}
          <div className="text-center mb-6">
            <div className={`text-lg font-semibold ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            {callState.status === 'in-progress' && (
              <div className="text-3xl font-bold text-gray-800 mt-2">
                {formatDuration(callState.duration)}
              </div>
            )}
            {leadPhone && (
              <div className="text-sm text-gray-600 mt-1">
                {leadPhone}
              </div>
            )}
          </div>

          {/* AI Status */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge variant={isAIEnabled ? "default" : "secondary"} className="flex items-center gap-1">
              <Bot className="w-3 h-3" />
              AI Assistant {isAIEnabled ? 'Active' : 'Inactive'}
            </Badge>
            {callState.status === 'in-progress' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {callState.transcript.length} messages
              </Badge>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {callState.status === 'idle' && (
              <Button 
                onClick={initiateCall}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                disabled={!leadPhone}
              >
                <Phone className="w-5 h-5 mr-2" />
                Start Call
              </Button>
            )}

            {(callState.status === 'connecting' || callState.status === 'ringing') && (
              <Button 
                onClick={endCall}
                variant="destructive"
                className="px-8 py-3"
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                Cancel
              </Button>
            )}

            {callState.status === 'in-progress' && (
              <>
                <Button 
                  onClick={toggleMute}
                  variant={callState.isMuted ? "destructive" : "outline"}
                  size="lg"
                  className="w-12 h-12 rounded-full"
                >
                  {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>

                <Button 
                  onClick={endCall}
                  variant="destructive"
                  size="lg"
                  className="w-16 h-16 rounded-full"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>

                <Button 
                  onClick={toggleSpeaker}
                  variant={callState.isSpeakerOn ? "default" : "outline"}
                  size="lg"
                  className="w-12 h-12 rounded-full"
                >
                  {callState.isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>
              </>
            )}

            {callState.status === 'completed' && (
              <div className="text-center">
                <div className="text-green-600 font-semibold mb-2">Call Completed Successfully</div>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            )}

            {callState.status === 'failed' && (
              <div className="text-center">
                <div className="text-red-600 font-semibold mb-2">Call Failed</div>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            )}
          </div>

          {/* Transcript */}
          {callState.transcript.length > 0 && (
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Conversation Transcript
              </h3>
              <div className="space-y-3">
                {callState.transcript.map((msg, index) => (
                  <div key={index} className={`flex gap-3 ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start gap-2 max-w-[80%] ${msg.speaker === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.speaker === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                      }`}>
                        {msg.speaker === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        msg.speaker === 'user' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Response Buttons (for demo) */}
          {callState.status === 'in-progress' && isAIEnabled && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Quick responses (for demo):</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "I'm interested in your services",
                  "Can you tell me more?",
                  "I need to think about it",
                  "What are your prices?",
                  "Let's schedule a meeting"
                ].map((response) => (
                  <Button
                    key={response}
                    variant="outline"
                    size="sm"
                    onClick={() => simulateUserMessage(response)}
                    className="text-xs"
                  >
                    {response}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* AI Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAIEnabled}
                onChange={(e) => setIsAIEnabled(e.target.checked)}
                className="w-4 h-4"
                disabled={callState.status !== 'idle'}
              />
              <span className="text-sm">Enable AI Assistant</span>
            </label>
            {callState.status === 'idle' && (
              <p className="text-xs text-gray-500">
                AI will help guide the conversation
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}