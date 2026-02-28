import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Plus, X } from "lucide-react";
import { signup } from "../lib/api";

interface SignupPageProps {
  onSignupComplete: (userId: string | null, email: string | null, displayName: string | null) => void;
  onNavigateToLogin: () => void;
}

export function SignupPage({ onSignupComplete, onNavigateToLogin }: SignupPageProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [inviteEmails, setInviteEmails] = useState([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const trimmedInviteEmails = inviteEmails
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

      const response = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        teamName: teamName.trim(),
        teamDescription: teamDescription.trim() || null,
        inviteEmails: trimmedInviteEmails,
      });

      if (!response.success) {
        setSubmitError(response.message ?? "Unable to create your account.");
        return;
      }

      onSignupComplete(response.userId, email.trim(), name.trim());
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

  const addEmailField = () => {
    setInviteEmails([...inviteEmails, ""]);
  };

  const removeEmailField = (index: number) => {
    setInviteEmails(inviteEmails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-2">
            <span className="text-white">POA</span>
          </div>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>Step {step} of 3</CardDescription>
          <div className="flex gap-2 justify-center pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full ${s <= step ? "bg-teal-600" : "bg-gray-200"
                  }`}
              />
            ))}
          </div>
        </CardHeader>

        {step === 1 && (
          <form onSubmit={handleStep1Submit}>
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
            </CardContent>
            <div className="px-6 pb-6 space-y-3">
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                Continue
              </Button>
              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-teal-600 hover:text-teal-700"
                >
                  Login
                </button>
              </div>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2Submit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  placeholder="Alpha Devs"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamDescription">Team Description (Optional)</Label>
                <Input
                  id="teamDescription"
                  placeholder="Our amazing development team"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                />
              </div>
            </CardContent>
            <div className="px-6 pb-6 space-y-3">
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                Continue
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3Submit}>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Invite Team Members (Optional)</Label>
                {inviteEmails.map((inviteEmail, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="teammate@example.com"
                      value={inviteEmail}
                      onChange={(e) => updateEmail(index, e.target.value)}
                    />
                    {inviteEmails.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEmailField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={addEmailField}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Email
                </Button>
              </div>
            </CardContent>
            <div className="px-6 pb-6 space-y-3">
              {submitError && <p className="text-sm text-red-600 text-center">{submitError}</p>}
              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Send Invites & Continue to Dashboard"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
