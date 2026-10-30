import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, Lightbulb, Trophy, ArrowRight, Clock, Shield,
  Eye, Zap, Star
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="mystery-card p-6">
    <div style={{ color: 'var(--color-gold)', marginBottom: '0.75rem' }}>
      <Icon size={28} />
    </div>
    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--color-text-primary)' }}>
      {title}
    </h3>
    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
      {desc}
    </p>
  </div>
);

const DifficultyCard = ({ level, suspects, clues, hints, bonus, color }) => (
  <div className="mystery-card p-5" style={{ borderTop: `2px solid ${color}` }}>
    <div style={{ fontWeight: 700, fontSize: '1rem', color, marginBottom: '0.5rem' }}>{level}</div>
    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <span>👤 {suspects} Suspects</span>
      <span>🔍 {clues} Clues</span>
      <span>💡 {hints} Hints</span>
      <span style={{ color: 'var(--color-gold)', fontWeight: 600, marginTop: '0.25rem' }}>+{bonus} pts bonus</span>
    </div>
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Navigation */}
      <nav style={{
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        background: 'rgba(13,15,20,0.95)',
        backdropFilter: 'blur(12px)',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Search size={22} style={{ color: 'var(--color-gold)' }} />
          <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '0.02em' }}>
            AI Mystery Room
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn-secondary"
            onClick={() => navigate('/history')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Clock size={15} />
            Case History
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate('/create')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Search size={15} />
            Start Investigating
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        textAlign: 'center',
        padding: '5rem 2rem 4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(212,168,67,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(212,168,67,0.1)',
          border: '1px solid var(--color-border-gold)',
          borderRadius: '20px',
          padding: '0.3rem 0.9rem',
          fontSize: '0.75rem',
          color: 'var(--color-gold)',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '1.5rem',
        }}>
          <Zap size={12} />
          Powered by Google Gemini AI
        </div>

        <h1 className="font-display" style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 700,
          lineHeight: 1.15,
          marginBottom: '1rem',
          maxWidth: '800px',
          margin: '0 auto 1rem',
        }}>
          Every Mystery Has{' '}
          <span className="text-gold-gradient">a Secret.</span>
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--color-text-secondary)',
          maxWidth: '580px',
          margin: '1.25rem auto 2.5rem',
          lineHeight: 1.7,
        }}>
          Enter a story premise, choose your difficulty, and let AI craft a complete detective
          mystery — suspects, clues, hints, and a hidden culprit — all uniquely generated for you.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            id="cta-start-investigating"
            className="btn-primary"
            onClick={() => navigate('/create')}
            style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}
          >
            <Search size={18} />
            Start Investigating
            <ArrowRight size={16} />
          </button>
          <button
            id="cta-view-history"
            className="btn-secondary"
            onClick={() => navigate('/history')}
            style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}
          >
            <Clock size={18} />
            View Case History
          </button>
        </div>
      </section>

      {/* Difficulty Overview */}
      <section style={{ padding: '2rem 2rem 3rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 className="font-display heading-underline" style={{
          fontSize: '1.6rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          color: 'var(--color-text-primary)',
        }}>
          Choose Your Challenge
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <DifficultyCard level="Easy" suspects={3} clues={5} hints={2} bonus={100} color="#4caf7d" />
          <DifficultyCard level="Medium" suspects={4} clues={7} hints={3} bonus={150} color="#e8a020" />
          <DifficultyCard level="Hard" suspects={5} clues={9} hints={3} bonus={200} color="#e05656" />
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '2rem 2rem 4rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 className="font-display heading-underline" style={{
          fontSize: '1.6rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          color: 'var(--color-text-primary)',
        }}>
          How It Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <FeatureCard
            icon={Zap}
            title="AI-Generated Mysteries"
            desc="Every case is uniquely created by Gemini AI based on your premise — no two investigations are alike."
          />
          <FeatureCard
            icon={Search}
            title="Clue Discovery"
            desc="Uncover evidence systematically. Each discovered clue reveals new information and adds to your score."
          />
          <FeatureCard
            icon={Lightbulb}
            title="Strategic Hints"
            desc="Request hints when stuck, but beware — each hint costs 10 points. Use them wisely."
          />
          <FeatureCard
            icon={Trophy}
            title="Detective Scoring"
            desc="Earn points for clues, lose for hints, and earn a big bonus for correctly identifying the culprit."
          />
          <FeatureCard
            icon={Shield}
            title="Fair Play"
            desc="All scoring is verified server-side. No cheating, no spoilers — the solution is always hidden."
          />
          <FeatureCard
            icon={BookOpen}
            title="Full Case History"
            desc="All your investigations are saved. Reopen active cases, revisit completed results anytime."
          />
        </div>
      </section>

      {/* How to Play */}
      <section style={{
        padding: '3rem 2rem',
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '2rem' }}>
            Crack the Case in 4 Steps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem' }}>
            {[
              { step: '01', label: 'Enter Premise', desc: 'Describe your mystery scenario' },
              { step: '02', label: 'Investigate', desc: 'Discover clues, study suspects' },
              { step: '03', label: 'Request Hints', desc: 'Get guidance when needed' },
              { step: '04', label: 'Accuse & Solve', desc: 'Name the culprit to close the case' },
            ].map(({ step, label, desc }) => (
              <div key={step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(212,168,67,0.1)',
                  border: '1px solid var(--color-border-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--color-gold)',
                }}>
                  {step}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--color-text-muted)',
        fontSize: '0.8rem',
        borderTop: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Search size={14} style={{ color: 'var(--color-gold)' }} />
          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>AI Mystery Room</span>
        </div>
        <p>AI-powered detective investigations · Built with Gemini AI · All mysteries are uniquely generated</p>
      </footer>
    </div>
  );
}
