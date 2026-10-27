import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PinModal } from './components/PinModal';
import { SplashScreen } from './pages/SplashScreen';
import { LoginScreen } from './pages/LoginScreen';
import { WelcomeScreen } from './pages/WelcomeScreen';
import { GameScreen } from './pages/GameScreen';
import { LevelCompleteScreen } from './pages/LevelCompleteScreen';
import { ExpeditionCompleteScreen } from './pages/ExpeditionCompleteScreen';
import { TrialDashboardScreen } from './pages/TrialDashboardScreen';
import { OrganizerDashboardScreen } from './pages/OrganizerDashboardScreen';
import { StorageService } from './lib/storage/storageService';
import { GameSession, Question, TeamRecord } from './types';
import { calculateElapsedSeconds } from './lib/timer/timerUtils';
import rawQuestions from './data/questions.json';

const questions = rawQuestions as unknown as Question[];

export type AppView = 
  | 'splash'
  | 'login'
  | 'welcome'
  | 'game'
  | 'level-complete'
  | 'expedition-complete'
  | 'trial-dashboard'
  | 'organizer-dashboard';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('splash');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinSuccessTarget, setPinSuccessTarget] = useState<AppView>('organizer-dashboard');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Authenticated participant team
  const [loggedInTeamId, setLoggedInTeamId] = useState<string | null>(StorageService.getLoggedInTeamId());
  const [appMode, setAppMode] = useState<'trial' | 'event'>(() => StorageService.getAppMode() || 'event');

  // Game session
  const [session, setSession] = useState<GameSession | null>(() => {
    const tid = StorageService.getLoggedInTeamId();
    const mode = StorageService.getAppMode() || 'event';
    return tid ? StorageService.getSession(mode, tid) : null;
  });

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const activeTeam: TeamRecord | undefined = loggedInTeamId 
    ? StorageService.getTeam(loggedInTeamId) 
    : undefined;

  // Session retrieval/creation
  const getOrCreateSession = (
    teamId: string,
    initialQId = 1,
    mode: 'trial' | 'event' = 'event'
  ): GameSession => {
    const existing = StorageService.getSession(mode, teamId);
    if (existing) {
      return existing;
    }

    const newSession: GameSession = {
      teamId,
      mode,
      currentLevel: Math.ceil(initialQId / 10),
      currentQuestionId: initialQId,
      completedQuestionIds: [],
      wrongAttemptsByQuestion: {},
      totalAttemptsByQuestion: {},
      startTime: null, // Timer starts when START THE HUNT is clicked
      endTime: null,
      elapsedSeconds: 0,
      isPaused: false,
      pausedAt: null,
      status: 'active'
    };

    StorageService.saveSession(newSession);
    return newSession;
  };

  // Centralized Route / View Access Guard
  const navigateToView = (targetView: AppView) => {
    // If attempting to enter admin-only views without admin authentication
    if ((targetView === 'organizer-dashboard' || targetView === 'trial-dashboard') && !isAdminAuthenticated) {
      setPinSuccessTarget(targetView);
      setIsPinModalOpen(true);
      return;
    }
    setCurrentView(targetView);
  };

  const handleLoginSuccess = (team: TeamRecord) => {
    setIsAdminAuthenticated(false);
    setLoggedInTeamId(team.id);
    StorageService.setLoggedInTeamId(team.id);
    StorageService.setActiveTeamId(team.id);

    const chosenMode = team.mode === 'trial' ? 'trial' : (StorageService.getAppMode() || appMode || 'event');
    setAppMode(chosenMode);
    StorageService.setAppMode(chosenMode);

    const teamSession = getOrCreateSession(team.id, 1, chosenMode);
    setSession(teamSession);

    // After a team logs in successfully, show dedicated welcome screen
    setCurrentView('welcome');
  };

  const handleStartHunt = () => {
    const tid = loggedInTeamId || session?.teamId;
    if (!tid) {
      setCurrentView('login');
      return;
    }

    const currentMode = appMode;
    let currentSession = session || getOrCreateSession(tid, 1, currentMode);

    // Timer Behaviour:
    // Start elapsed-time timer when START THE HUNT is clicked, NOT when logging in.
    // If the hunt has already started previously, revisiting the welcome screen must NOT reset or restart the timer.
    if (!currentSession.startTime) {
      const nowMs = Date.now();
      currentSession = {
        ...currentSession,
        startTime: nowMs,
        status: currentSession.status === 'completed' ? 'completed' : 'active'
      };
      StorageService.saveSession(currentSession);
      setSession(currentSession);

      if (currentMode === 'event') {
        const team = StorageService.getTeam(tid);
        if (team) {
          team.startTime = team.startTime || new Date(nowMs).toISOString();
          if (team.status === 'not_started') {
            team.status = 'in_progress';
          }
          team.mode = 'event';
          StorageService.updateTeam(team);
        }
      }
    }

    if (currentSession.status === 'completed') {
      setCurrentView('expedition-complete');
    } else {
      setCurrentView('game');
    }
  };

  const handleLogout = () => {
    StorageService.logout();
    setIsAdminAuthenticated(false);
    setLoggedInTeamId(null);
    setSession(null);
    setCurrentView('login');
  };

  // Answer verification handlers
  const handleCorrectAnswer = (questionId: number) => {
    if (!session) return;

    if (appMode === 'trial') {
      StorageService.recordTrialTest(questionId, true);
    }

    const updatedCompleted = Array.from(new Set([...session.completedQuestionIds, questionId]));
    const nextQId = questionId + 1;
    const isLevelMilestone = questionId % 10 === 0;
    const isFinalQuestion = questionId === 40;

    const nowMs = Date.now();
    const currentElapsed = calculateElapsedSeconds(
      session.startTime,
      isFinalQuestion ? nowMs : session.endTime,
      session.isPaused,
      session.pausedAt,
      session.elapsedSeconds
    );

    const updatedSession: GameSession = {
      ...session,
      completedQuestionIds: updatedCompleted,
      currentQuestionId: nextQId <= 40 ? nextQId : 40,
      currentLevel: Math.min(4, Math.ceil(nextQId / 10)),
      endTime: isFinalQuestion ? nowMs : session.endTime,
      elapsedSeconds: currentElapsed,
      status: isFinalQuestion ? 'completed' : 'active'
    };

    StorageService.saveSession(updatedSession);
    setSession(updatedSession);

    // Update Team record
    if (loggedInTeamId) {
      const team = StorageService.getTeam(loggedInTeamId);
      if (team) {
        team.completedQuestionIds = updatedCompleted;
        team.currentQuestionId = updatedSession.currentQuestionId;
        team.currentLevel = updatedSession.currentLevel;
        team.elapsedSeconds = currentElapsed;
        if (isFinalQuestion) {
          team.completionTime = new Date().toISOString();
          team.status = 'completed';
        }
        StorageService.updateTeam(team);
      }
    }

    if (isFinalQuestion) {
      setCurrentView('expedition-complete');
    } else if (isLevelMilestone) {
      setCurrentView('level-complete');
    }
  };

  const handleIncorrectAnswer = (questionId: number, _input: string) => {
    if (!session) return;

    if (appMode === 'trial') {
      StorageService.recordTrialTest(questionId, false);
    }

    const prevWrong = session.wrongAttemptsByQuestion[questionId] || 0;
    const prevTotal = session.totalAttemptsByQuestion[questionId] || 0;

    const updatedSession: GameSession = {
      ...session,
      wrongAttemptsByQuestion: {
        ...session.wrongAttemptsByQuestion,
        [questionId]: prevWrong + 1
      },
      totalAttemptsByQuestion: {
        ...session.totalAttemptsByQuestion,
        [questionId]: prevTotal + 1
      }
    };

    StorageService.saveSession(updatedSession);
    setSession(updatedSession);

    if (loggedInTeamId) {
      const team = StorageService.getTeam(loggedInTeamId);
      if (team) {
        team.wrongAttemptsCount += 1;
        team.totalAttemptsCount += 1;
        StorageService.updateTeam(team);
      }
    }
  };

  const handlePhysicalCheckpointConfirm = (_questionId: number) => {
    setPinSuccessTarget('game');
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setIsAdminAuthenticated(true);

    if (pinSuccessTarget === 'game' && session) {
      // Checkpoint confirmed by organizer PIN
      handleCorrectAnswer(session.currentQuestionId);
    } else {
      setCurrentView(pinSuccessTarget);
    }
  };

  const currentQuestion = questions.find(q => q.id === (session?.currentQuestionId || 1)) || questions[0];

  return (
    <div className="app-viewport">
      {currentView !== 'splash' && currentView !== 'login' && (
        <Header
          mode={appMode}
          activeTeam={activeTeam}
          isAdmin={isAdminAuthenticated && (currentView === 'organizer-dashboard' || currentView === 'trial-dashboard')}
          onOpenOrganizer={
            (currentView === 'organizer-dashboard' || currentView === 'trial-dashboard') && isAdminAuthenticated
              ? () => navigateToView('organizer-dashboard')
              : undefined
          }
          onLogout={handleLogout}
          onBack={
            currentView === 'trial-dashboard' || currentView === 'organizer-dashboard'
              ? () => {
                  if (loggedInTeamId) {
                    setCurrentView(session?.startTime ? 'game' : 'welcome');
                  } else {
                    setCurrentView('login');
                  }
                }
              : undefined
          }
          currentLevel={currentView === 'game' ? currentQuestion.level : undefined}
          currentQuestionNum={currentView === 'game' ? currentQuestion.num : undefined}
          isOnline={isOnline}
        />
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'splash' && (
          <SplashScreen
            onComplete={() => {
              if (loggedInTeamId) {
                const s = getOrCreateSession(loggedInTeamId, 1, appMode);
                setSession(s);
                if (s.status === 'completed') {
                  setCurrentView('expedition-complete');
                } else if (s.startTime) {
                  setCurrentView('game');
                } else {
                  setCurrentView('welcome');
                }
              } else {
                setCurrentView('login');
              }
            }}
          />
        )}

        {currentView === 'login' && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onAdminLoginSuccess={() => {
              setIsAdminAuthenticated(true);
              setCurrentView('organizer-dashboard');
            }}
          />
        )}

        {currentView === 'welcome' && (activeTeam || StorageService.getTeam(loggedInTeamId || '')) && (
          <WelcomeScreen
            team={(activeTeam || StorageService.getTeam(loggedInTeamId || ''))!}
            mode={appMode}
            currentLevel={session?.currentLevel || 1}
            currentQuestionNum={currentQuestion.num}
            isHuntStarted={Boolean(session?.startTime)}
            onStartHunt={handleStartHunt}
          />
        )}

        {currentView === 'game' && session && (
          <GameScreen
            question={currentQuestion}
            session={session}
            team={activeTeam || StorageService.getTeams()[0]}
            mode={appMode}
            onCorrectAnswer={handleCorrectAnswer}
            onIncorrectAnswer={handleIncorrectAnswer}
            onPhysicalCheckpointConfirm={handlePhysicalCheckpointConfirm}
            onRequestOrganizerPin={() => {
              setPinSuccessTarget('game');
              setIsPinModalOpen(true);
            }}
          />
        )}

        {currentView === 'level-complete' && session && activeTeam && (
          <LevelCompleteScreen
            completedLevel={Math.max(1, session.currentLevel - 1)}
            team={activeTeam}
            elapsedSeconds={session.elapsedSeconds}
            onProceed={() => setCurrentView('game')}
          />
        )}

        {currentView === 'expedition-complete' && session && activeTeam && (
          <ExpeditionCompleteScreen
            team={activeTeam}
            elapsedSeconds={session.elapsedSeconds}
            mode={appMode}
            isAdmin={isAdminAuthenticated}
            onReturnHome={() => setCurrentView('game')}
            onOpenOrganizer={() => navigateToView('organizer-dashboard')}
          />
        )}

        {/* ADMIN-ONLY PROTECTED SCREENS */}
        {currentView === 'trial-dashboard' && isAdminAuthenticated && (
          <TrialDashboardScreen
            onTestQuestion={(qId) => {
              const trialSession: GameSession = {
                teamId: 'ADMIN-QA',
                mode: 'trial',
                currentLevel: Math.ceil(qId / 10),
                currentQuestionId: qId,
                completedQuestionIds: [],
                wrongAttemptsByQuestion: {},
                totalAttemptsByQuestion: {},
                startTime: Date.now(),
                endTime: null,
                elapsedSeconds: 0,
                isPaused: false,
                pausedAt: null,
                status: 'active'
              };
              StorageService.saveSession(trialSession);
              setSession(trialSession);
              setAppMode('trial');
              setCurrentView('game');
            }}
            onBack={() => setCurrentView('organizer-dashboard')}
          />
        )}

        {currentView === 'organizer-dashboard' && isAdminAuthenticated && (
          <OrganizerDashboardScreen
            onBack={() => {
              if (loggedInTeamId) {
                setAppMode('event');
                const s = getOrCreateSession(loggedInTeamId, 1, 'event');
                setSession(s);
                setCurrentView(s.startTime ? 'game' : 'welcome');
              } else {
                setCurrentView('login');
              }
            }}
            onLaunchEvent={() => {
              if (loggedInTeamId) {
                setAppMode('event');
                const s = getOrCreateSession(loggedInTeamId, 1, 'event');
                setSession(s);
                setCurrentView(s.startTime ? 'game' : 'welcome');
              } else {
                setCurrentView('login');
              }
            }}
            onLaunchTrial={() => {
              setAppMode('trial');
              setCurrentView('trial-dashboard');
            }}
          />
        )}
      </main>

      {/* Organizer PIN Unlock / Setup Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onSuccess={handlePinSuccess}
        onClose={() => setIsPinModalOpen(false)}
      />
    </div>
  );
};
