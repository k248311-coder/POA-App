import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Upload, FileText, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface NewProjectPageProps {
  onCreateProject: (projectName: string, srsFile: File | null) => void;
  onCancel: () => void;
}

export function NewProjectPage({ onCreateProject, onCancel }: NewProjectPageProps) {
  const [projectName, setProjectName] = useState("");
  const [srsFile, setSrsFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (optional)
      const validTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.'));
      if (validTypes.includes(fileExt.toLowerCase())) {
        setSrsFile(file);
        toast.success("SRS document uploaded successfully");
      } else {
        toast.error("Please upload a valid document file (PDF, DOC, DOCX, or TXT)");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.'));
      if (validTypes.includes(fileExt.toLowerCase())) {
        setSrsFile(file);
        toast.success("SRS document uploaded successfully");
      } else {
        toast.error("Please upload a valid document file (PDF, DOC, DOCX, or TXT)");
      }
    }
  };

  const handleRemoveFile = () => {
    setSrsFile(null);
    toast.info("SRS document removed");
  };

  const handleContinue = async () => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    setIsProcessing(true);
    try {
      await onCreateProject(projectName, srsFile);
    } catch (error) {
      // Error is handled in App.tsx, but we need to reset loading state
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <CardTitle className="text-gray-900">Create New Project</CardTitle>
          <CardDescription>
            Set up your new project by providing a name and uploading the SRS document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-gray-700">
              Project Name
            </Label>
            <Input
              id="projectName"
              type="text"
              placeholder="Enter project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-white border-gray-200"
            />
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <Label className="text-gray-700">Upload SRS</Label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${isDragging ? "border-teal-500 bg-teal-50" : "border-gray-300 bg-white"}
                ${!srsFile ? "cursor-pointer hover:border-teal-400 hover:bg-gray-50" : ""}
              `}
            >
              {!srsFile ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-teal-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-900 mb-1">Upload SRS Document</h3>
                    <p className="text-gray-500 mb-4">
                      Drag and drop your file here, or click to browse
                    </p>
                    <label htmlFor="file-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-teal-600 text-teal-600 hover:bg-teal-50"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Browse Files
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                    />
                    <p className="text-gray-400 mt-2">
                      Supported formats: PDF, DOC, DOCX, TXT
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-teal-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-gray-900">{srsFile.name}</p>
                      <p className="text-gray-500">
                        {(srsFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
              disabled={!projectName.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing SRS with AI...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
