// ============================================================
// SkillGraph — Core Type Definitions
// ============================================================

/** Represents a user in the SkillGraph platform */
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  skills: Skill[];
  walletBalance: number; // in USD cents
  completedCourseIds: string[];
  createdAt: string;
}

/** Represents a verified skill node in the graph */
export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  verified: boolean;
}

export type SkillCategory =
  | 'frontend'
  | 'backend'
  | 'mobile'
  | 'devops'
  | 'data'
  | 'design'
  | 'blockchain'
  | 'ai';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

/** Represents a gig/bounty posted by an employer */
export interface Gig {
  id: string;
  title: string;
  description: string;
  company: string;
  companyLogoUrl?: string;
  bountyAmount: number; // in USD cents
  requiredSkills: Skill[];
  difficulty: SkillLevel;
  estimatedHours: number;
  deadline: string;
  status: GigStatus;
  applicantCount: number;
}

export type GigStatus = 'open' | 'in_progress' | 'completed' | 'expired';

/** Represents a micro-course that teaches a specific skill */
export interface MicroCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  skillTaught: Skill;
  durationMinutes: number;
  content: CourseContent[];
  xpReward: number;
  tokenReward: number; // in USD cents
  completionRate: number; // 0 to 1
}

/** A single card/slide within a micro-course */
export interface CourseContent {
  id: string;
  type: 'text' | 'video' | 'quiz' | 'code_challenge';
  title: string;
  body: string; // markdown or video URL
  quizOptions?: QuizOption[];
  correctAnswerIndex?: number;
}

export interface QuizOption {
  id: string;
  text: string;
}

/** Result of a skill-gap analysis from the Neo4j graph */
export interface SkillGapResult {
  gig: Gig;
  missingSkills: Skill[];
  recommendedCourses: MicroCourse[];
  matchPercentage: number; // 0 to 100
}

/** Authentication response from Base44 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

/** Standard API error shape */
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

/** Navigation param list for type-safe navigation */
export type RootTabParamList = {
  Marketplace: undefined;
  Learning: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  TransactionHistory: undefined;
  Auth: undefined;
  MainTabs: undefined;
  GigDetail: { gig: Gig; missingSkills?: Skill[] };
  CoursePlayer: { course: MicroCourse };
  SkillGapAnalysis: { gig: Gig; missingSkills: Skill[] };
};
