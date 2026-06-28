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
    const timeframe = searchParams.get('timeframe') || '7d';

    // Calculate date range
    const startDate = new Date();
    switch (timeframe) {
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get call analytics
    const [
      totalCalls,
      completedCalls,
      failedCalls,
      averageDuration,
      sentimentData,
      purposeData,
      dailyStats,
      recentCalls
    ] = await Promise.all([
      // Total calls
      db.aICall.count({
        where: {
          initiatedBy: session.user.id,
          createdAt: { gte: startDate }
        }
      }),

      // Completed calls
      db.aICall.count({
        where: {
          initiatedBy: session.user.id,
          createdAt: { gte: startDate },
          status: 'COMPLETED'
        }
      }),

      // Failed calls
      db.aICall.count({
        where: {
          initiatedBy: session.user.id,
          createdAt: { gte: startDate },
          status: { in: ['FAILED', 'BUSY', 'NO_ANSWER'] }
        }
      }),

      // Average duration
      db.aICall.aggregate({
        where: {
          initiatedBy: session.user.id,
          createdAt: { gte: startDate },
          duration: { not: null }
        },
        _avg: {
          duration: true
        }
      }),

      // Sentiment breakdown
      db.aICall.groupBy({
        by: ['sentiment'],
        where: {
          initiatedBy: session.user.id,
          createdAt: { gte: startDate },
          sentiment: { not: null }
        },
        _count: {
          sentiment: true
        }
      }),

      // Purpose breakdown
      db.aICall.groupBy({
        by: ['purpose'],
        where: {
          initiatedBy: session.user.id,
          createdAt: { gte: startDate }
        },
        _count: {
          purpose: true
        }
      }),

      // Daily stats
      db.$queryRaw`
        SELECT 
          DATE(createdAt) as date,
          COUNT(*) as total_calls,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_calls,
          AVG(CASE WHEN duration IS NOT NULL THEN duration END) as avg_duration
        FROM ai_calls 
        WHERE initiatedBy = ${session.user.id}
          AND createdAt >= ${startDate}
        GROUP BY DATE(createdAt)
        ORDER BY date DESC
        LIMIT 30
      ` as Array<{
        date: string;
        total_calls: number;
        completed_calls: number;
        avg_duration: number | null;
      }>,

      // Recent calls for context
      db.aICall.findMany({
        where: {
          initiatedBy: session.user.id,
          createdAt: { gte: startDate }
        },
        include: {
          lead: {
            select: {
              firstName: true,
              lastName: true,
              company: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Calculate success rate
    const successRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0;

    // Format sentiment data
    const sentimentBreakdown = sentimentData.reduce((acc, item) => {
      acc[item.sentiment || 'unknown'] = item._count.sentiment;
      return acc;
    }, {} as Record<string, number>);

    // Format purpose data
    const purposeBreakdown = purposeData.reduce((acc, item) => {
      acc[item.purpose] = item._count.purpose;
      return acc;
    }, {} as Record<string, number>);

    // Format daily stats
    const formattedDailyStats = dailyStats.map(stat => ({
      date: stat.date,
      totalCalls: Number(stat.total_calls),
      completedCalls: Number(stat.completed_calls),
      avgDuration: stat.avg_duration ? Number(stat.avg_duration) : 0
    }));

    // Format recent calls
    const formattedRecentCalls = recentCalls.map(call => ({
      id: call.id,
      leadName: `${call.lead.firstName} ${call.lead.lastName}`,
      company: call.lead.company,
      purpose: call.purpose,
      status: call.status,
      duration: call.duration,
      sentiment: call.sentiment,
      createdAt: call.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCalls,
          completedCalls,
          failedCalls,
          successRate: Math.round(successRate * 100) / 100,
          averageDuration: averageDuration._avg.duration 
            ? Math.round(averageDuration._avg.duration) 
            : 0
        },
        breakdowns: {
          sentiment: sentimentBreakdown,
          purpose: purposeBreakdown
        },
        dailyStats: formattedDailyStats,
        recentCalls: formattedRecentCalls,
        timeframe
      }
    });

  } catch (error) {
    console.error('Call Analytics Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch call analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}