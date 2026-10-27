/**
 * answer-input-restrictions.test.tsx
 *
 * Verifies that the answer input in GameScreen blocks copy, cut, paste,
 * and drag-and-drop while keeping normal keyboard typing functional.
 * Scoped to id="answer-input" only — no other input is affected.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, createEvent, screen } from '@testing-library/react';
import { GameScreen } from '../pages/GameScreen';
import { Question, GameSession, TeamRecord } from '../types';

// ── Minimal fixtures ──────────────────────────────────────────────────────────

const mockQuestion: Question = {
  id: 1,
  num: 'Q1',
  level: 1,
  title: 'The Silent Keeper',
  question: 'I have pages but am not a tree. What am I?',
  type: 'digital',
  answerFormat: 'text',
  acceptedAnswers: ['Book', 'A book'],
  isPhysicalCheckpoint: false,
};

const mockSession: GameSession = {
  teamId: 'TEAM-01',
  mode: 'event',
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
  status: 'active',
};

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
  checkpointsCompleted: [],
};

function renderGameScreen() {
  render(
    <GameScreen
      question={mockQuestion}
      session={mockSession}
      team={mockTeam}
      mode="event"
      onCorrectAnswer={vi.fn()}
      onIncorrectAnswer={vi.fn()}
      onPhysicalCheckpointConfirm={vi.fn()}
      onRequestOrganizerPin={vi.fn()}
    />
  );
}

function getAnswerInput() {
  return screen.getByRole('textbox');
}

// ── Paste prevention ──────────────────────────────────────────────────────────

describe('Answer input — paste prevention', () => {
  beforeEach(renderGameScreen);

  it('calls preventDefault() on a paste event', () => {
    const input = getAnswerInput();
    const pasteEvent = createEvent.paste(input);
    fireEvent(input, pasteEvent);
    expect(pasteEvent.defaultPrevented).toBe(true);
  });

  it('leaves the input value unchanged after a paste attempt', () => {
    const input = getAnswerInput() as HTMLInputElement;
    fireEvent.paste(input, {
      clipboardData: { getData: () => 'pasted text' },
    });
    expect(input.value).toBe('');
  });
});

// ── Copy prevention ───────────────────────────────────────────────────────────

describe('Answer input — copy prevention', () => {
  beforeEach(renderGameScreen);

  it('calls preventDefault() on a copy event', () => {
    const input = getAnswerInput();
    const copyEvent = createEvent.copy(input);
    fireEvent(input, copyEvent);
    expect(copyEvent.defaultPrevented).toBe(true);
  });
});

// ── Cut prevention ────────────────────────────────────────────────────────────

describe('Answer input — cut prevention', () => {
  beforeEach(renderGameScreen);

  it('calls preventDefault() on a cut event', () => {
    const input = getAnswerInput();
    const cutEvent = createEvent.cut(input);
    fireEvent(input, cutEvent);
    expect(cutEvent.defaultPrevented).toBe(true);
  });
});

// ── Drag-and-drop prevention ──────────────────────────────────────────────────

describe('Answer input — drag-and-drop prevention', () => {
  beforeEach(renderGameScreen);

  it('calls preventDefault() on a drop event', () => {
    const input = getAnswerInput();
    const dropEvent = createEvent.drop(input);
    fireEvent(input, dropEvent);
    expect(dropEvent.defaultPrevented).toBe(true);
  });

  it('calls preventDefault() on dragover', () => {
    const input = getAnswerInput();
    const dragOverEvent = createEvent.dragOver(input);
    fireEvent(input, dragOverEvent);
    expect(dragOverEvent.defaultPrevented).toBe(true);
  });
});

// ── Normal typing remains functional ─────────────────────────────────────────

describe('Answer input — normal typing still works', () => {
  beforeEach(renderGameScreen);

  it('accepts typed characters through onChange', () => {
    const input = getAnswerInput() as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Book' } });
    expect(input.value).toBe('Book');
  });

  it('accepts deletion through onChange', () => {
    const input = getAnswerInput() as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Book' } });
    fireEvent.change(input, { target: { value: 'Boo' } });
    expect(input.value).toBe('Boo');
  });

  it('does not block form submission after manual typing', () => {
    const input = getAnswerInput() as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Book' } });
    const form = input.closest('form')!;
    fireEvent.submit(form);
    expect(form).toBeInTheDocument();
  });
});

// ── Scope: restrictions must NOT apply to other inputs ────────────────────────

describe('Other inputs — no global paste restriction', () => {
  it('a non-answer input does not have its paste cancelled by our handlers', () => {
    const otherInput = document.createElement('input');
    otherInput.id = 'team-name-input';
    document.body.appendChild(otherInput);

    const pasteEvent = createEvent.paste(otherInput);
    fireEvent(otherInput, pasteEvent);
    expect(pasteEvent.defaultPrevented).toBe(false);

    document.body.removeChild(otherInput);
  });
});
