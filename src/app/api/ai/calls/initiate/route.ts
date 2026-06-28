import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiService } from '@/lib/ai-service';
import { twilioService } from '@/lib/twilio-service';
import { AICallPurpose, AICallStatus } from '@prisma/client';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const schema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  purpose: z.nativeEnum(AICallPurpose).optional().default(AICallPurpose.FOLLOW_UP),
  customScript: z.string().optional()
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

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { leadId, purpose, customScript } = parsed.data;

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
      return NextResponse.json({ error: 'Lead phone number not found' }, { status: 400 });
    }

    // Validate phone number
    if (!twilioService.validatePhoneNumber(lead.phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Generate or use custom script
    let script = customScript;
    if (!script) {
      const context = {
        name: `${lead.firstName} ${lead.lastName}`,
        company: lead.company || undefined,
        status: lead.status,
        previousInteractions: lead.interactions
      };

      script = await aiService.generateCallScript(
        purpose.toString(),
        context,
        `Make a ${purpose.toString().toLowerCase()} call to this lead`
      );
    }

    // Create AI call record
    const aiCall = await db.aICall.create({
      data: {
        uniqueId: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        leadId,
        initiatedBy: session.user.id,
        script,
        purpose,
        language: 'en',
        status: AICallStatus.INITIATED,
        responses: [],
        transcript: []
      }
    });

    // Initiate call via Twilio
    const formattedPhone = twilioService.formatPhoneNumber(lead.phone);
    const twilioCall = await twilioService.initiateAICall(formattedPhone, aiCall.id, script);

    // Log user activity
    await db.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'AI_CALL_INITIATED',
        resource: `AI Call: ${aiCall.id}`,
        metadata: {
          leadId,
          leadName: `${lead.firstName} ${lead.lastName}`,
          purpose,
          twilioSid: twilioCall.sid
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        call: aiCall,
        twilioCall: {
          sid: twilioCall.sid,
          status: twilioCall.status,
          dateCreated: twilioCall.dateCreated
        },
        message: 'AI call initiated successfully'
      }
    });

  } catch (error) {
    console.error('AI Call Initiation Error:', error);
    return NextResponse.json({
      error: 'Failed to initiate AI call',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}