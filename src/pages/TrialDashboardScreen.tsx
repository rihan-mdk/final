import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  ArrowLeft
} from 'lucide-react';
import { TrialQuestionStatus } from '../types';
import questions from '../data/questions.json';
import { StorageService } from '../lib/storage/storageService';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface TrialDashboardScreenProps {
  onTestQuestion: (questionId: number) => void;
  onBack: () => void;
}

export const TrialDashboardScreen: React.FC<TrialDashboardScreenProps> = ({
  onTestQuestion,
  onBack
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [trialChecklist, setTrialChecklist] = useState<Record<number, TrialQuestionStatus>>(
    StorageService.getTrialChecklist()
  );
  const [showResetModal, setShowResetModal] = useState(false);

  const toggleReveal = (id: number) => {
    setRevealedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredQuestions = selectedLevel === 'all'
    ? questions
    : questions.filter(q => q.level === selectedLevel);

  const handleResetTrialData = () => {
    StorageService.clearTrialData();
    setTrialChecklist({});
    setShowResetModal(false);
  };

  // Metrics
  const totalQuestions = questions.length;
  const verifiedCount = Object.values(trialChecklist).filter(item => item.testedCorrect).length;

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={onBack}
            aria-label="Back"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-structural)',
              color: 'var(--text-primary)'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h2 className="text-title-lg" style={{ textTransform: 'uppercase' }}>
                Trial Dashboard
              </h2>
              <span className="badge badge-amber">QA SUITE</span>
            </div>
            <span className="text-caption">40-Question Validation Matrix</span>
          </div>
        </div>

        <button
          className="btn btn-danger"
          onClick={() => setShowResetModal(true)}
          style={{ width: 'auto', padding: '0.45rem 0.85rem', minHeight: '36px', fontSize: '0.75rem' }}
        >
          <RotateCcw size={14} />
          <span>Reset Trial</span>
        </button>
      </div>

      {/* Progress & Stats Card */}
      <div className="card" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="text-caption">QA VALIDATION COVERAGE</span>
          <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-amber)' }}>
            {verifiedCount} / {totalQuestions} Verified ({Math.round((verifiedCount / totalQuestions) * 100)}%)
          </span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${(verifiedCount / totalQuestions) * 100}%` }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          This testing environment uses a dedicated local namespace. All actions, resets, and tests are isolated from Event Mode.
        </div>
      </div>

      {/* Level Filter Buttons */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
        {(['all', 1, 2, 3, 4] as const).map(lvl => (
          <button
            key={lvl}
            onClick={() => setSelectedLevel(lvl)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              border: selectedLevel === lvl ? '1.5px solid var(--accent-amber)' : '1px solid var(--border-structural)',
              backgroundColor: selectedLevel === lvl ? 'var(--accent-amber-muted)' : 'var(--bg-surface-elevated)',
              color: selectedLevel === lvl ? 'var(--accent-amber)' : 'var(--text-secondary)',
              whiteSpace: 'nowrap'
            }}
          >
            {lvl === 'all' ? 'All Questions (40)' : `Level ${lvl} (10)`}
          </button>
        ))}
      </div>

      {/* Questions Matrix */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredQuestions.map((q) => {
          const status = trialChecklist[q.id];
          const isRevealed = revealedAnswers[q.id];

          return (
            <div
              key={q.id}
              className="card"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-structural)',
                padding: '1rem',
                gap: '0.65rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                    {q.num}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    LEVEL {q.level} • {q.answerFormat.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {status?.testedCorrect ? (
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                      <CheckCircle2 size={12} /> TESTED CORRECT
                    </span>
                  ) : status?.testedIncorrect ? (
                    <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>
                      <XCircle size={12} /> TESTED INCORRECT
                    </span>
                  ) : (
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                      UNTESTED
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {q.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                  {q.question}
                </div>
              </div>

              {/* Protected Organizer Reveal Area */}
              {isRevealed && (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-structural)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}>
                  <div style={{ color: 'var(--accent-amber)', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                    ORGANIZER ANSWER KEY:
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--status-green)', fontWeight: 700 }}>
                    {q.acceptedAnswers.join('  |  ')}
                  </div>
                  {q.reviewNotes && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Note: {q.reviewNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Actions row */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => toggleReveal(q.id)}
                  style={{ flex: 1, minHeight: '38px', fontSize: '0.75rem' }}
                >
                  {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{isRevealed ? 'Hide Answer' : 'Reveal Key'}</span>
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => onTestQuestion(q.id)}
                  style={{ flex: 1, minHeight: '38px', fontSize: '0.75rem' }}
                >
                  <Play size={14} />
                  <span>Test in Engine</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        title="Reset Trial Data"
        message="This will clear all trial sessions and QA test checklists on this device. Official Event Mode records and team registrations will NOT be affected."
        confirmLabel="Reset Trial Only"
        isDangerous={true}
        onConfirm={handleResetTrialData}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
};
