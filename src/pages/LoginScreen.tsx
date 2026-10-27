import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { StorageService } from '../lib/storage/storageService';
import { TeamRecord } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (team: TeamRecord) => void;
  onAdminLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onAdminLoginSuccess
}) => {
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = teamName.trim();
    if (!trimmed || !password) {
      setErrorMessage('Please enter both team name and password.');
      return;
    }

    setLoading(true);

    const result = StorageService.authenticateTeam(trimmed, password);
    if (result.success) {
      setLoading(false);
      if (result.isAdmin) {
        onAdminLoginSuccess();
      } else if (result.team) {
        onLoginSuccess(result.team);
      }
    } else {
      setLoading(false);
      setErrorMessage(result.errorMessage || 'Invalid team name or password.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '1.5rem',
      backgroundColor: 'var(--bg-canvas)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Title & Branding */}
        <div style={{ textAlign: 'center' }}>
          <div className="badge badge-amber-subtle" style={{ marginBottom: '0.65rem' }}>
            EXPEDITION ACCESS
          </div>
          <h1 className="text-title-xl" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            THE HUNT EXPEDITION
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Enter your team credentials to begin.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="card" style={{
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1.5px solid var(--border-structural)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-elevated)'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Team Name Input */}
            <div>
              <label
                htmlFor="team-name-input"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.35rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                TEAM NAME
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="team-name-input"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Code3SD"
                  value={teamName}
                  onChange={(e) => {
                    setTeamName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoComplete="off"
                  spellCheck="false"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password-input"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.35rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                TEAM PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoComplete="off"
                  spellCheck="false"
                  disabled={loading}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Concise Invalid Credentials Error Message */}
            {errorMessage && (
              <div
                role="alert"
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--status-red-bg)',
                  border: '1px solid var(--status-red-border)',
                  color: 'var(--status-red)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  lineHeight: 1.4
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minHeight: '52px', marginTop: '0.35rem' }}
            >
              <Lock size={18} />
              <span>LOG IN</span>
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          OFFLINE EVENT RUNTIME • 28 OCT 2026
        </div>
      </div>
    </div>
  );
};
