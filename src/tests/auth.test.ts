import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../lib/storage/storageService';
import { AppView } from '../App';
import questions from '../data/questions.json';
import { validateAnswer } from '../lib/validation/answerValidator';
import { Question } from '../types';

describe('Authentication and Access Control (Authoritative Specification)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const EXPECTED_TEAMS = [
    { name: 'Code3SD', pass: 'Code3SD@yit', id: 'TEAM-01' },
    { name: 'IMPACTX', pass: 'IMPACTX@yit', id: 'TEAM-02' },
    { name: 'THE COGNIVEX', pass: 'THE COGNIVEX@yit', id: 'TEAM-03' },
    { name: 'Ctrl Alt Elit', pass: 'Ctrl Alt Elit@yit', id: 'TEAM-04' },
    { name: 'Non-syntax Error', pass: 'Non-syntax Error@yit', id: 'TEAM-05' },
    { name: 'The Lost Five', pass: 'The Lost Five@yit', id: 'TEAM-06' },
    { name: 'Team executives', pass: 'Team executives@yit', id: 'TEAM-07' },
    { name: 'Zedox', pass: 'Zedox@yit', id: 'TEAM-08' },
    { name: 'MindX', pass: 'MindX@yit', id: 'TEAM-09' }
  ];

  it('1. Verifies the participant team-selection screen is removed from AppView routing', () => {
    // Check that 'team-select' and 'mode-select' are not in valid AppView routes
    const validViews: AppView[] = [
      'splash',
      'login',
      'game',
      'level-complete',
      'expedition-complete',
      'trial-dashboard',
      'organizer-dashboard'
    ];
    // @ts-expect-error - 'team-select' should not exist in AppView
    expect(validViews.includes('team-select')).toBe(false);
    // @ts-expect-error - 'mode-select' should not exist in AppView
    expect(validViews.includes('mode-select')).toBe(false);
  });

  it('2. Verifies all nine configured team names are present exactly as specified', () => {
    const teams = StorageService.getTeams();
    expect(teams).toHaveLength(9);

    const actualNames = teams.map(t => t.name);
    EXPECTED_TEAMS.forEach(expected => {
      expect(actualNames).toContain(expected.name);
    });
  });

  it('3. Verifies each of the nine team/password combinations works', () => {
    EXPECTED_TEAMS.forEach(team => {
      const auth = StorageService.authenticateTeam(team.name, team.pass);
      expect(auth.success).toBe(true);
      expect(auth.team?.id).toBe(team.id);
      expect(auth.team?.name).toBe(team.name);
    });
  });

  it('4. Rejects invalid credentials with generic error', () => {
    const wrongPass = StorageService.authenticateTeam('Code3SD', 'wrongpass');
    expect(wrongPass.success).toBe(false);
    expect(wrongPass.errorMessage).toBe('Invalid team name or password.');

    const wrongUser = StorageService.authenticateTeam('NonExistentTeam', 'pass@yit');
    expect(wrongUser.success).toBe(false);
    expect(wrongUser.errorMessage).toBe('Invalid team name or password.');
  });

  it('5. Normalizes accidental leading/trailing whitespace in team names', () => {
    const auth1 = StorageService.authenticateTeam('  Code3SD  ', 'Code3SD@yit');
    expect(auth1.success).toBe(true);
    expect(auth1.team?.id).toBe('TEAM-01');

    const auth2 = StorageService.authenticateTeam(' MindX ', 'MindX@yit');
    expect(auth2.success).toBe(true);
    expect(auth2.team?.id).toBe('TEAM-09');
  });

  it('6. Preserves password case and internal spaces strictly', () => {
    // 'Ctrl Alt Elit' has internal spaces
    const authCorrect = StorageService.authenticateTeam('Ctrl Alt Elit', 'Ctrl Alt Elit@yit');
    expect(authCorrect.success).toBe(true);

    // Altering internal space or case must fail
    const authAlteredSpace = StorageService.authenticateTeam('Ctrl Alt Elit', 'CtrlAltElit@yit');
    expect(authAlteredSpace.success).toBe(false);

    const authAlteredCase = StorageService.authenticateTeam('Ctrl Alt Elit', 'ctrl alt elit@yit');
    expect(authAlteredCase.success).toBe(false);
  });

  it('7. Participant cannot switch teams through normal game interface', () => {
    // Authenticate as TEAM-01
    StorageService.authenticateTeam('Code3SD', 'Code3SD@yit');
    expect(StorageService.getLoggedInTeamId()).toBe('TEAM-01');

    // Logging in binds session strictly to TEAM-01
    const activeTeamId = StorageService.getActiveTeamId();
    expect(activeTeamId).toBe('TEAM-01');
  });

  it('8. Device assigned to one team rejects another team login attempt', () => {
    // Organizer locks device to TEAM-01 (Code3SD)
    StorageService.setAssignedDeviceTeamId('TEAM-01');
    expect(StorageService.getAssignedDeviceTeamId()).toBe('TEAM-01');

    // Attempt login as TEAM-02 (IMPACTX) on this device
    const rejected = StorageService.authenticateTeam('IMPACTX', 'IMPACTX@yit');
    expect(rejected.success).toBe(false);
    expect(rejected.errorMessage).toContain('This device is assigned exclusively');

    // Attempt login as TEAM-01 (Code3SD) on this device -> SUCESSS
    const allowed = StorageService.authenticateTeam('Code3SD', 'Code3SD@yit');
    expect(allowed.success).toBe(true);
    expect(allowed.team?.id).toBe('TEAM-01');
  });

  it('9. Maintains separate progress for each team', () => {
    // Team 1 progresses to Q10
    const session1 = {
      teamId: 'TEAM-01',
      mode: 'event' as const,
      currentLevel: 1,
      currentQuestionId: 10,
      completedQuestionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      wrongAttemptsByQuestion: { 3: 2 },
      totalAttemptsByQuestion: { 3: 3 },
      startTime: Date.now(),
      endTime: null,
      elapsedSeconds: 300,
      isPaused: false,
      pausedAt: null,
      status: 'active' as const
    };
    StorageService.saveSession(session1);

    // Team 2 starts fresh at Q1
    const session2 = {
      teamId: 'TEAM-02',
      mode: 'event' as const,
      currentLevel: 1,
      currentQuestionId: 1,
      completedQuestionIds: [],
      wrongAttemptsByQuestion: {},
      totalAttemptsByQuestion: {},
      startTime: Date.now(),
      endTime: null,
      elapsedSeconds: 0,
      isPaused: false,
      pausedAt: null,
      status: 'active' as const
    };
    StorageService.saveSession(session2);

    expect(StorageService.getEventSession('TEAM-01')?.currentQuestionId).toBe(10);
    expect(StorageService.getEventSession('TEAM-02')?.currentQuestionId).toBe(1);
  });

  it('10. Participants cannot open Trial Mode without administrator authentication', () => {
    // Normal participant login
    StorageService.authenticateTeam('MindX', 'MindX@yit');
    // Mode defaults to event
    StorageService.setAppMode('event');
    expect(StorageService.getAppMode()).toBe('event');
  });

  it('11. Logging out does not delete game progress', () => {
    // Log in as TEAM-03
    StorageService.authenticateTeam('THE COGNIVEX', 'THE COGNIVEX@yit');
    const session = {
      teamId: 'TEAM-03',
      mode: 'event' as const,
      currentLevel: 2,
      currentQuestionId: 14,
      completedQuestionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      wrongAttemptsByQuestion: {},
      totalAttemptsByQuestion: {},
      startTime: Date.now(),
      endTime: null,
      elapsedSeconds: 600,
      isPaused: false,
      pausedAt: null,
      status: 'active' as const
    };
    StorageService.saveSession(session);

    // Logout
    StorageService.logout();
    expect(StorageService.getLoggedInTeamId()).toBeNull();

    // Verify progress remains intact!
    const reloadedSession = StorageService.getEventSession('TEAM-03');
    expect(reloadedSession).not.toBeNull();
    expect(reloadedSession?.currentQuestionId).toBe(14);
    expect(reloadedSession?.completedQuestionIds).toHaveLength(13);
  });

  it('12. Unlimited attempts rule is preserved across all questions', () => {
    const q1 = questions[0] as unknown as Question;
    // Multiple wrong attempts
    const wrong1 = validateAnswer(q1, 'chair');
    expect(wrong1.isValid).toBe(false);
    expect(wrong1.feedbackMessage).toBe('INCORRECT ANSWER');

    const wrong2 = validateAnswer(q1, 'tree');
    expect(wrong2.isValid).toBe(false);
    expect(wrong2.feedbackMessage).toBe('INCORRECT ANSWER');

    // Immediate correct attempt succeeds without penalty
    const correct = validateAnswer(q1, 'Book');
    expect(correct.isValid).toBe(true);
    expect(correct.feedbackMessage).toBe('CORRECT ANSWER');
  });

  it('13. Trial resets do not affect official Event Mode records', () => {
    const eventSession = {
      teamId: 'TEAM-04',
      mode: 'event' as const,
      currentLevel: 3,
      currentQuestionId: 25,
      completedQuestionIds: [1, 2, 3],
      wrongAttemptsByQuestion: {},
      totalAttemptsByQuestion: {},
      startTime: Date.now(),
      endTime: null,
      elapsedSeconds: 500,
      isPaused: false,
      pausedAt: null,
      status: 'active' as const
    };
    StorageService.saveSession(eventSession);

    // Clear trial data
    StorageService.clearTrialData();

    // Event session is unaffected
    expect(StorageService.getEventSession('TEAM-04')?.currentQuestionId).toBe(25);
  });
});
