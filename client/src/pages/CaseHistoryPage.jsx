import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Clock, Trophy, CheckCircle, Trash2,
  BookOpen, AlertCircle, RefreshCw, ExternalLink, Eye
} from 'lucide-react';
import { casesAPI } from '../services/api';

const EmptyState = ({ onCreateNew }) => (
  <div style={{
    textAlign: 'center',
    padding: '4rem 2rem',
    maxWidth: '400px',
    margin: '0 auto',
  }}>
    <div style={{
      width: '72px',
      height: '72px',
      borderRadius: '50%',
      background: 'rgba(212,168,67,0.08)',
      border: '1px solid var(--color-border-gold)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.25rem',
    }}>
      <Search size={28} style={{ color: 'var(--color-gold)' }} />
    </div>
    <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
      No Cases Yet
    </h2>
    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
      You haven't started any investigations. Begin your first mystery and build your detective portfolio.
    </p>
    <button id="create-first-case-btn" className="btn-primary" onClick={onCreateNew} style={{ justifyContent: 'center' }}>
      <Plus size={16} /> Start First Investigation
    </button>
  </div>
);

const CaseCard = ({ caseItem, onOpen, onViewResult, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const isCompleted = caseItem.status === 'completed';
  const isCorrect = caseItem.accusation?.isCorrect;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${caseItem.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await onDelete(caseItem._id);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mystery-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'var(--color-text-primary)',
            marginBottom: '0.35rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {caseItem.title}
          </h3>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className={`badge badge-${caseItem.difficulty?.toLowerCase()}`}>{caseItem.difficulty}</span>
            <span className={`badge badge-${caseItem.status}`}>{caseItem.status}</span>
            {isCompleted && (
              <span style={{
                fontSize: '0.7rem',
                color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)',
                fontWeight: 600,
              }}>
                {isCorrect ? '✓ Solved' : '✗ Unsolved'}
              </span>
            )}
          </div>
        </div>
        {isCompleted && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '0.1rem',
          }}>
            <span style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '1.1rem' }}>
              {caseItem.finalScore ?? caseItem.currentScore}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>pts</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.85rem', fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={11} /> {formatDate(caseItem.createdAt)}
        </span>
        {!isCompleted && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Search size={11} /> {caseItem.progress}% investigated
          </span>
        )}
        {isCompleted && caseItem.completedAt && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle size={11} /> Completed {formatDate(caseItem.completedAt)}
          </span>
        )}
      </div>

      {!isCompleted && (
        <div style={{ marginBottom: '0.85rem' }}>
          <div className="progress-bar" style={{ height: '4px' }}>
            <div className="progress-fill" style={{ width: `${caseItem.progress}%` }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {!isCompleted && (
          <button
            id={`open-case-${caseItem._id}`}
            className="btn-secondary"
            onClick={() => onOpen(caseItem._id)}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            <ExternalLink size={12} /> Open Case
          </button>
        )}
        {isCompleted && (
          <button
            id={`view-result-${caseItem._id}`}
            className="btn-secondary"
            onClick={() => onViewResult(caseItem._id)}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            <Eye size={12} /> View Result
          </button>
        )}
        <button
          id={`delete-case-${caseItem._id}`}
          className="btn-danger"
          onClick={handleDelete}
          disabled={deleting}
          style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', marginLeft: 'auto' }}
        >
          {deleting ? <div className="spinner" style={{ width: '12px', height: '12px' }} /> : <Trash2 size={12} />}
        </button>
      </div>
    </div>
  );
};

export default function CaseHistoryPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  const loadCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await casesAPI.getAll();
      setCases(data.cases || []);
    } catch (err) {
      setError(err.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleDelete = async (id) => {
    try {
      await casesAPI.delete(id);
      setCases(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert('Failed to delete case: ' + err.message);
    }
  };

  const filtered = cases.filter(c => filter === 'all' ? true : c.status === filter);
  const activeCount = cases.filter(c => c.status === 'active').length;
  const completedCount = cases.filter(c => c.status === 'completed').length;

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
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/')} style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}>
            <Search size={13} style={{ color: 'var(--color-gold)' }} /> Home
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Case History</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              {cases.length} total · {activeCount} active · {completedCount} completed
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-secondary"
            onClick={loadCases}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
          >
            <RefreshCw size={13} />
          </button>
          <button
            id="new-investigation-btn"
            className="btn-primary"
            onClick={() => navigate('/create')}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            <Plus size={15} /> New Investigation
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Filter Tabs */}
        {cases.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
            {['all', 'active', 'completed'].map(f => (
              <button
                key={f}
                id={`filter-${f}`}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  border: `1px solid ${filter === f ? 'var(--color-gold)' : 'var(--color-border)'}`,
                  background: filter === f ? 'rgba(212,168,67,0.1)' : 'transparent',
                  color: filter === f ? 'var(--color-gold)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: filter === f ? 600 : 400,
                  transition: 'all 0.15s ease',
                  textTransform: 'capitalize',
                }}
              >
                {f} {f === 'all' ? `(${cases.length})` : f === 'active' ? `(${activeCount})` : `(${completedCount})`}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading your cases...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <AlertCircle size={36} style={{ color: 'var(--color-danger)', margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</p>
            <button className="btn-secondary" onClick={loadCases}><RefreshCw size={14} /> Retry</button>
          </div>
        ) : cases.length === 0 ? (
          <EmptyState onCreateNew={() => navigate('/create')} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            No {filter} cases found.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {filtered.map(c => (
              <CaseCard
                key={c._id}
                caseItem={c}
                onOpen={(id) => navigate(`/investigate/${id}`)}
                onViewResult={(id) => navigate(`/result/${id}`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
