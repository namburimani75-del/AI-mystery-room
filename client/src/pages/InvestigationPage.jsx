import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search, User, Eye, EyeOff, Lightbulb, Trophy, ArrowLeft,
  AlertCircle, CheckCircle, Lock, Unlock, RefreshCw, Target,
  ChevronDown, ChevronUp, FileText, Shield
} from 'lucide-react';
import { casesAPI } from '../services/api';

// ── Sub-components ────────────────────────────────────────────────────────────

const ScoreBadge = ({ score }) => (
  <div style={{
    background: 'rgba(212,168,67,0.12)',
    border: '1px solid var(--color-border-gold)',
    borderRadius: '8px',
    padding: '0.4rem 0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  }}>
    <Trophy size={14} style={{ color: 'var(--color-gold)' }} />
    <span style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '1rem' }}>{score}</span>
    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>pts</span>
  </div>
);

const DiffBadge = ({ difficulty }) => (
  <span className={`badge badge-${difficulty?.toLowerCase()}`}>{difficulty}</span>
);

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>{status}</span>
);

const SuspectCard = ({ suspect }) => (
  <div className="mystery-card" style={{ padding: '1rem', position: 'relative' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgba(212,168,67,0.1)',
        border: '1px solid var(--color-border-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <User size={18} style={{ color: 'var(--color-gold)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: '0.1rem' }}>
          {suspect.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', marginBottom: '0.5rem' }}>
          {suspect.occupation}
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
          {suspect.description}
        </p>
        <div style={{ display: 'grid', gap: '0.35rem', fontSize: '0.78rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Possible Motive: </span>
            <span style={{ color: 'var(--color-text-secondary)' }}>{suspect.publicMotive}</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Alibi: </span>
            <span style={{ color: 'var(--color-text-secondary)' }}>{suspect.alibi}</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Background: </span>
            <span style={{ color: 'var(--color-text-secondary)' }}>{suspect.background}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ClueCard = ({ clue, onDiscover, loading }) => {
  const isDiscovered = clue.isDiscovered;
  return (
    <div
      className={`mystery-card ${isDiscovered ? 'clue-discovered' : ''}`}
      style={{ padding: '1rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            {isDiscovered
              ? <Unlock size={14} style={{ color: 'var(--color-gold)' }} />
              : <Lock size={14} style={{ color: 'var(--color-text-muted)' }} />
            }
            <span style={{
              fontWeight: 600,
              fontSize: '0.88rem',
              color: isDiscovered ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}>
              {clue.title}
            </span>
            {clue.category && (
              <span style={{
                fontSize: '0.65rem',
                background: 'rgba(91,141,217,0.1)',
                color: 'var(--color-info)',
                padding: '0.1rem 0.4rem',
                borderRadius: '10px',
                textTransform: 'capitalize',
              }}>
                {clue.category}
              </span>
            )}
          </div>
          {isDiscovered ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              {clue.description}
            </p>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              Undiscovered — click to investigate.
            </p>
          )}
        </div>
        {!isDiscovered && (
          <button
            id={`discover-clue-${clue.id}`}
            className="btn-secondary"
            onClick={() => onDiscover(clue.id)}
            disabled={loading}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', flexShrink: 0 }}
          >
            {loading ? <div className="spinner" style={{ width: '12px', height: '12px' }} /> : <><Eye size={12} /> Discover</>}
          </button>
        )}
        {isDiscovered && (
          <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
        )}
      </div>
    </div>
  );
};

const HintPanel = ({ caseData, onRequestHint, loading }) => {
  const usedHints = caseData.hints.filter(h => h.isUsed);
  const hintsRemaining = caseData.hintsRemaining;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Lightbulb size={16} style={{ color: 'var(--color-gold)' }} />
          Hints
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {hintsRemaining} remaining
        </span>
      </div>

      {usedHints.length > 0 && (
        <div style={{ marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {usedHints.map((h, i) => (
            <div key={h.id} style={{
              background: 'rgba(212,168,67,0.05)',
              border: '1px solid var(--color-border-gold)',
              borderRadius: '8px',
              padding: '0.6rem 0.75rem',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
            }}>
              <span style={{ color: 'var(--color-gold)', fontWeight: 600, marginRight: '0.35rem' }}>#{i + 1}</span>
              {h.text}
            </div>
          ))}
        </div>
      )}

      <button
        id="request-hint-btn"
        className="btn-secondary"
        onClick={onRequestHint}
        disabled={loading || hintsRemaining === 0}
        style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
      >
        {loading
          ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Getting hint...</>
          : hintsRemaining === 0
          ? 'No hints remaining'
          : <><Lightbulb size={14} /> Request Hint (−10 pts)</>
        }
      </button>
    </div>
  );
};

const ScoreBoard = ({ caseData }) => {
  const discoveredCount = caseData.discoveredClueIds.length;
  const totalClues = caseData.totalClues;
  const hintsUsed = caseData.usedHintIds.length;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Trophy size={16} style={{ color: 'var(--color-gold)' }} />
        Investigation Progress
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { label: 'Current Score', value: caseData.currentScore, unit: 'pts', color: 'var(--color-gold)' },
          { label: 'Clues Found', value: `${discoveredCount}/${totalClues}`, color: 'var(--color-success)' },
          { label: 'Hints Used', value: hintsUsed, color: 'var(--color-warning)' },
          { label: 'Progress', value: `${caseData.progress}%`, color: 'var(--color-info)' },
        ].map(({ label, value, unit, color }) => (
          <div key={label} style={{
            background: 'var(--color-bg-secondary)',
            borderRadius: '8px',
            padding: '0.65rem 0.75rem',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color }}>
              {value}{unit && <span style={{ fontSize: '0.7rem', fontWeight: 400, marginLeft: '0.2rem' }}>{unit}</span>}
            </div>
          </div>
        ))}
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
          <span>Investigation completion</span>
          <span>{caseData.progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${caseData.progress}%` }} />
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function InvestigationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clueLoading, setClueLoading] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showAccuseModal, setShowAccuseModal] = useState(false);
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [accusing, setAccusing] = useState(false);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadCase = useCallback(async () => {
    try {
      setLoading(true);
      const data = await casesAPI.getById(id);
      if (data.case.status === 'completed') {
        navigate(`/result/${id}`, { replace: true });
        return;
      }
      setCaseData(data.case);
    } catch (err) {
      setError(err.message || 'Failed to load case');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  const handleDiscoverClue = async (clueId) => {
    setClueLoading(clueId);
    try {
      const result = await casesAPI.discoverClue(id, clueId);
      if (result.alreadyDiscovered) {
        showToast('Clue already discovered — no additional points.', 'warning');
      } else {
        showToast(`Clue discovered! +${result.scoreIncrease} points`, 'success');
      }
      // Update local state
      setCaseData(prev => ({
        ...prev,
        clues: prev.clues.map(c =>
          c.id === clueId ? { ...c, isDiscovered: true, description: result.clue.description } : c
        ),
        discoveredClueIds: [...new Set([...prev.discoveredClueIds, clueId])],
        currentScore: result.currentScore,
        progress: result.progress,
      }));
    } catch (err) {
      showToast(err.message || 'Failed to discover clue', 'error');
    } finally {
      setClueLoading(null);
    }
  };

  const handleRequestHint = async () => {
    setHintLoading(true);
    try {
      const result = await casesAPI.requestHint(id);
      showToast(`Hint received! −${result.scoreDeduction} points`, 'warning');
      setCaseData(prev => ({
        ...prev,
        hints: prev.hints.map(h =>
          h.id === result.hint.id ? { ...h, isUsed: true, text: result.hint.text } : h
        ),
        usedHintIds: [...prev.usedHintIds, result.hint.id],
        currentScore: result.currentScore,
        hintsRemaining: result.hintsRemaining,
      }));
    } catch (err) {
      showToast(err.message || 'Failed to get hint', 'error');
    } finally {
      setHintLoading(false);
    }
  };

  const handleAccuse = async () => {
    if (!selectedSuspect) return;
    setAccusing(true);
    try {
      await casesAPI.accuse(id, selectedSuspect.id);
      navigate(`/result/${id}`);
    } catch (err) {
      showToast(err.message || 'Failed to submit accusation', 'error');
      setAccusing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
        <p style={{ color: 'var(--color-text-muted)' }}>Loading investigation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
        <AlertCircle size={40} style={{ color: 'var(--color-danger)' }} />
        <p style={{ color: 'var(--color-danger)' }}>{error}</p>
        <button className="btn-secondary" onClick={() => navigate('/')}>
          <ArrowLeft size={14} /> Go Home
        </button>
      </div>
    );
  }

  if (!caseData) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          background: toast.type === 'success' ? 'rgba(76,175,125,0.15)' : toast.type === 'error' ? 'rgba(224,86,86,0.15)' : 'rgba(232,160,32,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(76,175,125,0.4)' : toast.type === 'error' ? 'rgba(224,86,86,0.4)' : 'rgba(232,160,32,0.4)'}`,
          color: toast.type === 'success' ? 'var(--color-success)' : toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-warning)',
          borderRadius: '8px',
          padding: '0.75rem 1.25rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          zIndex: 100,
          backdropFilter: 'blur(8px)',
          maxWidth: '320px',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Sticky Header */}
      <div style={{
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(13,15,20,0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/history')} style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}>
            <ArrowLeft size={13} /> Cases
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
              {caseData.title}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.1rem' }}>
              <DiffBadge difficulty={caseData.difficulty} />
              <StatusBadge status={caseData.status} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ScoreBadge score={caseData.currentScore} />
          <button
            id="accuse-suspect-btn"
            className="btn-primary"
            onClick={() => setShowAccuseModal(true)}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            <Target size={15} /> Accuse a Suspect
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Story */}
          <section>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              <FileText size={13} /> The Case
            </h2>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
                {caseData.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {caseData.story}
              </p>
            </div>
          </section>

          {/* Suspects */}
          <section>
            <h2 style={{ fontWeight: 600, fontSize: '0.75rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <User size={13} /> Suspects ({caseData.suspects.length})
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {caseData.suspects.map(s => (
                <SuspectCard key={s.id} suspect={s} />
              ))}
            </div>
          </section>

          {/* Evidence & Clues */}
          <section>
            <h2 style={{ fontWeight: 600, fontSize: '0.75rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <Search size={13} /> Evidence &amp; Clues ({caseData.discoveredClueIds.length}/{caseData.totalClues} discovered)
            </h2>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {caseData.clues.map(clue => (
                <ClueCard
                  key={clue.id}
                  clue={clue}
                  onDiscover={handleDiscoverClue}
                  loading={clueLoading === clue.id}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ScoreBoard caseData={caseData} />
          <HintPanel caseData={caseData} onRequestHint={handleRequestHint} loading={hintLoading} />

          {/* Quick Accuse */}
          <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <Target size={22} style={{ color: 'var(--color-gold)', margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              Ready to name the culprit? Review all suspects and evidence before accusing.
            </p>
            <button
              className="btn-primary"
              onClick={() => setShowAccuseModal(true)}
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
            >
              <Target size={14} /> Accuse a Suspect
            </button>
          </div>
        </div>
      </div>

      {/* Accuse Modal */}
      {showAccuseModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }} onClick={e => e.target === e.currentTarget && setShowAccuseModal(false)}>
          <div style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-gold)',
            borderRadius: '14px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}>
            <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Make Your Accusation
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Choose carefully — you can only accuse once. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {caseData.suspects.map(s => (
                <button
                  key={s.id}
                  id={`accuse-${s.id}`}
                  onClick={() => setSelectedSuspect(s)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: `2px solid ${selectedSuspect?.id === s.id ? 'var(--color-gold)' : 'var(--color-border)'}`,
                    background: selectedSuspect?.id === s.id ? 'rgba(212,168,67,0.1)' : 'var(--color-bg-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.occupation}</div>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn-secondary"
                onClick={() => { setShowAccuseModal(false); setSelectedSuspect(null); }}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                id="confirm-accuse-btn"
                className="btn-primary"
                onClick={handleAccuse}
                disabled={!selectedSuspect || accusing}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {accusing
                  ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Submitting...</>
                  : <><Target size={15} /> Confirm Accusation</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
