import React, { useEffect, useState } from 'react';
import { Compass, CheckCircle2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [status, setStatus] = useState('Initializing offline engine...');
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStatus('Loading 40 authoritative questions...');
      setProgress(50);
    }, 400);

    const t2 = setTimeout(() => {
      setStatus('Verifying local storage & 9 teams...');
      setProgress(80);
    }, 800);

    const t3 = setTimeout(() => {
      setStatus('Ready for offline operation.');
      setProgress(100);
    }, 1200);

    const t4 = setTimeout(() => {
      onComplete();
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: 'var(--bg-canvas)',
      textAlign: 'center'
    }}>
      <div style={{
        width: '84px',
        height: '84px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--accent-amber-muted)',
        border: '2px solid var(--accent-amber)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-amber)',
        marginBottom: '1.5rem',
        boxShadow: '0 0 30px rgba(232, 172, 80, 0.2)'
      }}>
        <Compass size={44} className="pulse-animation" />
      </div>

      <h1 className="text-title-xl" style={{ textTransform: 'uppercase', marginBottom: '0.35rem' }}>
        The Hunt Expedition
      </h1>
      <span className="text-caption" style={{ marginBottom: '2.5rem', color: 'var(--accent-amber)' }}>
        Offline Collegiate Treasure Hunt Engine
      </span>

      <div style={{ width: '100%', maxWidth: '280px', marginBottom: '1rem' }}>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)'
      }}>
        {progress === 100 ? <CheckCircle2 size={16} color="var(--status-green)" /> : <span className="pulse-animation">●</span>}
        <span>{status}</span>
      </div>
    </div>
  );
};
