"use client";

import { useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectsStore } from "@/state/projects.store";
import { useSuppliersStore } from "@/state/suppliers.store";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#007BFF", "#00C6AE", "#0A1A2F", "#64748b", "#f59e0b"];

export default function AnalyticsPage() {
  const { projects, loadProjects } = useProjectsStore();
  const { suppliers, loadSuppliers } = useSuppliersStore();

  useEffect(() => {
    loadProjects();
    loadSuppliers();
  }, [loadProjects, loadSuppliers]);

  // Spend vs Savings data for area chart
  const spendVsSavingsData = useMemo(() => {
    return projects.map((project, index) => ({
      name: project.name.substring(0, 15) + (project.name.length > 15 ? "..." : ""),
      spend: project.baselineSpend,
      savings: project.savingsSecured,
      month: `Month ${index + 1}`,
    }));
  }, [projects]);

  // Savings by status for bar chart
  const savingsByStatusData = useMemo(() => {
    const statusGroups = projects.reduce((acc, project) => {
      const status = project.status;
      if (!acc[status]) {
        acc[status] = { status: status.replace("-", " "), savings: 0, count: 0 };
      }
      acc[status].savings += project.savingsSecured;
      acc[status].count += 1;
      return acc;
    }, {} as Record<string, { status: string; savings: number; count: number }>);

    return Object.values(statusGroups);
  }, [projects]);

  // Suppliers by region for pie chart
  const suppliersByRegionData = useMemo(() => {
    const regionGroups = suppliers.reduce((acc, supplier) => {
      const region = supplier.region || "Unknown";
      if (!acc[region]) {
        acc[region] = { region, count: 0 };
      }
      acc[region].count += 1;
      return acc;
    }, {} as Record<string, { region: string; count: number }>);

    return Object.values(regionGroups);
  }, [suppliers]);

  const totalSpend = projects.reduce((sum, p) => sum + p.baselineSpend, 0);
  const totalSavings = projects.reduce((sum, p) => sum + p.savingsSecured, 0);
  const savingsRate = totalSpend > 0 ? (totalSavings / totalSpend) * 100 : 0;

  if (projects.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Visualize your procurement performance and savings
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground">No data available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create some projects to see analytics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Visualize your procurement performance and savings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpend)}</div>
            <p className="text-sm text-muted-foreground">
              Across {projects.length} projects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSavings)}</div>
            <p className="text-sm text-muted-foreground">
              {savingsRate.toFixed(1)}% savings rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.filter(s => s.status === "active").length}
            </div>
            <p className="text-sm text-muted-foreground">
              of {suppliers.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spend vs Savings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spend vs Savings by Project</CardTitle>
            <CardDescription>
              Comparison of baseline spend and secured savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={spendVsSavingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  labelStyle={{ color: "#000" }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stackId="1"
                  stroke="#007BFF"
                  fill="#007BFF"
                  fillOpacity={0.6}
                  name="Baseline Spend"
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stackId="2"
                  stroke="#00C6AE"
                  fill="#00C6AE"
                  fillOpacity={0.6}
                  name="Savings Secured"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Savings by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Savings by Project Status</CardTitle>
            <CardDescription>
              Total savings secured by project status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={savingsByStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="status" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Savings"]}
                  labelStyle={{ color: "#000" }}
                />
                <Bar dataKey="savings" fill="#007BFF" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Suppliers by Region */}
        <Card>
          <CardHeader>
            <CardTitle>Suppliers by Region</CardTitle>
            <CardDescription>
              Distribution of suppliers across regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={suppliersByRegionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ region, count }) => `${region}: ${count}`}
                >
                  {suppliersByRegionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Project Performance</CardTitle>
            <CardDescription>
              Savings efficiency by project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project) => {
                const efficiency = project.baselineSpend > 0 
                  ? (project.savingsSecured / project.baselineSpend) * 100 
                  : 0;
                
                return (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.client}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(project.savingsSecured)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {efficiency.toFixed(1)}% efficiency
                        </p>
                      </div>
                      <div className="w-16 h-2 bg-muted rounded-full">
                        <div 
                          className="h-2 bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min(efficiency, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}






