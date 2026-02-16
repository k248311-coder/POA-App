import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FolderKanban, Clock, TestTube, DollarSign, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getProjectDashboard } from "../lib/api";
import type { ProjectSummary, ProjectDashboard } from "../types/api";
import { formatDistanceToNow } from "date-fns";

interface DashboardProps {
  project: ProjectSummary;
}

function formatCost(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export function Dashboard({ project }: DashboardProps) {
  const [data, setData] = useState<ProjectDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getProjectDashboard(project.id, ac.signal);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load dashboard data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [project.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your project and team performance</p>
        </div>
        <div className="flex items-center justify-center py-12 text-gray-500">Loading dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your project and team performance</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const kpiData = [
    { title: "Total Stories", value: String(data.totalStories), icon: FolderKanban, color: "text-teal-600", bg: "bg-teal-50" },
    { title: "Total Dev Hours", value: data.totalDevHours.toLocaleString("en-US", { maximumFractionDigits: 0 }), icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Total QA Hours", value: data.totalQAHours.toLocaleString("en-US", { maximumFractionDigits: 0 }), icon: TestTube, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Total Cost", value: formatCost(data.totalCost), icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
  ];

  let timeDistribution = [
    { name: "Development", value: data.totalDevHours || 1, color: "#0d9488" },
    { name: "QA Testing", value: data.totalQAHours || 0, color: "#3b82f6" },
  ].filter((d) => d.value > 0);
  if (timeDistribution.length === 0) {
    timeDistribution = [{ name: "No hours yet", value: 1, color: "#94a3b8" }];
  }

  const burnupByWeek = data.burnupData;
  const recentActivity = data.recentActivity.map((a) => ({
    user: a.userName,
    action: a.action,
    time: formatDistanceToNow(new Date(a.createdAtIso), { addSuffix: true }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of {project.name}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{kpi.title}</p>
                    <h2 className="mt-2">{kpi.value}</h2>
                  </div>
                  <div className={`${kpi.bg} ${kpi.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Burnup Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              Burnup Chart
            </CardTitle>
          </CardHeader>
          <CardContent>
            {burnupByWeek.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={burnupByWeek}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="planned" stroke="#94a3b8" strokeWidth={2} name="Planned (total tasks)" />
                  <Line type="monotone" dataKey="actual" stroke="#0d9488" strokeWidth={2} name="Completed" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">No task data yet for burnup chart</div>
            )}
          </CardContent>
        </Card>

        {/* Time Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-600" />
              Dev vs QA Hours (estimated)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={timeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-teal-500" />
                  <div className="flex-1 min-w-0">
                    <p>
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent work log activity.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
