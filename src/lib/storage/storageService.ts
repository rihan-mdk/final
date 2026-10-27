import { AuthResult, GameSession, OrganizerConfig, TeamRecord, TrialQuestionStatus } from '../../types';

const STORAGE_KEYS = {
  ORGANIZER_CONFIG: 'hunt_expedition_organizer_config_v2',
  TEAMS: 'hunt_expedition_teams_v2',
  EVENT_SESSION_PREFIX: 'hunt_expedition_event_session_v2_',
  TRIAL_SESSION: 'hunt_expedition_trial_session_v2',
  TRIAL_CHECKLIST: 'hunt_expedition_trial_checklist_v2',
  ACTIVE_TEAM_ID: 'hunt_expedition_active_team_id_v2',
  ASSIGNED_DEVICE_TEAM_ID: 'hunt_expedition_assigned_device_team_v2',
  LOGGED_IN_TEAM_ID: 'hunt_expedition_logged_in_team_v2',
  APP_MODE: 'hunt_expedition_app_mode_v2'
} as const;

export const DEFAULT_TEAMS_TEMPLATE: TeamRecord[] = [
  { id: 'TEAM-01', name: 'Code3SD', password: 'Code3SD@yit', callsign: 'CODE3SD', currentLevel: 1, currentQuestionId: 1, completedQuestionIds: [], wrongAttemptsCount: 0, totalAttemptsCount: 0, startTime: null, completionTime: null, elapsedSeconds: 0, status: 'not_started', mode: 'event', lastActiveTime: null, checkpointsCompleted: [] },
  { id: 'TEAM-02', name: 'IMPACTX', password: 'IMPACTX@yit', callsign: 'IMPACTX', currentLevel: 1, currentQuestionId: 1, completedQuestionIds: [], wrongAttemptsCount: 0, totalAttemptsCount: 0, startTime: null, completionTime: null, elapsedSeconds: 0, status: 'not_started', mode: 'event', lastActiveTime: null, checkpointsCompleted: [] },
  { id: 'TEAM-03', name: 'THE COGNIVEX', password: 'THE COGNIVEX@yit', callsign: 'COGNIVEX', currentLevel: 1, currentQuestionId: 1, completedQuestionIds: [], wrongAttemptsCount: 0, totalAttemptsCount: 0, startTime: null, completionTime: null, elapsedSeconds: 0, status: 'not_started', mode: 'event', lastActiveTime: null, checkpointsCompleted: [] },
  { id: 'TEAM-04', name: 'Ctrl Alt Elit', password: 'Ctrl Alt Elit@yit', callsign: 'CTRL_ALT', currentLevel: 1, currentQuestionId: 1, completedQuestionIds: [], wrongAttemptsCount: 0, totalAttemptsCount: 0, startTime: null, completionTime: null, elapsedSeconds: 0, status: 'not_started', mode: 'event', lastActiveTime: null, checkpointsCompleted: [] },
  { id: 'TEAM-05', name: 'Non-syntax Error', password: 'Non-syntax Error@yit', callsign: 'NON_SYNTAX', currentLevel: 1, currentQuestionId: 1, completedQuestionIds: [], wrongAttemptsCount: 0, totalAttemptsCount: 0, startTime: null, completionTime: null, elapsedSeconds: 0, status: 'not_started', mode: 'event', lastActiveTime: null, checkpointsCompleted: [] },
  { id: 'TEAM-06', name: 'The Lost Five', password: 'The Lost Five@yit', callsign: 'LOST_FIVE', currentLevel: 1, currentQuestionId: 1, completedQuestionIds: [], wrongAttemptsCount: 0, totalAttemptsCount: 0, startTime: null, completionTime: null, elapsedSeconds: 0, status: 'not_started', mode: 'event', lastActiveTime: null, checkpointsCompleted: [] },
  { id: 'TEAM-07', name: 'Team executives', password: 'Team executives@yit', callsign: 'EXECUTIVES', currentLevel: 1, currentQuestionId: 1, completedQuestionIds: [], wrongAttemptsCount: 0, totalAttemptsCount: 0, startTime: null, completionTime: null, elapsedSeconds: 0, status: 'not_started', mode: 'event', lastActiveTime: null, checkpointsCompleted: [] },
  { id: 'TEAM-08', name: 'Zedox', password: 'Zedox@yit', callsign: 'ZEDOX', currentLevel: 1, currentQuestionId: 1, completedQuestionIds: [], wrongAttemptsCount: 0, totalAttemptsCount: 0, startTime: null, completionTime: null, elapsedSeconds: 0, status: 'not_started', mode: 'event', lastActiveTime: null, checkpointsCompleted: [] },
  { id: 'TEAM-09', name: 'MindX', password: 'MindX@yit', callsign: 'MINDX', currentLevel: 1, currentQuestionId: 1, completedQuestionIds: [], wrongAttemptsCount: 0, totalAttemptsCount: 0, startTime: null, completionTime: null, elapsedSeconds: 0, status: 'not_started', mode: 'event', lastActiveTime: null, checkpointsCompleted: [] },
];

export function getDefaultTeams(): TeamRecord[] {
  return JSON.parse(JSON.stringify(DEFAULT_TEAMS_TEMPLATE));
}

export const DEFAULT_TEAMS = getDefaultTeams();

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading key ${key} from localStorage:`, err);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error writing key ${key} to localStorage:`, err);
    return false;
  }
}

export const StorageService = {
  // Organizer Config
  getOrganizerConfig(): OrganizerConfig {
    return safeGetItem<OrganizerConfig>(STORAGE_KEYS.ORGANIZER_CONFIG, {
      pinHash: '',
      salt: '',
      isSetupComplete: false,
      eventStarted: false,
      eventStartTime: null,
      allowManualCheckpointBypass: true,
      assignedTeamId: null
    });
  },

  saveOrganizerConfig(config: OrganizerConfig): boolean {
    return safeSetItem(STORAGE_KEYS.ORGANIZER_CONFIG, config);
  },

  // Device Binding
  getAssignedDeviceTeamId(): string | null {
    return safeGetItem<string | null>(STORAGE_KEYS.ASSIGNED_DEVICE_TEAM_ID, null);
  },

  setAssignedDeviceTeamId(teamId: string | null): boolean {
    const res = safeSetItem(STORAGE_KEYS.ASSIGNED_DEVICE_TEAM_ID, teamId);
    const org = this.getOrganizerConfig();
    org.assignedTeamId = teamId;
    this.saveOrganizerConfig(org);
    return res;
  },

  // Logged-in Participant State
  getLoggedInTeamId(): string | null {
    return safeGetItem<string | null>(STORAGE_KEYS.LOGGED_IN_TEAM_ID, null);
  },

  setLoggedInTeamId(teamId: string | null): boolean {
    if (teamId === null) {
      localStorage.removeItem(STORAGE_KEYS.LOGGED_IN_TEAM_ID);
      return true;
    }
    return safeSetItem(STORAGE_KEYS.LOGGED_IN_TEAM_ID, teamId);
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.LOGGED_IN_TEAM_ID);
    // Note: Logging out does NOT delete or reset team progress!
  },

  // Teams
  getTeams(): TeamRecord[] {
    const teams = safeGetItem<TeamRecord[]>(STORAGE_KEYS.TEAMS, []);
    if (!teams || teams.length !== 9) {
      const fresh = getDefaultTeams();
      safeSetItem(STORAGE_KEYS.TEAMS, fresh);
      return fresh;
    }
    return teams;
  },

  getTeam(teamId: string): TeamRecord | undefined {
    const teams = this.getTeams();
    return teams.find(t => t.id === teamId);
  },

  getTeamByName(teamName: string): TeamRecord | undefined {
    const teams = this.getTeams();
    const clean = teamName.trim();
    return teams.find(t => t.name.trim() === clean);
  },

  saveTeams(teams: TeamRecord[]): boolean {
    return safeSetItem(STORAGE_KEYS.TEAMS, teams);
  },

  updateTeam(updatedTeam: TeamRecord): boolean {
    const teams = this.getTeams();
    const idx = teams.findIndex(t => t.id === updatedTeam.id);
    if (idx !== -1) {
      teams[idx] = updatedTeam;
      return this.saveTeams(teams);
    }
    return false;
  },

  resetTeam(teamId: string): boolean {
    const teams = this.getTeams();
    const freshDefaults = getDefaultTeams();
    const defaultTeam = freshDefaults.find(t => t.id === teamId);
    if (!defaultTeam) return false;
    const idx = teams.findIndex(t => t.id === teamId);
    if (idx !== -1) {
      // Preserve current password, reset progress
      teams[idx] = {
        ...defaultTeam,
        password: teams[idx].password || defaultTeam.password
      };
      this.saveTeams(teams);
      
      // Clear event session for this specific team
      localStorage.removeItem(STORAGE_KEYS.EVENT_SESSION_PREFIX + teamId);
      return true;
    }
    return false;
  },

  // Team Credential Authentication
  authenticateTeam(rawTeamName: string, rawPassword: string): AuthResult {
    const trimmedName = rawTeamName.trim();
    if (!trimmedName || !rawPassword) {
      return { success: false, errorMessage: 'Please enter both team name and password.' };
    }

    const team = this.getTeamByName(trimmedName);
    if (!team) {
      return { success: false, errorMessage: 'Invalid team name or password.' };
    }

    // Password verification (preserve exact case and internal whitespace)
    if (team.password !== rawPassword) {
      return { success: false, errorMessage: 'Invalid team name or password.' };
    }

    // Device binding verification
    const assignedTeamId = this.getAssignedDeviceTeamId();
    if (assignedTeamId && assignedTeamId !== team.id) {
      const assignedTeam = this.getTeam(assignedTeamId);
      const assignedLabel = assignedTeam ? assignedTeam.name : assignedTeamId;
      return {
        success: false,
        errorMessage: `Access denied: This device is assigned exclusively to "${assignedLabel}".`
      };
    }

    // Authentication successful
    this.setLoggedInTeamId(team.id);
    this.setActiveTeamId(team.id);

    return { success: true, team };
  },

  // Active Team ID & App Mode
  getActiveTeamId(): string {
    const loggedIn = this.getLoggedInTeamId();
    if (loggedIn) return loggedIn;
    const assigned = this.getAssignedDeviceTeamId();
    if (assigned) return assigned;
    return safeGetItem<string>(STORAGE_KEYS.ACTIVE_TEAM_ID, 'TEAM-01');
  },

  setActiveTeamId(teamId: string): boolean {
    return safeSetItem(STORAGE_KEYS.ACTIVE_TEAM_ID, teamId);
  },

  getAppMode(): 'trial' | 'event' | null {
    return safeGetItem<'trial' | 'event' | null>(STORAGE_KEYS.APP_MODE, null);
  },

  setAppMode(mode: 'trial' | 'event'): boolean {
    return safeSetItem(STORAGE_KEYS.APP_MODE, mode);
  },

  // Game Sessions (Separated for Trial & Event)
  getSession(mode: 'trial' | 'event', teamId?: string): GameSession | null {
    if (mode === 'trial') {
      return safeGetItem<GameSession | null>(STORAGE_KEYS.TRIAL_SESSION, null);
    }
    const tid = teamId || this.getActiveTeamId();
    return safeGetItem<GameSession | null>(STORAGE_KEYS.EVENT_SESSION_PREFIX + tid, null);
  },

  saveSession(session: GameSession): boolean {
    if (session.mode === 'trial') {
      return safeSetItem(STORAGE_KEYS.TRIAL_SESSION, session);
    }
    return safeSetItem(STORAGE_KEYS.EVENT_SESSION_PREFIX + session.teamId, session);
  },

  getEventSession(teamId?: string): GameSession | null {
    return this.getSession('event', teamId);
  },

  getTrialSession(): GameSession | null {
    return this.getSession('trial');
  },

  clearTrialData(): boolean {
    localStorage.removeItem(STORAGE_KEYS.TRIAL_SESSION);
    localStorage.removeItem(STORAGE_KEYS.TRIAL_CHECKLIST);
    return true;
  },

  clearEventData(): boolean {
    // Clear all event sessions
    const teams = this.getTeams();
    teams.forEach(t => {
      localStorage.removeItem(STORAGE_KEYS.EVENT_SESSION_PREFIX + t.id);
    });
    safeSetItem(STORAGE_KEYS.TEAMS, getDefaultTeams());
    const orgConfig = this.getOrganizerConfig();
    orgConfig.eventStarted = false;
    orgConfig.eventStartTime = null;
    this.saveOrganizerConfig(orgConfig);
    return true;
  },

  // Trial Checklist Status
  getTrialChecklist(): Record<number, TrialQuestionStatus> {
    return safeGetItem<Record<number, TrialQuestionStatus>>(STORAGE_KEYS.TRIAL_CHECKLIST, {});
  },

  saveTrialChecklist(checklist: Record<number, TrialQuestionStatus>): boolean {
    return safeSetItem(STORAGE_KEYS.TRIAL_CHECKLIST, checklist);
  },

  recordTrialTest(questionId: number, isCorrect: boolean): void {
    const list = this.getTrialChecklist();
    const existing = list[questionId] || {
      questionId,
      testedCorrect: false,
      testedIncorrect: false
    };

    if (isCorrect) {
      existing.testedCorrect = true;
    } else {
      existing.testedIncorrect = true;
    }
    existing.lastTestedAt = new Date().toISOString();
    list[questionId] = existing;
    this.saveTrialChecklist(list);
  },

  // Backup & Restore
  exportBackup(): string {
    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      organizerConfig: this.getOrganizerConfig(),
      teams: this.getTeams(),
      assignedDeviceTeamId: this.getAssignedDeviceTeamId(),
      loggedInTeamId: this.getLoggedInTeamId(),
      trialSession: this.getTrialSession(),
      trialChecklist: this.getTrialChecklist(),
      appMode: this.getAppMode()
    };
    return JSON.stringify(backupData, null, 2);
  },

  importBackup(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !data.version || !Array.isArray(data.teams) || data.teams.length !== 9) {
        return { success: false, error: 'Invalid backup format or incorrect team count (must contain 9 teams).' };
      }

      if (data.organizerConfig) safeSetItem(STORAGE_KEYS.ORGANIZER_CONFIG, data.organizerConfig);
      if (data.teams) safeSetItem(STORAGE_KEYS.TEAMS, data.teams);
      if (data.assignedDeviceTeamId !== undefined) safeSetItem(STORAGE_KEYS.ASSIGNED_DEVICE_TEAM_ID, data.assignedDeviceTeamId);
      if (data.trialSession) safeSetItem(STORAGE_KEYS.TRIAL_SESSION, data.trialSession);
      if (data.trialChecklist) safeSetItem(STORAGE_KEYS.TRIAL_CHECKLIST, data.trialChecklist);
      if (data.appMode) safeSetItem(STORAGE_KEYS.APP_MODE, data.appMode);

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Failed to parse backup JSON.' };
    }
  },

  // CSV Export
  generateResultsCsv(): string {
    const teams = this.getTeams();
    const headers = [
      'Team ID',
      'Team Name',
      'Callsign',
      'Status',
      'Mode',
      'Current Level',
      'Completed Questions',
      'Total Wrong Attempts',
      'Total Attempts',
      'Start Time (IST)',
      'Completion Time (IST)',
      'Elapsed Time (HH:MM:SS)'
    ];

    const rows = teams.map(t => {
      const formatTimeIST = (iso: string | null) => {
        if (!iso) return 'N/A';
        try {
          return new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        } catch {
          return iso;
        }
      };

      const formatElapsed = (sec: number) => {
        const hrs = Math.floor(sec / 3600);
        const mins = Math.floor((sec % 3600) / 60);
        const secs = sec % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      };

      return [
        `"${t.id}"`,
        `"${t.name.replace(/"/g, '""')}"`,
        `"${t.callsign}"`,
        `"${t.status}"`,
        `"${t.mode}"`,
        t.currentLevel,
        t.completedQuestionIds.length,
        t.wrongAttemptsCount,
        t.totalAttemptsCount,
        `"${formatTimeIST(t.startTime)}"`,
        `"${formatTimeIST(t.completionTime)}"`,
        `"${formatElapsed(t.elapsedSeconds)}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\r\n');
  }
};
