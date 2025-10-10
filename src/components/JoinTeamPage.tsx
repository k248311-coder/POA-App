import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CheckCircle2 } from "lucide-react";

interface JoinTeamPageProps {
  onJoinComplete: () => void;
}

export function JoinTeamPage({ onJoinComplete }: JoinTeamPageProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const prefilledEmail = "newmember@example.com";
  const teamName = "Alpha Devs";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJoinComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-2">
            <span className="text-white">POA</span>
          </div>
          <CardTitle>Join Team</CardTitle>
          <CardDescription>Complete your profile to join the team</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm">
                  You are joining team <span className="font-medium text-teal-600">{teamName}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Pre-filled)</Label>
              <Input
                id="email"
                type="email"
                value={prefilledEmail}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="qa">QA Engineer</SelectItem>
                  <SelectItem value="manager">Project Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
              Join Team & Continue
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
