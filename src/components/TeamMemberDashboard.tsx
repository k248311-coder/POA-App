import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileText, Clock, Activity, CheckCircle2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

export function TeamMemberDashboard() {
  const myStories = [
    { status: "To Do", count: 3, color: "bg-gray-500" },
    { status: "In Progress", count: 2, color: "bg-blue-500" },
    { status: "In Validation", count: 1, color: "bg-purple-500" },
    { status: "Done", count: 5, color: "bg-green-500" },
  ];

  const totalStories = myStories.reduce((sum, s) => sum + s.count, 0);
  const thisWeekHours = 24;
  const totalHours = 156;

  const activities = [
    { text: "You updated Story DEV-123 to In Progress", time: "2 hours ago", icon: "update" },
    { text: "You logged 3h for Story QA-456", time: "4 hours ago", icon: "log" },
    { text: "You completed Story DEV-120", time: "1 day ago", icon: "complete" },
    { text: "You updated Story DEV-119 to In Validation", time: "1 day ago", icon: "update" },
    { text: "You logged 5h for Story DEV-123", time: "2 days ago", icon: "log" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your work overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* My Stories Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              My Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Assigned</span>
                <h2>{totalStories}</h2>
              </div>
              
              <div className="space-y-3">
                {myStories.map((story) => (
                  <div key={story.status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{story.status}</span>
                      <span className="font-medium">{story.count}</span>
                    </div>
                    <Progress 
                      value={(story.count / totalStories) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hours Logged Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-600" />
              Hours Logged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-teal-700 mb-1">This Week</p>
                <h2 className="text-teal-600">{thisWeekHours}h</h2>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 mb-1">Total (All Time)</p>
                <h2 className="text-blue-600">{totalHours}h</h2>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Weekly Target: 40h</span>
                <span className="font-medium">{Math.round((thisWeekHours / 40) * 100)}%</span>
              </div>
              <Progress value={(thisWeekHours / 40) * 100} className="h-2" />
            </div>
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
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  activity.icon === "complete" ? "bg-green-500" :
                  activity.icon === "log" ? "bg-blue-500" :
                  "bg-purple-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p>{activity.text}</p>
                  <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stories Completed</p>
                <h2 className="mt-2">5</h2>
              </div>
              <div className="bg-green-50 text-green-600 p-3 rounded-lg">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <h2 className="mt-2">2</h2>
              </div>
              <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Hours/Story</p>
                <h2 className="mt-2">14.2h</h2>
              </div>
              <div className="bg-purple-50 text-purple-600 p-3 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
