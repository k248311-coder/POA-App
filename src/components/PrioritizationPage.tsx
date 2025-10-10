import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { GripVertical, ListOrdered, Plus, Minus, Calendar, CheckCircle2, PlusCircle, Lock, CalendarIcon } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner@2.0.3";
import { Alert, AlertDescription } from "./ui/alert";
import { format } from "date-fns";

interface Story {
  id: string;
  title: string;
  epic: string;
  feature: string;
  devHours: number;
  qaHours: number;
  cost: number;
  status: "done" | "in-progress" | "todo";
  inSprint: boolean;
}

interface PrioritizationPageProps {
  userRole?: "po" | "team";
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

function DraggableStoryCard({ 
  story, 
  index, 
  moveCard,
  isReadOnly = false
}: { 
  story: Story; 
  index: number; 
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  isReadOnly?: boolean;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: "STORY",
    item: { type: "STORY", id: story.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isReadOnly,
  });

  const [, drop] = useDrop({
    accept: "STORY",
    hover: (item: DragItem) => {
      if (!isReadOnly && item.index !== index) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
    canDrop: !isReadOnly,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-700 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "todo":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div
      ref={(node) => !isReadOnly ? drag(drop(node)) : null}
      className={`mb-3 transition-opacity ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <Card className={`${!isReadOnly ? 'cursor-move hover:shadow-md' : ''} transition-shadow border-gray-200`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {!isReadOnly && <GripVertical className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />}
            {isReadOnly && <Lock className="h-4 w-4 text-gray-300 mt-1 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-teal-600">{story.id}</span>
                <Badge className={getStatusColor(story.status)} variant="outline">
                  {story.status.toUpperCase().replace("-", " ")}
                </Badge>
              </div>
              <h4 className="mb-2">{story.title}</h4>
              <div className="space-y-1 text-gray-600">
                <p>Epic: {story.epic}</p>
                <p>Feature: {story.feature}</p>
              </div>
              <div className="mt-3 flex items-center gap-4 text-gray-600">
                <span>Dev: {story.devHours}h</span>
                <span>QA: {story.qaHours}h</span>
                <span>${story.cost}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PrioritizationPage({ userRole = "po" }: PrioritizationPageProps) {
  const [currentSprint, setCurrentSprint] = useState("Sprint 5 - Q4 2025");
  const [sprintDuration, setSprintDuration] = useState("2 weeks");
  const [sprintStartDate, setSprintStartDate] = useState<Date | undefined>(undefined);
  const [sprintEndDate, setSprintEndDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");
  const [newSprintStartDate, setNewSprintStartDate] = useState<Date | undefined>(undefined);
  const [newSprintEndDate, setNewSprintEndDate] = useState<Date | undefined>(undefined);
  const isProductOwner = userRole === "po";
  const [stories, setStories] = useState<Story[]>([
    {
      id: "S1",
      title: "User can login with email and password",
      epic: "Login & Registration",
      feature: "User Authentication",
      devHours: 16,
      qaHours: 8,
      cost: 2400,
      status: "in-progress",
      inSprint: true,
    },
    {
      id: "S2",
      title: "User can sign up with email verification",
      epic: "Login & Registration",
      feature: "User Authentication",
      devHours: 24,
      qaHours: 12,
      cost: 3600,
      status: "todo",
      inSprint: true,
    },
    {
      id: "S3",
      title: "User can add items to cart",
      epic: "Cart Management",
      feature: "Shopping Cart",
      devHours: 20,
      qaHours: 10,
      cost: 3000,
      status: "done",
      inSprint: false,
    },
    {
      id: "S4",
      title: "User can remove items from cart",
      epic: "Cart Management",
      feature: "Shopping Cart",
      devHours: 12,
      qaHours: 6,
      cost: 1800,
      status: "todo",
      inSprint: true,
    },
    {
      id: "S5",
      title: "Admin can view analytics dashboard",
      epic: "Analytics",
      feature: "Admin Dashboard",
      devHours: 32,
      qaHours: 16,
      cost: 4800,
      status: "todo",
      inSprint: false,
    },
    {
      id: "S6",
      title: "User can update profile information",
      epic: "Profile Management",
      feature: "User Profile",
      devHours: 18,
      qaHours: 9,
      cost: 2700,
      status: "todo",
      inSprint: false,
    },
    {
      id: "S7",
      title: "User can reset password via email",
      epic: "Login & Registration",
      feature: "User Authentication",
      devHours: 14,
      qaHours: 7,
      cost: 2100,
      status: "todo",
      inSprint: false,
    },
    {
      id: "S8",
      title: "User can checkout with saved payment method",
      epic: "Checkout",
      feature: "Payment Processing",
      devHours: 28,
      qaHours: 14,
      cost: 4200,
      status: "todo",
      inSprint: false,
    },
  ]);

  const [selectedBacklogStories, setSelectedBacklogStories] = useState<string[]>([]);

  const sprintStories = stories.filter((s) => s.inSprint);
  const undoneSprintStories = sprintStories.filter((s) => s.status !== "done");
  const backlogStories = stories.filter((s) => !s.inSprint && s.status !== "done");

  const totalDevHours = undoneSprintStories.reduce((sum, s) => sum + s.devHours, 0);
  const totalQAHours = undoneSprintStories.reduce((sum, s) => sum + s.qaHours, 0);
  const totalCost = undoneSprintStories.reduce((sum, s) => sum + s.cost, 0);

  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const draggedStory = undoneSprintStories[dragIndex];
    const updatedUndoneStories = [...undoneSprintStories];
    updatedUndoneStories.splice(dragIndex, 1);
    updatedUndoneStories.splice(hoverIndex, 0, draggedStory);

    // Update the main stories array to reflect the new order
    const otherStories = stories.filter((s) => !s.inSprint || s.status === "done");
    setStories([...otherStories, ...updatedUndoneStories]);
  };

  const toggleBacklogSelection = (storyId: string) => {
    setSelectedBacklogStories((prev) =>
      prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId]
    );
  };

  const addToSprint = () => {
    setStories((prev) =>
      prev.map((story) =>
        selectedBacklogStories.includes(story.id)
          ? { ...story, inSprint: true }
          : story
      )
    );
    setSelectedBacklogStories([]);
  };

  const removeFromSprint = (storyId: string) => {
    setStories((prev) =>
      prev.map((story) =>
        story.id === storyId ? { ...story, inSprint: false } : story
      )
    );
  };

  const selectAllBacklog = () => {
    setSelectedBacklogStories(backlogStories.map((s) => s.id));
  };

  const deselectAllBacklog = () => {
    setSelectedBacklogStories([]);
  };

  const calculateDuration = (start: Date, end: Date): string => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    
    if (weeks === 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (days === 0) {
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    } else {
      return `${weeks} week${weeks !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''}`;
    }
  };

  const handleCloseSprint = () => {
    // Mark all undone stories in sprint as done or move them
    toast.success(`${currentSprint} has been closed successfully!`);
  };

  const handleCreateSprint = () => {
    if (!newSprintName.trim()) {
      toast.error("Please enter sprint name");
      return;
    }
    if (!newSprintStartDate || !newSprintEndDate) {
      toast.error("Please select start and end dates");
      return;
    }
    if (newSprintEndDate <= newSprintStartDate) {
      toast.error("End date must be after start date");
      return;
    }
    
    const duration = calculateDuration(newSprintStartDate, newSprintEndDate);
    setCurrentSprint(newSprintName);
    setSprintDuration(duration);
    setSprintStartDate(newSprintStartDate);
    setSprintEndDate(newSprintEndDate);
    setNewSprintName("");
    setNewSprintStartDate(undefined);
    setNewSprintEndDate(undefined);
    setIsCreateSprintOpen(false);
    toast.success(`${newSprintName} created successfully!`);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div>
          <h1>Sprint Prioritization</h1>
          <p className="text-gray-600 mt-1">
            {isProductOwner 
              ? "Manage and prioritize your sprint backlog with drag-and-drop"
              : "View current sprint backlog and priorities"}
          </p>
        </div>

        {/* Role-based Alert */}
        {!isProductOwner && (
          <Alert className="border-blue-200 bg-blue-50">
            <Lock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              You are viewing the sprint in read-only mode. Only Product Owners can manage and prioritize the sprint backlog.
            </AlertDescription>
          </Alert>
        )}

        {/* Sprint Header */}
        <Card className="border-teal-200 bg-teal-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-teal-600" />
                <div>
                  <h2 className="text-teal-900">{currentSprint}</h2>
                  <p className="text-teal-700 mt-1">
                    {undoneSprintStories.length} stories in sprint backlog • Duration: {sprintDuration}
                    {sprintStartDate && sprintEndDate && (
                      <> • {format(sprintStartDate, "MMM dd")} - {format(sprintEndDate, "MMM dd, yyyy")}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {isProductOwner && (
                  <>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <ListOrdered className="w-4 h-4 mr-2" />
                      Prioritize Sprint Backlog
                    </Button>
                    <Button
                      onClick={handleCloseSprint}
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Close Sprint
                    </Button>
                    <Button
                      onClick={() => setIsCreateSprintOpen(true)}
                      variant="outline"
                      className="border-teal-600 text-teal-600 hover:bg-teal-50"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create Sprint
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <p className="text-gray-600">Total Dev Hours</p>
              <h2 className="mt-2 text-teal-600">{totalDevHours}h</h2>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <p className="text-gray-600">Total QA Hours</p>
              <h2 className="mt-2 text-blue-600">{totalQAHours}h</h2>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <p className="text-gray-600">Total Cost</p>
              <h2 className="mt-2 text-gray-900">${totalCost.toLocaleString()}</h2>
            </CardContent>
          </Card>
        </div>

        {/* Sprint Backlog with Drag & Drop */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              {isProductOwner ? <GripVertical className="h-5 w-5" /> : <ListOrdered className="h-5 w-5" />}
              Sprint Backlog {isProductOwner && "- Drag to Reorder"}
            </CardTitle>
            <p className="text-gray-600 mt-1">
              {isProductOwner 
                ? "Drag stories to change their priority order"
                : "Stories ordered by priority"}
            </p>
          </CardHeader>
          <CardContent>
            {undoneSprintStories.length === 0 ? (
              <div className="text-center py-12">
                <ListOrdered className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">No stories in sprint backlog</h3>
                <p className="text-gray-500 mb-4">
                  {isProductOwner 
                    ? 'Click "Prioritize Sprint Backlog" to add stories'
                    : "The Product Owner hasn't added any stories to this sprint yet"}
                </p>
                {isProductOwner && (
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stories
                  </Button>
                )}
              </div>
            ) : (
              <div>
                {undoneSprintStories.map((story, index) => (
                  <div key={story.id} className="relative">
                    <div className="absolute -left-8 top-6 text-gray-400">
                      #{index + 1}
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <DraggableStoryCard
                          story={story}
                          index={index}
                          moveCard={moveCard}
                          isReadOnly={!isProductOwner}
                        />
                      </div>
                      {isProductOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromSprint(story.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-3"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog for Creating New Sprint */}
        <Dialog open={isCreateSprintOpen} onOpenChange={setIsCreateSprintOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Create New Sprint</DialogTitle>
              <DialogDescription>
                Enter the sprint name and select start and end dates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sprintName" className="text-gray-700">
                  Sprint Name
                </Label>
                <Input
                  id="sprintName"
                  placeholder="e.g., Sprint 6 - Q1 2026"
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !newSprintStartDate && "text-gray-500"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newSprintStartDate ? (
                        format(newSprintStartDate, "PPP")
                      ) : (
                        <span>Pick a start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={newSprintStartDate}
                      onSelect={setNewSprintStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !newSprintEndDate && "text-gray-500"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newSprintEndDate ? (
                        format(newSprintEndDate, "PPP")
                      ) : (
                        <span>Pick an end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={newSprintEndDate}
                      onSelect={setNewSprintEndDate}
                      initialFocus
                      disabled={(date) =>
                        newSprintStartDate ? date <= newSprintStartDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {newSprintStartDate && newSprintEndDate && newSprintEndDate > newSprintStartDate && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <p className="text-teal-900">
                    Duration: {calculateDuration(newSprintStartDate, newSprintEndDate)}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateSprintOpen(false);
                  setNewSprintName("");
                  setNewSprintStartDate(undefined);
                  setNewSprintEndDate(undefined);
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSprint}
                className="bg-teal-600 hover:bg-teal-700"
                disabled={!newSprintName.trim() || !newSprintStartDate || !newSprintEndDate}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog for Managing Sprint Backlog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Manage Sprint Backlog</DialogTitle>
              <DialogDescription>
                Select undone stories from the product backlog to add to {currentSprint}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllBacklog}
                    className="border-teal-600 text-teal-600 hover:bg-teal-50"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllBacklog}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Deselect All
                  </Button>
                </div>
                <Button
                  onClick={addToSprint}
                  disabled={selectedBacklogStories.length === 0}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add {selectedBacklogStories.length > 0 && `(${selectedBacklogStories.length})`} to Sprint
                </Button>
              </div>

              {/* Backlog Stories */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-gray-900 mb-4">
                  Product Backlog ({backlogStories.length} undone stories)
                </h3>
                {backlogStories.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No undone stories in product backlog
                  </p>
                ) : (
                  <div className="space-y-2">
                    {backlogStories.map((story) => (
                      <div
                        key={story.id}
                        className={`p-4 bg-white border rounded-lg cursor-pointer transition-colors ${
                          selectedBacklogStories.includes(story.id)
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200 hover:border-teal-300"
                        }`}
                        onClick={() => toggleBacklogSelection(story.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedBacklogStories.includes(story.id)}
                            onCheckedChange={() => toggleBacklogSelection(story.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-teal-600">{story.id}</span>
                              <Badge
                                variant="outline"
                                className="bg-gray-100 text-gray-700 border-gray-200"
                              >
                                {story.status.toUpperCase().replace("-", " ")}
                              </Badge>
                            </div>
                            <h4 className="mb-2">{story.title}</h4>
                            <div className="flex items-center gap-4 text-gray-600">
                              <span>Epic: {story.epic}</span>
                              <span>•</span>
                              <span>Dev: {story.devHours}h</span>
                              <span>QA: {story.qaHours}h</span>
                              <span>${story.cost}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Sprint Stories */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <h3 className="text-gray-900 mb-4">
                  Current Sprint ({undoneSprintStories.length} undone stories)
                </h3>
                {undoneSprintStories.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No stories in sprint backlog
                  </p>
                ) : (
                  <div className="space-y-2">
                    {undoneSprintStories.map((story) => (
                      <div
                        key={story.id}
                        className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-teal-600">{story.id}</span>
                              <Badge
                                variant="outline"
                                className={
                                  story.status === "in-progress"
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                }
                              >
                                {story.status.toUpperCase().replace("-", " ")}
                              </Badge>
                            </div>
                            <h4 className="mb-2">{story.title}</h4>
                            <div className="flex items-center gap-4 text-gray-600">
                              <span>Epic: {story.epic}</span>
                              <span>•</span>
                              <span>Dev: {story.devHours}h</span>
                              <span>QA: {story.qaHours}h</span>
                              <span>${story.cost}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromSprint(story.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Minus className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}
