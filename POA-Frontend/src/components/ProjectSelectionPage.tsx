import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Search, FolderKanban, Plus, Users, Calendar, TrendingUp, LogOut } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ProjectSummary } from "../types/api";
import { getProjects } from "../lib/api";

interface ProjectSelectionPageProps {
  userRole: "po" | "team";
  userEmail?: string | null;
  userDisplayName?: string | null;
  onSelectProject: (project: ProjectSummary) => void;
  onLogout: () => void;
  onCreateProject?: () => void;
}

export function ProjectSelectionPage({
  userRole,
  userEmail,
  userDisplayName,
  onSelectProject,
  onLogout,
  onCreateProject,
}: ProjectSelectionPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    getProjects(controller.signal)
      .then(setProjects)
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Failed to load projects", err);
        setError("Unable to load projects from the server.");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        (project.description ?? "").toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (userDisplayName) {
      const parts = userDisplayName.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return userDisplayName.substring(0, 2).toUpperCase();
    }
    if (userEmail) {
      return userEmail.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* POA Logo on Left */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-teal-600">POA Platform</h1>
            </div>
            
            {/* Profile Dropdown on Right */}
            <div className="flex items-center">
              <div 
                className="relative"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-teal-600 text-white text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-gray-700 font-medium hidden sm:block">
                    {userDisplayName || userEmail || "User"}
                  </span>
                </button>
                
                {/* Dropdown Content */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md border border-gray-200 shadow-lg z-50">
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-medium text-gray-900">
                        {userDisplayName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {userEmail || "No email"}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {userRole === "po" ? "Product Owner" : "Team Member"}
                      </Badge>
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-md"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

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
        {isLoading ? (
          <Card className="border-gray-200">
            <CardContent className="py-12 text-center text-gray-600">
              Loading projects...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-12 text-center text-red-600">
              {error}
            </CardContent>
          </Card>
        ) : filteredProjects.length === 0 ? (
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
                onClick={() => onSelectProject(project)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-gray-900 group-hover:text-teal-600 transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {project.description || "No description provided"}
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
                      <span className="text-gray-900">{project.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(
                          project.progressPercent
                        )}`}
                        style={{ width: `${project.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{project.teamMemberCount} team members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>
                        {project.completedTasks}/{project.totalTasks} tasks complete
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {project.lastUpdated
                          ? `Updated ${formatDistanceToNow(new Date(project.lastUpdated), { addSuffix: true })}`
                          : "No updates yet"}
                      </span>
                    </div>
                  </div>

                  {/* Select Button */}
                  <Button
                    className="w-full mt-4 bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(project);
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
