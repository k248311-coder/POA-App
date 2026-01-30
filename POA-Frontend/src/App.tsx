import React, { useCallback, useState, useEffect, useRef } from "react";
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
import type { ProjectSummary } from "./types/api";

type Page = "login" | "signup" | "jointeam" | "projectselection" | "newproject" | "dashboard" | "mystories" | "backlog" | "estimates" | "prioritization" | "reports" | "team" | "profile";
type UserRole = "po" | "team" | null;

// Session storage keys
const STORAGE_KEYS = {
  IS_AUTHENTICATED: "poa_is_authenticated",
  USER_ROLE: "poa_user_role",
  USER_ID: "poa_user_id",
  USER_EMAIL: "poa_user_email",
  USER_DISPLAY_NAME: "poa_user_display_name",
  SELECTED_PROJECT: "poa_selected_project",
} as const;

// Helper function to get page from URL hash
function getPageFromUrl(): Page {
  const hash = window.location.hash.slice(1); // Remove the '#'
  const validPages: Page[] = ["login", "signup", "jointeam", "projectselection", "newproject", "dashboard", "mystories", "backlog", "estimates", "prioritization", "reports", "team", "profile"];
  return validPages.includes(hash as Page) ? (hash as Page) : "login";
}

// Helper functions for session persistence
function saveSession(isAuth: boolean, role: UserRole, id: string | null, email: string | null = null, displayName: string | null = null) {
  localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, String(isAuth));
  if (role) {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
  }
  if (id) {
    localStorage.setItem(STORAGE_KEYS.USER_ID, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
  }
  if (email) {
    localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
  }
  if (displayName) {
    localStorage.setItem(STORAGE_KEYS.USER_DISPLAY_NAME, displayName);
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER_DISPLAY_NAME);
  }
}

function loadSession(): { isAuthenticated: boolean; userRole: UserRole; userId: string | null; userEmail: string | null; userDisplayName: string | null } {
  const isAuth = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === "true";
  const role = localStorage.getItem(STORAGE_KEYS.USER_ROLE) as UserRole;
  const id = localStorage.getItem(STORAGE_KEYS.USER_ID);
  const email = localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
  const displayName = localStorage.getItem(STORAGE_KEYS.USER_DISPLAY_NAME);
  
  return {
    isAuthenticated: isAuth,
    userRole: (role === "po" || role === "team" ? role : null),
    userId: id,
    userEmail: email,
    userDisplayName: displayName,
  };
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
  localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
  localStorage.removeItem(STORAGE_KEYS.USER_ID);
  localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
  localStorage.removeItem(STORAGE_KEYS.USER_DISPLAY_NAME);
  localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT);
}

function saveSelectedProject(project: ProjectSummary | null) {
  if (project) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT, JSON.stringify(project));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT);
  }
}

function loadSelectedProject(): ProjectSummary | null {
  const projectJson = localStorage.getItem(STORAGE_KEYS.SELECTED_PROJECT);
  if (projectJson) {
    try {
      return JSON.parse(projectJson) as ProjectSummary;
    } catch {
      return null;
    }
  }
  return null;
}

export default function App() {
  // Initialize state from localStorage on mount
  const sessionData = loadSession();
  const savedProject = loadSelectedProject();
  
  const [currentPage, setCurrentPage] = useState<Page>(() => getPageFromUrl());
  const [isAuthenticated, setIsAuthenticated] = useState(sessionData.isAuthenticated);
  const [userRole, setUserRole] = useState<UserRole>(sessionData.userRole);
  const [userId, setUserId] = useState<string | null>(sessionData.userId);
  const [userEmail, setUserEmail] = useState<string | null>(sessionData.userEmail);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(sessionData.userDisplayName);
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(savedProject);
  
  // Ref to track if we're handling a popstate event (to prevent circular updates)
  const isHandlingPopState = useRef(false);
  // Ref to track if this is the initial mount
  const isInitialMount = useRef(true);

  // Helper function to navigate and update history
  const navigateToPage = useCallback((page: Page, replace = false) => {
    if (isHandlingPopState.current) {
      // Don't update history if we're restoring from popstate
      return;
    }

    const url = `#${page}`;
    if (replace) {
      window.history.replaceState({ page }, "", url);
    } else {
      window.history.pushState({ page }, "", url);
    }
  }, []);

  // Restore page on mount if authenticated and no hash in URL
  useEffect(() => {
    if (isInitialMount.current && isAuthenticated) {
      const hashPage = getPageFromUrl();
      // If URL has a hash, use it; otherwise navigate to appropriate page based on state
      if (!window.location.hash || hashPage === "login") {
        if (selectedProject) {
          const newPage: Page = "dashboard";
          setCurrentPage(newPage);
          navigateToPage(newPage, true);
        } else {
          const newPage: Page = "projectselection";
          setCurrentPage(newPage);
          navigateToPage(newPage, true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - we intentionally don't include dependencies

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      isHandlingPopState.current = true;
      const page = event.state?.page || getPageFromUrl();
      setCurrentPage(page);
      // Reset the flag after state update
      setTimeout(() => {
        isHandlingPopState.current = false;
      }, 0);
    };

    // Also handle hashchange for direct hash navigation
    const handleHashChange = () => {
      if (!isHandlingPopState.current) {
        const page = getPageFromUrl();
        setCurrentPage(page);
      }
    };

    // Listen for browser back/forward button
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handleHashChange);

    // Initialize URL on mount (replace instead of push to avoid extra history entry)
    if (isInitialMount.current) {
      const initialPage = getPageFromUrl();
      window.history.replaceState({ page: initialPage }, "", `#${initialPage}`);
      isInitialMount.current = false;
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Save to localStorage whenever authentication state changes
  useEffect(() => {
    saveSession(isAuthenticated, userRole, userId, userEmail, userDisplayName);
  }, [isAuthenticated, userRole, userId, userEmail, userDisplayName]);

  // Save selected project to localStorage
  useEffect(() => {
    saveSelectedProject(selectedProject);
  }, [selectedProject]);

  const handleLogin = (role: "po" | "team", id: string | null, email: string | null = null, displayName: string | null = null) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
    setUserEmail(email);
    setUserDisplayName(displayName);
    saveSession(true, role, id, email, displayName);
    const newPage: Page = "projectselection";
    setCurrentPage(newPage);
    navigateToPage(newPage);
  };

  const handleSignupComplete = (id: string | null, email: string | null = null, displayName: string | null = null) => {
    setIsAuthenticated(true);
    setUserRole("po"); // Signup creates a PO account
    setUserId(id);
    setUserEmail(email);
    setUserDisplayName(displayName);
    saveSession(true, "po", id, email, displayName);
    const newPage: Page = "projectselection";
    setCurrentPage(newPage);
    navigateToPage(newPage);
  };

  const handleJoinComplete = () => {
    setIsAuthenticated(true);
    setUserRole("team"); // Join team creates a team member account
    saveSession(true, "team", null);
    const newPage: Page = "projectselection";
    setCurrentPage(newPage);
    navigateToPage(newPage);
  };

  const handleProjectSelect = (project: ProjectSummary) => {
    setSelectedProject(project);
    saveSelectedProject(project);
    const newPage: Page = "dashboard";
    setCurrentPage(newPage);
    navigateToPage(newPage);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    setUserEmail(null);
    setUserDisplayName(null);
    setSelectedProject(null);
    clearSession();
    const newPage: Page = "login";
    setCurrentPage(newPage);
    navigateToPage(newPage);
  };

  const handleNavigate = useCallback((page: string) => {
    const newPage = page as Page;
    setCurrentPage(newPage);
    navigateToPage(newPage);
  }, [navigateToPage]);

  const handleSwitchProject = () => {
    setSelectedProject(null);
    saveSelectedProject(null);
    const newPage: Page = "projectselection";
    setCurrentPage(newPage);
    navigateToPage(newPage);
  };

  const handleCreateProject = async (projectName: string, srsFile: File | null) => {
    if (!userId) {
      toast.error("User ID is missing. Please login again.");
      return;
    }

    try {
      if (srsFile) {
        toast.info("Processing SRS document with AI. This may take a moment...");
      }
      
      const { createProject } = await import("./lib/api");
      const response = await createProject({
        name: projectName,
        srsFile,
        ownerUserId: userId,
      });

      // Create a project summary from the response
      const newProject: ProjectSummary = {
        id: response.projectId,
        name: response.name,
        description: null,
        status: "active",
        progressPercent: 0,
        teamMemberCount: 0,
        lastUpdated: null,
        totalStories: 0,
        totalTasks: 0,
        completedTasks: 0,
      };

      setSelectedProject(newProject);
      saveSelectedProject(newProject);
      toast.success(`Project "${projectName}" created successfully!${srsFile ? " SRS processed and hierarchy generated." : ""}`);
      const newPage: Page = "dashboard";
      setCurrentPage(newPage);
      navigateToPage(newPage);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create project";
      toast.error(message);
      throw error; // Re-throw so NewProjectPage can reset loading state
    }
  };

  // Authentication pages
  if (!isAuthenticated) {
    if (currentPage === "signup") {
      return (
        <SignupPage
          onSignupComplete={(id, email, displayName) => handleSignupComplete(id, email, displayName)}
          onNavigateToLogin={() => {
            const newPage: Page = "login";
            setCurrentPage(newPage);
            navigateToPage(newPage);
          }}
        />
      );
    }

    if (currentPage === "jointeam") {
      return <JoinTeamPage onJoinComplete={handleJoinComplete} />;
    }

      return (
        <LoginPage
          onLogin={(role, userId, email, displayName) => handleLogin(role, userId, email, displayName)}
          onNavigateToSignup={() => {
            const newPage: Page = "signup";
            setCurrentPage(newPage);
            navigateToPage(newPage);
          }}
        />
      );
  }

  // New project page
  if (currentPage === "newproject" && userRole === "po") {
    return (
      <>
        <NewProjectPage
          onCreateProject={handleCreateProject}
          onCancel={() => {
            const newPage: Page = "projectselection";
            setCurrentPage(newPage);
            navigateToPage(newPage);
          }}
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
          userEmail={userEmail}
          userDisplayName={userDisplayName}
          onSelectProject={handleProjectSelect}
          onLogout={handleLogout}
          onCreateProject={
            userRole === "po" ? () => {
              const newPage: Page = "newproject";
              setCurrentPage(newPage);
              navigateToPage(newPage);
            } : undefined
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
          {currentPage === "dashboard" && selectedProject && (
            <Dashboard project={selectedProject} />
          )}
          {currentPage === "backlog" && selectedProject && (
            <ProjectBacklog projectId={selectedProject.id} />
          )}
          {currentPage === "estimates" && selectedProject && (
            <EstimatesPage projectId={selectedProject.id} />
          )}
          {currentPage === "prioritization" && selectedProject && (
            <PrioritizationPage userRole="po" projectId={selectedProject.id} />
          )}
          {currentPage === "reports" && selectedProject && (
            <ReportsPage projectId={selectedProject.id} />
          )}
          {currentPage === "team" && selectedProject && (
            <TeamManagementPage projectId={selectedProject.id} />
          )}
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
        {currentPage === "dashboard" && selectedProject && (
          <TeamMemberDashboard project={selectedProject} />
        )}
        {currentPage === "mystories" && selectedProject && (
          <MyStoriesPage projectId={selectedProject.id} />
        )}
        {currentPage === "backlog" && selectedProject && (
          <ProjectBacklog projectId={selectedProject.id} readOnly />
        )}
        {currentPage === "prioritization" && selectedProject && (
          <PrioritizationPage userRole="team" projectId={selectedProject.id} />
        )}
        {currentPage === "reports" && selectedProject && (
          <TeamMemberReports projectId={selectedProject.id} />
        )}
        {currentPage === "profile" && <ProfilePage />}
      </TeamMemberLayout>
      <Toaster />
    </>
  );
}
