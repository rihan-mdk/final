import React from 'react';
import { Compass, Play, CheckCircle2 } from 'lucide-react';
import { TeamRecord } from '../types';

interface WelcomeScreenProps {
  team: TeamRecord;
  mode?: 'trial' | 'event';
  currentLevel?: number;
  currentQuestionNum?: string;
  isHuntStarted?: boolean;
  onStartHunt: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  team,
  mode = 'event',
  currentLevel = 1,
  currentQuestionNum = 'Q1',
  isHuntStarted = false,
  onStartHunt
}) => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}
      >
        {/* Emblem / Badge */}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--accent-amber-muted)',
            border: '2px solid var(--accent-amber)',
            color: 'var(--accent-amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(232, 172, 80, 0.25)',
            marginBottom: '0.25rem'
          }}
        >
          <Compass size={44} />
        </div>

        {/* Mission Status Tag */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="badge badge-amber-subtle">
            {mode === 'trial' ? 'TRIAL MODE SANDBOX' : 'EXPEDITION MISSION BRIEFING'}
          </span>
          {isHuntStarted && (
            <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={12} />
              HUNT IN PROGRESS
            </span>
          )}
        </div>

        {/* Heading & Mission Statement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <h1
            id="welcome-team-heading"
            className="text-title-xl"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
              margin: 0
            }}
          >
            WELCOME, {team.name}!
          </h1>

          <p
            id="welcome-message"
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              lineHeight: 1.6,
              margin: '0 auto',
              maxWidth: '380px'
            }}
          >
            Your hunt begins here. Think smart, solve the clues, and trust your team.
          </p>
        </div>

        {/* Mission Parameters Card */}
        <div
          className="card"
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1.5px solid var(--border-structural)',
            padding: '1.15rem 1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              CALLSIGN
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
              {team.callsign || team.id}
            </div>
          </div>

          <div style={{ borderLeft: '1px solid var(--border-structural)', borderRight: '1px solid var(--border-structural)' }}>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              SECTOR
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-amber)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
              LEVEL {currentLevel} • {currentQuestionNum}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              OBJECTIVES
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
              40 TOTAL
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ width: '100%', marginTop: '0.5rem' }}>
          <button
            id="start-hunt-btn"
            className="btn btn-primary"
            onClick={onStartHunt}
            style={{
              width: '100%',
              minHeight: '54px',
              fontSize: '1.05rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              boxShadow: '0 4px 18px rgba(232, 172, 80, 0.35)'
            }}
          >
            <Play size={20} fill="currentColor" />
            <span>START THE HUNT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
