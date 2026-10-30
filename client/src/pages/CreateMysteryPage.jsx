import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { casesAPI } from '../services/api';

const DIFFICULTIES = [
  {
    id: 'Easy',
    label: 'Easy',
    color: '#4caf7d',
    suspects: 3,
    clues: 5,
    hints: 2,
    bonus: 100,
    desc: 'A gentle introduction. Fewer suspects and clues — ideal for first-time detectives.',
  },
  {
    id: 'Medium',
    label: 'Medium',
    color: '#e8a020',
    suspects: 4,
    clues: 7,
    hints: 3,
    bonus: 150,
    desc: 'The classic detective experience. More suspects, more evidence, more intrigue.',
  },
  {
    id: 'Hard',
    label: 'Hard',
    color: '#e05656',
    suspects: 5,
    clues: 9,
    hints: 3,
    bonus: 200,
    desc: 'For seasoned investigators only. Complex webs of deception and minimal margin for error.',
  },
];

export default function CreateMysteryPage() {
  const navigate = useNavigate();
  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const MAX_CHARS = 1000;
  const MIN_CHARS = 20;

  const premiseValid = premise.trim().length >= MIN_CHARS;
  const selectedDiff = DIFFICULTIES.find(d => d.id === difficulty);

  const handleGenerate = async () => {
    if (!premiseValid) {
      setError(`Please enter at least ${MIN_CHARS} characters for your premise.`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await casesAPI.create(premise.trim(), difficulty);
      navigate(`/investigate/${data.case._id}`);
    } catch (err) {
      setError(err.message || 'Failed to generate mystery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Header */}
      <div style={{
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: 'rgba(13,15,20,0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <button
          className="btn-secondary"
          onClick={() => navigate('/')}
          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} style={{ color: 'var(--color-gold)' }} />
          <span className="font-display" style={{ fontWeight: 700, fontSize: '1rem' }}>
            Create New Mystery
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Craft Your <span className="text-gold-gradient">Investigation</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Describe your mystery scenario and let AI create a complete investigation — suspects, evidence, and a hidden culprit.
          </p>
        </div>

        {/* Premise */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Story Premise
            </label>
            <span style={{
              fontSize: '0.75rem',
              color: premise.length > MAX_CHARS * 0.9 ? 'var(--color-danger)' : 'var(--color-text-muted)'
            }}>
              {premise.length} / {MAX_CHARS}
            </span>
          </div>
          <textarea
            id="premise-input"
            className="mystery-input"
            rows={6}
            value={premise}
            onChange={e => setPremise(e.target.value.slice(0, MAX_CHARS))}
            placeholder="A famous scientist disappeared from a locked laboratory. Three researchers were present, but each has a different explanation for what happened."
            disabled={loading}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Minimum {MIN_CHARS} characters. Be creative — the more vivid your premise, the better the mystery.
            </p>
            {premise.length >= MIN_CHARS && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle size={12} /> Good length
              </span>
            )}
          </div>
        </div>

        {/* Difficulty */}
        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.75rem' }}>
            Difficulty Level
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {DIFFICULTIES.map(d => (
              <button
                id={`difficulty-${d.id.toLowerCase()}`}
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                disabled={loading}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  border: `2px solid ${difficulty === d.id ? d.color : 'var(--color-border)'}`,
                  background: difficulty === d.id ? `rgba(${d.color === '#4caf7d' ? '76,175,125' : d.color === '#e8a020' ? '232,160,32' : '224,86,86'},0.1)` : 'var(--color-bg-card)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <div style={{ fontWeight: 700, color: d.color, marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  {d.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                  {d.desc}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span>{d.suspects} suspects</span>
                  <span>·</span>
                  <span>{d.clues} clues</span>
                  <span>·</span>
                  <span>{d.hints} hints</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 600, marginTop: '0.25rem' }}>
                  +{d.bonus} pts bonus
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {selectedDiff && (
          <div style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-gold)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Will Generate</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                {selectedDiff.suspects} Suspects · {selectedDiff.clues} Clues · {selectedDiff.hints} Hints
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Correct Accusation</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                +{selectedDiff.bonus} points
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Max Possible Score</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                {selectedDiff.bonus + selectedDiff.clues * 5} points
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(224,86,86,0.1)',
            border: '1px solid rgba(224,86,86,0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
          }}>
            <AlertCircle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '0.1rem' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--color-danger)' }}>{error}</span>
          </div>
        )}

        {/* Generate Button */}
        <button
          id="generate-mystery-btn"
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading || !premiseValid}
          style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem' }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: '18px', height: '18px' }} />
              Generating Your Mystery...
            </>
          ) : (
            <>
              <Zap size={18} />
              Generate Mystery
            </>
          )}
        </button>

        {loading && (
          <p style={{
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '0.8rem',
            marginTop: '0.75rem',
          }}>
            AI is crafting your unique mystery. This may take 10–30 seconds...
          </p>
        )}
      </div>
    </div>
  );
}
