import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FolderKanban, Clock, TestTube, DollarSign, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function Dashboard() {
  const kpiData = [
    { title: "Total Projects", value: "12", icon: FolderKanban, color: "text-teal-600", bg: "bg-teal-50" },
    { title: "Total Dev Hours", value: "2,450", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Total QA Hours", value: "980", icon: TestTube, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Total Cost", value: "$128,500", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
  ];

  const burnupData = [
    { week: "Week 1", planned: 100, actual: 85 },
    { week: "Week 2", planned: 200, actual: 190 },
    { week: "Week 3", planned: 300, actual: 280 },
    { week: "Week 4", planned: 400, actual: 390 },
    { week: "Week 5", planned: 500, actual: 480 },
    { week: "Week 6", planned: 600, actual: 580 },
  ];

  const timeDistribution = [
    { name: "Development", value: 2450, color: "#0d9488" },
    { name: "QA Testing", value: 980, color: "#3b82f6" },
  ];

  const recentActivity = [
    { user: "POA Agent", action: "Created new epic 'User Authentication'", time: "2 hours ago", type: "create" },
    { user: "Sarah Chen", action: "Updated story DEV-123 estimates", time: "3 hours ago", type: "update" },
    { user: "POA Agent", action: "Generated acceptance criteria for 5 stories", time: "5 hours ago", type: "generate" },
    { user: "Mike Johnson", action: "Completed task 'Setup CI/CD pipeline'", time: "6 hours ago", type: "complete" },
    { user: "Emily Davis", action: "Added QA hours to story QA-456", time: "1 day ago", type: "update" },
    { user: "POA Agent", action: "Created sprint plan for Sprint 12", time: "1 day ago", type: "create" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your projects and team performance</p>
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={burnupData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="planned" stroke="#94a3b8" strokeWidth={2} name="Planned" />
                <Line type="monotone" dataKey="actual" stroke="#0d9488" strokeWidth={2} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-600" />
              Dev vs QA Hours
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
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  activity.type === "create" ? "bg-teal-500" :
                  activity.type === "update" ? "bg-blue-500" :
                  activity.type === "generate" ? "bg-purple-500" :
                  "bg-green-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p>
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
