import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1.5px solid var(--border-structural)',
        borderRadius: 'var(--radius-md)',
        maxWidth: '440px',
        width: '100%',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isDangerous ? 'var(--status-red-bg)' : 'var(--accent-amber-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDangerous ? 'var(--status-red)' : 'var(--accent-amber)'
            }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.01em' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close modal"
            style={{ color: 'var(--text-secondary)', padding: '0.2rem' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          {message}
        </p>

        {children}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            style={{ flex: 1 }}
          >
            {cancelLabel}
          </button>
          <button
            className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            style={{ flex: 1 }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
