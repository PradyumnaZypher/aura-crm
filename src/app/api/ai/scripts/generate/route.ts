import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiService } from '@/lib/ai-service';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { purpose, leadId, customInstructions } = await request.json();

    if (!purpose) {
      return NextResponse.json({ error: 'Purpose is required' }, { status: 400 });
    }

    // Get lead context if leadId is provided
    let leadContext = null;
    if (leadId) {
      const lead = await db.lead.findUnique({
        where: { id: leadId },
        include: {
          interactions: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (lead) {
        leadContext = {
          name: `${lead.firstName} ${lead.lastName}`,
          company: lead.company,
          status: lead.status,
          priority: lead.priority,
          previousInteractions: lead.interactions
        };
      }
    }

    // Generate AI script
    const script = await aiService.generateCallScript(
      purpose,
      leadContext || {},
      customInstructions
    );

    // Save script as template if requested
    let savedTemplate = null;
    const { searchParams } = new URL(request.url);
    if (searchParams.get('saveAsTemplate') === 'true') {
      const templateName = `${purpose} Template - ${new Date().toLocaleDateString()}`;
      
      savedTemplate = await db.aITemplate.create({
        data: {
          name: templateName,
          type: 'CALL_SCRIPT',
          category: purpose,
          content: script,
          variables: leadContext ? JSON.stringify(leadContext) : null,
          createdBy: session.user.id
        }
      });
    }

    // Log user activity
    await db.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'AI_SCRIPT_GENERATED',
        resource: `Script: ${purpose}`,
        metadata: {
          purpose,
          leadId,
          customInstructions,
          savedAsTemplate: !!savedTemplate
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        script,
        purpose,
        leadContext,
        savedTemplate,
        message: 'AI script generated successfully'
      }
    });

  } catch (error) {
    console.error('AI Script Generation Error:', error);
    return NextResponse.json({
      error: 'Failed to generate AI script',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'CALL_SCRIPT';
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
      type: type as any
    };

    if (category) {
      where.category = category;
    }

    // Get templates
    const [templates, total] = await Promise.all([
      db.aITemplate.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.aITemplate.count({ where })
    ]);

    const formattedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      type: template.type,
      category: template.category,
      content: template.content,
      variables: template.variables,
      createdAt: template.createdAt,
      creator: template.creator
    }));

    return NextResponse.json({
      success: true,
      data: {
        templates: formattedTemplates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('AI Templates Fetch Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch AI templates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}