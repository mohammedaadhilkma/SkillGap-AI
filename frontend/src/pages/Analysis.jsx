import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const Analysis = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [skillTags, setSkillTags] = useState([]);
  const [experience, setExperience] = useState('Beginner');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    axios.get('/api/analysis/roles', { 
      signal: controller.signal,
      timeout: 8000 
    })
      .then(res => {
        if (active) {
          setRoles(res.data);
          if (res.data.length > 0) setSelectedRole(res.data[0]);
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Roles fetch error:", err);
          setError(err.code === 'ECONNABORTED' ? 'Connection timed out. Check if backend is running.' : 'Cannot connect to backend.');
        }
      });

    return () => { active = false; controller.abort(); };
  }, []);

  /* ── Tag input ── */
  const addTag = (val) => {
    const cleaned = val.trim().replace(/,$/, '').trim();
    if (cleaned && !skillTags.includes(cleaned)) {
      setSkillTags(prev => [...prev, cleaned]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && tagInput === '' && skillTags.length > 0) {
      setSkillTags(prev => prev.slice(0, -1));
    }
  };

  const removeTag = (tag) => setSkillTags(prev => prev.filter(t => t !== tag));

  /* ── File drag ── */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') setFile(dropped);
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (skillTags.length === 0) { setError('Please add at least one skill.'); return; }
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('role', selectedRole);
    formData.append('skills', skillTags.join(', '));
    formData.append('experience', experience);
    if (file) formData.append('resume', file);

    try {
      const res = await axios.post('/api/analysis/analyze', formData);
      localStorage.setItem('gapAnalysis', JSON.stringify({ ...res.data, experience }));
      navigate('/dashboard');
    } catch (err) {
      setError('Analysis failed. Please make sure the backend server is running.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3.5rem 0' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: 'var(--blue)', borderRadius: '9999px', padding: '0.3rem 0.9rem', fontSize: '0.78rem', fontWeight: 600, marginBottom: '1rem' }}>
            🧠 AI Analysis Engine
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>
            Analyze Your <span className="g-text">Skills</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1rem' }}>Fill in your details below to get your personalized skill gap report.</p>
        </div>

        {/* Form Card */}
        <div className="glass" style={{ padding: '2.5rem' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* Role */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Target Job Role
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  disabled={loading || roles.length === 0}
                  className="field-input"
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  style={{
                    opacity: roles.length === 0 ? 0.6 : 1,
                    cursor: roles.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {roles.length > 0 ? (
                    roles.map(r => <option key={r} value={r}>{r}</option>)
                  ) : (
                    <option value="">{error ? 'Error loading roles' : 'Loading roles...'}</option>
                  )}
                </select>
                {roles.length === 0 && !error && (
                  <div style={{
                    position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)',
                    width: '16px', height: '16px', border: '2px solid rgba(59,130,246,0.3)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin 0.6s linear infinite'
                  }} />
                )}
              </div>
              {error && (
                <button 
                  type="button" 
                  onClick={() => window.location.reload()}
                  style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '0.75rem', marginTop: '0.4rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Try reloading roles
                </button>
              )}
            </div>

            {/* Experience */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Experience Level
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {EXPERIENCE_LEVELS.map(lvl => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setExperience(lvl)}
                    style={{
                      flex: 1,
                      padding: '0.7rem',
                      borderRadius: '12px',
                      border: experience === lvl ? '2px solid var(--blue)' : '1px solid var(--border)',
                      background: experience === lvl ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                      color: experience === lvl ? 'var(--text)' : 'var(--muted)',
                      fontWeight: experience === lvl ? 700 : 500,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {lvl === 'Beginner' ? '🌱' : lvl === 'Intermediate' ? '🔥' : '🚀'} {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills Tag Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Current Skills
              </label>
              <div
                onClick={() => inputRef.current?.focus()}
                style={{
                  minHeight: '80px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '0.65rem 0.85rem',
                  display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'flex-start',
                  cursor: 'text',
                  transition: 'border-color 0.2s',
                }}
                onFocus={() => {}}
              >
                {skillTags.map(tag => (
                  <span key={tag} className="skill-tag">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>✕</button>
                  </span>
                ))}
                <input
                  ref={inputRef}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => tagInput && addTag(tagInput)}
                  placeholder={skillTags.length === 0 ? 'Type a skill and press Enter or comma...' : ''}
                  style={{
                    flex: 1, minWidth: '160px', background: 'none', border: 'none', outline: 'none',
                    color: 'var(--text)', fontSize: '0.92rem', fontFamily: 'inherit', padding: '0.2rem',
                  }}
                />
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.4rem' }}>
                Press <kbd style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0 4px', fontFamily: 'monospace' }}>Enter</kbd> or <kbd style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0 4px', fontFamily: 'monospace' }}>,</kbd> after each skill. Backspace to remove last.
              </p>
            </div>

            {/* Resume Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Upload Resume <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.78rem' }}>(Optional · PDF)</span>
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                style={{
                  border: `2px dashed ${dragging ? 'var(--blue)' : file ? 'var(--green)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-xl)',
                  padding: '2rem',
                  textAlign: 'center',
                  position: 'relative',
                  background: dragging ? 'rgba(59,130,246,0.06)' : file ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={e => setFile(e.target.files[0])}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{file ? '✅' : '📄'}</div>
                <p style={{ fontWeight: 600, color: file ? 'var(--green)' : 'var(--muted)', margin: 0, fontSize: '0.92rem' }}>
                  {file ? file.name : 'Drag & drop your PDF resume here'}
                </p>
                {!file && <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>or click to browse</p>}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || roles.length === 0}
              className="btn-primary"
              style={{
                width: '100%', justifyContent: 'center',
                padding: '1.1rem',
                fontSize: '1rem',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Analyzing your skills...
                </>
              ) : (
                '🔍 Generate My Skill Analysis →'
              )}
            </button>
          </form>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Analysis;
