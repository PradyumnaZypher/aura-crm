'use client'

import { useEffect } from 'react'
import Vapi from '@vapi-ai/web'

export default function VapiAssistant() {
  useEffect(() => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID

      if (!apiKey || !assistantId) {
        console.warn('⚠️ Vapi keys missing. Check your .env.local file.')
        return
      }

      const vapi = new Vapi(apiKey)

      vapi.on('call-start', () => console.log('📞 Vapi call started'))
      vapi.on('call-end', () => console.log('🔚 Vapi call ended'))
      vapi.on('error', (err) => console.error('❌ Vapi error:', err))

      // Create a floating mic button
      const btn = document.createElement('button')
      btn.innerText = '🎙 Voice Assistant'
      Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#7C3AED',
        color: 'white',
        border: 'none',
        borderRadius: '9999px',
        padding: '12px 18px',
        fontSize: '14px',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      })

      btn.onclick = () => {
        console.log('🎤 Starting Vapi assistant call...')
        vapi.start(assistantId)
      }

      document.body.appendChild(btn)

      console.log('✅ Vapi initialized successfully')

      return () => {
        document.body.removeChild(btn)
        vapi.stop()
      }
    } catch (error) {
      console.error('Error initializing Vapi:', error)
    }
  }, [])

  return null
}
