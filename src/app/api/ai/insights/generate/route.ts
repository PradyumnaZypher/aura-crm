import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiService } from '@/lib/ai-service';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const generateSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required")
});

const fetchSchema = z.object({
  leadId: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20')
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

    const parsed = generateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { leadId } = parsed.data;

    // Generate AI insights for the lead
    const insights = await aiService.generateLeadInsights(leadId);

    // Save insights to database
    const savedInsights = await Promise.all([
      // Sentiment insight
      db.aIInsight.create({
        data: {
          leadId,
          type: 'SENTIMENT',
          content: `Overall sentiment: ${insights.sentiment}`,
          confidence: 0.8,
          metadata: {
            source: 'ai_analysis',
            sentiment: insights.sentiment,
            interestLevel: insights.interestLevel
          }
        }
      }),

      // Risk factors insight
      ...(insights.riskFactors.length > 0 ? [
        db.aIInsight.create({
          data: {
            leadId,
            type: 'RISK',
            content: `Risk factors: ${insights.riskFactors.join(', ')}`,
            confidence: 0.7,
            metadata: {
              source: 'ai_analysis',
              riskFactors: insights.riskFactors
            }
          }
        })
      ] : []),

      // Opportunities insight
      ...(insights.opportunities.length > 0 ? [
        db.aIInsight.create({
          data: {
            leadId,
            type: 'OPPORTUNITY',
            content: `Opportunities: ${insights.opportunities.join(', ')}`,
            confidence: 0.7,
            metadata: {
              source: 'ai_analysis',
              opportunities: insights.opportunities
            }
          }
        })
      ] : []),

      // Recommendations insight
      ...(insights.recommendations.length > 0 ? [
        db.aIInsight.create({
          data: {
            leadId,
            type: 'BEHAVIOR',
            content: `Recommendations: ${insights.recommendations.join(', ')}`,
            confidence: 0.8,
            metadata: {
              source: 'ai_analysis',
              recommendations: insights.recommendations
            }
          }
        })
      ] : [])
    ]);

    // Log user activity
    await db.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'AI_INSIGHTS_GENERATED',
        resource: `Lead: ${leadId}`,
        metadata: {
          insightsCount: savedInsights.length,
          sentiment: insights.sentiment,
          interestLevel: insights.interestLevel
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        insights,
        savedInsights: savedInsights.map(insight => ({
          id: insight.id,
          type: insight.type,
          content: insight.content,
          confidence: insight.confidence,
          metadata: insight.metadata,
          createdAt: insight.createdAt
        })),
        message: 'AI insights generated successfully'
      }
    });

  } catch (error) {
    console.error('AI Insights Generation Error:', error);
    return NextResponse.json({
      error: 'Failed to generate AI insights',
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

    const searchParams = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = fetchSchema.safeParse(searchParams);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { leadId, type, page: pageStr, limit: limitStr } = parsed.data;
    const page = parseInt(pageStr, 10);
    const limit = parseInt(limitStr, 10);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (leadId) {
      where.leadId = leadId;
    }

    if (type) {
      where.type = type;
    }

    // Get insights with lead information
    const [insights, total] = await Promise.all([
      db.aIInsight.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.aIInsight.count({ where })
    ]);

    const formattedInsights = insights.map(insight => ({
      id: insight.id,
      lead: {
        id: insight.lead.id,
        name: `${insight.lead.firstName} ${insight.lead.lastName}`,
        company: insight.lead.company
      },
      type: insight.type,
      content: insight.content,
      confidence: insight.confidence,
      metadata: insight.metadata,
      createdAt: insight.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        insights: formattedInsights,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('AI Insights Fetch Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch AI insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}