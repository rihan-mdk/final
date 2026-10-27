import React from 'react';
import { Compass, Play, TestTube, Users, Shield, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { TeamRecord } from '../types';

interface HomeScreenProps {
  activeTeam: TeamRecord;
  appMode: 'trial' | 'event' | null;
  onSelectMode: () => void;
  onContinue: () => void;
  onChangeTeam: () => void;
  onOpenOrganizer: () => void;
  hasActiveSession: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  activeTeam,
  appMode,
  onSelectMode,
  onContinue,
  onChangeTeam,
  onOpenOrganizer,
  hasActiveSession
}) => {
  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Hero Banner */}
      <div className="card" style={{
        position: 'relative',
        overflow: 'hidden',
        border: '1.5px solid var(--border-structural)',
        padding: '1.5rem',
        backgroundColor: 'var(--bg-surface-elevated)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="badge badge-amber-subtle">EXPEDITION DISPATCH</div>
          <div className="badge badge-neutral">STANDALONE OFFLINE</div>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <h1 className="text-title-xl" style={{ textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            THE HUNT EXPEDITION
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem', lineHeight: 1.45 }}>
            Offline navigation, cryptographic decoders, algorithmic puzzles, and physical campus checkpoints across 4 levels.
          </p>
        </div>

        {/* Schedule & Telemetry Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.65rem',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-structural)',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <Calendar size={14} color="var(--accent-amber)" />
            <span>28 OCT 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <Clock size={14} color="var(--accent-amber)" />
            <span>13:00 - 16:00 IST</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <Users size={14} color="var(--accent-amber)" />
            <span>8 TEAMS (1/DEVICE)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <MapPin size={14} color="var(--accent-amber)" />
            <span>4 LEVELS • 40 QS</span>
          </div>
        </div>
      </div>

      {/* Device Assignment Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="text-caption">DEVICE ASSIGNMENT</span>
          <button
            onClick={onChangeTeam}
            style={{
              fontSize: '0.75rem',
              color: 'var(--accent-amber)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              textDecoration: 'underline'
            }}
          >
            SWITCH TEAM
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface-high)',
            border: '1.5px solid var(--border-structural)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-amber)'
          }}>
            <Compass size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{activeTeam.name}</div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              {activeTeam.id} • CALLSIGN: {activeTeam.callsign}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Status & Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {hasActiveSession ? (
          <button className="btn btn-primary" onClick={onContinue} style={{ minHeight: '52px' }}>
            <Play size={18} fill="currentColor" />
            RESUME {appMode === 'trial' ? 'TRIAL SESSION' : 'EXPEDITION RUN'}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onSelectMode} style={{ minHeight: '52px' }}>
            <Play size={18} fill="currentColor" />
            SELECT OPERATING MODE
          </button>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
          <button className="btn btn-secondary" onClick={onSelectMode}>
            <TestTube size={16} />
            MODE SELECT
          </button>
          <button className="btn btn-secondary" onClick={onOpenOrganizer}>
            <Shield size={16} />
            ORGANIZER PIN
          </button>
        </div>
      </div>

      {/* Offline Status Footer Note */}
      <div style={{
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        padding: '0.75rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)'
      }}>
        <CheckCircle2 size={14} color="var(--status-green)" />
        <span>LOCAL CACHE VERIFIED • READY FOR DISCONNECTED USE</span>
      </div>
    </div>
  );
};
