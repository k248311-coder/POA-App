import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FileText, Download, Clock } from "lucide-react";

export function ReportsPage({ projectId: _projectId }: { projectId: string }) {
  const burndownData = [
    { day: "Day 1", remaining: 500, ideal: 500 },
    { day: "Day 2", remaining: 475, ideal: 450 },
    { day: "Day 3", remaining: 440, ideal: 400 },
    { day: "Day 4", remaining: 390, ideal: 350 },
    { day: "Day 5", remaining: 350, ideal: 300 },
    { day: "Day 6", remaining: 310, ideal: 250 },
    { day: "Day 7", remaining: 270, ideal: 200 },
    { day: "Day 8", remaining: 230, ideal: 150 },
    { day: "Day 9", remaining: 180, ideal: 100 },
    { day: "Day 10", remaining: 120, ideal: 50 },
  ];

  const ganttData = [
    { task: "Sprint Planning", start: 0, duration: 2 },
    { task: "User Authentication", start: 2, duration: 5 },
    { task: "Shopping Cart", start: 4, duration: 7 },
    { task: "Payment Integration", start: 8, duration: 6 },
    { task: "Admin Dashboard", start: 11, duration: 8 },
    { task: "Testing & QA", start: 14, duration: 5 },
  ];

  const changelog = [
    {
      date: "2025-10-01",
      version: "v2.1.0",
      changes: [
        "Added shopping cart functionality",
        "Implemented payment gateway integration",
        "Enhanced user profile management",
      ],
    },
    {
      date: "2025-09-15",
      version: "v2.0.0",
      changes: [
        "Complete UI redesign with new branding",
        "Added multi-language support",
        "Improved mobile responsiveness",
      ],
    },
    {
      date: "2025-09-01",
      version: "v1.5.0",
      changes: [
        "Added user authentication system",
        "Implemented role-based access control",
        "Bug fixes and performance improvements",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Reports</h1>
        <p className="text-gray-600 mt-1">Project progress reports and analytics</p>
      </div>

      {/* Burndown Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-600" />
              Sprint Burndown Chart
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={burndownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Ideal" />
              <Line type="monotone" dataKey="remaining" stroke="#ef4444" strokeWidth={2} name="Remaining" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gantt Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-teal-600" />
              Project Timeline (Gantt Chart)
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={ganttData}
              layout="vertical"
              margin={{ left: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 20]} />
              <YAxis type="category" dataKey="task" />
              <Tooltip />
              <Bar dataKey="duration" fill="#0d9488" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Changelog */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              Changelog
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {changelog.map((entry, index) => (
              <div key={index} className="border-l-2 border-teal-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">
                    {entry.version}
                  </span>
                  <span className="text-sm text-gray-500">{entry.date}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {entry.changes.map((change, idx) => (
                    <li key={idx}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export All Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export as Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
