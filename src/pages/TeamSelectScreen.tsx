import React, { useState } from 'react';
import { Check, Edit2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { StorageService } from '../lib/storage/storageService';
import { TeamRecord } from '../types';

interface TeamSelectScreenProps {
  currentTeamId: string;
  onSelectTeam: (teamId: string) => void;
  onBack: () => void;
}

export const TeamSelectScreen: React.FC<TeamSelectScreenProps> = ({
  currentTeamId,
  onSelectTeam,
  onBack
}) => {
  const [teams, setTeams] = useState<TeamRecord[]>(StorageService.getTeams());
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCallsign, setEditCallsign] = useState('');

  const startEdit = (team: TeamRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTeamId(team.id);
    setEditName(team.name);
    setEditCallsign(team.callsign);
  };

  const saveEdit = (teamId: string, e: React.FormEvent) => {
    e.preventDefault();
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const updated: TeamRecord = {
      ...team,
      name: editName.trim() || team.name,
      callsign: editCallsign.trim() || team.callsign
    };

    StorageService.updateTeam(updated);
    setTeams(StorageService.getTeams());
    setEditingTeamId(null);
  };

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
          <h2 className="text-title-lg" style={{ textTransform: 'uppercase' }}>
            Device Assignment
          </h2>
          <span className="text-caption">Select team bound to this device (1 of 8)</span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.55rem',
        padding: '0.75rem',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-structural)',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)'
      }}>
        <ShieldAlert size={16} color="var(--accent-amber)" />
        <span>Each tablet or phone is bound to 1 designated team. Sessions are stored strictly on this device.</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {teams.map((team) => {
          const isSelected = team.id === currentTeamId;
          const isEditing = editingTeamId === team.id;

          return (
            <div
              key={team.id}
              onClick={() => !isEditing && onSelectTeam(team.id)}
              className="card"
              style={{
                cursor: isEditing ? 'default' : 'pointer',
                border: isSelected ? '1.5px solid var(--accent-amber)' : '1px solid var(--border-structural)',
                backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                position: 'relative'
              }}
            >
              {isEditing ? (
                <form onSubmit={(e) => saveEdit(team.id, e)} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontWeight: 700 }}>
                    EDITING {team.id}
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                      TEAM NAME
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ height: '42px', fontSize: '0.9rem' }}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                      CALLSIGN
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ height: '42px', fontSize: '0.9rem' }}
                      value={editCallsign}
                      onChange={(e) => setEditCallsign(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditingTeamId(null)} style={{ minHeight: '38px', fontSize: '0.78rem' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ minHeight: '38px', fontSize: '0.78rem' }}>
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'var(--accent-amber)' : 'var(--bg-surface-high)',
                      color: isSelected ? 'var(--text-dark)' : 'var(--accent-amber)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}>
                      {team.id.replace('TEAM-', 'T')}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {team.name}
                        </span>
                        {isSelected && (
                          <span className="badge badge-amber" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {team.id} • CALLSIGN: {team.callsign} • LVL {team.currentLevel} ({team.completedQuestionIds.length}/40)
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => startEdit(team, e)}
                      title="Edit Team Name"
                      style={{
                        padding: '0.4rem',
                        color: 'var(--text-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface-high)'
                      }}
                    >
                      <Edit2 size={15} />
                    </button>
                    {isSelected && (
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: 'var(--status-green)',
                        color: 'var(--text-dark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
