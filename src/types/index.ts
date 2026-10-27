export type QuestionType = 'digital' | 'checkpoint';

export type AnswerFormatType = 
  | 'text'
  | 'numeric'
  | 'coordinate'
  | 'sequence'
  | 'probability'
  | 'binary'
  | 'two-word'
  | 'three-word';

export interface Question {
  id: number;
  level: number; // 1, 2, 3, or 4
  num: string; // e.g. "Q1"
  title: string;
  question: string;
  type: QuestionType;
  answerFormat: AnswerFormatType;
  acceptedAnswers: string[];
  checkpointInstructions?: string;
  explanation?: string;
  reviewNotes?: string;
  isPhysicalCheckpoint?: boolean;
}

export interface TeamRecord {
  id: string; // "TEAM-01" to "TEAM-09"
  name: string;
  password: string; // Event credential e.g. "<Name>@yit"
  callsign: string;
  currentLevel: number;
  currentQuestionId: number;
  completedQuestionIds: number[];
  wrongAttemptsCount: number;
  totalAttemptsCount: number;
  startTime: string | null; // ISO string
  completionTime: string | null; // ISO string
  elapsedSeconds: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  mode: 'trial' | 'event';
  lastActiveTime: string | null;
  checkpointsCompleted: number[];
}

export interface GameSession {
  teamId: string;
  mode: 'trial' | 'event';
  currentLevel: number;
  currentQuestionId: number;
  completedQuestionIds: number[];
  wrongAttemptsByQuestion: Record<number, number>;
  totalAttemptsByQuestion: Record<number, number>;
  startTime: number | null; // epoch ms
  endTime: number | null; // epoch ms
  elapsedSeconds: number;
  isPaused: boolean;
  pausedAt: number | null;
  status: 'active' | 'completed' | 'paused';
}

export interface OrganizerConfig {
  pinHash: string;
  salt: string;
  isSetupComplete: boolean;
  eventStarted: boolean;
  eventStartTime: string | null;
  allowManualCheckpointBypass: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  isClose?: boolean;
  normalizedInput: string;
  feedbackMessage: string;
  matchedAnswer?: string;
}

export interface TrialQuestionStatus {
  questionId: number;
  testedCorrect: boolean;
  testedIncorrect: boolean;
  lastTestedAt?: string;
  notes?: string;
}

export interface AuthResult {
  success: boolean;
  isAdmin?: boolean;
  team?: TeamRecord;
  errorMessage?: string;
}
