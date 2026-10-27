import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Shield } from 'lucide-react';
import { TeamRecord } from '../types';
import { formatElapsedTime } from '../lib/timer/timerUtils';

interface ExpeditionCompleteScreenProps {
  team: TeamRecord;
  elapsedSeconds: number;
  mode: 'trial' | 'event';
  onReturnHome: () => void;
  onOpenOrganizer: () => void;
}

export const ExpeditionCompleteScreen: React.FC<ExpeditionCompleteScreenProps> = ({
  team,
  elapsedSeconds,
  mode,
  onReturnHome,
  onOpenOrganizer
}) => {
  useEffect(() => {
    try {
      const end = Date.now() + 2000;
      const interval: NodeJS.Timeout = setInterval(() => {
        if (Date.now() > end) {
          return clearInterval(interval);
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#e8ac50', '#42b883', '#ffc97d', '#f6f2e9']
        });
      }, 250);
      return () => clearInterval(interval);
    } catch (e) {
      // safe fallback
    }
  }, []);

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', textAlign: 'center' }}>
      <div style={{
        width: '88px',
        height: '88px',
        borderRadius: 'var(--radius-pill)',
        backgroundColor: 'var(--accent-amber-muted)',
        border: '3px solid var(--accent-amber)',
        color: 'var(--accent-amber)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '1rem',
        boxShadow: '0 0 35px rgba(232, 172, 80, 0.3)'
      }}>
        <Trophy size={48} />
      </div>

      <div>
        <div className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>
          {mode === 'trial' ? 'TRIAL SIMULATION FINISHED' : 'EXPEDITION MISSION COMPLETED'}
        </div>
        <h1 className="text-title-xl" style={{ textTransform: 'uppercase' }}>
          EXPEDITION CONQUERED!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.35rem' }}>
          Congratulations {team.name}! All 40 mystery waypoints across all 4 levels have been successfully solved.
        </p>
      </div>

      {/* Official Certificate & Stats Card */}
      <div className="card" style={{ width: '100%', textAlign: 'left', backgroundColor: 'var(--bg-surface-elevated)', border: '1.5px solid var(--accent-amber)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="text-caption">OFFICIAL RECORD</span>
          <span className="badge badge-green">VERIFIED 40/40</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Team Designation:</span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{team.name} ({team.id})</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Final Elapsed Time:</span>
            <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontSize: '1.1rem' }}>
              {formatElapsedTime(elapsedSeconds)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Levels Cleared:</span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--status-green)' }}>
              4 of 4 Levels (100%)
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Incorrect Submissions:</span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {team.wrongAttemptsCount} attempts
            </span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button className="btn btn-primary" onClick={onReturnHome} style={{ minHeight: '52px' }}>
          Return to Expedition Home
        </button>
        <button className="btn btn-secondary" onClick={onOpenOrganizer}>
          <Shield size={16} />
          Organizer Telemetry & CSV Export
        </button>
      </div>
    </div>
  );
};
