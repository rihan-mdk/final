import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Sliders, 
  Download, 
  Upload, 
  RotateCcw, 
  Play, 
  ArrowLeft,
  FileSpreadsheet,
  FileCode,
  Smartphone,
  TestTube,
  Key,
  Check,
  Edit2
} from 'lucide-react';
import { StorageService } from '../lib/storage/storageService';
import { TeamRecord, OrganizerConfig } from '../types';
import questions from '../data/questions.json';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { formatElapsedTime } from '../lib/timer/timerUtils';

interface OrganizerDashboardScreenProps {
  onBack: () => void;
  onLaunchEvent: () => void;
  onLaunchTrial: () => void;
}

export const OrganizerDashboardScreen: React.FC<OrganizerDashboardScreenProps> = ({
  onBack,
  onLaunchEvent,
  onLaunchTrial
}) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'device' | 'controls' | 'questions' | 'export'>('teams');
  const [teams, setTeams] = useState<TeamRecord[]>(StorageService.getTeams());
  const [orgConfig, setOrgConfig] = useState<OrganizerConfig>(StorageService.getOrganizerConfig());
  const [assignedTeamId, setAssignedTeamId] = useState<string | null>(StorageService.getAssignedDeviceTeamId());
  
  const [editingPasswordTeamId, setEditingPasswordTeamId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    isDangerous?: boolean;
    confirmLabel?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {}
  });

  const [importStatus, setImportStatus] = useState<string | null>(null);

  const refreshData = () => {
    setTeams(StorageService.getTeams());
    setOrgConfig(StorageService.getOrganizerConfig());
    setAssignedTeamId(StorageService.getAssignedDeviceTeamId());
  };

  const handleAssignDevice = (targetTeamId: string | null) => {
    const targetTeam = targetTeamId ? teams.find(t => t.id === targetTeamId) : null;
    const teamName = targetTeam ? targetTeam.name : 'Unassigned (Any Team)';

    setConfirmModal({
      isOpen: true,
      title: 'Confirm Device Assignment',
      message: `Assign this physical device to "${teamName}"? Once locked, participants will only be allowed to log into this device using this team's credentials.`,
      confirmLabel: 'Confirm Assignment',
      isDangerous: false,
      action: () => {
        StorageService.setAssignedDeviceTeamId(targetTeamId);
        refreshData();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleStartEventMode = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Activate Live Event Mode',
      message: 'Are you sure you want to officially start Event Mode on this device? This will initiate the competition timer and record official participant attempts for 28 October 2026.',
      confirmLabel: 'Activate Event Now',
      isDangerous: false,
      action: () => {
        const config = StorageService.getOrganizerConfig();
        config.eventStarted = true;
        if (!config.eventStartTime) {
          config.eventStartTime = new Date().toISOString();
        }
        StorageService.saveOrganizerConfig(config);
        StorageService.setAppMode('event');
        refreshData();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        onLaunchEvent();
      }
    });
  };

  const handleResetTeam = (teamId: string) => {
    const target = teams.find(t => t.id === teamId);
    setConfirmModal({
      isOpen: true,
      title: `Reset Progress for ${target?.name || teamId}`,
      message: `Are you sure you want to reset all game progress for ${target?.name} (${teamId})? Completed questions, timers, and attempt counts on this device will be reset to zero. Credentials will remain preserved.`,
      confirmLabel: 'Confirm Reset',
      isDangerous: true,
      action: () => {
        StorageService.resetTeam(teamId);
        refreshData();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleResetAllEventData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset All Event Data',
      message: 'WARNING: This will wipe all event session progress and reset all 9 teams on this device back to default state. This action cannot be undone.',
      confirmLabel: 'Wipe Event Data',
      isDangerous: true,
      action: () => {
        StorageService.clearEventData();
        refreshData();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSavePassword = (teamId: string) => {
    if (!newPassword.trim()) return;
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    team.password = newPassword;
    StorageService.updateTeam(team);
    setEditingPasswordTeamId(null);
    setNewPassword('');
    refreshData();
  };

  const handleDownloadCsv = () => {
    const csvContent = StorageService.generateResultsCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const activeId = StorageService.getActiveTeamId();
    link.setAttribute('download', `hunt_expedition_results_${activeId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadBackup = () => {
    const backupJson = StorageService.exportBackup();
    const blob = new Blob([backupJson], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hunt_expedition_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = StorageService.importBackup(content);
      if (res.success) {
        setImportStatus('Backup restored successfully!');
        refreshData();
      } else {
        setImportStatus(`Restore failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

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
                Organizer Console
              </h2>
              <span className="badge badge-amber">AUTHENTICATED ADMIN</span>
            </div>
            <span className="text-caption">Field Command & 9-Device Configuration</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '0.25rem',
        backgroundColor: 'var(--bg-surface-elevated)',
        padding: '0.35rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-structural)'
      }}>
        {[
          { key: 'teams', label: 'Teams', icon: Users },
          { key: 'device', label: 'Device', icon: Smartphone },
          { key: 'controls', label: 'Controls', icon: Sliders },
          { key: 'questions', label: 'Answers', icon: BookOpen },
          { key: 'export', label: 'Export', icon: Download },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.45rem 0.15rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive ? 'var(--accent-amber)' : 'transparent',
                color: isActive ? 'var(--text-dark)' : 'var(--text-secondary)',
                fontSize: '0.68rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TEAMS & CREDENTIALS */}
      {activeTab === 'teams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            All 9 Authoritative Event Teams. Progress and credentials on this device:
          </div>

          {teams.map(team => {
            const isAssignedToThisDevice = assignedTeamId === team.id;
            const isEditingPassword = editingPasswordTeamId === team.id;

            return (
              <div
                key={team.id}
                className="card"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: isAssignedToThisDevice ? '1.5px solid var(--accent-amber)' : '1px solid var(--border-structural)',
                  padding: '0.9rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isAssignedToThisDevice ? 'var(--accent-amber)' : 'var(--bg-surface-elevated)',
                      color: isAssignedToThisDevice ? 'var(--text-dark)' : 'var(--accent-amber)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {team.id.replace('TEAM-', 'T')}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{team.name}</span>
                        {isAssignedToThisDevice && (
                          <span className="badge badge-amber" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>
                            THIS DEVICE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {team.id} • CALLSIGN: {team.callsign} • LVL {team.currentLevel}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleResetTeam(team.id)}
                      style={{ width: 'auto', minHeight: '30px', padding: '0.25rem 0.55rem', fontSize: '0.7rem' }}
                    >
                      <RotateCcw size={12} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Password & Credential Row */}
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.45rem 0.65rem',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-structural)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  {isEditingPassword ? (
                    <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                      <input
                        type="text"
                        className="input-field"
                        style={{ height: '32px', fontSize: '0.78rem' }}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                        autoFocus
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSavePassword(team.id)}
                        style={{ minHeight: '32px', width: 'auto', padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setEditingPasswordTeamId(null)}
                        style={{ minHeight: '32px', width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Key size={13} color="var(--accent-amber)" />
                        <span style={{ color: 'var(--text-secondary)' }}>PASSWORD:</span>
                        <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {team.password}
                        </code>
                      </div>
                      <button
                        onClick={() => {
                          setEditingPasswordTeamId(team.id);
                          setNewPassword(team.password);
                        }}
                        title="Edit team password"
                        style={{ color: 'var(--text-secondary)', padding: '0.2rem' }}
                      >
                        <Edit2 size={13} />
                      </button>
                    </>
                  )}
                </div>

                {/* Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block' }}>COMPLETED</span>
                    <span style={{ fontWeight: 700, color: 'var(--status-green)' }}>{team.completedQuestionIds.length} / 40</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block' }}>WRONG ATTEMPTS</span>
                    <span style={{ fontWeight: 700 }}>{team.wrongAttemptsCount}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block' }}>ELAPSED</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>{formatElapsedTime(team.elapsedSeconds)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: DEVICE ASSIGNMENT (ORGANIZER BINDING) */}
      {activeTab === 'device' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
            <span className="text-caption">DEVICE LOCK & ASSIGNMENT</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem' }}>
              Dedicated Device Hardware Binding
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginTop: '0.25rem' }}>
              Assign this tablet or phone to one specific team. Once assigned, participants will ONLY be able to log in with that team's credentials.
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.75rem',
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-structural)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)'
            }}>
              <Smartphone size={18} color="var(--accent-amber)" />
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', display: 'block' }}>CURRENT HARDWARE STATUS:</span>
                <span style={{ fontWeight: 700, color: assignedTeamId ? 'var(--status-green)' : 'var(--text-secondary)' }}>
                  {assignedTeamId
                    ? `LOCKED TO: ${teams.find(t => t.id === assignedTeamId)?.name} (${assignedTeamId})`
                    : 'UNLOCKED / UNASSIGNED'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-caption">SELECT TEAM TO ASSIGN THIS DEVICE:</span>

            {teams.map(team => {
              const isCurrent = assignedTeamId === team.id;
              return (
                <button
                  key={team.id}
                  onClick={() => handleAssignDevice(team.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isCurrent ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                    border: isCurrent ? '1.5px solid var(--accent-amber)' : '1px solid var(--border-structural)',
                    color: 'var(--text-primary)',
                    textAlign: 'left'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{team.name}</div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {team.id} • PWD: {team.password}
                    </div>
                  </div>
                  {isCurrent && (
                    <div className="badge badge-amber">
                      <Check size={12} strokeWidth={3} />
                      ASSIGNED
                    </div>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => handleAssignDevice(null)}
              className="btn btn-secondary"
              style={{ marginTop: '0.5rem' }}
            >
              Clear Assignment (Allow Any Team)
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: CONTROLS & TRIAL MODE */}
      {activeTab === 'controls' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Admin Trial Mode Card */}
          <div className="card" style={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1.5px solid var(--accent-amber)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-caption">ADMINISTRATOR QA TOOL</span>
              <span className="badge badge-amber">ADMIN ONLY</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.35rem' }}>
              Trial Mode & 40-Question Sandbox
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Strictly restricted to administrators. Test individual questions, reveal answers, verify input normalization, and test level completions without affecting event records.
            </p>
            <button
              className="btn btn-primary"
              onClick={onLaunchTrial}
              style={{ minHeight: '48px', marginTop: '0.5rem' }}
            >
              <TestTube size={18} />
              <span>LAUNCH TRIAL MODE QA</span>
            </button>
          </div>

          {/* Event Mode Status */}
          <div className="card" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
            <span className="text-caption">LIVE EVENT OPERATION</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                {orgConfig.eventStarted ? 'EVENT MODE ACTIVE' : 'DRAFT / STANDBY'}
              </div>
              <span className={`badge ${orgConfig.eventStarted ? 'badge-green' : 'badge-amber-subtle'}`}>
                {orgConfig.eventStarted ? 'LIVE' : 'STANDBY'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.4 }}>
              The real event requires explicit organizer activation. It never starts automatically by system time.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {!orgConfig.eventStarted ? (
              <button className="btn btn-primary" onClick={handleStartEventMode} style={{ minHeight: '52px' }}>
                <Play size={18} fill="currentColor" />
                <span>START OFFICIAL EVENT MODE</span>
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={onLaunchEvent} style={{ minHeight: '52px' }}>
                <Play size={18} fill="currentColor" />
                <span>ENTER ACTIVE EVENT SESSION</span>
              </button>
            )}

            <button className="btn btn-danger" onClick={handleResetAllEventData} style={{ minHeight: '48px' }}>
              <RotateCcw size={16} />
              <span>WIPE & RESET EVENT DATA</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: QUESTIONS & ANSWER KEYS */}
      {activeTab === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Official Internal Answer-Key Review (40 Questions across 4 Levels):
          </div>

          {questions.map(q => (
            <div key={q.id} className="card" style={{ backgroundColor: 'var(--bg-surface)', padding: '0.9rem', gap: '0.45rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>{q.num}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{q.title}</span>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>LVL {q.level} • {q.answerFormat}</span>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {q.question}
              </div>

              <div style={{
                marginTop: '0.35rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-structural)',
                fontSize: '0.78rem'
              }}>
                <div style={{ color: 'var(--accent-amber)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  ACCEPTED ANSWERS:
                </div>
                <div style={{ color: 'var(--status-green)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {q.acceptedAnswers.join('  |  ')}
                </div>
                {q.reviewNotes && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px' }}>
                    Note: {q.reviewNotes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: EXPORT & BACKUP */}
      {activeTab === 'export' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <span className="text-caption">CSV RESULTS EXPORT (9 TEAMS)</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Export this device's local team telemetry to a formatted CSV file. Organizers can merge CSV files from all 9 team devices at the conclusion of the event.
            </p>
            <button className="btn btn-primary" onClick={handleDownloadCsv}>
              <FileSpreadsheet size={18} />
              <span>DOWNLOAD RESULTS CSV</span>
            </button>
          </div>

          <div className="card">
            <span className="text-caption">JSON BACKUP & RESTORE</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Save a full device state backup (settings, 9 teams, passwords, PIN hashes, and progress records) or restore from an existing JSON file.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={handleDownloadBackup} style={{ flex: 1 }}>
                <FileCode size={16} />
                <span>Export Backup</span>
              </button>

              <label className="btn btn-secondary" style={{ flex: 1, cursor: 'pointer', margin: 0 }}>
                <Upload size={16} />
                <span>Restore Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {importStatus && (
              <div style={{ fontSize: '0.8rem', color: importStatus.includes('failed') ? 'var(--status-red)' : 'var(--status-green)', marginTop: '0.35rem' }}>
                {importStatus}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDangerous={confirmModal.isDangerous}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
