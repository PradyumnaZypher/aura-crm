import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiService } from '@/lib/ai-service';
import { twilioService } from '@/lib/twilio-service';
import { AICallStatus } from '@prisma/client';
import { z } from 'zod';

const formSchema = z.object({
  SpeechResult: z.string().optional(),
  Confidence: z.string().optional(),
  From: z.string().optional()
}).passthrough();

export async function POST(
  request: NextRequest,
  { params }: { params: { callId: string } }
) {
  try {
    const { callId } = params;
    const formData = await request.formData();
    
    const parsed = formSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { SpeechResult, Confidence, From } = parsed.data;

    if (!SpeechResult) {
      // No speech detected, end the call
      const endTwiML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">
    Thank you for your time. Have a great day!
  </Say>
  <Hangup />
</Response>`;
      
      return new NextResponse(endTwiML, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' }
      });
    }

    const aiCall = await db.aICall.findUnique({
      where: { id: callId },
      include: {
        lead: true
      }
    });

    if (!aiCall) {
      return new NextResponse('Call not found', { status: 404 });
    }

    // Get conversation history
    const currentResponses = (aiCall.responses as any) || [];
    
    // Generate AI response
    const context = {
      leadName: `${aiCall.lead.firstName} ${aiCall.lead.lastName}`,
      leadCompany: aiCall.lead.company || undefined,
      leadStatus: aiCall.lead.status,
      previousInteractions: [],
      script: aiCall.script,
      purpose: aiCall.purpose.toString().toLowerCase()
    };

    const aiResponse = await aiService.generateCallResponse(
      SpeechResult,
      currentResponses,
      context
    );

    // Update call record with new interaction
    const newResponse = {
      userInput: SpeechResult,
      aiResponse: aiResponse.text,
      confidence: Confidence ? parseFloat(Confidence) : null,
      sentiment: aiResponse.sentiment,
      sentimentScore: aiResponse.sentimentScore,
      timestamp: new Date()
    };

    const updatedResponses = [...currentResponses, newResponse];

    // Update transcript
    const currentTranscript = (aiCall.transcript as any) || [];
    const updatedTranscript = [
      ...currentTranscript,
      {
        speaker: 'human',
        text: SpeechResult,
        timestamp: new Date(),
        confidence: Confidence ? parseFloat(Confidence) : null
      },
      {
        speaker: 'ai',
        text: aiResponse.text,
        timestamp: new Date(),
        confidence: aiResponse.confidence || 0.9
      }
    ];

    await db.aICall.update({
      where: { id: callId },
      data: {
        responses: updatedResponses,
        transcript: updatedTranscript,
        status: AICallStatus.IN_PROGRESS,
        sentiment: aiResponse.sentiment as string | null,
        sentimentScore: aiResponse.sentimentScore
      }
    });

    // Generate follow-up TwiML
    const followUpTwiML = twilioService.generateFollowUpTwiML(aiResponse.text, callId);

    return new NextResponse(followUpTwiML, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml'
      }
    });

  } catch (error) {
    console.error('Speech Processing Error:', error);
    
    // Return error TwiML
    const errorTwiML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">
    I apologize, but I'm having trouble understanding. Let me connect you with a human representative.
  </Say>
  <Hangup />
</Response>`;
    
    return new NextResponse(errorTwiML, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}