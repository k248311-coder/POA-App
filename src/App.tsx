import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { JoinTeamPage } from "./components/JoinTeamPage";
import { ProjectSelectionPage } from "./components/ProjectSelectionPage";
import { NewProjectPage } from "./components/NewProjectPage";
import { Layout } from "./components/Layout";
import { TeamMemberLayout } from "./components/TeamMemberLayout";
import { Dashboard } from "./components/Dashboard";
import { TeamMemberDashboard } from "./components/TeamMemberDashboard";
import { MyStoriesPage } from "./components/MyStoriesPage";
import { TeamMemberReports } from "./components/TeamMemberReports";
import { ProfilePage } from "./components/ProfilePage";
import { ProjectBacklog } from "./components/ProjectBacklog";
import { EstimatesPage } from "./components/EstimatesPage";
import { PrioritizationPage } from "./components/PrioritizationPage";
import { ReportsPage } from "./components/ReportsPage";
import { TeamManagementPage } from "./components/TeamManagementPage";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";

type Page = "login" | "signup" | "jointeam" | "projectselection" | "newproject" | "dashboard" | "mystories" | "backlog" | "estimates" | "prioritization" | "reports" | "team" | "profile";
type UserRole = "po" | "team" | null;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [selectedProject, setSelectedProject] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleLogin = (role: "po" | "team") => {
    setIsAuthenticated(true);
    setUserRole(role);
    setCurrentPage("projectselection");
  };

  const handleSignupComplete = () => {
    setIsAuthenticated(true);
    setUserRole("po"); // Signup creates a PO account
    setCurrentPage("projectselection");
  };

  const handleJoinComplete = () => {
    setIsAuthenticated(true);
    setUserRole("team"); // Join team creates a team member account
    setCurrentPage("projectselection");
  };

  const handleProjectSelect = (projectId: string, projectName: string) => {
    setSelectedProject({ id: projectId, name: projectName });
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setSelectedProject(null);
    setCurrentPage("login");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleSwitchProject = () => {
    setSelectedProject(null);
    setCurrentPage("projectselection");
  };

  const handleCreateProject = (projectName: string, srsFile: File | null) => {
    // Create a new project
    const newProject = {
      id: Date.now().toString(),
      name: projectName,
    };
    setSelectedProject(newProject);
    toast.success(`Project "${projectName}" created successfully!`);
    setCurrentPage("dashboard");
  };

  // Authentication pages
  if (!isAuthenticated) {
    if (currentPage === "signup") {
      return (
        <SignupPage
          onSignupComplete={handleSignupComplete}
          onNavigateToLogin={() => setCurrentPage("login")}
        />
      );
    }

    if (currentPage === "jointeam") {
      return <JoinTeamPage onJoinComplete={handleJoinComplete} />;
    }

    return (
      <LoginPage
        onLogin={handleLogin}
        onNavigateToSignup={() => setCurrentPage("signup")}
      />
    );
  }

  // New project page
  if (currentPage === "newproject" && userRole === "po") {
    return (
      <>
        <NewProjectPage
          onCreateProject={handleCreateProject}
          onCancel={() => setCurrentPage("projectselection")}
        />
        <Toaster />
      </>
    );
  }

  // Project selection page
  if (!selectedProject && userRole) {
    return (
      <>
        <ProjectSelectionPage
          userRole={userRole}
          onSelectProject={handleProjectSelect}
          onCreateProject={
            userRole === "po" ? () => setCurrentPage("newproject") : undefined
          }
        />
        <Toaster />
      </>
    );
  }

  // Main app pages - Product Owner
  if (userRole === "po") {
    return (
      <>
        <Layout
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          projectName={selectedProject?.name}
          onSwitchProject={handleSwitchProject}
        >
          {currentPage === "dashboard" && <Dashboard />}
          {currentPage === "backlog" && <ProjectBacklog />}
          {currentPage === "estimates" && <EstimatesPage />}
          {currentPage === "prioritization" && <PrioritizationPage userRole="po" />}
          {currentPage === "reports" && <ReportsPage />}
          {currentPage === "team" && <TeamManagementPage />}
        </Layout>
        <Toaster />
      </>
    );
  }

  // Main app pages - Team Member
  return (
    <>
      <TeamMemberLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        projectName={selectedProject?.name}
        onSwitchProject={handleSwitchProject}
      >
        {currentPage === "dashboard" && <TeamMemberDashboard />}
        {currentPage === "mystories" && <MyStoriesPage />}
        {currentPage === "backlog" && <ProjectBacklog readOnly />}
        {currentPage === "prioritization" && <PrioritizationPage userRole="team" />}
        {currentPage === "reports" && <TeamMemberReports />}
        {currentPage === "profile" && <ProfilePage />}
      </TeamMemberLayout>
      <Toaster />
    </>
  );
}
