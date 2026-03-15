import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { FileText, Clock } from "lucide-react";
import { getProjectBacklog, updateStory } from "../lib/api";
import { toast } from "sonner";
import type { ProjectBacklogStory } from "../types/api";
import { StoryDetailPage } from "./StoryDetailPage";

interface MyStory extends ProjectBacklogStory {
  epicTitle: string | null;
  featureTitle: string | null;
  loggedHours: number;
}

export function MyStoriesPage({ projectId }: { projectId: string }) {
  const [stories, setStories] = useState<MyStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<MyStory | null>(null);

  const loadStories = () => {
    const userId = localStorage.getItem("poa_user_id");
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    getProjectBacklog(projectId)
      .then((data) => {
        const myStories: MyStory[] = [];
        data.epics.forEach((epic) => {
          epic.features.forEach((feature) => {
            feature.stories.forEach((story) => {
              if (story.assigneeId === userId) {
                const logged = story.tasks.reduce((sum, t) => sum + (t.devHours || 0) + (t.testHours || 0), 0);
                myStories.push({
                  ...story,
                  epicTitle: epic.title,
                  featureTitle: feature.title,
                  loggedHours: logged
                });
              }
            });
          });
        });
        setStories(myStories);
      })
      .catch((err) => {
        console.error("Failed to load stories", err);
        toast.error("Failed to load attached stories");
      });
  };

  useEffect(() => {
    loadStories();
  }, [projectId]);

  const totalEstimated = stories.reduce((sum, s) => sum + (s.estimatedDevHours || 0) + (s.estimatedTestHours || 0), 0);
  const totalLogged = stories.reduce((sum, s) => sum + s.loggedHours, 0);

  if (selectedStory) {
    return (
      <StoryDetailPage
        projectId={projectId}
        story={selectedStory}
        epicTitle={selectedStory.epicTitle ?? undefined}
        featureTitle={selectedStory.featureTitle ?? undefined}
        onBack={() => {
          setSelectedStory(null);
        }}
        onStoryUpdated={async (updated) => {
          try {
            await updateStory(updated.id, updated);
            toast.success("Story updated successfully!");
            // Update local story to show changes immediately if user stays on page
            setSelectedStory({
              ...updated,
              epicTitle: selectedStory.epicTitle,
              featureTitle: selectedStory.featureTitle,
              loggedHours: updated.tasks.reduce((sum, t) => sum + (t.devHours || 0) + (t.testHours || 0), 0)
            });
            // Reload backlog to update the table
            loadStories();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to update story");
            throw e;
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>My Stories</h1>
        <p className="text-gray-600 mt-1">Manage your assigned stories and log your time</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Stories</p>
                <h2 className="mt-2">{stories.length}</h2>
              </div>
              <div className="bg-teal-50 text-teal-600 p-3 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estimated Hours</p>
                <h2 className="mt-2">{totalEstimated}h</h2>
              </div>
              <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Logged Hours</p>
                <h2 className="mt-2">{totalLogged}h</h2>
              </div>
              <div className="bg-purple-50 text-purple-600 p-3 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stories Table */}
      <Card>
        <CardHeader>
          <CardTitle>All My Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Epic</TableHead>
                  <TableHead>Feature</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Est. Hours</TableHead>
                  <TableHead className="text-right">Logged Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stories.map((story) => {
                  const estHours = (story.estimatedDevHours || 0) + (story.estimatedTestHours || 0);
                  return (
                    <TableRow key={story.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedStory(story)}>
                      <TableCell className="font-medium">{story.id.substring(0, 8)}</TableCell>
                      <TableCell>{story.title}</TableCell>
                      <TableCell className="text-sm text-gray-600">{story.epicTitle || "—"}</TableCell>
                      <TableCell className="text-sm text-gray-600">{story.featureTitle || "—"}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-sm">{story.status}</span>
                      </TableCell>
                      <TableCell className="text-right">{estHours}h</TableCell>
                      <TableCell className="text-right">
                        <span className={story.loggedHours > estHours ? "text-red-600" : ""}>
                          {story.loggedHours}h
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
