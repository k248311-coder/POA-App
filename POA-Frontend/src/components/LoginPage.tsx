import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { login } from "../lib/api";

interface LoginPageProps {
  onLogin: (role: "po" | "team", userId: string | null, email: string | null, displayName: string | null) => void;
  onNavigateToSignup: () => void;
  onNavigateToJoinTeam?: () => void;
}

export function LoginPage({ onLogin, onNavigateToSignup, onNavigateToJoinTeam }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login({
        email: email.trim(),
        password,
      });

      if (!response.success || !response.role) {
        setError(response.message ?? "Invalid email or password.");
        return;
      }

      // Map backend role to frontend role
      const frontendRole = response.role === "po" ? "po" : "team";
      onLogin(frontendRole, response.userId, response.email, response.displayName);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-2">
            <span className="text-white">POA</span>
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your Product Owner Agent account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                {error}
              </div>
            )}
            <button
              type="button"
              className="text-teal-600 hover:text-teal-700 text-sm"
            >
              Forgot Password?
            </button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center text-sm text-gray-600 space-y-2">
              <div>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={onNavigateToSignup}
                  className="text-teal-600 hover:text-teal-700"
                >
                  Sign Up
                </button>
              </div>
              {onNavigateToJoinTeam && (
                <div>
                  Have an invite?{" "}
                  <button
                    type="button"
                    onClick={onNavigateToJoinTeam}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    Join Team
                  </button>
                </div>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
