export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progressPercent: number;
  teamMemberCount: number;
  lastUpdated: string | null;
  totalStories: number;
  totalTasks: number;
  completedTasks: number;
}

export interface ProjectBacklog {
  id: string;
  name: string;
  epics: ProjectBacklogEpic[];
}

export interface ProjectBacklogEpic {
  id: string;
  title: string;
  description: string | null;
  priority: number | null;
  estimatedPoints: number | null;
  features: ProjectBacklogFeature[];
}

export interface ProjectBacklogFeature {
  id: string;
  title: string;
  description: string | null;
  priority: number | null;
  stories: ProjectBacklogStory[];
}

export interface ProjectBacklogStory {
  id: string;
  title: string;
  description: string | null;
  acceptanceCriteria: string[];
  storyPoints: number | null;
  estimatedDevHours: number | null;
  estimatedTestHours: number | null;
  status: string;
  totalCost: number;
  tasks: ProjectBacklogTask[];
}

export interface ProjectBacklogTask {
  id: string;
  title: string;
  status: string;
  devHours: number | null;
  testHours: number | null;
  costDev: number | null;
  costTest: number | null;
  totalCost: number | null;
}

export interface ProjectTask {
  id: string;
  title: string;
  status: string;
  type: string;
  storyId: string | null;
  storyTitle: string | null;
  epicId: string | null;
  epicTitle: string | null;
  featureId: string | null;
  featureTitle: string | null;
  sprintId: string | null;
  sprintName: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeRole: string | null;
  devHours: number | null;
  testHours: number | null;
  costDev: number | null;
  costTest: number | null;
  totalCost: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ProjectEstimate {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  userId: string | null;
  userName: string | null;
  points: number | null;
  note: string | null;
  createdAt: string;
}

export interface ProjectWorklog {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  userId: string | null;
  userName: string | null;
  date: string;
  hours: number;
  description: string | null;
  createdAt: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  teamName: string;
  teamDescription?: string | null;
  inviteEmails: string[];
}

export interface SignupResponse {
  success: boolean;
  userId: string | null;
  teamId: string | null;
  message?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  role: string | null;
  message?: string | null;
}

export interface CreateProjectRequest {
  name: string;
  srsFile?: File | null;
  ownerUserId: string;
}

export interface CreateProjectResponse {
  projectId: string;
  name: string;
  message?: string | null;
}

