import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const purpose = searchParams.get('purpose');
    const leadId = searchParams.get('leadId');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      initiatedBy: session.user.id
    };

    if (status) {
      where.status = status;
    }

    if (purpose) {
      where.purpose = purpose;
    }

    if (leadId) {
      where.leadId = leadId;
    }

    // Get calls with pagination
    const [calls, total] = await Promise.all([
      db.aICall.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true,
              phone: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.aICall.count({ where })
    ]);

    // Format response data
    const formattedCalls = calls.map(call => ({
      id: call.id,
      uniqueId: call.uniqueId,
      callSid: call.callSid,
      lead: {
        id: call.lead.id,
        name: `${call.lead.firstName} ${call.lead.lastName}`,
        company: call.lead.company,
        phone: call.lead.phone,
        status: call.lead.status
      },
      purpose: call.purpose,
      status: call.status,
      duration: call.duration,
      sentiment: call.sentiment,
      sentimentScore: call.sentimentScore,
      summary: call.summary,
      recordingUrl: call.recordingUrl,
      followUpRequired: call.followUpRequired,
      nextSteps: call.nextSteps,
      startTime: call.startTime,
      endTime: call.endTime,
      createdAt: call.createdAt,
      // Include transcript and responses if needed (can be large)
      transcriptCount: call.transcript ? (call.transcript as any[]).length : 0,
      responseCount: call.responses ? (call.responses as any[]).length : 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        calls: formattedCalls,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Call History Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch call history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}