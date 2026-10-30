import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy, AlertCircle, CheckCircle, XCircle, ArrowLeft, Search,
  RefreshCw, Clock, Star, Target, BookOpen, Shield
} from 'lucide-react';
import { casesAPI } from '../services/api';

const DIFFICULTY_BONUS = { Easy: 100, Medium: 150, Hard: 200 };

export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadResult = useCallback(async () => {
    try {
      setLoading(true);
      const data = await casesAPI.getResult(id);
      setCaseData(data.case);
    } catch (err) {
      // Maybe the case is still active, redirect
      if (err.status === 400) {
        navigate(`/investigate/${id}`, { replace: true });
      } else {
        setError(err.message || 'Failed to load result');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
        <p style={{ color: 'var(--color-text-muted)' }}>Loading results...</p>
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

  const { accusation, solution, finalScore, difficulty } = caseData;
  const isCorrect = accusation?.isCorrect;
  const bonus = DIFFICULTY_BONUS[difficulty] || 0;
  const cluePoints = caseData.discoveredClueIds.length * 5;
  const hintDeductions = caseData.usedHintIds.length * 10;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Header */}
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
        gap: '0.75rem',
      }}>
        <button className="btn-secondary" onClick={() => navigate('/history')} style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}>
          <ArrowLeft size={13} /> All Cases
        </button>
        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{caseData.title}</span>
        <span className={`badge badge-${difficulty?.toLowerCase()}`}>{difficulty}</span>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Verdict Banner */}
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          background: isCorrect
            ? 'linear-gradient(135deg, rgba(76,175,125,0.12), rgba(76,175,125,0.05))'
            : 'linear-gradient(135deg, rgba(224,86,86,0.12), rgba(224,86,86,0.05))',
          border: `1px solid ${isCorrect ? 'rgba(76,175,125,0.3)' : 'rgba(224,86,86,0.3)'}`,
        }}>
          {isCorrect
            ? <CheckCircle size={52} style={{ color: 'var(--color-success)', margin: '0 auto 1rem' }} />
            : <XCircle size={52} style={{ color: 'var(--color-danger)', margin: '0 auto 1rem' }} />
          }
          <h1 className="font-display" style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 700,
            marginBottom: '0.5rem',
            color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)',
          }}>
            {isCorrect ? 'Case Solved!' : 'Wrong Accusation'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            {isCorrect
              ? `Brilliant detective work! You correctly identified ${accusation?.suspectName} as the culprit.`
              : `You accused ${accusation?.suspectName}, but the real culprit was ${solution?.culprit?.name}.`
            }
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(212,168,67,0.12)',
            border: '1px solid var(--color-border-gold)',
            borderRadius: '12px',
            padding: '0.75rem 1.5rem',
          }}>
            <Trophy size={20} style={{ color: 'var(--color-gold)' }} />
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-gold)' }}>{finalScore}</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>final score</span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Star size={16} style={{ color: 'var(--color-gold)' }} /> Score Breakdown
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: `Clues Discovered (${caseData.discoveredClueIds.length} × 5pts)`, value: `+${cluePoints}`, color: 'var(--color-success)' },
              { label: `Hints Used (${caseData.usedHintIds.length} × 10pts)`, value: `-${hintDeductions}`, color: 'var(--color-danger)' },
              { label: `Correct Accusation Bonus (${difficulty})`, value: isCorrect ? `+${bonus}` : '+0', color: isCorrect ? 'var(--color-gold)' : 'var(--color-text-muted)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '0.875rem',
              }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                <span style={{ fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0',
              fontSize: '1rem',
            }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Final Score</span>
              <span style={{ fontWeight: 800, color: 'var(--color-gold)', fontSize: '1.2rem' }}>{finalScore} pts</span>
            </div>
          </div>
        </div>

        {/* Culprit Reveal */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Target size={16} style={{ color: 'var(--color-gold)' }} /> The Culprit
          </h2>
          {solution?.culprit && (
            <div style={{
              background: 'rgba(212,168,67,0.06)',
              border: '1px solid var(--color-border-gold)',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
            }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-gold)', marginBottom: '0.2rem' }}>
                {solution.culprit.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                {solution.culprit.occupation}
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Real Motive: </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{solution.motive}</span>
              </div>
            </div>
          )}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              How It Happened
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.75 }}>
              {solution?.explanation}
            </p>
          </div>
        </div>

        {/* Supporting Evidence */}
        {solution?.supportingClues?.length > 0 && (
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={16} style={{ color: 'var(--color-gold)' }} /> Key Evidence
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {solution.supportingClues.map(clue => (
                <div key={clue.id} style={{
                  background: 'var(--color-bg-secondary)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    🔍 {clue.title}
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                    {clue.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            id="play-again-btn"
            className="btn-primary"
            onClick={() => navigate('/create')}
            style={{ flex: 1, justifyContent: 'center', minWidth: '160px' }}
          >
            <Search size={16} /> Play Again
          </button>
          <button
            id="view-history-result-btn"
            className="btn-secondary"
            onClick={() => navigate('/history')}
            style={{ flex: 1, justifyContent: 'center', minWidth: '160px' }}
          >
            <BookOpen size={16} /> View Case History
          </button>
        </div>
      </div>
    </div>
  );
}
