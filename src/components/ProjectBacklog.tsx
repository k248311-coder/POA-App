import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronDown, ChevronRight, FolderKanban, Layers, BookOpen, FileText, CheckSquare, Edit2, Lock } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

interface Task {
  id: string;
  title: string;
  devHours: number;
  qaHours: number;
  cost: number;
  status: string;
}

interface Story {
  id: string;
  title: string;
  acceptanceCriteria: string[];
  devHours: number;
  qaHours: number;
  cost: number;
  status: string;
  tasks: Task[];
}

interface Epic {
  id: string;
  title: string;
  stories: Story[];
}

interface Feature {
  id: string;
  title: string;
  epics: Epic[];
}

interface Project {
  id: string;
  title: string;
  features: Feature[];
}

interface ProjectBacklogProps {
  readOnly?: boolean;
}

export function ProjectBacklog({ readOnly = false }: ProjectBacklogProps) {
  const [projects] = useState<Project[]>([
    {
      id: "P1",
      title: "E-commerce Platform Redesign",
      features: [
        {
          id: "F1",
          title: "User Authentication System",
          epics: [
            {
              id: "E1",
              title: "Login & Registration",
              stories: [
                {
                  id: "S1",
                  title: "User can login with email and password",
                  acceptanceCriteria: [
                    "User enters valid email and password",
                    "System validates credentials",
                    "User is redirected to dashboard on success",
                  ],
                  devHours: 16,
                  qaHours: 8,
                  cost: 2400,
                  status: "In Progress",
                  tasks: [
                    { id: "T1", title: "Create login API endpoint", devHours: 8, qaHours: 4, cost: 1200, status: "Done" },
                    { id: "T2", title: "Build login UI component", devHours: 8, qaHours: 4, cost: 1200, status: "In Progress" },
                  ],
                },
                {
                  id: "S2",
                  title: "User can sign up with email verification",
                  acceptanceCriteria: [
                    "User fills registration form",
                    "System sends verification email",
                    "User confirms email to activate account",
                  ],
                  devHours: 24,
                  qaHours: 12,
                  cost: 3600,
                  status: "To Do",
                  tasks: [],
                },
              ],
            },
          ],
        },
        {
          id: "F2",
          title: "Shopping Cart",
          epics: [
            {
              id: "E2",
              title: "Cart Management",
              stories: [
                {
                  id: "S3",
                  title: "User can add items to cart",
                  acceptanceCriteria: [
                    "User clicks 'Add to Cart' button",
                    "Item is added to cart with quantity",
                    "Cart icon shows updated item count",
                  ],
                  devHours: 20,
                  qaHours: 10,
                  cost: 3000,
                  status: "Done",
                  tasks: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

  const [editingItem, setEditingItem] = useState<{ id: string; field: string } | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-700 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1>Project Backlog</h1>
          <p className="text-gray-600 mt-1">
            {readOnly 
              ? "Browse all projects, features, epics, and stories (read-only)" 
              : "Hierarchical view of all projects, features, epics, stories, and tasks"}
          </p>
        </div>
        {readOnly && (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Read Only
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <Collapsible key={project.id} defaultOpen>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FolderKanban className="h-5 w-5 text-teal-600" />
                    <CardTitle>{project.title}</CardTitle>
                    <ChevronDown className="h-5 w-5 ml-auto text-gray-400" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  {project.features.map((feature) => (
                    <Collapsible key={feature.id} defaultOpen>
                      <div className="ml-6 border-l-2 border-teal-200 pl-4">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 -ml-4 pl-4 rounded">
                            <Layers className="h-4 w-4 text-blue-600" />
                            <h3>{feature.title}</h3>
                            <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="space-y-3 mt-2">
                            {feature.epics.map((epic) => (
                              <Collapsible key={epic.id} defaultOpen>
                                <div className="ml-6 border-l-2 border-blue-200 pl-4">
                                  <CollapsibleTrigger asChild>
                                    <div className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 -ml-4 pl-4 rounded">
                                      <BookOpen className="h-4 w-4 text-purple-600" />
                                      <h4>{epic.title}</h4>
                                      <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="space-y-3 mt-2">
                                      {epic.stories.map((story) => (
                                        <Card key={story.id} className="bg-gray-50">
                                          <CardContent className="p-4">
                                            <div className="flex items-start gap-2 mb-3">
                                              <FileText className="h-4 w-4 text-orange-600 mt-1" />
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <h4>{story.title}</h4>
                                                  <Badge className={getStatusColor(story.status)}>{story.status}</Badge>
                                                </div>
                                                
                                                <div className="mt-3 space-y-1">
                                                  <p className="text-sm text-gray-600">Acceptance Criteria:</p>
                                                  <ul className="list-disc list-inside space-y-1">
                                                    {story.acceptanceCriteria.map((criteria, idx) => (
                                                      <li key={idx} className="text-sm text-gray-700">{criteria}</li>
                                                    ))}
                                                  </ul>
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                  {!readOnly ? (
                                                    <>
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-600">Dev Hours:</span>
                                                        <Input
                                                          type="number"
                                                          value={story.devHours}
                                                          className="h-8 w-20"
                                                          onChange={() => {}}
                                                        />
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-600">QA Hours:</span>
                                                        <Input
                                                          type="number"
                                                          value={story.qaHours}
                                                          className="h-8 w-20"
                                                          onChange={() => {}}
                                                        />
                                                      </div>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-600">Dev Hours:</span>
                                                        <span className="font-medium">{story.devHours}h</span>
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-600">QA Hours:</span>
                                                        <span className="font-medium">{story.qaHours}h</span>
                                                      </div>
                                                    </>
                                                  )}
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-600">Cost:</span>
                                                    <span className="font-medium">${story.cost}</span>
                                                  </div>
                                                </div>

                                                {story.tasks.length > 0 && (
                                                  <div className="mt-4 space-y-2">
                                                    <p className="text-sm text-gray-600">Tasks:</p>
                                                    {story.tasks.map((task) => (
                                                      <div key={task.id} className="flex items-center gap-2 text-sm bg-white p-2 rounded border border-gray-200">
                                                        <CheckSquare className="h-3 w-3 text-gray-400" />
                                                        <span className="flex-1">{task.title}</span>
                                                        <Badge className={getStatusColor(task.status)} variant="outline">
                                                          {task.status}
                                                        </Badge>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
