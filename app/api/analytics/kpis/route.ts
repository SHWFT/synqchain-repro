import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/server/db';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');

    const db = getDB();

    // Build date filter
    let dateFilter = '';
    const params: string[] = [];

    if (start) {
      dateFilter += ' AND createdAt >= ?';
      params.push(start);
    }

    if (end) {
      dateFilter += ' AND createdAt <= ?';
      params.push(end);
    }

    // Get counts (using existing DB schema)
    const activeProjects = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM suppliers 
      WHERE status = 'Active' ${dateFilter}
    `
      )
      .get(...params) as { count: number };

    const activePOs = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM [Order]
      WHERE status IN ('PENDING', 'APPROVED', 'IN_PROGRESS') ${dateFilter}
    `
      )
      .get(...params) as { count: number };

    const totalSpend = db
      .prepare(
        `
      SELECT COALESCE(SUM(totalValue), 0) as total 
      FROM [Order]
      WHERE status NOT IN ('DRAFT') ${dateFilter}
    `
      )
      .get(...params) as { total: number };

    // Mock platform savings since we don't have a projects table with savings
    const platformSavings = { savings: 125000 };

    // Get monthly data for charts (mock data for demo)
    const monthlyProjects = [
      { month: '2024-01', count: 5 },
      { month: '2024-02', count: 8 },
      { month: '2024-03', count: 12 },
      { month: '2024-04', count: 7 },
      { month: '2024-05', count: 15 },
      { month: '2024-06', count: 10 },
    ];

    const monthlySavings = [
      { month: '2024-01', savings: 15000 },
      { month: '2024-02', savings: 22000 },
      { month: '2024-03', savings: 18000 },
      { month: '2024-04', savings: 25000 },
      { month: '2024-05', savings: 30000 },
      { month: '2024-06', savings: 15000 },
    ];

    return NextResponse.json({
      cards: {
        activeProjects: activeProjects.count,
        activePOs: activePOs.count,
        totalSpend: totalSpend.total,
        platformSavings: platformSavings.savings,
      },
      series: {
        projectsCompletedMonthly: {
          labels: monthlyProjects.map((p) => formatMonthLabel(p.month)),
          values: monthlyProjects.map((p) => p.count),
        },
        savingsMonthly: {
          labels: monthlySavings.map((s) => formatMonthLabel(s.month)),
          values: monthlySavings.map((s) => s.savings),
        },
      },
    });
  } catch (error) {
    console.error('Error getting analytics KPIs:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics data' },
      { status: 500 }
    );
  }
}

function formatMonthLabel(monthString: string): string {
  // Convert YYYY-MM to "MMM YYYY" format
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
