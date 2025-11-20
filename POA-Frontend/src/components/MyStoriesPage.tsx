import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { FileText, Clock } from "lucide-react";

interface Story {
  id: string;
  title: string;
  epic: string;
  feature: string;
  status: string;
  estimatedHours: number;
  loggedHours: number;
}

export function MyStoriesPage() {
  const [stories, setStories] = useState<Story[]>([
    {
      id: "DEV-123",
      title: "Implement user login API",
      epic: "User Authentication",
      feature: "Auth System",
      status: "In Progress",
      estimatedHours: 16,
      loggedHours: 8,
    },
    {
      id: "DEV-124",
      title: "Create login UI component",
      epic: "User Authentication",
      feature: "Auth System",
      status: "In Progress",
      estimatedHours: 12,
      loggedHours: 5,
    },
    {
      id: "QA-456",
      title: "Test shopping cart functionality",
      epic: "Cart Management",
      feature: "Shopping Cart",
      status: "To Do",
      estimatedHours: 10,
      loggedHours: 0,
    },
    {
      id: "DEV-120",
      title: "Setup database migrations",
      epic: "Infrastructure",
      feature: "Database",
      status: "Done",
      estimatedHours: 8,
      loggedHours: 8,
    },
    {
      id: "DEV-119",
      title: "Implement password reset",
      epic: "User Authentication",
      feature: "Auth System",
      status: "In Validation",
      estimatedHours: 14,
      loggedHours: 14,
    },
  ]);

  const [hourInputs, setHourInputs] = useState<{ [key: string]: string }>({});

  const updateStatus = (id: string, newStatus: string) => {
    setStories(stories.map(story => 
      story.id === id ? { ...story, status: newStatus } : story
    ));
  };

  const logHours = (id: string) => {
    const hoursToAdd = parseFloat(hourInputs[id] || "0");
    if (hoursToAdd > 0) {
      setStories(stories.map(story => 
        story.id === id 
          ? { ...story, loggedHours: story.loggedHours + hoursToAdd } 
          : story
      ));
      setHourInputs({ ...hourInputs, [id]: "" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-700 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "In Validation":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const totalEstimated = stories.reduce((sum, s) => sum + s.estimatedHours, 0);
  const totalLogged = stories.reduce((sum, s) => sum + s.loggedHours, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1>My Stories</h1>
        <p className="text-gray-600 mt-1">Manage your assigned stories and log your time</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Stories</p>
                <h2 className="mt-2">{stories.length}</h2>
              </div>
              <div className="bg-teal-50 text-teal-600 p-3 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estimated Hours</p>
                <h2 className="mt-2">{totalEstimated}h</h2>
              </div>
              <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Logged Hours</p>
                <h2 className="mt-2">{totalLogged}h</h2>
              </div>
              <div className="bg-purple-50 text-purple-600 p-3 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stories Table */}
      <Card>
        <CardHeader>
          <CardTitle>All My Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Epic</TableHead>
                  <TableHead>Feature</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Est. Hours</TableHead>
                  <TableHead className="text-right">Logged Hours</TableHead>
                  <TableHead>Log Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stories.map((story) => (
                  <TableRow key={story.id}>
                    <TableCell className="font-medium">{story.id}</TableCell>
                    <TableCell>{story.title}</TableCell>
                    <TableCell className="text-sm text-gray-600">{story.epic}</TableCell>
                    <TableCell className="text-sm text-gray-600">{story.feature}</TableCell>
                    <TableCell>
                      <Select
                        value={story.status}
                        onValueChange={(val) => updateStatus(story.id, val)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="In Validation">In Validation</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">{story.estimatedHours}h</TableCell>
                    <TableCell className="text-right">
                      <span className={story.loggedHours > story.estimatedHours ? "text-red-600" : ""}>
                        {story.loggedHours}h
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="Hours"
                          className="w-20 h-8"
                          value={hourInputs[story.id] || ""}
                          onChange={(e) => setHourInputs({ 
                            ...hourInputs, 
                            [story.id]: e.target.value 
                          })}
                        />
                        <Button
                          size="sm"
                          onClick={() => logHours(story.id)}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          Log
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
