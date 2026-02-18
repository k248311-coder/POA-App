import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, FileText, CheckSquare, Plus, Trash2 } from "lucide-react";
import type { ProjectBacklogStory, ProjectBacklogTask } from "../types/api";

const WORK_STATUS_OPTIONS = [
  "To Do",
  "Planned",
  "In Progress",
  "In Review",
  "In QA",
  "Done",
];

export interface StoryDetailPageProps {
  projectId: string;
  story: ProjectBacklogStory;
  epicTitle?: string;
  featureTitle?: string;
  onBack: () => void;
  onStoryUpdated?: (updated: ProjectBacklogStory) => void | Promise<void>;
  readOnly?: boolean;
}

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) return "$0";
  const n = Number(value);
  return Number.isNaN(n) ? "$0" : `$${n.toLocaleString()}`;
}

function formatHours(dev?: number | null, test?: number | null) {
  const d = dev ?? 0;
  const t = test ?? 0;
  return `${d}h dev · ${t}h qa`;
}

function getStatusColor(status: string) {
  switch (status) {
    case "Done":
      return "bg-green-100 text-green-700 border-green-200";
    case "In Progress":
    case "In Review":
    case "In QA":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Planned":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export function StoryDetailPage({
  projectId,
  story: initialStory,
  epicTitle,
  featureTitle,
  onBack,
  onStoryUpdated,
  readOnly = false,
}: StoryDetailPageProps) {
  const [story, setStory] = useState<ProjectBacklogStory>(initialStory);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStory(initialStory);
  }, [initialStory.id]);

  const update = (patch: Partial<ProjectBacklogStory>) => {
    setStory((prev) => ({ ...prev, ...patch }));
    setHasChanges(true);
  };

  const setTitle = (title: string) => update({ title });
  const setDescription = (description: string | null) => update({ description: description || null });
  const setStoryPoints = (storyPoints: number | null) => update({ storyPoints });
  const setStatus = (status: string) => update({ status });

  const setAcceptanceCriteria = (acceptanceCriteria: string[]) => {
    update({ acceptanceCriteria });
  };

  const addCriterion = () => {
    setAcceptanceCriteria([...story.acceptanceCriteria, ""]);
  };

  const updateCriterion = (index: number, value: string) => {
    const next = [...story.acceptanceCriteria];
    next[index] = value;
    setAcceptanceCriteria(next);
  };

  const removeCriterion = (index: number) => {
    setAcceptanceCriteria(story.acceptanceCriteria.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!onStoryUpdated) {
      setHasChanges(false);
      return;
    }
    setSaving(true);
    try {
      await onStoryUpdated(story);
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to backlog">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500">
            {[epicTitle, featureTitle].filter(Boolean).join(" → ") || "Backlog"}
          </p>
          <h1 className="text-xl font-semibold truncate">Story: {story.title}</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={story.title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={readOnly}
                  className="mt-1"
                  placeholder="Story title"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={story.description ?? ""}
                  onChange={(e) => setDescription(e.target.value || null)}
                  disabled={readOnly}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the story..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Story points</label>
                  <Input
                    type="number"
                    min={0}
                    value={story.storyPoints ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setStoryPoints(v === "" ? null : parseInt(v, 10) || null);
                    }}
                    disabled={readOnly}
                    className="mt-1"
                    placeholder="—"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Work status</label>
                  <Select
                    value={story.status}
                    onValueChange={setStatus}
                    disabled={readOnly}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 text-sm text-gray-600">
                <span>Dev: {story.estimatedDevHours ?? 0}h</span>
                <span>QA: {story.estimatedTestHours ?? 0}h</span>
                <span>Cost: {formatCurrency(story.totalCost)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Acceptance criteria</span>
                {!readOnly && (
                  <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {story.acceptanceCriteria.length === 0 ? (
                <p className="text-sm text-gray-500">No acceptance criteria yet.</p>
              ) : (
                story.acceptanceCriteria.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <Input
                      value={item}
                      onChange={(e) => updateCriterion(index, e.target.value)}
                      disabled={readOnly}
                      placeholder="Criterion"
                      className="flex-1"
                    />
                    {!readOnly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCriterion(index)}
                        aria-label="Remove criterion"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-teal-600" />
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {story.tasks.length === 0 ? (
                <p className="text-sm text-gray-500">No tasks linked to this story.</p>
              ) : (
                <ul className="space-y-2">
                  {story.tasks.map((task: ProjectBacklogTask) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <CheckSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="flex-1">{task.title}</span>
                      <Badge className={getStatusColor(task.status)} variant="outline">
                        {task.status}
                      </Badge>
                      <span className="text-gray-500">{formatHours(task.devHours, task.testHours)}</span>
                      {typeof task.totalCost === "number" && (
                        <span className="font-medium">{formatCurrency(task.totalCost)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {!readOnly && hasChanges && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onBack} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-teal-600 hover:bg-teal-700"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
