import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { signup } from "../lib/api";

interface SignupPageProps {
  onSignupComplete: (userId: string | null, email: string | null, displayName: string | null, role: string) => void;
  onNavigateToLogin: () => void;
}

export function SignupPage({ onSignupComplete, onNavigateToLogin }: SignupPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("project manager"); // Default to Project Manager
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (!response.success) {
        setSubmitError(response.message ?? "Unable to create your account.");
        return;
      }

      const finalRole = (response as any).role || (response as any).Role || role;
      onSignupComplete(response.userId, email.trim(), name.trim(), finalRole);
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Unable to create your account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-2">
            <span className="text-white font-bold text-xl">POA</span>
          </div>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>Join the Product Owner Assistant platform</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <Label htmlFor="role">Your Role</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="project manager">Project Manager</option>
                <option value="developer">Developer</option>
                <option value="qa analyst">QA Analyst</option>
              </select>
            </div>
          </CardContent>
          <div className="px-6 pb-6 space-y-3">
            {submitError && <p className="text-sm text-red-600 text-center">{submitError}</p>}
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Login
              </button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
