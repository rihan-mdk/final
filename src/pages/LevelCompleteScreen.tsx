import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, ArrowRight } from 'lucide-react';
import { TeamRecord } from '../types';
import { formatElapsedTime } from '../lib/timer/timerUtils';

interface LevelCompleteScreenProps {
  completedLevel: number;
  team: TeamRecord;
  elapsedSeconds: number;
  onProceed: () => void;
}

export const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({
  completedLevel,
  team,
  elapsedSeconds,
  onProceed
}) => {
  useEffect(() => {
    // Fire celebratory confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e8ac50', '#42b883', '#f6f2e9']
      });
    } catch (e) {
      // safe fallback if confetti fails in headless env
    }
  }, []);

  const nextLevel = completedLevel + 1;

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', textAlign: 'center' }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: 'var(--radius-pill)',
        backgroundColor: 'var(--status-green-bg)',
        border: '2px solid var(--status-green)',
        color: 'var(--status-green)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '1rem'
      }}>
        <Award size={38} />
      </div>

      <div>
        <div className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
          LEVEL {completedLevel} CLEARED
        </div>
        <h2 className="text-title-xl" style={{ textTransform: 'uppercase' }}>
          WAYPOINT SECTOR COMPLETE
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
          All 10 challenges in Level {completedLevel} have been successfully verified.
        </p>
      </div>

      {/* Summary Card */}
      <div className="card" style={{ width: '100%', textAlign: 'left', backgroundColor: 'var(--bg-surface-elevated)' }}>
        <span className="text-caption">SECTOR METRICS</span>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Team Assigned:</span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{team.name} ({team.id})</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Completed Waypoints:</span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--status-green)' }}>
              10 / 10 ({completedLevel * 10} Total)
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Elapsed Expedition Time:</span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
              {formatElapsedTime(elapsedSeconds)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', marginTop: '1rem' }}>
        <button
          className="btn btn-primary"
          onClick={onProceed}
          style={{ minHeight: '52px' }}
        >
          <span>PROCEED TO LEVEL {nextLevel}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
