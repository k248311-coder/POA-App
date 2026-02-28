import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, FileText, CheckSquare, Plus, Trash2, Beaker } from "lucide-react";
import type { ProjectBacklogStory, ProjectBacklogTask, ProjectBacklogTestCase } from "../types/api";

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

export function StoryDetailPage({
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
    setStory((prev: ProjectBacklogStory) => ({ ...prev, ...patch }));
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
    setAcceptanceCriteria(story.acceptanceCriteria.filter((_, i: number) => i !== index));
  };

  const handleSave = async () => {
    if (!onStoryUpdated) {
      setHasChanges(false);
      return;
    }
    setSaving(true);
    try {
      // Prepare data: new items shouldn't have GUID strings like "new-..."
      const cleanedStory = {
        ...story,
        tasks: story.tasks.map(t => ({
          ...t,
          id: t.id.startsWith("new-") ? undefined : t.id
        })),
        testCases: story.testCases.map(tc => ({
          ...tc,
          id: tc.id.startsWith("new-") ? undefined : tc.id
        }))
      };
      await onStoryUpdated(cleanedStory as any);
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  const setEstimatedDevHours = (hours: number | null) => update({ estimatedDevHours: hours });
  const setEstimatedTestHours = (hours: number | null) => update({ estimatedTestHours: hours });

  // Tasks
  const addTask = () => {
    const newTask: ProjectBacklogTask = {
      id: "new-" + Date.now(),
      title: "New Task",
      status: "To Do",
      devHours: 0,
      testHours: 0,
      costDev: 0,
      costTest: 0,
      totalCost: 0
    };
    update({ tasks: [...story.tasks, newTask] });
  };

  const updateTask = (id: string, patch: Partial<ProjectBacklogTask>) => {
    const next = story.tasks.map((t: ProjectBacklogTask) => t.id === id ? { ...t, ...patch } : t);
    update({ tasks: next });
  };

  const removeTask = (id: string) => {
    update({ tasks: story.tasks.filter((t: ProjectBacklogTask) => t.id !== id) });
  };

  // Test Cases
  const addTestCase = () => {
    const newTestCase: ProjectBacklogTestCase = {
      id: "new-" + Date.now(),
      testCaseText: "New Test Case"
    };
    update({ testCases: [...story.testCases, newTestCase] });
  };

  const updateTestCase = (id: string, text: string) => {
    const next = story.testCases.map((tc: ProjectBacklogTestCase) => tc.id === id ? { ...tc, testCaseText: text } : tc);
    update({ testCases: next });
  };

  const removeTestCase = (id: string) => {
    update({ testCases: story.testCases.filter((tc: ProjectBacklogTestCase) => tc.id !== id) });
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

      <div className="grid gap-6 items-start lg:grid-cols-2">
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  disabled={readOnly}
                  className="mt-1"
                  placeholder="Story title"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={story.description ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value || null)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Estimated Dev Hours</label>
                  <Input
                    type="number"
                    min={0}
                    value={story.estimatedDevHours ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const v = e.target.value;
                      setEstimatedDevHours(v === "" ? null : parseFloat(v) || 0);
                    }}
                    disabled={readOnly}
                    className="mt-1"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Estimated QA Hours</label>
                  <Input
                    type="number"
                    min={0}
                    value={story.estimatedTestHours ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const v = e.target.value;
                      setEstimatedTestHours(v === "" ? null : parseFloat(v) || 0);
                    }}
                    disabled={readOnly}
                    className="mt-1"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-end text-sm text-gray-600 font-medium">
                <span>Total Cost: {formatCurrency(story.totalCost)}</span>
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
                story.acceptanceCriteria.map((item: string, index: number) => (
                  <div key={index} className="flex gap-2 items-start">
                    <Input
                      value={item}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCriterion(index, e.target.value)}
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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-teal-600" />
                  Tasks
                </div>
                {!readOnly && (
                  <Button type="button" variant="outline" size="sm" onClick={addTask}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {story.tasks.length === 0 ? (
                <p className="text-sm text-gray-500">No tasks linked to this story.</p>
              ) : (
                <div className="space-y-4">
                  {story.tasks.map((task: ProjectBacklogTask) => (
                    <div
                      key={task.id}
                      className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex gap-2 items-start">
                        <Input
                          value={task.title}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTask(task.id, { title: e.target.value })}
                          disabled={readOnly}
                          placeholder="Task title"
                          className="flex-1 bg-white"
                        />
                        {!readOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTask(task.id)}
                            aria-label="Remove task"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                          <Select
                            value={task.status}
                            onValueChange={(v: string) => updateTask(task.id, { status: v })}
                            disabled={readOnly}
                          >
                            <SelectTrigger className="bg-white">
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
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-500 uppercase">Dev Hours</label>
                          <Input
                            type="number"
                            min={0}
                            value={task.devHours ?? ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const v = e.target.value;
                              updateTask(task.id, { devHours: v === "" ? null : parseFloat(v) || 0 });
                            }}
                            disabled={readOnly}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-500 uppercase">QA Hours</label>
                          <Input
                            type="number"
                            min={0}
                            value={task.testHours ?? ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const v = e.target.value;
                              updateTask(task.id, { testHours: v === "" ? null : parseFloat(v) || 0 });
                            }}
                            disabled={readOnly}
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Beaker className="h-5 w-5 text-teal-600" />
                  Test Cases
                </div>
                {!readOnly && (
                  <Button type="button" variant="outline" size="sm" onClick={addTestCase}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Test Case
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {story.testCases?.length === 0 ? (
                <p className="text-sm text-gray-500">No test cases linked to this story.</p>
              ) : (
                <div className="space-y-3">
                  {story.testCases?.map((tc: ProjectBacklogTestCase) => (
                    <div key={tc.id} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <textarea
                        value={tc.testCaseText}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateTestCase(tc.id, e.target.value)}
                        disabled={readOnly}
                        rows={2}
                        className="flex-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Test case steps and outcome..."
                      />
                      {!readOnly && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTestCase(tc.id)}
                          aria-label="Remove test case"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {!readOnly && hasChanges && (
        <div className="flex justify-end gap-2 p-4 bg-white border-t sticky bottom-0 z-10">
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
