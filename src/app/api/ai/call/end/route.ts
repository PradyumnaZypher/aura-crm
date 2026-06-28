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

    const { leadId, duration, transcript, sentiment, callId } = await request.json()

    if (!leadId || !callId) {
      return NextResponse.json({ 
        error: 'Lead ID and call ID are required' 
      }, { status: 400 })
    }

    // Get the AI call record
    const aiCall = await db.aiCall.findUnique({
      where: { id: callId },
      include: {
        lead: {
          select: {
            firstName: true,
            lastName: true,
            company: true
          }
        }
      }
    })

    if (!aiCall) {
      return NextResponse.json({ error: 'AI call not found' }, { status: 404 })
    }

    // Generate AI summary and insights if transcript is available
    let summary = ""
    let keyPoints = ""
    let sentimentAnalysis = sentiment || { sentiment: 'neutral', score: 0 }
    let nextSteps = ""

    if (transcript && transcript.length > 0) {
      try {
        const zai = await ZAI.create()
        
        const transcriptText = transcript
          .map(t => `${t.speaker}: ${t.text}`)
          .join('\n')

        // Generate call summary
        const summaryPrompt = `
          Analyze this phone call transcript and provide:
          1. A brief summary (2-3 sentences)
          2. Key points discussed (bullet points)
          3. Sentiment analysis
          4. Recommended next steps
          
          Call with ${aiCall.lead.firstName} ${aiCall.lead.lastName} from ${aiCall.lead.company || 'Unknown company'}:
          
          ${transcriptText}
          
          Return as JSON with keys: summary, keyPoints, sentiment, nextSteps
        `

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an expert call analyst. Provide concise, actionable insights from call transcripts.'
            },
            {
              role: 'user',
              content: summaryPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })

        const analysisText = completion.choices[0]?.message?.content || '{}'
        
        try {
          const analysis = JSON.parse(analysisText)
          summary = analysis.summary || ""
          keyPoints = JSON.stringify(analysis.keyPoints || [])
          sentimentAnalysis = analysis.sentiment || sentimentAnalysis
          nextSteps = JSON.stringify(analysis.nextSteps || [])
        } catch (parseError) {
          console.error('Failed to parse AI analysis:', parseError)
          summary = "Call completed successfully"
        }
      } catch (error) {
        console.error('AI analysis failed:', error)
        summary = "Call completed successfully"
      }
    }

    // Update AI call record
    const updatedCall = await db.aiCall.update({
      where: { id: callId },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        duration: duration || 0,
        transcript: transcript || [],
        sentiment: sentimentAnalysis.sentiment,
        sentimentScore: sentimentAnalysis.score || 0,
        summary: summary,
        keyPoints: keyPoints,
        nextSteps: nextSteps,
        followUpRequired: nextSteps && nextSteps.length > 0
      }
    })

    // Update lead interaction record
    await db.leadInteraction.updateMany({
      where: { 
        leadId: leadId,
        metadata: {
          path: ['aiCallId'],
          equals: callId
        }
      },
      data: {
        duration: duration || 0,
        summary: summary || `AI call completed with ${aiCall.lead.firstName} ${aiCall.lead.lastName}`,
        transcript: transcriptText || '',
        sentiment: sentimentAnalysis.sentiment
      }
    })

    // Log user activity
    await db.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'AI_CALL_COMPLETED',
        resource: 'AICall',
        metadata: {
          leadId: leadId,
          leadName: `${aiCall.lead.firstName} ${aiCall.lead.lastName}`,
          aiCallId: callId,
          duration: duration || 0,
          sentiment: sentimentAnalysis.sentiment
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        callId: updatedCall.id,
        status: 'completed',
        duration: duration || 0,
        summary: summary,
        sentiment: sentimentAnalysis,
        nextSteps: nextSteps
      }
    })

  } catch (error) {
    console.error('AI call ending error:', error)
    return NextResponse.json({ 
      error: 'Failed to end AI call',
      details: error.message 
    }, { status: 500 })
  }
}