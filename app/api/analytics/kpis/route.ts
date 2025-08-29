import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/server/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");

    const db = getDB();

    // Build date filter
    let dateFilter = "";
    const params: any[] = [];
    
    if (start) {
      dateFilter += " AND createdAt >= ?";
      params.push(start);
    }
    
    if (end) {
      dateFilter += " AND createdAt <= ?";
      params.push(end);
    }

    // Get counts
    const activeProjects = db.prepare(`
      SELECT COUNT(*) as count 
      FROM projects 
      WHERE status IN ('In Progress', 'Planning') ${dateFilter}
    `).get(...params) as { count: number };

    const activePOs = db.prepare(`
      SELECT COUNT(*) as count 
      FROM purchase_orders 
      WHERE status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED') ${dateFilter}
    `).get(...params) as { count: number };

    const totalSpend = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total 
      FROM purchase_orders 
      WHERE status NOT IN ('DRAFT') ${dateFilter}
    `).get(...params) as { total: number };

    const platformSavings = db.prepare(`
      SELECT COALESCE(SUM(savingsTarget), 0) as savings 
      FROM projects 
      WHERE status = 'Completed' ${dateFilter}
    `).get(...params) as { savings: number };

    // Get monthly data for charts
    const monthlyProjects = db.prepare(`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        COUNT(*) as count
      FROM projects 
      WHERE status = 'Completed' ${dateFilter}
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month DESC
      LIMIT 12
    `).all(...params) as { month: string; count: number }[];

    const monthlySavings = db.prepare(`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        COALESCE(SUM(savingsTarget), 0) as savings
      FROM projects 
      WHERE status = 'Completed' ${dateFilter}
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month DESC
      LIMIT 12
    `).all(...params) as { month: string; savings: number }[];

    return NextResponse.json({
      cards: {
        activeProjects: activeProjects.count,
        activePOs: activePOs.count,
        totalSpend: totalSpend.total,
        platformSavings: platformSavings.savings,
      },
      series: {
        projectsCompletedMonthly: {
          labels: monthlyProjects.map(p => formatMonthLabel(p.month)),
          values: monthlyProjects.map(p => p.count),
        },
        savingsMonthly: {
          labels: monthlySavings.map(s => formatMonthLabel(s.month)),
          values: monthlySavings.map(s => s.savings),
        },
      },
    });
  } catch (error) {
    console.error("Error getting analytics KPIs:", error);
    return NextResponse.json(
      { error: "Failed to get analytics data" },
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
