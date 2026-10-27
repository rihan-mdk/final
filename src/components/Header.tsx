import React from 'react';
import { Shield, Wifi, WifiOff, Users, ArrowLeft, LogOut } from 'lucide-react';
import { TeamRecord } from '../types';

interface HeaderProps {
  mode: 'trial' | 'event' | null;
  activeTeam?: TeamRecord;
  isAdmin?: boolean;
  onOpenOrganizer?: () => void;
  onLogout?: () => void;
  onBack?: () => void;
  currentLevel?: number;
  currentQuestionNum?: string;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  activeTeam,
  isAdmin = false,
  onOpenOrganizer,
  onLogout,
  onBack,
  currentLevel,
  currentQuestionNum,
  isOnline
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(18, 20, 22, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-structural)',
      padding: '0.65rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-structural)'
            }}
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              THE HUNT
            </span>
            {mode === 'trial' && (
              <span className="badge badge-amber-subtle" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                ADMIN QA
              </span>
            )}
            {mode === 'event' && (
              <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                EVENT
              </span>
            )}
          </div>
          {currentLevel && currentQuestionNum ? (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              LEVEL {currentLevel} • {currentQuestionNum}
            </div>
          ) : (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              EXPEDITION 2026
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {activeTeam && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.55rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-structural)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            maxWidth: '130px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            <Users size={13} color="var(--accent-amber)" />
            <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeTeam.name}
            </span>
          </div>
        )}

        <div
          title={isOnline ? 'Online Connection' : 'Operating in Offline Mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-structural)',
            color: isOnline ? 'var(--status-green)' : 'var(--text-secondary)'
          }}
        >
          {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
        </div>

        {onLogout && activeTeam && (
          <button
            onClick={onLogout}
            title="Log Out (Preserves Progress)"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-structural)',
              color: 'var(--text-secondary)'
            }}
          >
            <LogOut size={15} />
          </button>
        )}

        {isAdmin && onOpenOrganizer && (
          <button
            onClick={onOpenOrganizer}
            title="Organizer Console"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-structural)',
              color: 'var(--accent-amber)'
            }}
          >
            <Shield size={16} />
          </button>
        )}
      </div>
    </header>
  );
};
