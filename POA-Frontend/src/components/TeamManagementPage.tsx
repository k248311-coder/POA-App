import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { UserPlus, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { getProjectMembers, addProjectMember, updateProjectMember, removeProjectMember } from "../lib/api";
import type { ProjectMember, AddProjectMemberRequest, UpdateProjectMemberRequest } from "../types/api";

export function TeamManagementPage({ projectId, readOnly = false }: { projectId: string, readOnly?: boolean }) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Invite/Edit Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    role: "developer",
    hourlyCost: 0
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getProjectMembers(projectId);
      setMembers(data);
    } catch (error) {
      toast.error("Failed to fetch team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const handleOpenAddDialog = () => {
    setIsEditing(false);
    setEditingMemberId(null);
    setFormData({ email: "", role: "developer", hourlyCost: 0 });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (member: ProjectMember) => {
    setIsEditing(true);
    setEditingMemberId(member.id);
    setFormData({ email: member.email, role: member.role, hourlyCost: member.hourlyCost });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (isEditing && editingMemberId) {
        const updateReq: UpdateProjectMemberRequest = {
          role: formData.role,
          hourlyCost: formData.hourlyCost
        };
        await updateProjectMember(editingMemberId, updateReq);
        toast.success("Member updated successfully");
      } else {
        const addReq: AddProjectMemberRequest = {
          email: formData.email,
          role: formData.role,
          hourlyCost: formData.hourlyCost
        };
        await addProjectMember(projectId, addReq);
        toast.success("Invitation sent successfully");
      }
      setIsDialogOpen(false);
      fetchMembers();
    } catch (error: any) {
      const message = error.message || "Failed to save member";
      toast.error(message);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member from the project?")) return;
    try {
      await removeProjectMember(memberId);
      toast.success("Member removed successfully");
      fetchMembers();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "developer":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "qa analyst":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "project manager":
        return "bg-teal-100 text-teal-700 border-teal-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading team members...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1>Team Members</h1>
          <p className="text-gray-600 mt-1">
            {readOnly ? "View your colleagues and team roles" : "Manage your team members and their roles"}
          </p>
        </div>
        {!readOnly && (
          <Button onClick={handleOpenAddDialog} className="bg-teal-600 hover:bg-teal-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Total Members</p>
            <h2 className="mt-2 text-2xl font-bold">{members.length}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Project Managers</p>
            <h2 className="mt-2 text-2xl font-bold">{members.filter(m => m.role.toLowerCase() === "project manager").length}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Developers</p>
            <h2 className="mt-2 text-2xl font-bold">{members.filter(m => m.role.toLowerCase() === "developer").length}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">QA Analysts</p>
            <h2 className="mt-2 text-2xl font-bold">{members.filter(m => m.role.toLowerCase() === "qa analyst").length}</h2>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow relative overflow-hidden">
            {member.status === "Pending" && (
              <div className="absolute top-0 right-0">
                <Badge variant="secondary" className="rounded-none bg-orange-100 text-orange-700 border-orange-200 text-[10px] uppercase px-2 py-0.5">
                  Invited
                </Badge>
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border-2 border-slate-100">
                  <AvatarFallback className="bg-teal-600 text-white font-medium">
                    {member.displayName ? member.displayName.substring(0, 2).toUpperCase() : member.email.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold truncate text-slate-900">
                    {member.displayName || "Invited User"}
                  </h3>
                  <p className="text-sm text-slate-500 truncate pb-2 border-b border-slate-50 mb-2">
                    {member.email}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className={`${getRoleColor(member.role)} capitalize`} variant="outline">
                      {member.role}
                    </Badge>
                    <span className="text-sm font-medium text-slate-600">
                      ${member.hourlyCost}/hr
                    </span>
                  </div>
                </div>
              </div>

              {!readOnly && (
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                    onClick={() => handleOpenEditDialog(member)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleRemove(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {members.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            No team members added yet.
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Member" : "Invite Team Member"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update role and cost for this team member." : "Send an invitation email to a new team member."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                disabled={isEditing}
                placeholder="newmember@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val) => setFormData({ ...formData, role: val })}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="qa analyst">QA Analyst</SelectItem>
                    <SelectItem value="project manager">Project Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Hourly Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  value={formData.hourlyCost}
                  onChange={(e) => setFormData({ ...formData, hourlyCost: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700 text-white">
              {isEditing ? "Save Changes" : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
