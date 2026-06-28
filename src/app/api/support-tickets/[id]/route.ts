import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const replySchema = z.object({
  content: z.string().min(1, 'Reply content is required'),
  isInternal: z.boolean().default(false),
});

const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  resolution: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticket = await db.supportTicket.findUnique({
      where: { id: params.id },
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
        replies: {
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
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if user has access to this ticket
    const hasAccess = ticket.userId === user.id || ticket.assignedTo === user.id || user.role !== 'CLIENT';
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticket = await db.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if user can update this ticket
    const canUpdate = ticket.userId === user.id || ticket.assignedTo === user.id || user.role !== 'CLIENT';
    
    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateTicketSchema.parse(body);

    const updateData: any = {};
    
    if (validatedData.status) {
      updateData.status = validatedData.status;
      if (validatedData.status === 'RESOLVED' || validatedData.status === 'CLOSED') {
        updateData.resolvedAt = new Date();
      }
    }
    
    if (validatedData.priority) {
      updateData.priority = validatedData.priority;
    }
    
    if (validatedData.resolution !== undefined) {
      updateData.resolution = validatedData.resolution;
    }

    const updatedTicket = await db.supportTicket.update({
      where: { id: params.id },
      data: updateData,
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
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    // Log activity
    await db.userActivity.create({
      data: {
        userId: user.id,
        action: 'UPDATED_SUPPORT_TICKET',
        resource: 'SupportTicket',
        metadata: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          changes: validatedData,
        },
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticket = await db.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if user can reply to this ticket
    const canReply = ticket.userId === user.id || ticket.assignedTo === user.id || user.role !== 'CLIENT';
    
    if (!canReply) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = replySchema.parse(body);

    const reply = await db.supportReply.create({
      data: {
        ticketId: params.id,
        userId: user.id,
        content: validatedData.content,
        isInternal: validatedData.isInternal && (user.role !== 'CLIENT'), // Only non-clients can create internal replies
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
      },
    });

    // Update ticket status if needed
    if (user.role === 'CLIENT' && ticket.status === 'PENDING_CUSTOMER') {
      await db.supportTicket.update({
        where: { id: params.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // Log activity
    await db.userActivity.create({
      data: {
        userId: user.id,
        action: 'REPLIED_TO_SUPPORT_TICKET',
        resource: 'SupportTicket',
        metadata: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          replyId: reply.id,
          isInternal: reply.isInternal,
        },
      },
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error('Error adding reply:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add reply' },
      { status: 500 }
    );
  }
}
