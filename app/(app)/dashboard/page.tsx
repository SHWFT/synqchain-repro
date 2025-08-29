"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/KpiCard";
import { useProjectsStore } from "@/state/projects.store";
import { useSuppliersStore } from "@/state/suppliers.store";
import { useActivityStore } from "@/state/activity.store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  DollarSign,
  FolderKanban,
  Building2,
  Plus,
  Activity,
  Users,
  Zap,
  BarChart3,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { projects, loadProjects } = useProjectsStore();
  const { suppliers, loadSuppliers } = useSuppliersStore();
  const { activities, loadActivities } = useActivityStore();

  useEffect(() => {
    loadProjects();
    loadSuppliers();
    loadActivities();
  }, [loadProjects, loadSuppliers, loadActivities]);

  // Calculate KPIs
  const totalSpend = projects.reduce((sum, project) => sum + project.baselineSpend, 0);
  const totalSavings = projects.reduce((sum, project) => sum + project.savingsSecured, 0);
  const activeProjects = projects.filter(p => p.status === "in-progress").length;
  const activeSuppliers = suppliers.filter(s => s.status === "active").length;

  const recentActivities = activities.slice(0, 5);
  const recentProjects = projects.slice(0, 3);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your procurement.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => router.push("/projects")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
          <Button variant="outline" onClick={() => router.push("/suppliers")}>
            <Building2 className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Spend Sourced"
          value={formatCurrency(totalSpend)}
          change="+12%"
          changeType="positive"
          icon={DollarSign}
          description="Total procurement spend"
        />
        <KpiCard
          title="Savings Secured"
          value={formatCurrency(totalSavings)}
          change="+8.3%"
          changeType="positive"
          icon={TrendingUp}
          description="Cost optimization achieved"
        />
        <KpiCard
          title="Active Projects"
          value={activeProjects.toString()}
          change="In Progress"
          changeType="neutral"
          icon={FolderKanban}
          description="Currently running projects"
        />
        <KpiCard
          title="Active Suppliers"
          value={activeSuppliers.toString()}
          change={`${suppliers.length} total`}
          changeType="neutral"
          icon={Building2}
          description="Supplier relationships"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates across your procurement projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-blue-600 font-medium">
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/projects")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/suppliers")}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/analytics")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/connector-playground")}
              >
                <Zap className="mr-2 h-4 w-4" />
                Test ERP Connection
              </Button>
            </CardContent>
          </Card>

          {/* Project Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {project.client}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(project.savingsSecured)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        project.status === "in-progress" 
                          ? "bg-blue-100 text-blue-800"
                          : project.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {project.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {recentProjects.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <FolderKanban className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm">No projects yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => router.push("/projects")}
                  >
                    Create your first project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ERP Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-5 w-5" />
            ERP Integration Status
          </CardTitle>
          <CardDescription>
            Real-time status of your ERP connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: "Epicor", status: "Connected", color: "green" },
              { name: "NetSuite", status: "Mock Mode", color: "blue" },
              { name: "SAP S/4HANA", status: "Mock Mode", color: "blue" },
              { name: "Dynamics BC", status: "Mock Mode", color: "blue" },
            ].map((erp) => (
              <div key={erp.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    erp.color === "green" ? "bg-green-500" : "bg-blue-500"
                  }`}></div>
                  <span className="font-medium">{erp.name}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  erp.color === "green" 
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {erp.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}