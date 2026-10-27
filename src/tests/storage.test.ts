import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../lib/storage/storageService';
import { GameSession } from '../types';

describe('Storage Service & Namespace Separation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes exactly 9 authoritative default teams', () => {
    const teams = StorageService.getTeams();
    expect(teams).toHaveLength(9);
    expect(teams[0].id).toBe('TEAM-01');
    expect(teams[0].name).toBe('Code3SD');
    expect(teams[8].id).toBe('TEAM-09');
    expect(teams[8].name).toBe('MindX');
  });

  it('maintains strict isolation between trial and event sessions', () => {
    const eventSession: GameSession = {
      teamId: 'TEAM-01',
      mode: 'event',
      currentLevel: 2,
      currentQuestionId: 15,
      completedQuestionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      wrongAttemptsByQuestion: { 3: 2 },
      totalAttemptsByQuestion: { 3: 3 },
      startTime: 1700000000000,
      endTime: null,
      elapsedSeconds: 450,
      isPaused: false,
      pausedAt: null,
      status: 'active'
    };

    const trialSession: GameSession = {
      teamId: 'ADMIN-QA',
      mode: 'trial',
      currentLevel: 4,
      currentQuestionId: 35,
      completedQuestionIds: [31, 32, 33, 34],
      wrongAttemptsByQuestion: {},
      totalAttemptsByQuestion: {},
      startTime: 1700000050000,
      endTime: null,
      elapsedSeconds: 120,
      isPaused: false,
      pausedAt: null,
      status: 'active'
    };

    StorageService.saveSession(eventSession);
    StorageService.saveSession(trialSession);

    // Verify both are intact
    expect(StorageService.getEventSession('TEAM-01')?.currentQuestionId).toBe(15);
    expect(StorageService.getTrialSession()?.currentQuestionId).toBe(35);

    // Reset Trial Data
    StorageService.clearTrialData();

    // Trial must be gone, but Event must be completely untouched!
    expect(StorageService.getTrialSession()).toBeNull();
    expect(StorageService.getEventSession('TEAM-01')?.currentQuestionId).toBe(15);
  });

  it('resets a single team without corrupting other teams', () => {
    const teams = StorageService.getTeams();
    teams[0].currentLevel = 3;
    teams[0].wrongAttemptsCount = 5;
    StorageService.saveTeams(teams);

    StorageService.resetTeam('TEAM-01');

    const updatedTeams = StorageService.getTeams();
    expect(updatedTeams[0].currentLevel).toBe(1);
    expect(updatedTeams[0].wrongAttemptsCount).toBe(0);
    // Other teams remain intact
    expect(updatedTeams[1].id).toBe('TEAM-02');
  });

  it('exports and validates backup restore', () => {
    const backupJson = StorageService.exportBackup();
    expect(backupJson).toContain('Code3SD');

    const result = StorageService.importBackup(backupJson);
    expect(result.success).toBe(true);

    const invalidResult = StorageService.importBackup('{"invalid": true}');
    expect(invalidResult.success).toBe(false);
  });

  it('generates well-formatted CSV with 9 team records and headers', () => {
    const csv = StorageService.generateResultsCsv();
    const lines = csv.split('\r\n').filter(Boolean);
    // 1 header line + 9 teams = 10 lines
    expect(lines).toHaveLength(10);
    expect(lines[0]).toContain('Team ID');
    expect(lines[1]).toContain('TEAM-01');
    expect(lines[9]).toContain('TEAM-09');
  });
});
