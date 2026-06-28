// 'use client'

// import { useState, useEffect } from 'react'
// import DashboardLayout from '@/components/layout/dashboard-layout'
// import EnhancedNavbar from '@/components/ui/enhanced-navbar'
// import { Button } from '@/components/ui/button'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import {
//   HelpCircle,
//   User,
//   Activity,
//   MessageSquare,
//   Plus,
//   ArrowRight,
//   History,
//   Phone,
//   Mail,
//   FileText,
//   Bot,
//   PhoneCall,
// } from 'lucide-react'
// import Link from 'next/link'

// import AIAssistantPanel from '@/components/client/ai-assistant-panel'
// import AIInteractionsModal from '@/components/client/ai-interactions-modal'
// import AICallingPanel from '@/components/client/ai-calling-panel'

// export default function ClientDashboard() {
//   const [userName, setUserName] = useState<string>('')
//   const [userAvatar, setUserAvatar] = useState<string>('')
//   const [interactions, setInteractions] = useState<any[]>([])
//   const [supportTickets, setSupportTickets] = useState<any[]>([])
//   const [messages, setMessages] = useState<any[]>([])
//   const [showInteractionsModal, setShowInteractionsModal] = useState(false)
//   const [showAIInteractionsModal, setShowAIInteractionsModal] = useState(false)
//   const [showAICallingPanel, setShowAICallingPanel] = useState(false)
//   const [selectedLead, setSelectedLead] = useState<any>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const userData = localStorage.getItem('user')
//     if (userData) {
//       const user = JSON.parse(userData)
//       setUserName(
//         user.name ||
//           `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() ||
//           'User'
//       )
//       setUserAvatar(user.profile?.avatar || '')
//     }
//     fetchDashboardData()
//   }, [])

//   const fetchDashboardData = async () => {
//     try {
//       const token = localStorage.getItem('token')

//       // Fetch interactions
//       const interactionsResponse = await fetch('/api/interactions', {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       if (interactionsResponse.ok) {
//         const data = await interactionsResponse.json()
//         setInteractions(data.interactions || [])
//       }

//       // Fetch support tickets
//       const ticketsResponse = await fetch('/api/support-tickets', {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       if (ticketsResponse.ok) {
//         const data = await ticketsResponse.json()
//         setSupportTickets(data.tickets || [])
//       }

//       // Fetch messages
//       const messagesResponse = await fetch('/api/messages', {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       if (messagesResponse.ok) {
//         const data = await messagesResponse.json()
//         setMessages(data.messages || [])
//       }
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Auto-refresh every 30 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchDashboardData()
//     }, 30000)
//     return () => clearInterval(interval)
//   }, [])

//   // Listen for storage events (cross-tab updates)
//   useEffect(() => {
//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === 'interaction_created' || e.key === 'dashboard_refresh') {
//         fetchDashboardData()
//       }
//     }
//     window.addEventListener('storage', handleStorageChange)
//     return () => window.removeEventListener('storage', handleStorageChange)
//   }, [])

//   // Refresh when window gains focus
//   useEffect(() => {
//     const handleFocus = () => {
//       fetchDashboardData()
//     }
//     window.addEventListener('focus', handleFocus)
//     return () => window.removeEventListener('focus', handleFocus)
//   }, [])

//   const getInteractionIcon = (type: string) => {
//     switch (type) {
//       case 'call':
//         return <Phone className="w-4 h-4" />
//       case 'email':
//         return <Mail className="w-4 h-4" />
//       case 'meeting':
//         return <FileText className="w-4 h-4" />
//       default:
//         return <MessageSquare className="w-4 h-4" />
//     }
//   }

//   const getInteractionColor = (type: string) => {
//     switch (type) {
//       case 'call':
//         return 'bg-blue-100 text-blue-600'
//       case 'email':
//         return 'bg-green-100 text-green-600'
//       case 'meeting':
//         return 'bg-purple-100 text-purple-600'
//       default:
//         return 'bg-gray-100 text-gray-600'
//     }
//   }

//   const handleAICall = (lead?: any) => {
//     if (lead) {
//       setSelectedLead(lead)
//     } else {
//       setSelectedLead({
//         id: 'demo-lead',
//         firstName: 'Demo',
//         lastName: 'Contact',
//         name: 'Demo Contact',
//         phone: '+1234567890',
//         company: 'Demo Company',
//       })
//     }
//     setShowAICallingPanel(true)
//   }

//   return (
//     <DashboardLayout userRole="client">
//       {/* Header */}
//       <header className="bg-white border-b border-slate-200">
//         <div className="px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-slate-900">AI CRM Dashboard</h1>
//               <p className="text-slate-600">Welcome back! Here's your activity overview</p>
//             </div>
//             <EnhancedNavbar
//               userName={userName}
//               userAvatar={userAvatar}
//               onLogout={() => {
//                 localStorage.removeItem('token')
//                 localStorage.removeItem('user')
//                 window.location.href = '/login'
//               }}
//             />
//           </div>
//         </div>
//       </header>

//       <div className="p-6">
//         {/* Welcome Section */}
//         <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg p-6 mb-8">
//           <h2 className="text-2xl font-bold mb-2">Welcome to AI CRM</h2>
//           <p className="text-purple-100">
//             Track your interactions, manage your profile, and get support
//           </p>
//         </div>

//         {/* Quick Stats */}
//         {/* Cards grid omitted for brevity — (keep same JSX from your source) */}

//         {/* Recent Activity */}
//         {/* Keep same JSX from your original code for recent activity & modals */}

//         {/* AI Assistant Panel */}
//         <AIAssistantPanel userId={userName} />

//         {/* AI Interactions Modal */}
//         <AIInteractionsModal
//           isOpen={showAIInteractionsModal}
//           onClose={() => setShowAIInteractionsModal(false)}
//           userId={userName}
//         />

//         {/* AI Calling Panel */}
//         <AICallingPanel
//           isOpen={showAICallingPanel}
//           onClose={() => setShowAICallingPanel(false)}
//           leadId={selectedLead?.id}
//           leadName={selectedLead?.name}
//           leadPhone={selectedLead?.phone}
//         />
//       </div>
//     </DashboardLayout>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import VapiCallButton from '@/components/VapiCallButton' // Import added
// import AIChatButton from '@/components/AIChatButton'; // 1. Import
import ExternalChatTrigger from '@/components/ExternalChatTrigger';
import AIChatTrigger from '@/components/AIChatTrigger';
import DashboardLayout from '@/components/layout/dashboard-layout'
import EnhancedNavbar from '@/components/ui/enhanced-navbar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  HelpCircle,
  User,
  Activity,
  MessageSquare,
  Plus,
  ArrowRight,
  History,
  Phone,
  Mail,
  FileText,
  Bot,
  PhoneCall,
} from 'lucide-react'
import Link from 'next/link'

import AIAssistantPanel from '@/components/client/ai-assistant-panel'
import AIInteractionsModal from '@/components/client/ai-interactions-modal'
import AICallingPanel from '@/components/client/ai-calling-panel'

export default function ClientDashboard() {
  const [userName, setUserName] = useState<string>('')
  const [userAvatar, setUserAvatar] = useState<string>('')
  const [interactions, setInteractions] = useState<any[]>([])
  const [supportTickets, setSupportTickets] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [showInteractionsModal, setShowInteractionsModal] = useState(false)
  const [showAIInteractionsModal, setShowAIInteractionsModal] = useState(false)
  const [showAICallingPanel, setShowAICallingPanel] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserName(
        user.name ||
          `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() ||
          'User'
      )
      setUserAvatar(user.profile?.avatar || '')
    }
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')

      // Fetch interactions
      const interactionsResponse = await fetch('/api/interactions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (interactionsResponse.ok) {
        const data = await interactionsResponse.json()
        setInteractions(data.interactions || [])
      }

      // Fetch support tickets
      const ticketsResponse = await fetch('/api/support-tickets', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (ticketsResponse.ok) {
        const data = await ticketsResponse.json()
        setSupportTickets(data.tickets || [])
      }

      // Fetch messages
      const messagesResponse = await fetch('/api/messages', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (messagesResponse.ok) {
        const data = await messagesResponse.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Listen for storage events (cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'interaction_created' || e.key === 'dashboard_refresh') {
        fetchDashboardData()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Refresh when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchDashboardData()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-4 h-4" />
      case 'email':
        return <Mail className="w-4 h-4" />
      case 'meeting':
        return <FileText className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-blue-100 text-blue-600'
      case 'email':
        return 'bg-green-100 text-green-600'
      case 'meeting':
        return 'bg-purple-100 text-purple-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const handleAICall = (lead?: any) => {
    if (lead) {
      setSelectedLead(lead)
    } else {
      setSelectedLead({
        id: 'demo-lead',
        firstName: 'Demo',
        lastName: 'Contact',
        name: 'Demo Contact',
        phone: '+1234567890',
        company: 'Demo Company',
      })
    }
    setShowAICallingPanel(true)
  }

  return (
    <DashboardLayout userRole="client">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AI CRM Dashboard</h1>
              <p className="text-slate-600">Welcome back! Here's your activity overview</p>
            </div>
            
            {/* --- MODIFIED SECTION --- */}
            <div className="flex items-center gap-4">
              <VapiCallButton />
              <AIChatTrigger />
              <ExternalChatTrigger />
              {/* <AIChatButton /> */}
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
            {/* ------------------------ */}

          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to AI CRM</h2>
          <p className="text-purple-100">
            Track your interactions, manage your profile, and get support
          </p>
        </div>

        {/* Quick Stats */}
        {/* Cards grid omitted for brevity — (keep same JSX from your source) */}

        {/* Recent Activity */}
        {/* Keep same JSX from your original code for recent activity & modals */}

        {/* AI Assistant Panel */}
        <AIAssistantPanel userId={userName} />

        {/* AI Interactions Modal */}
        <AIInteractionsModal
          isOpen={showAIInteractionsModal}
          onClose={() => setShowAIInteractionsModal(false)}
          userId={userName}
        />

        {/* AI Calling Panel */}
        <AICallingPanel
          isOpen={showAICallingPanel}
          onClose={() => setShowAICallingPanel(false)}
          leadId={selectedLead?.id}
          leadName={selectedLead?.name}
          leadPhone={selectedLead?.phone}
        />
      </div>
    </DashboardLayout>
  )
}