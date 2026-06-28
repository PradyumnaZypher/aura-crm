import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build the where clause for interactions
    const where: any = {};

    if (user.role === 'CLIENT') {
      // Clients can see their own activities and their assigned interactions
      where.OR = [
        { userId: user.id },
        { 
          lead: { 
            assignedTo: user.id 
          } 
        }
      ];
    }

    // Get various types of interactions
    const [userActivities, leadInteractions, scheduledCalls, messages] = await Promise.all([
      // User activities
      db.userActivity.findMany({
        where: {
          userId: user.id,
          ...(type && { action: { contains: type.toUpperCase() } }),
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
        orderBy: {
          createdAt: 'desc',
        },
        take: Math.ceil(limit / 4),
        skip: Math.ceil(offset / 4),
      }),

      // Lead interactions
      db.leadInteraction.findMany({
        where: {
          userId: user.id,
          ...(type && { type: type.toUpperCase() as any }),
        },
        include: {
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              company: true,
            },
          },
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
          createdAt: 'desc',
        },
        take: Math.ceil(limit / 4),
        skip: Math.ceil(offset / 4),
      }),

      // Scheduled calls
      db.scheduledCall.findMany({
        where: {
          OR: [
            { userId: user.id },
            { assignedTo: user.id }
          ],
          ...(type && { type: type.toUpperCase() as any }),
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
        orderBy: {
          createdAt: 'desc',
        },
        take: Math.ceil(limit / 4),
        skip: Math.ceil(offset / 4),
      }),

      // Messages
      db.message.findMany({
        where: {
          OR: [
            { senderId: user.id },
            { receiverId: user.id }
          ],
          ...(type && { type: type.toUpperCase() as any }),
        },
        include: {
          sender: {
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
          receiver: {
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
          createdAt: 'desc',
        },
        take: Math.ceil(limit / 4),
        skip: Math.ceil(offset / 4),
      }),
    ]);

    // Combine and format all interactions
    const allInteractions = [
      ...userActivities.map(activity => ({
        id: activity.id,
        type: 'activity',
        action: activity.action,
        resource: activity.resource,
        title: activity.action.replace(/_/g, ' ').toLowerCase(),
        description: `Performed ${activity.action.replace(/_/g, ' ').toLowerCase()}`,
        metadata: activity.metadata,
        user: activity.user,
        createdAt: activity.createdAt,
        timestamp: activity.createdAt.toISOString(),
      })),

      ...leadInteractions.map(interaction => ({
        id: interaction.id,
        type: 'lead_interaction',
        action: interaction.type,
        resource: 'Lead',
        title: `${interaction.type.toLowerCase()} with ${interaction.lead?.firstName || 'Lead'} ${interaction.lead?.lastName || ''}`,
        description: interaction.summary || `${interaction.type.toLowerCase()} - ${interaction.direction.toLowerCase()}`,
        metadata: {
          leadId: interaction.leadId,
          direction: interaction.direction,
          duration: interaction.duration,
          ...interaction.metadata,
        },
        user: interaction.user,
        lead: (interaction as any).lead,
        createdAt: interaction.createdAt,
        timestamp: interaction.createdAt.toISOString(),
      })),

      ...scheduledCalls.map(call => ({
        id: call.id,
        type: 'scheduled_call',
        action: 'SCHEDULED_CALL',
        resource: 'Call',
        title: call.title,
        description: `${call.type.toLowerCase()} call scheduled for ${new Date(call.scheduledFor).toLocaleDateString()}`,
        metadata: {
          scheduledFor: call.scheduledFor,
          duration: call.duration,
          type: call.type,
          status: call.status,
          meetingUrl: call.meetingUrl,
        },
        user: call.user,
        assignee: (call as any).assignee,
        createdAt: call.createdAt,
        timestamp: call.createdAt.toISOString(),
      })),

      ...messages.map(message => ({
        id: message.id,
        type: 'message',
        action: 'SENT_MESSAGE',
        resource: 'Message',
        title: message.subject || `${message.type.toLowerCase()} message`,
        description: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
        metadata: {
          type: message.type,
          direction: message.direction,
          status: message.status,
          subject: message.subject,
        },
        sender: (message as any).sender,
        receiver: (message as any).receiver,
        createdAt: message.createdAt,
        timestamp: message.createdAt.toISOString(),
      })),
    ];

    // Sort by timestamp (most recent first)
    allInteractions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const paginatedInteractions = allInteractions.slice(offset, offset + limit);

    return NextResponse.json({
      interactions: paginatedInteractions,
      pagination: {
        total: allInteractions.length,
        limit,
        offset,
        hasMore: offset + limit < allInteractions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, description, duration, metadata, scheduledFor } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      );
    }

    let interaction;

    switch (type.toLowerCase()) {
      case 'call':
        // Create a scheduled call
        interaction = await db.scheduledCall.create({
          data: {
            title,
            type: 'AUDIO',
            scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
            duration: duration || 30,
            status: 'SCHEDULED',
            userId: user.id,
            assignedTo: user.id,
            metadata: metadata || {},
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
        break;

      case 'email':
        // Create a message
        interaction = await db.message.create({
          data: {
            content: description || '',
            subject: title,
            type: 'EMAIL',
            direction: 'OUTBOUND',
            status: 'SENT',
            senderId: user.id,
            receiverId: user.id, // For demo purposes, sending to self
            metadata: metadata || {},
          },
          include: {
            sender: {
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
            receiver: {
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
        break;

      case 'meeting':
        // Create a scheduled call for meeting
        interaction = await db.scheduledCall.create({
          data: {
            title,
            type: 'MEETING' as any,
            scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
            duration: duration || 60,
            status: 'SCHEDULED',
            userId: user.id,
            assignedTo: user.id,
            metadata: metadata || {},
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
        break;

      case 'note':
      default:
        // Create a user activity
        interaction = await db.userActivity.create({
          data: {
            action: 'NOTE_CREATED',
            resource: 'Interaction',
            userId: user.id,
            metadata: {
              title,
              description,
              ...metadata,
            },
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
        break;
    }

    // Log the activity
    await db.userActivity.create({
      data: {
        userId: user.id,
        action: 'INTERACTION_CREATED',
        resource: 'Interaction',
        metadata: {
          type,
          title,
          interactionId: interaction.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      interaction: {
        id: interaction.id,
        type: type.toLowerCase(),
        title,
        description,
        duration,
        metadata,
        createdAt: interaction.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating interaction:', error);
    return NextResponse.json(
      { error: 'Failed to create interaction' },
      { status: 500 }
    );
  }
}