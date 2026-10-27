import React from 'react';
import { TestTube, Flame, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../lib/storage/storageService';

interface ModeSelectScreenProps {
  onSelectTrial: () => void;
  onSelectEvent: () => void;
  onBack: () => void;
}

export const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({
  onSelectTrial,
  onSelectEvent,
  onBack
}) => {
  const orgConfig = StorageService.getOrganizerConfig();
  const isEventStarted = orgConfig.eventStarted;

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 className="text-title-lg" style={{ textTransform: 'uppercase' }}>
          Select Operating Mode
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Choose your operational environment. Trial data and Event data are strictly isolated.
        </p>
      </div>

      {/* Trial Mode Option */}
      <div
        className="card"
        onClick={onSelectTrial}
        style={{
          cursor: 'pointer',
          border: '1.5px solid var(--accent-amber)',
          backgroundColor: 'var(--bg-surface-elevated)',
          transition: 'transform 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="badge badge-amber">TRIAL / TEST MODE</div>
          <TestTube size={20} color="var(--accent-amber)" />
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Practice & QA Sandbox
        </h3>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          Test all 40 questions, trial answer verification, test physical checkpoints, and simulate completions.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--status-green)',
          marginTop: '0.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={13} />
            <span>Isolated local sandbox (never touches event records)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={13} />
            <span>Dedicated 40-question QA testing dashboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={13} />
            <span>Safe instant reset anytime</span>
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          <span>Enter Trial Mode</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Event Mode Option */}
      <div
        className="card"
        onClick={onSelectEvent}
        style={{
          cursor: 'pointer',
          border: '1.5px solid var(--border-structural)',
          backgroundColor: 'var(--bg-surface)',
          opacity: 0.95
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="badge badge-neutral">OFFICIAL EVENT</div>
          <Flame size={20} color="var(--status-red)" />
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          The Live Expedition
        </h3>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          Official participant run for the 8 teams on 28 October 2026. Locks in start time, tracks attempts, and records official completion times.
        </p>

        {!isEventStarted && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.6rem 0.85rem',
            backgroundColor: 'var(--status-red-bg)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--status-red-border)',
            fontSize: '0.78rem',
            color: 'var(--status-red)'
          }}>
            <AlertCircle size={15} />
            <span>Event Mode is in draft. Explicit organizer activation required.</span>
          </div>
        )}

        <button className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
          <span>{isEventStarted ? 'Resume Live Event' : 'Access Event Mode'}</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '0.5rem' }}>
        Back to Home
      </button>
    </div>
  );
};
