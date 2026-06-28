import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId, phoneNumber, enableAI = true } = await request.json()

    if (!leadId || !phoneNumber) {
      return NextResponse.json({ 
        error: 'Lead ID and phone number are required' 
      }, { status: 400 })
    }

    // Get lead information
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        assignedUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Generate AI script if enabled
    let script = "Hello! This is a call from AI CRM System. How are you today?"
    
    if (enableAI) {
      try {
        const zai = await ZAI.create()
        
        const prompt = `
          Create a personalized opening script for a call to ${lead.firstName} ${lead.lastName}.
          
          Lead Information:
          - Company: ${lead.company || 'Not provided'}
          - Status: ${lead.status}
          - Priority: ${lead.priority}
          - Notes: ${lead.notes || 'No notes available'}
          
          Create a warm, professional opening that:
          1. Personalizes with their name and company
          2. States the purpose clearly
          3. Shows understanding of their status
          4. Encourages engagement
          
          Keep it conversational and natural (under 30 seconds when spoken).
        `

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an expert sales communication specialist. Create natural, engaging phone scripts.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        })

        script = completion.choices[0]?.message?.content || script
      } catch (error) {
        console.error('AI script generation failed:', error)
        // Use default script if AI fails
      }
    }

    // Create AI call record
    const aiCall = await db.aiCall.create({
      data: {
        uniqueId: `ai_call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        leadId: leadId,
        initiatedBy: session.user.id,
        script: script,
        purpose: 'FOLLOW_UP',
        language: 'en',
        status: 'INITIATED',
        startTime: new Date(),
        metadata: {
          enableAI,
          phoneNumber,
          userAgent: request.headers.get('user-agent')
        }
      }
    })

    // Create lead interaction record
    await db.leadInteraction.create({
      data: {
        leadId: leadId,
        userId: session.user.id,
        type: 'CALL',
        direction: 'OUTBOUND',
        summary: `AI call initiated to ${lead.firstName} ${lead.lastName}`,
        metadata: {
          aiCallId: aiCall.id,
          script: script,
          enableAI
        }
      }
    })

    // Log user activity
    await db.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'AI_CALL_INITIATED',
        resource: 'AICall',
        metadata: {
          leadId: leadId,
          leadName: `${lead.firstName} ${lead.lastName}`,
          aiCallId: aiCall.id,
          enableAI
        }
      }
    })

    // In a real implementation, you would integrate with Twilio or another phone service here
    // For now, we'll simulate the call initiation
    
    return NextResponse.json({
      success: true,
      data: {
        callId: aiCall.id,
        uniqueId: aiCall.uniqueId,
        script: script,
        status: 'initiated',
        lead: {
          name: `${lead.firstName} ${lead.lastName}`,
          company: lead.company,
          phone: phoneNumber
        }
      }
    })

  } catch (error) {
    console.error('AI call initiation error:', error)
    return NextResponse.json({ 
      error: 'Failed to initiate AI call',
      details: error.message 
    }, { status: 500 })
  }
}