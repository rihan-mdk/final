import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { WelcomeScreen } from '../pages/WelcomeScreen';
import { Header } from '../components/Header';
import { ExpeditionCompleteScreen } from '../pages/ExpeditionCompleteScreen';
import { App } from '../App';
import { StorageService } from '../lib/storage/storageService';
import { TeamRecord, GameSession } from '../types';

describe('Team Welcome Screen — Component Unit Tests', () => {
  const mockTeam: TeamRecord = {
    id: 'TEAM-01',
    name: 'Code3SD',
    password: 'Code3SD@yit',
    callsign: 'CODE3SD',
    currentLevel: 1,
    currentQuestionId: 1,
    completedQuestionIds: [],
    wrongAttemptsCount: 0,
    totalAttemptsCount: 0,
    startTime: null,
    completionTime: null,
    elapsedSeconds: 0,
    status: 'not_started',
    mode: 'event',
    lastActiveTime: null,
    checkpointsCompleted: []
  };

  it('1. Displays centered heading: WELCOME, [TEAM NAME]! dynamically using team name', () => {
    const onStart = vi.fn();
    render(<WelcomeScreen team={mockTeam} onStartHunt={onStart} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe('WELCOME, Code3SD!');
  });

  it('2. Dynamically uses different team names properly', () => {
    const otherTeam: TeamRecord = { ...mockTeam, id: 'TEAM-09', name: 'MindX', callsign: 'MINDX' };
    render(<WelcomeScreen team={otherTeam} onStartHunt={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('WELCOME, MindX!');
  });

  it('3. Displays the exact short message', () => {
    render(<WelcomeScreen team={mockTeam} onStartHunt={vi.fn()} />);

    const message = screen.getByText(
      'Your hunt begins here. Think smart, solve the clues, and trust your team.'
    );
    expect(message).toBeInTheDocument();
  });

  it('4. Displays the prominent START THE HUNT button', () => {
    render(<WelcomeScreen team={mockTeam} onStartHunt={vi.fn()} />);

    const button = screen.getByRole('button', { name: /START THE HUNT/i });
    expect(button).toBeInTheDocument();
  });

  it('5. Invokes onStartHunt when START THE HUNT button is clicked', () => {
    const onStart = vi.fn();
    render(<WelcomeScreen team={mockTeam} onStartHunt={onStart} />);

    const button = screen.getByRole('button', { name: /START THE HUNT/i });
    fireEvent.click(button);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('6. Displays mission parameters (Callsign, Sector/Level, Objectives)', () => {
    render(
      <WelcomeScreen
        team={mockTeam}
        currentLevel={2}
        currentQuestionNum="Q15"
        onStartHunt={vi.fn()}
      />
    );

    expect(screen.getByText('CODE3SD')).toBeInTheDocument();
    expect(screen.getByText('LEVEL 2 • Q15')).toBeInTheDocument();
    expect(screen.getByText('40 TOTAL')).toBeInTheDocument();
  });
});

describe('Team Welcome Screen — Flow, Timer & Mode Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('7. After successful login, App shows Welcome Screen rather than going directly to questions', () => {
    render(<App />);

    // Fast-forward splash screen
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Enter team credentials on LoginScreen
    const teamInput = screen.getByLabelText('TEAM NAME');
    const passInput = screen.getByLabelText('TEAM PASSWORD');
    fireEvent.change(teamInput, { target: { value: 'MindX' } });
    fireEvent.change(passInput, { target: { value: 'MindX@yit' } });

    // Submit login
    const loginBtn = screen.getByRole('button', { name: /LOG IN/i });
    fireEvent.click(loginBtn);

    // Welcome Screen is displayed
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('WELCOME, MindX!');
    expect(
      screen.getByText('Your hunt begins here. Think smart, solve the clues, and trust your team.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /START THE HUNT/i })).toBeInTheDocument();

    // Verify question input is NOT rendered yet
    expect(screen.queryByPlaceholderText(/Type answer here/i)).not.toBeInTheDocument();
  });

  it('8. Timer does not start on login; starts only when START THE HUNT is clicked', () => {
    render(<App />);

    // Bypass splash
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Login as Code3SD
    fireEvent.change(screen.getByLabelText('TEAM NAME'), { target: { value: 'Code3SD' } });
    fireEvent.change(screen.getByLabelText('TEAM PASSWORD'), { target: { value: 'Code3SD@yit' } });
    fireEvent.click(screen.getByRole('button', { name: /LOG IN/i }));

    // Before clicking START THE HUNT:
    const sessionBeforeStart = StorageService.getEventSession('TEAM-01');
    expect(sessionBeforeStart).not.toBeNull();
    expect(sessionBeforeStart?.startTime).toBeNull();

    const teamBeforeStart = StorageService.getTeam('TEAM-01');
    expect(teamBeforeStart?.startTime).toBeNull();
    expect(teamBeforeStart?.status).toBe('not_started');

    // Click START THE HUNT
    const startBtn = screen.getByRole('button', { name: /START THE HUNT/i });
    fireEvent.click(startBtn);

    // After clicking START THE HUNT:
    const sessionAfterStart = StorageService.getEventSession('TEAM-01');
    expect(sessionAfterStart?.startTime).not.toBeNull();
    expect(typeof sessionAfterStart?.startTime).toBe('number');

    const teamAfterStart = StorageService.getTeam('TEAM-01');
    expect(teamAfterStart?.startTime).not.toBeNull();
    expect(teamAfterStart?.status).toBe('in_progress');

    // Navigated to GameScreen with answer input
    expect(screen.getByPlaceholderText(/Type answer here/i)).toBeInTheDocument();
  });

  it('9. Returning teams: clicking START THE HUNT does not reset an already-started timer', () => {
    // Pre-seed an active team session that started 15 minutes ago
    const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
    const initialSession: GameSession = {
      teamId: 'TEAM-02',
      mode: 'event',
      currentLevel: 2,
      currentQuestionId: 12,
      completedQuestionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      wrongAttemptsByQuestion: { 12: 1 },
      totalAttemptsByQuestion: { 12: 1 },
      startTime: fifteenMinsAgo,
      endTime: null,
      elapsedSeconds: 900,
      isPaused: false,
      pausedAt: null,
      status: 'active'
    };
    StorageService.saveSession(initialSession);

    const teamRecord = StorageService.getTeam('TEAM-02')!;
    teamRecord.startTime = new Date(fifteenMinsAgo).toISOString();
    teamRecord.status = 'in_progress';
    teamRecord.currentLevel = 2;
    teamRecord.currentQuestionId = 12;
    teamRecord.completedQuestionIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    StorageService.updateTeam(teamRecord);

    render(<App />);

    // Fast-forward splash
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Login as IMPACTX
    fireEvent.change(screen.getByLabelText('TEAM NAME'), { target: { value: 'IMPACTX' } });
    fireEvent.change(screen.getByLabelText('TEAM PASSWORD'), { target: { value: 'IMPACTX@yit' } });
    fireEvent.click(screen.getByRole('button', { name: /LOG IN/i }));

    // Welcome Screen displays returning team's name
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('WELCOME, IMPACTX!');

    // Click START THE HUNT
    const startBtn = screen.getByRole('button', { name: /START THE HUNT/i });
    fireEvent.click(startBtn);

    // Verify progress is preserved
    const reloadedSession = StorageService.getEventSession('TEAM-02');
    expect(reloadedSession?.startTime).toBe(fifteenMinsAgo);
    expect(reloadedSession?.currentQuestionId).toBe(12);
    expect(reloadedSession?.completedQuestionIds).toHaveLength(11);

    const reloadedTeam = StorageService.getTeam('TEAM-02');
    expect(reloadedTeam?.startTime).toBe(new Date(fifteenMinsAgo).toISOString());
  });

  it('10. Trial Mode isolation: timer start does not alter Event Mode records', () => {
    StorageService.setAppMode('trial');

    // Setup an event record for TEAM-03
    const eventSession: GameSession = {
      teamId: 'TEAM-03',
      mode: 'event',
      currentLevel: 1,
      currentQuestionId: 1,
      completedQuestionIds: [],
      wrongAttemptsByQuestion: {},
      totalAttemptsByQuestion: {},
      startTime: null,
      endTime: null,
      elapsedSeconds: 0,
      isPaused: false,
      pausedAt: null,
      status: 'active'
    };
    StorageService.saveSession(eventSession);

    // Create a trial session
    const trialSession: GameSession = {
      teamId: 'TEAM-03',
      mode: 'trial',
      currentLevel: 1,
      currentQuestionId: 1,
      completedQuestionIds: [],
      wrongAttemptsByQuestion: {},
      totalAttemptsByQuestion: {},
      startTime: null,
      endTime: null,
      elapsedSeconds: 0,
      isPaused: false,
      pausedAt: null,
      status: 'active'
    };
    StorageService.saveSession(trialSession);

    // Start hunt in trial session
    trialSession.startTime = Date.now();
    StorageService.saveSession(trialSession);

    // Trial session has start time
    expect(StorageService.getTrialSession()?.startTime).not.toBeNull();

    // Official event session remains untouched with startTime == null
    expect(StorageService.getEventSession('TEAM-03')?.startTime).toBeNull();
  });

  it('11. Header: Shield icon (Organizer Console) is NOT visible to participants on participant pages', () => {
    const mockTeam: TeamRecord = {
      id: 'TEAM-01',
      name: 'Code3SD',
      password: 'Code3SD@yit',
      callsign: 'CODE3SD',
      currentLevel: 1,
      currentQuestionId: 1,
      completedQuestionIds: [],
      wrongAttemptsCount: 0,
      totalAttemptsCount: 0,
      startTime: null,
      completionTime: null,
      elapsedSeconds: 0,
      status: 'not_started',
      mode: 'event',
      lastActiveTime: null,
      checkpointsCompleted: []
    };

    render(
      <Header
        mode="event"
        activeTeam={mockTeam}
        isAdmin={false}
        onOpenOrganizer={vi.fn()}
        onLogout={vi.fn()}
        isOnline={true}
      />
    );

    // Shield icon button should NOT exist when isAdmin is false
    expect(screen.queryByTitle('Organizer Console')).not.toBeInTheDocument();
  });

  it('12. Header: Shield icon (Organizer Console) IS visible when isAdmin is true', () => {
    render(
      <Header
        mode="event"
        isAdmin={true}
        onOpenOrganizer={vi.fn()}
        onLogout={vi.fn()}
        isOnline={true}
      />
    );

    // Shield icon button should exist when isAdmin is true
    expect(screen.getByTitle('Organizer Console')).toBeInTheDocument();
  });

  it('13. ExpeditionCompleteScreen: Organizer button with Shield icon is hidden from participants and only visible to admin', () => {
    const mockTeam: TeamRecord = {
      id: 'TEAM-01',
      name: 'Code3SD',
      password: 'Code3SD@yit',
      callsign: 'CODE3SD',
      currentLevel: 4,
      currentQuestionId: 40,
      completedQuestionIds: Array.from({ length: 40 }, (_, i) => i + 1),
      wrongAttemptsCount: 2,
      totalAttemptsCount: 42,
      startTime: null,
      completionTime: null,
      elapsedSeconds: 3600,
      status: 'completed',
      mode: 'event',
      lastActiveTime: null,
      checkpointsCompleted: []
    };

    // Participant view (isAdmin = false)
    const { rerender } = render(
      <ExpeditionCompleteScreen
        team={mockTeam}
        elapsedSeconds={3600}
        mode="event"
        isAdmin={false}
        onReturnHome={vi.fn()}
        onOpenOrganizer={vi.fn()}
      />
    );

    expect(screen.queryByText(/Organizer Telemetry & CSV Export/i)).not.toBeInTheDocument();

    // Admin view (isAdmin = true)
    rerender(
      <ExpeditionCompleteScreen
        team={mockTeam}
        elapsedSeconds={3600}
        mode="event"
        isAdmin={true}
        onReturnHome={vi.fn()}
        onOpenOrganizer={vi.fn()}
      />
    );

    expect(screen.getByText(/Organizer Telemetry & CSV Export/i)).toBeInTheDocument();
  });
});

