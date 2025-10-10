import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, FolderKanban, Plus, Users, Calendar, TrendingUp } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  role: string;
  teamSize: number;
  progress: number;
  lastUpdated: string;
  status: "active" | "planning" | "completed";
}

interface ProjectSelectionPageProps {
  userRole: "po" | "team";
  onSelectProject: (projectId: string, projectName: string) => void;
  onCreateProject?: () => void;
}

export function ProjectSelectionPage({
  userRole,
  onSelectProject,
  onCreateProject,
}: ProjectSelectionPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock projects data
  const mockProjects: Project[] = [
    {
      id: "1",
      name: "E-Commerce Platform Redesign",
      description: "Complete overhaul of the customer-facing e-commerce platform",
      role: userRole === "po" ? "Product Owner" : "Frontend Developer",
      teamSize: 8,
      progress: 65,
      lastUpdated: "2 hours ago",
      status: "active",
    },
    {
      id: "2",
      name: "Mobile App MVP",
      description: "iOS and Android mobile application for customer engagement",
      role: userRole === "po" ? "Product Owner" : "QA Engineer",
      teamSize: 5,
      progress: 32,
      lastUpdated: "1 day ago",
      status: "active",
    },
    {
      id: "3",
      name: "Analytics Dashboard",
      description: "Internal analytics and reporting dashboard for stakeholders",
      role: userRole === "po" ? "Product Owner" : "Backend Developer",
      teamSize: 4,
      progress: 89,
      lastUpdated: "3 days ago",
      status: "active",
    },
    {
      id: "4",
      name: "API Integration Project",
      description: "Third-party API integrations for payment and shipping",
      role: userRole === "po" ? "Product Owner" : "Developer",
      teamSize: 3,
      progress: 15,
      lastUpdated: "5 days ago",
      status: "planning",
    },
  ];

  const filteredProjects = mockProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-teal-100 text-teal-700 border-teal-200";
      case "planning":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-teal-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-gray-300";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-gray-900 mb-2">Select a Project</h1>
              <p className="text-gray-600">
                {userRole === "po"
                  ? "Choose a project to manage or create a new one"
                  : "Select a project to view your assigned stories and tasks"}
              </p>
            </div>
            {userRole === "po" && onCreateProject && (
              <Button onClick={onCreateProject} className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="py-12 text-center">
              <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "You don't have any projects yet"}
              </p>
              {userRole === "po" && onCreateProject && (
                <Button onClick={onCreateProject} className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => onSelectProject(project.id, project.name)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-gray-900 group-hover:text-teal-600 transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {project.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(
                          project.progress
                        )}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{project.teamSize} team members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>{project.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Updated {project.lastUpdated}</span>
                    </div>
                  </div>

                  {/* Select Button */}
                  <Button
                    className="w-full mt-4 bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(project.id, project.name);
                    }}
                  >
                    Select Project
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
