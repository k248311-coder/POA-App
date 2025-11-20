import { useEffect, useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ChevronDown, ChevronRight, FolderKanban, Layers, BookOpen, FileText, CheckSquare, Lock } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { getProjectBacklog } from "../lib/api";
import type { ProjectBacklog as ProjectBacklogType } from "../types/api";

interface ProjectBacklogProps {
  projectId: string;
  readOnly?: boolean;
}

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "$0";
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return "$0";
  }

  return `$${numeric.toLocaleString()}`;
};

const formatHours = (devHours?: number | null, testHours?: number | null) => {
  const dev = devHours ?? 0;
  const test = testHours ?? 0;
  return `${dev}h dev · ${test}h qa`;
};

export function ProjectBacklog({ projectId, readOnly = false }: ProjectBacklogProps) {
  const [backlog, setBacklog] = useState<ProjectBacklogType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    getProjectBacklog(projectId, controller.signal)
      .then(setBacklog)
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Failed to load backlog", err);
        setError("Unable to load backlog data.");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [projectId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-700 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Planned":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  let content: ReactNode;

  if (isLoading) {
    content = (
      <Card className="border-gray-200">
        <CardContent className="py-12 text-center text-gray-600">
          Loading backlog...
        </CardContent>
      </Card>
    );
  } else if (error) {
    content = (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-12 text-center text-red-600">
          {error}
        </CardContent>
      </Card>
    );
  } else if (!backlog) {
    content = (
      <Card className="border-gray-200">
        <CardContent className="py-12 text-center text-gray-600">
          No backlog data available for this project.
        </CardContent>
      </Card>
    );
  } else {
    content = (
        <div className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-teal-600" />
                {backlog.name}
              </CardTitle>
            </CardHeader>
          </Card>

          {backlog.epics.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="py-12 text-center text-gray-600">
                No epics defined yet.
              </CardContent>
            </Card>
          ) : (
            backlog.epics.map((epic) => (
              <Collapsible key={epic.id} defaultOpen>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                        <div className="flex-1">
                          <CardTitle>{epic.title}</CardTitle>
                          {epic.description && (
                            <p className="text-sm text-gray-600 mt-1">{epic.description}</p>
                          )}
                        </div>
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      {epic.features.length === 0 ? (
                        <div className="text-sm text-gray-500 px-4 py-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          No features linked to this epic.
                        </div>
                      ) : (
                        epic.features.map((feature) => (
                          <Collapsible key={feature.id} defaultOpen>
                            <div className="ml-4 border-l-2 border-blue-200 pl-4">
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 -ml-4 pl-4 rounded">
                                  <Layers className="h-4 w-4 text-blue-600" />
                                  <h3>{feature.title}</h3>
                                  <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="space-y-3 mt-2">
                                  {feature.stories.length === 0 ? (
                                    <div className="text-sm text-gray-500 px-4 py-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                      No stories linked to this feature.
                                    </div>
                                  ) : (
                                    feature.stories.map((story) => (
                                      <Card key={story.id} className="bg-gray-50">
                                        <CardContent className="p-4">
                                          <div className="flex items-start gap-2 mb-3">
                                            <FileText className="h-4 w-4 text-orange-600 mt-1" />
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <h4>{story.title}</h4>
                                                <Badge className={getStatusColor(story.status)}>{story.status}</Badge>
                                              </div>

                                              {story.acceptanceCriteria.length > 0 && (
                                                <div className="mt-3 space-y-1">
                                                  <p className="text-sm text-gray-600">Acceptance Criteria:</p>
                                                  <ul className="list-disc list-inside space-y-1">
                                                    {story.acceptanceCriteria.map((criteria, idx) => (
                                                      <li key={idx} className="text-sm text-gray-700">
                                                        {criteria}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}

                                              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm text-gray-600">Dev Hours:</span>
                                                  <span className="font-medium">{story.estimatedDevHours ?? 0}h</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm text-gray-600">QA Hours:</span>
                                                  <span className="font-medium">{story.estimatedTestHours ?? 0}h</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm text-gray-600">Story Points:</span>
                                                  <span className="font-medium">{story.storyPoints ?? "—"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm text-gray-600">Cost:</span>
                                                  <span className="font-medium">{formatCurrency(story.totalCost)}</span>
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
                                                      <span className="text-gray-500">
                                                        {formatHours(task.devHours, task.testHours)}
                                                      </span>
                                                      {typeof task.totalCost === "number" && (
                                                        <span className="text-gray-700 font-medium">
                                                          {formatCurrency(task.totalCost)}
                                                        </span>
                                                      )}
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))
                                  )}
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        ))
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))
          )}
        </div>
    );
  }

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
        {readOnly ? (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Read Only
          </Badge>
        ) : null}
      </div>

      {content}
    </div>
  );
}
