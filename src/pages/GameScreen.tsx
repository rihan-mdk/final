import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  MapPin, 
  Send, 
  ShieldCheck, 
  Delete, 
  Clock
} from 'lucide-react';
import { Question, GameSession, TeamRecord, ValidationResult } from '../types';
import { validateAnswer } from '../lib/validation/answerValidator';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { formatElapsedTime, calculateElapsedSeconds } from '../lib/timer/timerUtils';

interface GameScreenProps {
  question: Question;
  session: GameSession;
  team: TeamRecord;
  mode?: 'trial' | 'event';
  onCorrectAnswer: (questionId: number) => void;
  onIncorrectAnswer: (questionId: number, input: string) => void;
  onPhysicalCheckpointConfirm?: (questionId: number) => void;
  onRequestOrganizerPin: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  question,
  session,
  team,
  onCorrectAnswer,
  onIncorrectAnswer,
  onPhysicalCheckpointConfirm,
  onRequestOrganizerPin
}) => {
  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect' | 'neutral' | null; message: string }>({
    status: null,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsedDisplay, setElapsedDisplay] = useState('00:00');
  const inputRef = useRef<HTMLInputElement>(null);

  // Update wall-clock elapsed time ticker
  useEffect(() => {
    const updateTimer = () => {
      const elapsed = calculateElapsedSeconds(
        session.startTime,
        session.endTime,
        session.isPaused,
        session.pausedAt,
        session.elapsedSeconds
      );
      setElapsedDisplay(formatElapsedTime(elapsed));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session]);

  // Reset input and feedback when switching questions
  useEffect(() => {
    setInputVal('');
    setFeedback({ status: null, message: '' });
    inputRef.current?.focus();
  }, [question.id]);

  // Calculate Level progress (1 to 10 within current level)
  const questionIndexInLevel = ((question.id - 1) % 10) + 1;
  const levelProgressPercent = ((questionIndexInLevel - 1) / 10) * 100;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const trimmed = inputVal.trim();
    if (!trimmed) {
      setFeedback({
        status: 'incorrect',
        message: 'INPUT REQUIRED: Please type your answer before submitting.'
      });
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    const result: ValidationResult = validateAnswer(question, trimmed);

    if (result.isValid) {
      setFeedback({
        status: 'correct',
        message: 'CORRECT ANSWER'
      });

      // Brief delay so participant sees the clear green confirmation before advancing
      setTimeout(() => {
        onCorrectAnswer(question.id);
        setIsSubmitting(false);
      }, 700);
    } else {
      setFeedback({
        status: 'incorrect',
        message: result.feedbackMessage
      });
      onIncorrectAnswer(question.id, trimmed);
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const getFormatHelpLabel = () => {
    switch (question.answerFormat) {
      case 'numeric':
        return 'NUMERIC VALUE';
      case 'coordinate':
        return 'FORMAT: (x,y)';
      case 'sequence':
        return 'SEQUENCE: COMMA-SEPARATED';
      case 'probability':
        return 'FORMAT: FRACTION OR DECIMAL';
      case 'binary':
        return 'BINARY CODE (0s & 1s)';
      case 'two-word':
        return 'TWO-WORD PHRASE';
      case 'three-word':
        return 'THREE-WORD PHRASE';
      default:
        return 'TEXT ANSWER';
    }
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Telemetry Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.55rem 0.85rem',
        backgroundColor: 'var(--bg-surface-elevated)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-structural)',
        fontSize: '0.78rem',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span className="badge badge-amber">
            LEVEL {question.level} / 4
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            WAYPOINT {questionIndexInLevel} / 10
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={13} color="var(--accent-amber)" />
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{elapsedDisplay}</span>
          </div>
          <span>•</span>
          <span style={{ fontWeight: 600 }}>{team.id}</span>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          <span>PROGRESS IN LEVEL {question.level}</span>
          <span>{questionIndexInLevel} of 10</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${Math.max(10, levelProgressPercent)}%` }} />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="card" style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1.5px solid var(--border-structural)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--accent-amber)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <MapPin size={14} />
            WAYPOINT {question.num} (Q{question.id})
          </span>

          {question.isPhysicalCheckpoint ? (
            <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
              PHYSICAL CHECKPOINT
            </span>
          ) : (
            <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
              {getFormatHelpLabel()}
            </span>
          )}
        </div>

        {/* Question Title & Prompt */}
        <div>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            {question.title}
          </h2>
          <p style={{
            fontSize: '1.05rem',
            fontWeight: 500,
            color: 'var(--text-primary)',
            lineHeight: 1.55,
            whiteSpace: 'pre-wrap'
          }}>
            {question.question}
          </p>
        </div>

        {/* Physical Checkpoint Specific Notice */}
        {question.isPhysicalCheckpoint && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1.5px dashed var(--accent-amber)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)', fontWeight: 700, fontSize: '0.85rem' }}>
              <Compass size={18} />
              <span>FIELD DIRECTIVE: VISIT CHECKPOINT STATION</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              {question.checkpointInstructions || 'Locate the physical checkpoint card placed at the designated coordinates. Inspect the clue and decode the key.'}
            </p>
          </div>
        )}

        {/* Feedback Banner */}
        <FeedbackBanner
          status={feedback.status}
          message={feedback.message}
        />

        {/* Input & Submission Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            <label htmlFor="answer-input" style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              ENTER ANSWER CODE
            </label>
            <span style={{ textTransform: 'uppercase' }}>
              {getFormatHelpLabel()}
            </span>
          </div>

          <div style={{ position: 'relative', width: '100%' }}>
            <input
              id="answer-input"
              ref={inputRef}
              type="text"
              className="input-field"
              placeholder={question.isPhysicalCheckpoint ? 'Type decoded key...' : 'Type answer here...'}
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                if (feedback.status) setFeedback({ status: null, message: '' });
              }}
              autoComplete="off"
              spellCheck="false"
              autoCapitalize="characters"
              disabled={isSubmitting}
              style={{
                paddingRight: '3rem',
                borderColor: feedback.status === 'correct' ? 'var(--status-green)' : feedback.status === 'incorrect' ? 'var(--status-red)' : undefined
              }}
            />

            {inputVal.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setInputVal('');
                  inputRef.current?.focus();
                }}
                aria-label="Clear answer"
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <Delete size={18} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{
              minHeight: '52px',
              backgroundColor: feedback.status === 'correct' ? 'var(--status-green)' : 'var(--accent-amber)'
            }}
          >
            {feedback.status === 'correct' ? (
              <>
                <ShieldCheck size={20} />
                <span>UNLOCKED — ADVANCING...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>SUBMIT ANSWER</span>
              </>
            )}
          </button>
        </form>

        {/* Physical Checkpoint Organizer Verification Button */}
        {question.isPhysicalCheckpoint && (
          <div style={{
            borderTop: '1px solid var(--border-structural)',
            paddingTop: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                if (onPhysicalCheckpointConfirm) {
                  onPhysicalCheckpointConfirm(question.id);
                } else {
                  onRequestOrganizerPin();
                }
              }}
              style={{ fontSize: '0.82rem' }}
            >
              <ShieldCheck size={16} color="var(--accent-amber)" />
              <span>Organizer Checkpoint Verification (PIN)</span>
            </button>
          </div>
        )}
      </div>

      {/* Attempt Telemetry Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 0.85rem',
        backgroundColor: 'var(--bg-surface-elevated)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-structural)',
        fontSize: '0.72rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--status-green)' }}>●</span>
          <span>UNLIMITED ATTEMPTS PERMITTED</span>
        </div>
        <div>
          ATTEMPTS ON THIS Q: {session.totalAttemptsByQuestion[question.id] || 0}
        </div>
      </div>
    </div>
  );
};
