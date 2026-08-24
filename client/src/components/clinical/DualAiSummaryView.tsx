import React, { useState } from 'react';
import { Sparkles, HelpCircle, ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, Cloud, Cpu, Info, RefreshCw } from 'lucide-react';
import { PreVisitSummary, PostVisitSummary } from '../../types/appointment';
import Button from '../ui/Button';

interface DualPreVisitSummaryProps {
  summary: PreVisitSummary;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DualPreVisitSummaryView: React.FC<DualPreVisitSummaryProps> = ({ summary, onRefresh, isRefreshing }) => {
  // Determine if engines have explicit data or root legacy data
  const ollamaData = summary.ollama?.data || (summary.urgency ? {
    urgency: summary.urgency,
    chiefComplaint: summary.chiefComplaint || '',
    suggestedQuestions: summary.suggestedQuestions || [],
  } : null);

  const geminiData = summary.gemini?.data || null;

  const ollamaStatus = summary.ollama?.status || (ollamaData ? 'READY' : 'PENDING');
  const geminiStatus = summary.gemini?.status || (geminiData ? 'READY' : 'PENDING');

  // Default active tab to whichever has ready data (preferring Gemini if selected, or whichever is READY)
  const [activeTab, setActiveTab] = useState<'ollama' | 'gemini'>(
    geminiStatus === 'READY' && ollamaStatus !== 'READY' ? 'gemini' : 'ollama'
  );

  const activeResult = activeTab === 'ollama' ? summary.ollama : summary.gemini;
  const activeData = activeTab === 'ollama' ? ollamaData : geminiData;
  const activeStatus = activeTab === 'ollama' ? ollamaStatus : geminiStatus;

  return (
    <div className="ai-previsit-container">
      {/* Header */}
      <div className="ai-previsit-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="ai-previsit-icon">
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--info-text, #38BDF8)', margin: 0 }}>
                Pre-Visit AI Symptom Summary
              </h3>
              <span className="ai-previsit-tag">
                Dual-Engine Verified
              </span>
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Simultaneous analysis by On-Device Local AI and Cloud LLM
            </span>
          </div>
        </div>

        {/* Engine Switcher Tabs */}
        <div className="ai-engine-switcher">
          <button
            type="button"
            onClick={() => setActiveTab('ollama')}
            className={`ai-engine-btn ${activeTab === 'ollama' ? 'is-active' : ''}`}
          >
            <Cpu size={14} />
            <span>Local AI (Ollama)</span>
            <span className={`ai-engine-badge status-${ollamaStatus}`}>
              {ollamaStatus}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gemini')}
            className={`ai-engine-btn ${activeTab === 'gemini' ? 'is-active' : ''}`}
          >
            <Cloud size={14} />
            <span>Cloud AI (Gemini)</span>
            <span className={`ai-engine-badge status-${geminiStatus}`}>
              {geminiStatus}
            </span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {activeStatus === 'NOT_CONFIGURED' ? (
          <div className="ai-box-placeholder">
            <Info size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem', color: 'var(--text-muted)' }} />
            Google Gemini Cloud AI is not configured in this environment (set <code>GEMINI_API_KEY</code> in server/.env to enable).
          </div>
        ) : activeStatus === 'FAILED' ? (
          <div className="ai-box-failed">
            <AlertTriangle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />
            {activeTab === 'ollama' ? 'Local Ollama' : 'Google Gemini'} encountered an issue generating a response: {activeResult?.error || 'Unavailable'}.
          </div>
        ) : activeData ? (
          <>
            {/* Triage Urgency */}
            {activeData.urgency && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Triage Urgency:
                </span>
                <div className={`triage-urgency-chip urgency-${activeData.urgency.toLowerCase()}`}>
                  {activeData.urgency === 'High' ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                  <span>{activeData.urgency}</span>
                </div>
              </div>
            )}

            {/* Chief Complaint */}
            {activeData.chiefComplaint && (
              <div>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0' }}>
                  Chief Complaint / Symptom Synopsis ({activeTab === 'ollama' ? 'Local Ollama' : 'Google Gemini'})
                </h4>
                <div className="ai-chief-complaint-box">
                  {activeData.chiefComplaint}
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {activeData.suggestedQuestions && activeData.suggestedQuestions.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>
                  Suggested Consultation Questions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeData.suggestedQuestions.map((q, idx) => (
                    <div key={idx} className="ai-suggested-q-item">
                      <HelpCircle size={17} color="#A78BFA" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="ai-box-placeholder">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0 0 0.75rem 0' }}>
              {activeTab === 'gemini'
                ? 'Cloud AI (Gemini) has not synthesized a summary for this appointment yet.'
                : 'Local AI (Ollama) summary not yet generated.'}
            </p>
            {onRefresh && (
              <Button
                variant="primary"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                leftIcon={<RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />}
              >
                {isRefreshing ? 'Generating Dual AI Summary...' : 'Generate / Re-sync Both AI Engines'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface DualPostVisitSummaryProps {
  summary: PostVisitSummary;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DualPostVisitSummaryView: React.FC<DualPostVisitSummaryProps> = ({ summary, onRefresh, isRefreshing }) => {
  const ollamaData = summary.ollama?.data || (summary.summary ? {
    summary: summary.summary,
    patientSummary: summary.patientSummary || summary.summary,
    medicationSchedule: summary.medicationSchedule || [],
    followUpSteps: summary.followUpSteps || [],
  } : null);

  const geminiData = summary.gemini?.data || null;

  const ollamaStatus = summary.ollama?.status || (ollamaData ? 'READY' : 'PENDING');
  const geminiStatus = summary.gemini?.status || (geminiData ? 'READY' : 'PENDING');

  const [activeTab, setActiveTab] = useState<'ollama' | 'gemini'>(
    geminiStatus === 'READY' && ollamaStatus !== 'READY' ? 'gemini' : 'ollama'
  );

  const activeResult = activeTab === 'ollama' ? summary.ollama : summary.gemini;
  const activeData = activeTab === 'ollama' ? ollamaData : geminiData;
  const activeStatus = activeTab === 'ollama' ? ollamaStatus : geminiStatus;

  return (
    <div className="ai-postvisit-container">
      {/* Header */}
      <div className="ai-postvisit-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="ai-postvisit-icon">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success-text, #86EFAC)', margin: 0 }}>
                Post-Visit AI Care Plan & Summary
              </h3>
              <span className="ai-postvisit-tag">
                Dual-Engine Cross-Checked
              </span>
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Patient guidance with zero-hallucination medication schedule verification
            </span>
          </div>
        </div>

        {/* Engine Tabs */}
        <div className="ai-engine-switcher">
          <button
            type="button"
            onClick={() => setActiveTab('ollama')}
            className={`ai-engine-btn ${activeTab === 'ollama' ? 'is-active-green' : ''}`}
          >
            <Cpu size={14} />
            <span>Local AI (Ollama)</span>
            <span className={`ai-engine-badge status-${ollamaStatus}`}>
              {ollamaStatus}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gemini')}
            className={`ai-engine-btn ${activeTab === 'gemini' ? 'is-active-green' : ''}`}
          >
            <Cloud size={14} />
            <span>Cloud AI (Gemini)</span>
            <span className={`ai-engine-badge status-${geminiStatus}`}>
              {geminiStatus}
            </span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {activeStatus === 'NOT_CONFIGURED' ? (
          <div className="ai-box-placeholder">
            <Info size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem', color: 'var(--text-muted)' }} />
            Google Gemini Cloud AI is not configured in this environment (set <code>GEMINI_API_KEY</code> in server/.env to enable).
          </div>
        ) : activeStatus === 'FAILED' ? (
          <div className="ai-box-failed">
            <AlertTriangle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />
            {activeTab === 'ollama' ? 'Local Ollama' : 'Google Gemini'} was unable to complete post-visit summary synthesis: {activeResult?.error || 'Unavailable'}.
          </div>
        ) : activeData ? (
          <>
            {/* Patient Summary */}
            {activeData.summary && (
              <div>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0' }}>
                  Patient-Friendly Visit Summary ({activeTab === 'ollama' ? 'Local Ollama' : 'Google Gemini'})
                </h4>
                <div className="ai-postvisit-summary-box">
                  {activeData.summary}
                </div>
              </div>
            )}

            {/* Medication Guidance */}
            {activeData.medicationSchedule && (
              <div>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0' }}>
                  Medication Instructions & Adherence
                </h4>
                <div className="ai-postvisit-med-box">
                  {Array.isArray(activeData.medicationSchedule) ? activeData.medicationSchedule.join('. ') : activeData.medicationSchedule}
                </div>
              </div>
            )}

            {/* Follow-up Steps */}
            {activeData.followUpSteps && (
              <div>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0' }}>
                  Next Steps & Follow-Up Advice
                </h4>
                <div className="ai-postvisit-steps-box">
                  {Array.isArray(activeData.followUpSteps) ? activeData.followUpSteps.join('. ') : activeData.followUpSteps}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="ai-box-placeholder">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0 0 0.75rem 0' }}>
              {activeTab === 'gemini'
                ? 'Cloud AI (Gemini) has not synthesized post-visit guidance for this consultation yet.'
                : 'Post-visit summary not yet available.'}
            </p>
            {onRefresh && (
              <Button
                variant="success"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                leftIcon={<RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />}
              >
                {isRefreshing ? 'Synthesizing Dual AI Guidance...' : 'Generate / Re-sync Both AI Engines'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
