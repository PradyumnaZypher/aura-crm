import { NextRequest, NextResponse } from 'next/server';
import { twilioService } from '@/lib/twilio-service';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { callId: string } }
) {
  try {
    const { callId } = params;

    const aiCall = await db.aICall.findUnique({
      where: { id: callId },
      include: {
        lead: true
      }
    });

    if (!aiCall) {
      return new NextResponse('Call not found', { status: 404 });
    }

    // Generate TwiML response
    const twiml = await twilioService.handleIncomingCall(callId, aiCall.script);

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml'
      }
    });

  } catch (error) {
    console.error('Voice Webhook Error:', error);
    return new NextResponse('Error processing voice webhook', { status: 500 });
  }
}