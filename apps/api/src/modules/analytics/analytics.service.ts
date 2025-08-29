import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface KpisResponse {
  cards: {
    activeProjects: number;
    activePOs: number;
    totalSpend: number;
    platformSavings: number;
  };
  series: {
    projectsCompletedMonthly: {
      labels: string[];
      values: number[];
    };
    savingsMonthly: {
      labels: string[];
      values: number[];
    };
  };
}

@Injectable()
export class AnalyticsService {
  private cache = new Map<string, { data: KpisResponse; expiry: number }>();
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds

  constructor(private readonly prisma: PrismaService) {}

  async getKpis(tenantId: string, startDate?: string, endDate?: string): Promise<KpisResponse> {
    const cacheKey = `kpis-${tenantId}-${startDate}-${endDate}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
    const end = endDate ? new Date(endDate) : new Date();

    // Get totals
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalPOs,
      activePOs,
      totalSpend,
      platformSavings
    ] = await Promise.all([
      this.prisma.project.count({ where: { tenantId } }),
      this.prisma.project.count({ 
        where: { 
          tenantId, 
          status: { in: ['In Progress', 'Planning'] } 
        } 
      }),
      this.prisma.project.count({ 
        where: { 
          tenantId, 
          status: 'Completed' 
        } 
      }),
      this.prisma.purchaseOrder.count({ where: { tenantId } }),
      this.prisma.purchaseOrder.count({ 
        where: { 
          tenantId, 
          status: { 
            in: ['PENDING_APPROVAL', 'APPROVED', 'ACKNOWLEDGED', 'IN_FULFILLMENT'] 
          } 
        } 
      }),
      this.prisma.purchaseOrder.aggregate({
        where: { tenantId },
        _sum: { total: true }
      }),
      this.prisma.project.aggregate({
        where: { 
          tenantId,
          status: 'Completed'
        },
        _sum: { savingsTarget: true }
      })
    ]);

    // Get monthly data for charts
    const monthlyProjects = await this.getMonthlyProjectsCompleted(tenantId, start, end);
    const monthlySavings = await this.getMonthlySavings(tenantId, start, end);
    const monthlySpend = await this.getMonthlySpend(tenantId, start, end);

    const result: KpisResponse = {
      cards: {
        activeProjects,
        activePOs,
        totalSpend: Number(totalSpend._sum.total) || 0,
        platformSavings: platformSavings._sum.savingsTarget || 0,
      },
      series: {
        projectsCompletedMonthly: {
          labels: monthlyProjects.map(p => this.formatMonthLabel(p.month)),
          values: monthlyProjects.map(p => p.count),
        },
        savingsMonthly: {
          labels: monthlySavings.map(s => this.formatMonthLabel(s.month)),
          values: monthlySavings.map(s => s.savings),
        },
      },
    };

    // Cache the result
    this.cache.set(cacheKey, {
      data: result,
      expiry: Date.now() + this.CACHE_TTL,
    });

    return result;
  }

  private async getMonthlyProjectsCompleted(tenantId: string, start: Date, end: Date) {
    const projects = await this.prisma.project.findMany({
      where: {
        tenantId,
        status: 'Completed',
        updatedAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        updatedAt: true,
      },
    });

    // Group by month
    const monthlyData = new Map<string, number>();
    
    projects.forEach(project => {
      const monthKey = project.updatedAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
    });

    // Convert to array format for Chart.js
    return Array.from(monthlyData.entries()).map(([month, count]) => ({
      month,
      count,
    }));
  }

  private async getMonthlySavings(tenantId: string, start: Date, end: Date) {
    const projects = await this.prisma.project.findMany({
      where: {
        tenantId,
        status: 'Completed',
        updatedAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        updatedAt: true,
        savingsTarget: true,
      },
    });

    // Group by month
    const monthlyData = new Map<string, number>();
    
    projects.forEach(project => {
      const monthKey = project.updatedAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + (project.savingsTarget || 0));
    });

    // Convert to array format for Chart.js
    return Array.from(monthlyData.entries()).map(([month, savings]) => ({
      month,
      savings,
    }));
  }

  private async getMonthlySpend(tenantId: string, start: Date, end: Date) {
    const pos = await this.prisma.purchaseOrder.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    // Group by month
    const monthlyData = new Map<string, number>();
    
    pos.forEach(po => {
      const monthKey = po.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + Number(po.total));
    });

    // Convert to array format for Chart.js
    return Array.from(monthlyData.entries()).map(([month, spend]) => ({
      month,
      spend,
    }));
  }

  private formatMonthLabel(monthString: string): string {
    // Convert YYYY-MM to "MMM YYYY" format
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
