import React, { useState } from 'react';
import { Shield, KeyRound, AlertCircle, X } from 'lucide-react';
import { StorageService } from '../lib/storage/storageService';
import { generateSalt, hashPin, verifyPin } from '../lib/security/pinAuth';

interface PinModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onSuccess, onClose }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const config = StorageService.getOrganizerConfig();
  const isFirstTime = !config.isSetupComplete;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits/characters.');
      return;
    }

    setLoading(true);
    try {
      if (isFirstTime) {
        if (pin !== confirmPin) {
          setError('PIN confirmation does not match.');
          setLoading(false);
          return;
        }

        const salt = generateSalt();
        const pinHash = await hashPin(pin, salt);
        StorageService.saveOrganizerConfig({
          ...config,
          pinHash,
          salt,
          isSetupComplete: true
        });
        setPin('');
        setConfirmPin('');
        onSuccess();
      } else {
        const isValid = await verifyPin(pin, config.salt, config.pinHash);
        if (isValid) {
          setPin('');
          onSuccess();
        } else {
          setError('Incorrect Organizer PIN. Please try again.');
        }
      }
    } catch (err) {
      setError('An authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1.5px solid var(--border-structural)',
        borderRadius: 'var(--radius-md)',
        maxWidth: '400px',
        width: '100%',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-amber-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-amber)'
            }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {isFirstTime ? 'Organizer Setup' : 'Organizer Authentication'}
              </h3>
              <span className="text-caption">
                {isFirstTime ? 'Establish Local PIN' : 'Restricted Access'}
              </span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          {isFirstTime
            ? 'Set a master PIN for this device. This PIN will be required to access team telemetry, modify settings, or manage Event Mode.'
            : 'Enter your Organizer PIN to access controls, verify answers, and view event progress.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              {isFirstTime ? 'CREATE ORGANIZER PIN' : 'ENTER ORGANIZER PIN'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={12}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              autoFocus
              className="input-field"
              style={{ textAlign: 'center', letterSpacing: '0.35em', fontSize: '1.3rem' }}
            />
          </div>

          {isFirstTime && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                CONFIRM ORGANIZER PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={12}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="••••"
                className="input-field"
                style={{ textAlign: 'center', letterSpacing: '0.35em', fontSize: '1.3rem' }}
              />
            </div>
          )}

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--status-red-bg)',
              border: '1px solid var(--status-red-border)',
              color: 'var(--status-red)',
              fontSize: '0.8rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Operational notice: The local PIN is an operational device safeguard, not absolute security against someone inspecting local browser storage.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              <KeyRound size={16} />
              {isFirstTime ? 'Save PIN' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
