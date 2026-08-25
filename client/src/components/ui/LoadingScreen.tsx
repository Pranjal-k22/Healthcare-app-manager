import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Lock, Sparkles, RefreshCw } from 'lucide-react';
import '../../styles/loading.css';

export interface LoadingScreenProps {
  variant?: 'fullscreen' | 'page' | 'compact';
  message?: string;
  submessage?: string;
  progress?: number;
  showProgress?: boolean;
  showECG?: boolean;
  showSecurity?: boolean;
  messagesCycle?: string[];
  cycleIntervalMs?: number;
  timeoutMs?: number;
  onTimeout?: () => void;
  className?: string;
}

const DEFAULT_CLINICAL_MESSAGES = [
  'Securing HIPAA-compliant clinical workspace...',
  'Synchronizing encrypted patient records...',
  'Calibrating real-time medical modules...',
  'Establishing end-to-end encrypted session...',
  'Verifying provider authentication...',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  variant = 'fullscreen',
  message,
  submessage,
  progress,
  showProgress = true,
  showECG = true,
  showSecurity = true,
  messagesCycle = DEFAULT_CLINICAL_MESSAGES,
  cycleIntervalMs = 2400,
  timeoutMs = 8000,
  onTimeout,
  className = '',
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isSlow, setIsSlow] = useState(false);

  // Cycle through reassuring clinical messages if no single static message is provided
  useEffect(() => {
    if (message || !messagesCycle || messagesCycle.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messagesCycle.length);
    }, cycleIntervalMs);

    return () => clearInterval(interval);
  }, [message, messagesCycle, cycleIntervalMs]);

  // Timeout detector to provide a helpful fallback if network or loading hangs
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSlow(true);
      if (onTimeout) onTimeout();
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [timeoutMs, onTimeout]);

  const activeMessage = message || (messagesCycle ? messagesCycle[currentMessageIndex] : 'Loading HealthPulse...');

  const containerClass = 
    variant === 'fullscreen' 
      ? `hp-loader-fullscreen ${className}` 
      : variant === 'page' 
      ? `hp-loader-page ${className}` 
      : `hp-loader-compact ${className}`;

  return (
    <div className={containerClass} role="status" aria-live="polite" aria-label="Loading clinical application">
      {/* Ambient Radial Glow Lighting */}
      {variant === 'fullscreen' && (
        <>
          <div className="hp-ambient-glow" aria-hidden="true" />
          <div className="hp-ambient-glow-secondary" aria-hidden="true" />
        </>
      )}

      {/* Main Glassmorphic Card */}
      <div className={`hp-loader-card ${variant === 'compact' ? 'compact' : ''}`}>
        
        {/* Pulse Beacon / Animated Heartbeat */}
        <div className="hp-beacon-container" aria-hidden="true">
          <div className="hp-beacon-ring" />
          <div className="hp-beacon-ring" />
          <div className="hp-beacon-ring" />
          <div className="hp-beacon-core">
            <Activity size={32} strokeWidth={2.5} />
          </div>
        </div>

        {/* Brand Header */}
        <div className="hp-loader-brand">
          <span>HealthPulse</span>
          <span className="hp-loader-brand-badge">Clinical Suite</span>
        </div>

        {/* ECG Heartbeat SVG Wave Animation */}
        {showECG && (
          <div className="hp-ecg-container" aria-hidden="true">
            <svg className="hp-ecg-svg" viewBox="0 0 240 40">
              <defs>
                <linearGradient id="hp-ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0F766E" />
                  <stop offset="50%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
              </defs>
              {/* Background Guideline */}
              <path
                className="hp-ecg-path-bg"
                d="M 0 20 L 40 20 L 50 20 L 58 8 L 68 32 L 78 4 L 88 28 L 96 20 L 140 20 L 150 20 L 158 8 L 168 32 L 178 4 L 188 28 L 196 20 L 240 20"
              />
              {/* Animated Glowing ECG Stroke */}
              <path
                className="hp-ecg-path-pulse"
                d="M 0 20 L 40 20 L 50 20 L 58 8 L 68 32 L 78 4 L 88 28 L 96 20 L 140 20 L 150 20 L 158 8 L 168 32 L 178 4 L 188 28 L 196 20 L 240 20"
              />
            </svg>
          </div>
        )}

        {/* Dynamic Status Text */}
        <div className="hp-loader-status">
          <span className="hp-status-ticker-dot" aria-hidden="true" />
          <span>{activeMessage}</span>
        </div>

        {submessage && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {submessage}
          </p>
        )}

        {/* Progress Bar (Determinate or Indeterminate Glow Flow) */}
        {showProgress && (
          <div 
            className="hp-progress-track"
            role="progressbar"
            aria-valuenow={progress !== undefined ? progress : undefined}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div 
              className={`hp-progress-bar ${progress !== undefined ? 'determinate' : 'indeterminate'}`}
              style={progress !== undefined ? { width: `${Math.min(100, Math.max(0, progress))}%` } : undefined}
            />
          </div>
        )}

        {/* Security & Compliance Badges */}
        {showSecurity && (
          <div className="hp-loader-security">
            <div className="hp-security-pill">
              <ShieldCheck size={14} />
              <span>HIPAA Compliant</span>
            </div>
            <div className="hp-security-pill">
              <Lock size={13} />
              <span>256-Bit SSL</span>
            </div>
            <div className="hp-security-pill">
              <Sparkles size={13} />
              <span>Cloud Sync</span>
            </div>
          </div>
        )}

        {/* Helpful connection note if taking longer */}
        {isSlow && (
          <div className="hp-loader-slow-tip">
            <span>Taking longer than expected? </span>
            <button type="button" onClick={() => window.location.reload()}>
              <RefreshCw size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              Reload Page
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export const FullScreenLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="fullscreen" {...props} />
);

export const PageLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="page" {...props} />
);

export const CompactLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="compact" showSecurity={false} showECG={false} {...props} />
);
