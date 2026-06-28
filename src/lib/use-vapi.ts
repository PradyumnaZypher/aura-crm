// /lib/use-vapi.ts
import { useEffect } from 'react'
import Vapi from '@vapi-ai/web'

export function useVapi({ assistantId, apiKey, onReady, onError }: any) {
  useEffect(() => {
    if (!assistantId || !apiKey) {
      console.warn('Missing Vapi assistant ID or API key')
      return
    }

    const vapi: any = new Vapi(apiKey)

    vapi.on('ready', () => onReady?.())
    vapi.on('error', (err: any) => onError?.(err))

    try {
      vapi.connect({ assistantId })
    } catch (error) {
      onError?.(error)
    }

    return () => {
      if (vapi && typeof vapi.disconnect === 'function') {
        vapi.disconnect()
      } else if (vapi && typeof vapi.close === 'function') {
        // some runtimes use `close` instead of `disconnect`
        vapi.close()
      }
    }
  }, [assistantId, apiKey])
}
