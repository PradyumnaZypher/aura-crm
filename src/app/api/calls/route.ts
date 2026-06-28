import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const scheduleCallSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  scheduledFor: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration must be less than 8 hours'),
  type: z.enum(['AUDIO', 'VIDEO', 'IN_PERSON']).default('VIDEO'),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    
    // Filter by user role
    if (user.role === 'CLIENT') {
      where.OR = [
        { userId: user.id },
        { assignedTo: user.id }
      ];
    } else {
      where.OR = [
        { userId: user.id },
        { assignedTo: user.id }
      ];
    }

    if (status) {
      where.status = status;
    }

    const calls = await db.scheduledCall.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
      take: limit,
      skip: offset,
    });

    const total = await db.scheduledCall.count({ where });

    return NextResponse.json({
      calls,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = scheduleCallSchema.parse(body);

    // Convert string date to Date object
    const scheduledFor = new Date(validatedData.scheduledFor);
    
    // Ensure the scheduled time is in the future
    if (scheduledFor <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    // Generate meeting URL for video calls
    let meetingUrl = null;
    if (validatedData.type === 'VIDEO') {
      meetingUrl = `https://meet.jit.si/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    const call = await db.scheduledCall.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        scheduledFor,
        duration: validatedData.duration,
        type: validatedData.type,
        meetingUrl,
        userId: user.id,
        assignedTo: validatedData.assignedTo || null,
        notes: validatedData.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Log activity
    await db.userActivity.create({
      data: {
        userId: user.id,
        action: 'SCHEDULED_CALL',
        resource: 'ScheduledCall',
        metadata: {
          callId: call.id,
          title: call.title,
          scheduledFor: call.scheduledFor,
        },
      },
    });

    return NextResponse.json(call, { status: 201 });
  } catch (error) {
    console.error('Error scheduling call:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to schedule call' },
      { status: 500 }
    );
  }
}
