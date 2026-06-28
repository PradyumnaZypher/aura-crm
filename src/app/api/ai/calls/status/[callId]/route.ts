import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { twilioService } from '@/lib/twilio-service';
import { aiService } from '@/lib/ai-service';
import { AICallStatus } from '@prisma/client';
import { z } from 'zod';

const callDataSchema = z.object({
  CallStatus: z.string(),
}).passthrough();

export async function POST(
  request: NextRequest,
  { params }: { params: { callId: string } }
) {
  try {
    const { callId } = params;
    const bodyText = await request.text(); // Twilio sends form data sometimes, but assuming json if next.js json was used before.
    let parsedBody;
    try {
      parsedBody = JSON.parse(bodyText);
    } catch {
      // If it's URL encoded from Twilio:
      const searchParams = new URLSearchParams(bodyText);
      parsedBody = Object.fromEntries(searchParams.entries());
    }

    const parsed = callDataSchema.safeParse(parsedBody);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const callData = parsed.data;

    // Update call status via Twilio service
    const statusUpdate = await twilioService.handleCallStatus(callId, callData.CallStatus, callData);

    if (!statusUpdate.success) {
      console.error('Call status update failed:', statusUpdate.error);
      return NextResponse.json({ error: statusUpdate.error }, { status: 500 });
    }

    // If call is completed, generate summary and insights
    if (callData.CallStatus === 'completed') {
      const aiCall = await db.aICall.findUnique({
        where: { id: callId },
        include: {
          lead: true
        }
      });

      if (aiCall && aiCall.transcript) {
        try {
          // Generate call summary
          const context = {
            leadName: `${aiCall.lead.firstName} ${aiCall.lead.lastName}`,
            leadCompany: aiCall.lead.company || undefined,
            leadStatus: aiCall.lead.status,
            previousInteractions: [],
            script: aiCall.script,
            purpose: aiCall.purpose.toString().toLowerCase()
          };

          const summary = await aiService.generateCallSummary(
            aiCall.transcript as any,
            context
          );

          // Update call with summary and insights
          await db.aICall.update({
            where: { id: callId },
            data: {
              summary: summary.summary,
              keyPoints: JSON.stringify(summary.keyPoints),
              actionItems: JSON.stringify(summary.actionItems),
              followUpRequired: summary.actionItems.length > 0,
              nextSteps: summary.actionItems.join('; ')
            }
          });

          // Create AI insights for the lead
          if (summary.keyPoints.length > 0) {
            await db.aIInsight.create({
              data: {
                leadId: aiCall.leadId,
                type: 'TOPIC',
                content: `Key topics discussed: ${summary.keyPoints.join(', ')}`,
                confidence: 0.8,
                metadata: {
                  callId,
                  source: 'call_summary'
                }
              }
            });
          }

        } catch (summaryError) {
          console.error('Call summary generation failed:', summaryError);
        }
      }
    }

    return NextResponse.json({ success: true, status: callData.CallStatus });

  } catch (error) {
    console.error('Call Status Webhook Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process call status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}