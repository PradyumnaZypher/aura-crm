import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiService } from '@/lib/ai-service';
import { twilioService } from '@/lib/twilio-service';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const smsSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  message: z.string().min(1, "Message is required"),
  tone: z.enum(['professional', 'friendly', 'casual', 'formal']).optional().default('professional')
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 });
    }

    const parsed = smsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { leadId, message, tone } = parsed.data;

    // Get lead information
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (!lead.phone) {
      return NextResponse.json({ 
        error: 'Lead phone number not found' 
      }, { status: 400 });
    }

    // Generate AI response
    const context = {
      leadName: `${lead.firstName} ${lead.lastName}`,
      leadCompany: lead.company || undefined,
      leadStatus: lead.status,
      previousMessages: lead.interactions,
      tone
    };

    const aiResponse = await aiService.generateTextResponse(message, context, tone);
    
    // Send SMS via Twilio
    const formattedPhone = twilioService.formatPhoneNumber(lead.phone);
    const smsResult = await twilioService.sendSMS(formattedPhone, aiResponse.text, leadId);

    // Create AI insight for this interaction
    if (aiResponse.sentiment && aiResponse.sentiment !== 'neutral') {
      await db.aIInsight.create({
        data: {
          leadId,
          type: 'SENTIMENT',
          content: `SMS conversation sentiment: ${aiResponse.sentiment}`,
          confidence: aiResponse.confidence || 0.7,
          metadata: {
            source: 'ai_sms',
            originalMessage: message,
            aiResponse: aiResponse.text,
            sentiment: aiResponse.sentiment,
            sentimentScore: aiResponse.sentimentScore,
            twilioSid: smsResult.sid
          }
        }
      });
    }

    // Log user activity
    await db.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'AI_SMS_SENT',
        resource: `Lead: ${leadId}`,
        metadata: {
          leadName: `${lead.firstName} ${lead.lastName}`,
          originalMessage: message,
          aiResponse: aiResponse.text,
          twilioSid: smsResult.sid
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'AI SMS sent successfully',
        originalMessage: message,
        aiResponse: aiResponse.text,
        sentiment: aiResponse.sentiment,
        sentimentScore: aiResponse.sentimentScore,
        confidence: aiResponse.confidence,
        twilioMessage: {
          sid: smsResult.sid,
          status: smsResult.status,
          dateCreated: smsResult.dateCreated
        }
      }
    });

  } catch (error) {
    console.error('AI SMS Error:', error);
    return NextResponse.json({
      error: 'Failed to send AI SMS',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}