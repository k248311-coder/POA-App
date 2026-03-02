import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { UserPlus, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedHours: number;
  availableHours: number;
  avatar: string;
}

export function TeamManagementPage({ projectId: _projectId }: { projectId: string }) {
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      role: "Developer",
      assignedHours: 120,
      availableHours: 160,
      avatar: "SC",
    },
    {
      id: "2",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      role: "Developer",
      assignedHours: 140,
      availableHours: 160,
      avatar: "MJ",
    },
    {
      id: "3",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "QA",
      assignedHours: 80,
      availableHours: 160,
      avatar: "ED",
    },
    {
      id: "4",
      name: "Alex Kumar",
      email: "alex.kumar@example.com",
      role: "Developer",
      assignedHours: 100,
      availableHours: 160,
      avatar: "AK",
    },
    {
      id: "5",
      name: "Lisa Wang",
      email: "lisa.wang@example.com",
      role: "Manager",
      assignedHours: 60,
      availableHours: 160,
      avatar: "LW",
    },
    {
      id: "6",
      name: "Tom Brown",
      email: "tom.brown@example.com",
      role: "QA",
      assignedHours: 90,
      availableHours: 160,
      avatar: "TB",
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Developer":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "QA":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Manager":
        return "bg-teal-100 text-teal-700 border-teal-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1>Team Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their workload</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite New Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation email to a new team member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email Address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="newmember@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteRole">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="inviteRole">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="qa">QA Engineer</SelectItem>
                    <SelectItem value="manager">Project Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Total Members</p>
            <h2 className="mt-2">{teamMembers.length}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Developers</p>
            <h2 className="mt-2">{teamMembers.filter(m => m.role === "Developer").length}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">QA Engineers</p>
            <h2 className="mt-2">{teamMembers.filter(m => m.role === "QA").length}</h2>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member) => {
          const workloadPercentage = (member.assignedHours / member.availableHours) * 100;
          return (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-teal-600 text-white">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate">{member.name}</h3>
                    <p className="text-sm text-gray-600 truncate mt-1">{member.email}</p>
                    <Badge className={`${getRoleColor(member.role)} mt-2`} variant="outline">
                      {member.role}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Workload</span>
                    <span className={getWorkloadColor(workloadPercentage)}>
                      {member.assignedHours} / {member.availableHours} hrs
                    </span>
                  </div>
                  <Progress value={workloadPercentage} className="h-2" />
                  <p className="text-xs text-gray-500 text-right">
                    {workloadPercentage.toFixed(0)}% allocated
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
