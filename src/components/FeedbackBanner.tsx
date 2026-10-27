import React from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

interface FeedbackBannerProps {
  status: 'correct' | 'incorrect' | 'close' | 'neutral' | null;
  message: string;
  onDismiss?: () => void;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ status, message }) => {
  if (!status) return null;

  if (status === 'correct') {
    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--status-green-bg)',
          border: '1.5px solid var(--status-green-border)',
          color: 'var(--status-green)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '0.92rem',
          letterSpacing: '0.04em'
        }}
      >
        <CheckCircle2 size={20} />
        <div>
          <div>CORRECT ANSWER</div>
          {message !== 'CORRECT ANSWER' && (
            <div style={{ fontSize: '0.78rem', fontWeight: 500, marginTop: '2px', opacity: 0.9 }}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === 'close') {
    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--accent-amber-muted)',
          border: '1.5px solid var(--accent-amber)',
          color: 'var(--accent-amber)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '0.92rem',
          letterSpacing: '0.04em'
        }}
      >
        <Sparkles size={20} />
        <div>
          <div>{message || "YOU'RE CLOSE! Try once again."}</div>
        </div>
      </div>
    );
  }

  if (status === 'incorrect') {
    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--status-red-bg)',
          border: '1.5px solid var(--status-red-border)',
          color: 'var(--status-red)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '0.92rem',
          letterSpacing: '0.04em'
        }}
      >
        <AlertCircle size={20} />
        <div>
          <div>INCORRECT ANSWER</div>
          {message !== 'INCORRECT ANSWER' && (
            <div style={{ fontSize: '0.78rem', fontWeight: 500, marginTop: '2px', opacity: 0.9 }}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-structural)',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem'
      }}
    >
      <Info size={18} color="var(--accent-amber)" />
      <span>{message}</span>
    </div>
  );
};
