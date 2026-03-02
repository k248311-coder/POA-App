import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Clock } from "lucide-react";

export function TeamMemberReports({ projectId: _projectId }: { projectId: string }) {
  const hoursPerStory = [
    { name: "User Login API", hours: 8, color: "#0d9488" },
    { name: "Login UI Component", hours: 5, color: "#3b82f6" },
    { name: "Password Reset", hours: 14, color: "#a855f7" },
    { name: "Database Setup", hours: 8, color: "#f59e0b" },
  ];

  const progressData = [
    { week: "Week 1", planned: 20, actual: 18 },
    { week: "Week 2", planned: 40, actual: 38 },
    { week: "Week 3", planned: 60, actual: 55 },
    { week: "Week 4", planned: 80, actual: 75 },
    { week: "Week 5", planned: 100, actual: 95 },
  ];

  const weeklyHours = [
    { week: "W1", hours: 18 },
    { week: "W2", hours: 20 },
    { week: "W3", hours: 17 },
    { week: "W4", hours: 20 },
    { week: "W5", hours: 20 },
    { week: "W6", hours: 22 },
    { week: "W7", hours: 19 },
    { week: "W8", hours: 24 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>My Reports</h1>
        <p className="text-gray-600 mt-1">View your personal performance and progress</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Total Hours Logged</p>
            <h2 className="mt-2">156h</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Stories Completed</p>
            <h2 className="mt-2">5</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Avg Hours/Week</p>
            <h2 className="mt-2">20h</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Efficiency</p>
            <h2 className="mt-2">95%</h2>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logged Hours Per Story */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-600" />
              Hours Per Story
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={hoursPerStory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, hours }) => `${name.split(' ')[0]}: ${hours}h`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {hoursPerStory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Personal Progress Burnup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              Personal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="planned"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  name="Planned"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#0d9488"
                  strokeWidth={2}
                  name="Actual"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Hours Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-teal-600" />
            Weekly Hours Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Hours Logged"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4>This Month</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stories Completed</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hours Logged</span>
                  <span className="font-medium">80h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stories In Progress</span>
                  <span className="font-medium">2</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4>All Time</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Stories Completed</span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Hours Logged</span>
                  <span className="font-medium">456h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average Story Completion</span>
                  <span className="font-medium">19.8h</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
