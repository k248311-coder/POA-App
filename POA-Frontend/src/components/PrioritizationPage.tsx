import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  GripVertical,
  Plus,
  Minus,
  CalendarIcon,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  AlertCircle,
  Layers,
  Clock,
  DollarSign,
  LayoutList,
  Lock,
  CheckCircle,
} from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner@2.0.3";
import { format, parseISO } from "date-fns";
import type {
  Sprint,
  SprintStory,
  BacklogStory,
  CreateSprintRequest,
} from "../lib/api";
import {
  getSprints,
  getBacklogStories,
  createSprint as apiCreateSprint,
  deleteSprint as apiDeleteSprint,
  updateSprintStories,
  reorderSprintStories,
} from "../lib/api";

// ======================== Types ========================

interface PrioritizationPageProps {
  userRole?: "po" | "team";
  projectId: string;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

// ======================== Draggable Story Card ========================

function DraggableStoryCard({
  story,
  index,
  moveCard,
  isReadOnly = false,
  onRemove,
}: {
  story: SprintStory;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  isReadOnly?: boolean;
  onRemove?: () => void;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: "SPRINT_STORY",
    item: { type: "SPRINT_STORY", id: story.id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    canDrag: !isReadOnly,
  });

  const [, drop] = useDrop({
    accept: "SPRINT_STORY",
    hover: (item: DragItem) => {
      if (!isReadOnly && item.index !== index) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
    canDrop: () => !isReadOnly,
  });

  const statusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "done") return "status-done";
    if (s === "in progress" || s === "in-progress") return "status-in-progress";
    return "status-todo";
  };

  return (
    <div
      ref={(node) => (!isReadOnly ? drag(drop(node)) : null)}
      style={{ opacity: isDragging ? 0.45 : 1, transition: "opacity 0.2s" }}
      className="mb-2"
    >
      <div
        className={`story-drag-card ${!isReadOnly ? "draggable" : ""}`}
      >
        <div className="story-drag-priority">#{index + 1}</div>
        <div className="story-drag-grip">
          {isReadOnly ? (
            <Lock className="h-4 w-4 text-gray-400" />
          ) : (
            <GripVertical className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <div className="story-drag-body">
          <div className="story-drag-header">
            <span className="story-drag-title">{story.title}</span>
            <Badge className={`story-status-badge ${statusColor(story.storyStatus)}`}>
              {story.storyStatus}
            </Badge>
          </div>
          <div className="story-drag-meta">
            {story.epicTitle && <span className="meta-chip epic-chip">{story.epicTitle}</span>}
            {story.featureTitle && <span className="meta-chip feat-chip">{story.featureTitle}</span>}
            {story.storyPoints != null && (
              <span className="meta-chip pts-chip">{story.storyPoints} pts</span>
            )}
            {story.estimatedDevHours != null && (
              <span className="meta-chip hours-chip">Dev: {story.estimatedDevHours}h</span>
            )}
            {story.estimatedTestHours != null && (
              <span className="meta-chip hours-chip">QA: {story.estimatedTestHours}h</span>
            )}
            {story.totalCost > 0 && (
              <span className="meta-chip cost-chip">${story.totalCost.toLocaleString()}</span>
            )}
          </div>
        </div>
        {!isReadOnly && onRemove && (
          <button
            className="story-drag-remove"
            onClick={onRemove}
            title="Remove from sprint"
          >
            <Minus className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ======================== Sprint Card ========================

function SprintCard({
  sprint,
  isReadOnly,
  onDeleteSprint,
  onManageStories,
  onMoveCard,
}: {
  sprint: Sprint;
  isReadOnly: boolean;
  onDeleteSprint: (id: string, name: string) => void;
  onManageStories: (sprint: Sprint) => void;
  onMoveCard: (sprintId: string, dragIdx: number, hoverIdx: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const totalDevHours = sprint.stories.reduce((s, st) => s + (st.estimatedDevHours ?? 0), 0);
  const totalQAHours = sprint.stories.reduce((s, st) => s + (st.estimatedTestHours ?? 0), 0);
  const totalCost = sprint.stories.reduce((s, st) => s + st.totalCost, 0);
  const doneCount = sprint.stories.filter((s) => s.storyStatus.toLowerCase() === "done").length;

  const sprintStatusColor = (status: string) => {
    if (status === "active") return "sprint-badge-active";
    if (status === "completed") return "sprint-badge-done";
    return "sprint-badge-planned";
  };

  return (
    <div className="sprint-card">
      {/* Sprint Header */}
      <div className="sprint-card-header">
        <div className="sprint-header-left">
          <div className="sprint-header-icon">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="sprint-header-title">
              <span>{sprint.name}</span>
              <span className={`sprint-status-badge ${sprintStatusColor(sprint.status)}`}>
                {sprint.status}
              </span>
            </div>
            <div className="sprint-header-sub">
              {sprint.startDate && sprint.endDate && (
                <span className="sprint-date-range">
                  <CalendarIcon className="h-3.5 w-3.5 inline mr-1" />
                  {format(parseISO(sprint.startDate), "MMM d")} — {format(parseISO(sprint.endDate), "MMM d, yyyy")}
                </span>
              )}
              <span className="sprint-story-count">
                {sprint.stories.length} {sprint.stories.length === 1 ? "story" : "stories"}
                {sprint.stories.length > 0 && ` • ${doneCount}/${sprint.stories.length} done`}
              </span>
            </div>
          </div>
        </div>
        <div className="sprint-header-right">
          {/* Stats */}
          <div className="sprint-stats">
            <div className="sprint-stat">
              <Clock className="h-3.5 w-3.5" />
              <span>{totalDevHours.toFixed(0)}h dev</span>
            </div>
            <div className="sprint-stat">
              <Clock className="h-3.5 w-3.5" />
              <span>{totalQAHours.toFixed(0)}h QA</span>
            </div>
            <div className="sprint-stat">
              <DollarSign className="h-3.5 w-3.5" />
              <span>${totalCost.toLocaleString()}</span>
            </div>
          </div>
          {/* Actions */}
          {!isReadOnly && (
            <div className="sprint-actions">
              <Button
                size="sm"
                variant="outline"
                className="sprint-manage-btn"
                onClick={() => onManageStories(sprint)}
              >
                <LayoutList className="h-3.5 w-3.5 mr-1" />
                Manage
              </Button>
              <button
                className="sprint-delete-btn"
                onClick={() => onDeleteSprint(sprint.id, sprint.name)}
                title="Delete sprint"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
          <button
            className="sprint-collapse-btn"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Stories */}
      {expanded && (
        <div className="sprint-stories-section">
          {sprint.stories.length === 0 ? (
            <div className="sprint-empty">
              <LayoutList className="h-10 w-10 opacity-25 mx-auto mb-2" />
              <p>No stories in this sprint yet.</p>
              {!isReadOnly && (
                <Button
                  size="sm"
                  variant="outline"
                  className="sprint-manage-btn mt-3"
                  onClick={() => onManageStories(sprint)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Stories
                </Button>
              )}
            </div>
          ) : (
            <div className="sprint-stories-list">
              {sprint.stories.map((story, idx) => (
                <DraggableStoryCard
                  key={story.id}
                  story={story}
                  index={idx}
                  moveCard={(di, hi) => onMoveCard(sprint.id, di, hi)}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ======================== Main Page ========================

export function PrioritizationPage({ userRole = "po", projectId }: PrioritizationPageProps) {
  const isProductOwner = userRole === "po";

  // ---- State ----
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [backlogStories, setBacklogStories] = useState<BacklogStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create sprint dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");
  const [newStartDate, setNewStartDate] = useState<Date | undefined>(undefined);
  const [newEndDate, setNewEndDate] = useState<Date | undefined>(undefined);
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // Manage stories dialog
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [managingSprint, setManagingSprint] = useState<Sprint | null>(null);
  const [manageSelectedIds, setManageSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSprintId, setDeletingSprintId] = useState<string | null>(null);
  const [deletingSprintName, setDeletingSprintName] = useState("");

  // Debounce timer for reorder saves
  const reorderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Data loading ----
  const loadData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const [sprintsData, storiesData] = await Promise.all([
        getSprints(projectId),
        getBacklogStories(projectId),
      ]);
      setSprints(sprintsData);
      setBacklogStories(storiesData);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load sprint data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---- Create Sprint ----
  const handleCreateSprint = async () => {
    if (!newSprintName.trim()) {
      toast.error("Please enter a sprint name.");
      return;
    }
    setCreating(true);
    try {
      const payload: CreateSprintRequest = {
        name: newSprintName.trim(),
        startDate: newStartDate ? format(newStartDate, "yyyy-MM-dd") : null,
        endDate: newEndDate ? format(newEndDate, "yyyy-MM-dd") : null,
        storyIds: selectedStoryIds,
      };
      const newSprint = await apiCreateSprint(projectId, payload);
      setSprints((prev) => [...prev, newSprint]);
      // Refresh backlog stories to update sprint membership
      const updatedStories = await getBacklogStories(projectId);
      setBacklogStories(updatedStories);
      toast.success(`Sprint "${newSprintName}" created!`);
      resetCreateDialog();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create sprint");
    } finally {
      setCreating(false);
    }
  };

  const resetCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewSprintName("");
    setNewStartDate(undefined);
    setNewEndDate(undefined);
    setSelectedStoryIds([]);
  };

  // ---- Delete Sprint ----
  const handleDeleteSprint = async () => {
    if (!deletingSprintId) return;
    try {
      await apiDeleteSprint(projectId, deletingSprintId);
      setSprints((prev) => prev.filter((s) => s.id !== deletingSprintId));
      const updatedStories = await getBacklogStories(projectId);
      setBacklogStories(updatedStories);
      toast.success(`Sprint "${deletingSprintName}" deleted.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete sprint");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingSprintId(null);
      setDeletingSprintName("");
    }
  };

  // ---- Manage Stories Dialog ----
  const openManageDialog = (sprint: Sprint) => {
    setManagingSprint(sprint);
    setManageSelectedIds(sprint.stories.map((s) => s.id));
    setManageDialogOpen(true);
  };

  const handleSaveSprintStories = async () => {
    if (!managingSprint) return;
    setSaving(true);
    try {
      await updateSprintStories(projectId, managingSprint.id, manageSelectedIds);
      // Reload both sprints and backlog
      const [sprintsData, storiesData] = await Promise.all([
        getSprints(projectId),
        getBacklogStories(projectId),
      ]);
      setSprints(sprintsData);
      setBacklogStories(storiesData);
      toast.success("Sprint stories updated!");
      setManageDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update sprint stories");
    } finally {
      setSaving(false);
    }
  };

  const toggleManageStory = (storyId: string) => {
    setManageSelectedIds((prev) =>
      prev.includes(storyId) ? prev.filter((id) => id !== storyId) : [...prev, storyId]
    );
  };

  // ---- Drag & Drop Reorder ----
  const handleMoveCard = useCallback(
    (sprintId: string, dragIndex: number, hoverIndex: number) => {
      let finalOrderedIds: string[] = [];

      setSprints((prev) => {
        const newSprints = prev.map((sprint) => {
          if (sprint.id !== sprintId) return sprint;
          const stories = [...sprint.stories];
          const [dragged] = stories.splice(dragIndex, 1);
          stories.splice(hoverIndex, 0, dragged);
          const reordered = stories.map((s, i) => ({ ...s, priority: i + 1 }));
          finalOrderedIds = reordered.map(s => s.id);
          return { ...sprint, stories: reordered };
        });
        return newSprints;
      });

      // Save to backend with debounce
      if (reorderTimer.current) clearTimeout(reorderTimer.current);
      reorderTimer.current = setTimeout(async () => {
        if (finalOrderedIds.length > 0) {
          try {
            await reorderSprintStories(projectId, sprintId, finalOrderedIds);
          } catch (e) {
            toast.error("Failed to persist new story order");
          }
        }
      }, 1200);
    },
    [projectId]
  );

  // ---- Remove story from sprint inline ----
  const handleRemoveFromSprint = async (sprintId: string, storyId: string) => {
    const sprint = sprints.find((s) => s.id === sprintId);
    if (!sprint) return;
    const newIds = sprint.stories.filter((s) => s.id !== storyId).map((s) => s.id);
    try {
      await updateSprintStories(projectId, sprintId, newIds);
      setSprints((prev) =>
        prev.map((s) =>
          s.id === sprintId
            ? { ...s, stories: s.stories.filter((st) => st.id !== storyId) }
            : s
        )
      );
      const updatedStories = await getBacklogStories(projectId);
      setBacklogStories(updatedStories);
      toast.success("Story removed from sprint.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove story");
    }
  };

  // ---- Helpers ----
  const calculateDuration = (start: Date, end: Date) => {
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    if (weeks === 0) return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    if (days === 0) return `${weeks} week${weeks !== 1 ? "s" : ""}`;
    return `${weeks}w ${days}d`;
  };

  const freeBacklogStories = backlogStories.filter((s) => !s.isInSprint);
  const totalProjectDevHours = sprints.flatMap((s) => s.stories).reduce((acc, s) => acc + (s.estimatedDevHours ?? 0), 0);
  const totalProjectQAHours = sprints.flatMap((s) => s.stories).reduce((acc, s) => acc + (s.estimatedTestHours ?? 0), 0);
  const totalProjectCost = sprints.flatMap((s) => s.stories).reduce((acc, s) => acc + s.totalCost, 0);

  // All stories available to add in "Create Sprint" dialog = those not already in any sprint
  const availableToAdd = backlogStories.filter((s) => !s.isInSprint);

  // ======================== Render ========================

  if (loading) {
    return (
      <div className="prioritization-loading">
        <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
        <p>Loading sprint data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prioritization-error">
        <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
        <p className="text-red-700 mb-4">{error}</p>
        <Button onClick={loadData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="prioritization-root">
        {/* ---- Page Header ---- */}
        <div className="prioritization-page-header">
          <div>
            <h1 className="prioritization-title">Sprint Prioritization</h1>
            <p className="prioritization-sub">
              {isProductOwner
                ? "Create and manage sprints. Drag stories to reprioritize within a sprint."
                : "View sprint backlog and priorities."}
            </p>
          </div>
          <div className="prioritization-header-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="gap-2 refresh-btn"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            {isProductOwner && (
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="create-sprint-btn"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Sprint
              </Button>
            )}
          </div>
        </div>

        {/* ---- Read-only Banner ---- */}
        {!isProductOwner && (
          <div className="readonly-banner">
            <Lock className="h-4 w-4" />
            <span>View-only mode. Only Product Owners can manage sprints.</span>
          </div>
        )}

        {/* ---- Overview Stats ---- */}
        <div className="overview-stats-grid">
          <div className="overview-stat-card">
            <div className="overview-stat-icon sprints-icon">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="overview-stat-value">{sprints.length}</span>
              <span className="overview-stat-label">Sprints</span>
            </div>
          </div>
          <div className="overview-stat-card">
            <div className="overview-stat-icon stories-icon">
              <LayoutList className="h-5 w-5" />
            </div>
            <div>
              <span className="overview-stat-value">
                {sprints.reduce((a, s) => a + s.stories.length, 0)}
              </span>
              <span className="overview-stat-label">Stories in Sprints</span>
            </div>
          </div>
          <div className="overview-stat-card">
            <div className="overview-stat-icon hours-icon">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="overview-stat-value">{totalProjectDevHours.toFixed(0)}h</span>
              <span className="overview-stat-label">Dev Hours</span>
            </div>
          </div>
          <div className="overview-stat-card">
            <div className="overview-stat-icon qa-icon">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="overview-stat-value">{totalProjectQAHours.toFixed(0)}h</span>
              <span className="overview-stat-label">QA Hours</span>
            </div>
          </div>
          <div className="overview-stat-card">
            <div className="overview-stat-icon cost-icon">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="overview-stat-value">${totalProjectCost.toLocaleString()}</span>
              <span className="overview-stat-label">Total Cost</span>
            </div>
          </div>
          <div className="overview-stat-card">
            <div className="overview-stat-icon backlog-icon">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="overview-stat-value">{freeBacklogStories.length}</span>
              <span className="overview-stat-label">Unassigned Stories</span>
            </div>
          </div>
        </div>

        {/* ---- Sprint List ---- */}
        {sprints.length === 0 ? (
          <div className="no-sprints-placeholder">
            <Layers className="h-14 w-14 opacity-20 mb-4" />
            <h3>No sprints yet</h3>
            <p>
              {isProductOwner
                ? "Create your first sprint to start planning work."
                : "The Product Owner hasn't created any sprints yet."}
            </p>
            {isProductOwner && (
              <Button onClick={() => setCreateDialogOpen(true)} className="create-sprint-btn mt-4">
                <Plus className="h-4 w-4 mr-1" />
                Create First Sprint
              </Button>
            )}
          </div>
        ) : (
          <div className="sprint-list">
            {sprints.map((sprint) => (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                isReadOnly={!isProductOwner}
                onDeleteSprint={(id, name) => {
                  setDeletingSprintId(id);
                  setDeletingSprintName(name);
                  setDeleteDialogOpen(true);
                }}
                onManageStories={openManageDialog}
                onMoveCard={handleMoveCard}
              />
            ))}
          </div>
        )}

        {/* ---- Unassigned Backlog Panel ---- */}
        {freeBacklogStories.length > 0 && (
          <Card className="backlog-panel">
            <CardHeader className="backlog-panel-header">
              <CardTitle className="backlog-panel-title">
                <LayoutList className="h-5 w-5" />
                Unassigned Backlog
                <span className="backlog-count">{freeBacklogStories.length}</span>
              </CardTitle>
              <p className="backlog-panel-sub">
                Stories not yet assigned to any sprint
              </p>
            </CardHeader>
            <CardContent>
              <div className="backlog-story-list">
                {freeBacklogStories.map((story) => (
                  <div key={story.id} className="backlog-story-item">
                    <div className="backlog-story-info">
                      <span className="backlog-story-title">{story.title}</span>
                      <div className="backlog-story-meta">
                        {story.epicTitle && <span className="meta-chip epic-chip">{story.epicTitle}</span>}
                        {story.featureTitle && <span className="meta-chip feat-chip">{story.featureTitle}</span>}
                        {story.storyPoints != null && <span className="meta-chip pts-chip">{story.storyPoints} pts</span>}
                        {story.estimatedDevHours != null && <span className="meta-chip hours-chip">Dev: {story.estimatedDevHours}h</span>}
                        {story.estimatedTestHours != null && <span className="meta-chip hours-chip">QA: {story.estimatedTestHours}h</span>}
                      </div>
                    </div>
                    <Badge className={`story-status-badge ${story.status.toLowerCase().includes("done") ? "status-done" : story.status.toLowerCase().includes("progress") ? "status-in-progress" : "status-todo"}`}>
                      {story.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ======================== CREATE SPRINT DIALOG ======================== */}
        <Dialog open={createDialogOpen} onOpenChange={(o) => { if (!o) resetCreateDialog(); else setCreateDialogOpen(true); }}>
          <DialogContent className="create-sprint-dialog">
            <DialogHeader>
              <DialogTitle>Create New Sprint</DialogTitle>
              <DialogDescription>
                Set sprint details and optionally add stories from the backlog.
              </DialogDescription>
            </DialogHeader>

            <div className="create-sprint-form">
              {/* Sprint Name */}
              <div className="form-field">
                <Label htmlFor="sprint-name">Sprint Name *</Label>
                <Input
                  id="sprint-name"
                  placeholder="e.g., Sprint 1 – Q1 2026"
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateSprint(); }}
                />
              </div>

              {/* Dates */}
              <div className="form-dates-row">
                <div className="form-field">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`date-picker-btn ${!newStartDate ? "text-gray-400" : ""}`}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {newStartDate ? format(newStartDate, "MMM d, yyyy") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={newStartDate}
                        onSelect={setNewStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="form-field">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`date-picker-btn ${!newEndDate ? "text-gray-400" : ""}`}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {newEndDate ? format(newEndDate, "MMM d, yyyy") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={newEndDate}
                        onSelect={setNewEndDate}
                        disabled={(d) => newStartDate ? d <= newStartDate : false}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Duration badge */}
              {newStartDate && newEndDate && newEndDate > newStartDate && (
                <div className="duration-badge">
                  Duration: {calculateDuration(newStartDate, newEndDate)}
                </div>
              )}

              {/* Story selection */}
              <div className="form-field">
                <Label>Add Stories from Backlog</Label>
                {availableToAdd.length === 0 ? (
                  <p className="no-stories-hint">No unassigned stories available.</p>
                ) : (
                  <div className="story-select-list">
                    <div className="story-select-actions">
                      <button className="select-all-btn" onClick={() => setSelectedStoryIds(availableToAdd.map((s) => s.id))}>
                        Select All
                      </button>
                      <button className="clear-btn" onClick={() => setSelectedStoryIds([])}>
                        Clear
                      </button>
                      <span className="select-count">{selectedStoryIds.length} selected</span>
                    </div>
                    {availableToAdd.map((story) => (
                      <label
                        key={story.id}
                        className={`story-select-item ${selectedStoryIds.includes(story.id) ? "selected" : ""}`}
                      >
                        <Checkbox
                          checked={selectedStoryIds.includes(story.id)}
                          onCheckedChange={() =>
                            setSelectedStoryIds((prev) =>
                              prev.includes(story.id)
                                ? prev.filter((id) => id !== story.id)
                                : [...prev, story.id]
                            )
                          }
                        />
                        <div className="story-select-info">
                          <span className="story-select-title">{story.title}</span>
                          <div className="story-select-meta">
                            {story.epicTitle && <span className="meta-chip epic-chip">{story.epicTitle}</span>}
                            {story.featureTitle && <span className="meta-chip feat-chip">{story.featureTitle}</span>}
                            {story.storyPoints != null && <span className="meta-chip pts-chip">{story.storyPoints} pts</span>}
                            {story.estimatedDevHours != null && <span className="meta-chip hours-chip">{story.estimatedDevHours}h dev</span>}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="create-sprint-footer">
              <Button variant="outline" onClick={resetCreateDialog} disabled={creating}>
                Cancel
              </Button>
              <Button onClick={handleCreateSprint} disabled={!newSprintName.trim() || creating} className="create-sprint-confirm-btn">
                {creating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating…</>
                ) : (
                  <><Plus className="h-4 w-4 mr-1" />Create Sprint</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ======================== MANAGE STORIES DIALOG ======================== */}
        <Dialog open={manageDialogOpen} onOpenChange={(o) => { if (!o) setManageDialogOpen(false); }}>
          <DialogContent className="manage-stories-dialog">
            <DialogHeader>
              <DialogTitle>Manage Stories – {managingSprint?.name}</DialogTitle>
              <DialogDescription>
                Select stories to include in this sprint. Deselect to remove them.
              </DialogDescription>
            </DialogHeader>

            <div className="manage-stories-body">
              {/* Sprint's current stories */}
              <div className="manage-section">
                <h4 className="manage-section-title">In Sprint ({manageSelectedIds.length})</h4>
                <div className="manage-story-list">
                  {backlogStories.filter((s) => manageSelectedIds.includes(s.id)).length === 0 ? (
                    <p className="no-stories-hint">No stories selected yet.</p>
                  ) : (
                    backlogStories
                      .filter((s) => manageSelectedIds.includes(s.id))
                      .map((story) => (
                        <div key={story.id} className="manage-story-item in-sprint">
                          <Checkbox checked onCheckedChange={() => toggleManageStory(story.id)} />
                          <div className="manage-story-info">
                            <span>{story.title}</span>
                            <div className="story-select-meta">
                              {story.epicTitle && <span className="meta-chip epic-chip">{story.epicTitle}</span>}
                              {story.storyPoints != null && <span className="meta-chip pts-chip">{story.storyPoints} pts</span>}
                            </div>
                          </div>
                          <button className="inline-remove-btn" onClick={() => toggleManageStory(story.id)}>
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Available backlog */}
              <div className="manage-section">
                <h4 className="manage-section-title">
                  Backlog ({backlogStories.filter((s) => !manageSelectedIds.includes(s.id) && (!s.isInSprint || s.currentSprintId === managingSprint?.id)).length} available)
                </h4>
                <div className="manage-story-list">
                  {backlogStories
                    .filter(
                      (s) =>
                        !manageSelectedIds.includes(s.id) &&
                        (!s.isInSprint || s.currentSprintId === managingSprint?.id)
                    )
                    .map((story) => (
                      <div
                        key={story.id}
                        className="manage-story-item"
                        onClick={() => toggleManageStory(story.id)}
                      >
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => toggleManageStory(story.id)}
                        />
                        <div className="manage-story-info">
                          <span>{story.title}</span>
                          <div className="story-select-meta">
                            {story.epicTitle && <span className="meta-chip epic-chip">{story.epicTitle}</span>}
                            {story.featureTitle && <span className="meta-chip feat-chip">{story.featureTitle}</span>}
                            {story.storyPoints != null && <span className="meta-chip pts-chip">{story.storyPoints} pts</span>}
                            {story.estimatedDevHours != null && <span className="meta-chip hours-chip">{story.estimatedDevHours}h dev</span>}
                          </div>
                        </div>
                        <button className="inline-add-btn" onClick={(e) => { e.stopPropagation(); toggleManageStory(story.id); }}>
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  {backlogStories.filter(
                    (s) =>
                      !manageSelectedIds.includes(s.id) &&
                      (!s.isInSprint || s.currentSprintId === managingSprint?.id)
                  ).length === 0 && (
                      <p className="no-stories-hint">All stories are already assigned.</p>
                    )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setManageDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSaveSprintStories} disabled={saving} className="create-sprint-confirm-btn">
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ======================== DELETE CONFIRM DIALOG ======================== */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Sprint</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>"{deletingSprintName}"</strong>? All stories
                will be moved back to the unassigned backlog. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSprint}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Sprint
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DndProvider>
  );
}
