import { LayoutDashboard, FolderKanban, Calculator, BarChart3, Users, LogOut, Menu, X, ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { useState, type ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  projectName?: string;
  onSwitchProject?: () => void;
}

export function Layout({ children, currentPage, onNavigate, onLogout, projectName, onSwitchProject }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
    { name: "Backlog", icon: FolderKanban, page: "backlog" },
    { name: "Estimates", icon: Calculator, page: "estimates" },
    { name: "Prioritization", icon: ArrowUpDown, page: "prioritization" },
    { name: "Reports", icon: BarChart3, page: "reports" },
    { name: "Team", icon: Users, page: "team" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-200">
            <h1 className="text-teal-600">POA Platform</h1>
          </div>

          {/* Project Selector */}
          {projectName && onSwitchProject && (
            <div className="px-4 py-3 border-b border-gray-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex-1 text-left">
                      <p className="text-gray-500">Project</p>
                      <p className="text-gray-900 truncate">{projectName}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={onSwitchProject}>
                    Switch Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => onNavigate(item.page)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${currentPage === item.page
                      ? "bg-teal-50 text-teal-600"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <Button
              onClick={onLogout}
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-teal-600">POA Platform</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="px-4 py-2 space-y-1 border-t border-gray-200">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    onNavigate(item.page);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${currentPage === item.page
                      ? "bg-teal-50 text-teal-600"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </nav>
        )}
      </div>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
