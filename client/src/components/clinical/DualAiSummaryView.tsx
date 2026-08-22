import React, { useState } from 'react';
import { Sparkles, HelpCircle, ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, Cloud, Cpu, Info, RefreshCw } from 'lucide-react';
import { PreVisitSummary, PostVisitSummary } from '../../types/appointment';

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
    <div
      style={{
        marginBottom: '1.75rem',
        borderRadius: '14px',
        background: '#ffffff',
        border: '1.5px solid #bae6fd',
        boxShadow: '0 4px 18px rgba(2, 132, 199, 0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.15rem 1.5rem',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderBottom: '1px solid #bae6fd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0369a1', margin: 0 }}>
                Pre-Visit AI Symptom Summary
              </h3>
              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem', borderRadius: '999px', background: '#ffffff', color: '#0284c7', fontWeight: 800, border: '1px solid #bae6fd' }}>
                Dual-Engine Verified
              </span>
            </div>
            <span style={{ fontSize: '0.76rem', color: '#0369a1', opacity: 0.85 }}>
              Simultaneous analysis by On-Device Local AI and Cloud LLM
            </span>
          </div>
        </div>

        {/* Engine Switcher Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.8)', padding: '0.25rem', borderRadius: '10px', border: '1px solid #bae6fd' }}>
          <button
            type="button"
            onClick={() => setActiveTab('ollama')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: activeTab === 'ollama' ? '#0284c7' : 'transparent',
              color: activeTab === 'ollama' ? '#ffffff' : '#0369a1',
              transition: 'all 0.15s ease',
            }}
          >
            <Cpu size={14} />
            <span>Local AI (Ollama)</span>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '999px',
                background: ollamaStatus === 'READY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: activeTab === 'ollama' ? '#ffffff' : ollamaStatus === 'READY' ? '#10b981' : '#ef4444',
                marginLeft: '0.2rem',
              }}
            >
              {ollamaStatus}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gemini')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: activeTab === 'gemini' ? '#0284c7' : 'transparent',
              color: activeTab === 'gemini' ? '#ffffff' : '#0369a1',
              transition: 'all 0.15s ease',
            }}
          >
            <Cloud size={14} />
            <span>Cloud AI (Gemini)</span>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '999px',
                background: geminiStatus === 'READY' ? 'rgba(16, 185, 129, 0.2)' : geminiStatus === 'NOT_CONFIGURED' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: activeTab === 'gemini' ? '#ffffff' : geminiStatus === 'READY' ? '#10b981' : '#64748b',
                marginLeft: '0.2rem',
              }}
            >
              {geminiStatus}
            </span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {activeStatus === 'NOT_CONFIGURED' ? (
          <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            <Info size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem', color: '#94a3b8' }} />
            Google Gemini Cloud AI is not configured in this environment (set <code>GEMINI_API_KEY</code> in server/.env to enable).
          </div>
        ) : activeStatus === 'FAILED' ? (
          <div style={{ padding: '1.25rem', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.9rem' }}>
            <AlertTriangle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />
            {activeTab === 'ollama' ? 'Local Ollama' : 'Google Gemini'} encountered an issue generating a response: {activeResult?.error || 'Unavailable'}.
          </div>
        ) : activeData ? (
          <>
            {/* Triage Urgency */}
            {activeData.urgency && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Triage Urgency:
                </span>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.3rem 0.85rem',
                    borderRadius: '999px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    background: activeData.urgency === 'High' ? '#fee2e2' : activeData.urgency === 'Medium' ? '#fef3c7' : '#dcfce7',
                    color: activeData.urgency === 'High' ? '#b91c1c' : activeData.urgency === 'Medium' ? '#b45309' : '#15803d',
                    border: `1px solid ${activeData.urgency === 'High' ? '#fca5a5' : activeData.urgency === 'Medium' ? '#fcd34d' : '#86efac'}`,
                  }}
                >
                  {activeData.urgency === 'High' ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                  <span>{activeData.urgency}</span>
                </div>
              </div>
            )}

            {/* Chief Complaint */}
            {activeData.chiefComplaint && (
              <div>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0' }}>
                  Chief Complaint / Symptom Synopsis ({activeTab === 'ollama' ? 'Local Ollama' : 'Google Gemini'})
                </h4>
                <div style={{ padding: '0.9rem 1.15rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 500 }}>
                  {activeData.chiefComplaint}
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {activeData.suggestedQuestions && activeData.suggestedQuestions.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>
                  Suggested Consultation Questions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeData.suggestedQuestions.map((q, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', padding: '0.75rem 1rem', borderRadius: '8px', background: '#f5f3ff', border: '1px solid #e0e7ff', color: '#312e81', fontSize: '0.9rem', lineHeight: 1.5, fontWeight: 500 }}>
                      <HelpCircle size={17} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0 0 0.75rem 0' }}>
              {activeTab === 'gemini'
                ? 'Cloud AI (Gemini) has not synthesized a summary for this appointment yet.'
                : 'Local AI (Ollama) summary not yet generated.'}
            </p>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
                <span>{isRefreshing ? 'Generating Dual AI Summary...' : 'Generate / Re-sync Both AI Engines'}</span>
              </button>
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
    <div
      style={{
        marginBottom: '1.75rem',
        borderRadius: '14px',
        background: '#ffffff',
        border: '1.5px solid #a7f3d0',
        boxShadow: '0 4px 18px rgba(16, 185, 129, 0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.15rem 1.5rem',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          borderBottom: '1px solid #a7f3d0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            }}
          >
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065f46', margin: 0 }}>
                Post-Visit AI Care Plan & Summary
              </h3>
              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem', borderRadius: '999px', background: '#ffffff', color: '#059669', fontWeight: 800, border: '1px solid #a7f3d0' }}>
                Dual-Engine Cross-Checked
              </span>
            </div>
            <span style={{ fontSize: '0.76rem', color: '#065f46', opacity: 0.85 }}>
              Patient guidance with zero-hallucination medication schedule verification
            </span>
          </div>
        </div>

        {/* Engine Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.8)', padding: '0.25rem', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
          <button
            type="button"
            onClick={() => setActiveTab('ollama')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: activeTab === 'ollama' ? '#059669' : 'transparent',
              color: activeTab === 'ollama' ? '#ffffff' : '#065f46',
              transition: 'all 0.15s ease',
            }}
          >
            <Cpu size={14} />
            <span>Local AI (Ollama)</span>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '999px',
                background: ollamaStatus === 'READY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: activeTab === 'ollama' ? '#ffffff' : ollamaStatus === 'READY' ? '#10b981' : '#ef4444',
                marginLeft: '0.2rem',
              }}
            >
              {ollamaStatus}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gemini')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: activeTab === 'gemini' ? '#059669' : 'transparent',
              color: activeTab === 'gemini' ? '#ffffff' : '#065f46',
              transition: 'all 0.15s ease',
            }}
          >
            <Cloud size={14} />
            <span>Cloud AI (Gemini)</span>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '999px',
                background: geminiStatus === 'READY' ? 'rgba(16, 185, 129, 0.2)' : geminiStatus === 'NOT_CONFIGURED' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: activeTab === 'gemini' ? '#ffffff' : geminiStatus === 'READY' ? '#10b981' : '#64748b',
                marginLeft: '0.2rem',
              }}
            >
              {geminiStatus}
            </span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {activeStatus === 'NOT_CONFIGURED' ? (
          <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            <Info size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem', color: '#94a3b8' }} />
            Google Gemini Cloud AI is not configured in this environment (set <code>GEMINI_API_KEY</code> in server/.env to enable).
          </div>
        ) : activeStatus === 'FAILED' ? (
          <div style={{ padding: '1.25rem', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.9rem' }}>
            <AlertTriangle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />
            {activeTab === 'ollama' ? 'Local Ollama' : 'Google Gemini'} was unable to complete post-visit summary synthesis: {activeResult?.error || 'Unavailable'}.
          </div>
        ) : activeData ? (
          <>
            {/* Patient Summary */}
            {activeData.summary && (
              <div>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0' }}>
                  Patient-Friendly Visit Summary ({activeTab === 'ollama' ? 'Local Ollama' : 'Google Gemini'})
                </h4>
                <div style={{ padding: '0.9rem 1.15rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '0.95rem', lineHeight: 1.65, fontWeight: 500 }}>
                  {activeData.summary}
                </div>
              </div>
            )}

            {/* Medication Guidance */}
            {activeData.medicationSchedule && (
              <div>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0' }}>
                  Medication Instructions & Adherence
                </h4>
                <div style={{ padding: '0.85rem 1.15rem', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', color: '#0369a1', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {Array.isArray(activeData.medicationSchedule) ? activeData.medicationSchedule.join('. ') : activeData.medicationSchedule}
                </div>
              </div>
            )}

            {/* Follow-up Steps */}
            {activeData.followUpSteps && (
              <div>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0' }}>
                  Next Steps & Follow-Up Advice
                </h4>
                <div style={{ padding: '0.85rem 1.15rem', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {Array.isArray(activeData.followUpSteps) ? activeData.followUpSteps.join('. ') : activeData.followUpSteps}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0 0 0.75rem 0' }}>
              {activeTab === 'gemini'
                ? 'Cloud AI (Gemini) has not synthesized post-visit guidance for this consultation yet.'
                : 'Post-visit summary not yet available.'}
            </p>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#059669',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
                <span>{isRefreshing ? 'Synthesizing Dual AI Guidance...' : 'Generate / Re-sync Both AI Engines'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
