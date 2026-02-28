import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { User, Briefcase, Clock } from "lucide-react";

export function ProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1>Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6 flex-col sm:flex-row">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-teal-600 text-white text-2xl">
                SC
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2>Sarah Chen</h2>
              <p className="text-gray-600 mt-1">sarah.chen@example.com</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">Developer</Badge>
                <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-teal-600" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="Sarah" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="Chen" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="sarah.chen@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" defaultValue="Developer" disabled className="bg-gray-50" />
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Work Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-teal-600" />
            Work Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Team</p>
              <p className="font-medium mt-1">Alpha Devs</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium mt-1">January 2025</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stories Completed</p>
              <p className="font-medium mt-1">23</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Hours Logged</p>
              <p className="font-medium mt-1">456h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-teal-600" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workingHours">Weekly Working Hours</Label>
            <Input id="workingHours" type="number" defaultValue="40" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" defaultValue="UTC-8 (Pacific Time)" />
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700">Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}
