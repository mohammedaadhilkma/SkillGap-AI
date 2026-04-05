import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';

/* ── helpers ── */
const pct = (n) => Math.round(n);

const ProgressBar = ({ value, label, color = 'var(--blue)' }) => (
  <div style={{ marginBottom: '0.75rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{value}%</span>
    </div>
    <div className="progress-track">
      <motion.div
        className="progress-fill"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        style={{ background: `linear-gradient(90deg, ${color}, var(--cyan))` }}
      />
    </div>
  </div>
);

/* Custom Radar tick */
const CustomTick = ({ x, y, payload }) => (
  <text x={x} y={y} fill="var(--muted)" fontSize={11} textAnchor="middle" dy={4}>
    {payload.value}
  </text>
);

const LEVEL_EMOJI = { Beginner: '🌱', Intermediate: '🔥', Advanced: '🚀' };

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('gapAnalysis');
    if (raw) {
      try { setData(JSON.parse(raw)); } catch {}
    }
  }, []);

  const handleComplete = (item, idx) => {
    const newData = { ...data };
    const completedSkill = item.skill_target || item.title.replace("Master ", "");
    
    // Move skill
    newData.missing_skills = newData.missing_skills.filter(s => s !== completedSkill);
    if (!newData.matched_skills.includes(completedSkill)) {
      newData.matched_skills.push(completedSkill);
    }
    
    // Remove from roadmap
    newData.roadmap = newData.roadmap.filter((_, i) => i !== idx);
    
    // Recalculate percentage
    const totalSkills = newData.matched_skills.length + newData.missing_skills.length;
    newData.match_percentage = totalSkills > 0 ? (newData.matched_skills.length / totalSkills) * 100 : 0;
    
    setData(newData);
    localStorage.setItem('gapAnalysis', JSON.stringify(newData));
  };

  /* ── Empty state ── */
  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>No Analysis Yet</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Run an analysis first to see your personalized skill report.</p>
        <Link to="/analysis" className="btn-primary">Start Analysis →</Link>
      </div>
    );
  }

  const total = data.matched_skills.length + data.missing_skills.length;
  const pctMatch = pct(data.match_percentage);

  /* Build radar data from per-skill arrays */
  const radarData = [
    ...data.matched_skills.map(s => ({ skill: s, score: 85 + Math.floor(Math.random() * 15), fill: '#10b981' })),
    ...data.missing_skills.map(s => ({ skill: s, score: 5 + Math.floor(Math.random() * 25), fill: '#ef4444' })),
  ].slice(0, 8); // max 8 spokes

  /* Bar chart data */
  const barData = [
    { name: 'Matched', count: data.matched_skills.length },
    { name: 'Missing', count: data.missing_skills.length },
  ];

  const matchColor = pctMatch >= 70 ? 'var(--green)' : pctMatch >= 40 ? 'var(--amber)' : 'var(--red)';
  const badge = pctMatch >= 70 ? '🏆 Strong Candidate' : pctMatch >= 40 ? '📈 On Track' : '🎯 Needs Work';

  return (
    <div style={{ padding: '3rem 0' }}>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
            Skill Report
          </p>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.4rem' }}>
            Your <span className="g-text">Skill Profile</span>
          </h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Target: <strong style={{ color: 'var(--text)' }}>{data.role}</strong>
            {data.experience && (
              <span style={{ marginLeft: '0.75rem' }}>
                {LEVEL_EMOJI[data.experience] || ''} <span style={{ color: 'var(--text)', fontWeight: 600 }}>{data.experience}</span>
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            background: `${matchColor}22`,
            border: `1px solid ${matchColor}55`,
            color: matchColor,
            borderRadius: '9999px', padding: '0.45rem 1.1rem',
            fontSize: '0.88rem', fontWeight: 700,
          }}>{badge}</div>
          <Link to="/analysis" className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem' }}>
            Re-analyze ↺
          </Link>
        </div>
      </div>

      {/* ─── Top Stats ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Match Score', value: `${pctMatch}%`, color: matchColor, icon: '🎯' },
          { label: 'Skills Matched', value: data.matched_skills.length, color: 'var(--green)', icon: '✅' },
          { label: 'Skills Missing', value: data.missing_skills.length, color: 'var(--red)', icon: '❌' },
          { label: 'Roadmap Steps', value: data.roadmap?.length || 0, color: 'var(--blue)', icon: '🗺️' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass"
            style={{ padding: '1.5rem', textAlign: 'center', border: `1px solid ${s.color}22` }}
          >
            <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ─── Progress Bar ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass"
        style={{ padding: '2rem', marginBottom: '2rem' }}
      >
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1.05rem' }}>Overall Readiness</h3>
        <ProgressBar value={pctMatch} label={`${data.role} Readiness`} color={matchColor} />
        <ProgressBar value={Math.round((data.matched_skills.length / total) * 100)} label="Skill Coverage" color="var(--cyan)" />
      </motion.div>

      {/* ─── Charts + Skills ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>

        {/* Radar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.05rem' }}>🕸️ Competency Radar</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis dataKey="skill" tick={<CustomTick />} />
                <Radar dataKey="score" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.05rem' }}>📊 Skill Breakdown</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barSize={60}>
                <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 13 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0d1525', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 13 }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Matched */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass" style={{ padding: '1.5rem', borderLeft: '3px solid var(--green)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.05rem', color: 'var(--green)' }}>✅ Skills You Have</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {data.matched_skills.length > 0
              ? data.matched_skills.map((s, i) => <span key={i} className="chip-green">{s}</span>)
              : <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>No matching skills found.</p>
            }
          </div>
        </motion.div>

        {/* Missing conditionally shown */}
        {data.missing_skills.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass" style={{ padding: '1.5rem', borderLeft: '3px solid var(--red)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.05rem', color: '#fca5a5' }}>🚫 Skills You Need</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {data.missing_skills.map((s, i) => <span key={i} className="chip-red">{s}</span>)}
            </div>
          </motion.div>
        )}
      </div>

      {/* ─── Roadmap ─── */}
      {data.roadmap && data.roadmap.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '2rem' }}>🗺️ Your Learning Roadmap</h3>
          <div style={{ position: 'relative' }}>
            {data.roadmap.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.08 }}
                style={{ display: 'flex', gap: '1.25rem', marginBottom: idx === data.roadmap.length - 1 ? 0 : '1.5rem', position: 'relative' }}
              >
                {/* Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                  <div className="timeline-dot" />
                  {idx !== data.roadmap.length - 1 && <div className="timeline-line" style={{ height: '100%', minHeight: 40 }} />}
                </div>

                {/* Content */}
                <div style={{
                  flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)', padding: '1rem 1.25rem', marginBottom: '0.25rem',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.98rem', margin: 0 }}>{item.title}</h4>
                    <span style={{ background: 'rgba(6,182,212,0.12)', color: 'var(--cyan)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '9999px', padding: '0.15rem 0.7rem', fontSize: '0.73rem', fontWeight: 600 }}>
                      {item.duration}
                    </span>
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: '0 0 0.6rem' }}>{item.type}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem' }}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--blue)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.target.style.textDecoration = 'none'}
                    >
                      🔗 Explore Resources →
                    </a>
                    <button 
                       onClick={() => handleComplete(item, idx)}
                       className="btn-outline" 
                       style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderColor: 'var(--green)', color: 'var(--green)', cursor: 'pointer' }}>
                       Mark as Complete ✓
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Celebration Banner ─── */}
      {data.missing_skills.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: 'spring' }} className="glass" style={{ padding: '3rem 2rem', marginTop: '1rem', border: '2px solid var(--green)', background: 'rgba(16,185,129,0.1)', textAlign: 'center', boxShadow: '0 10px 40px rgba(16,185,129,0.2)' }}>
           <h2 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</h2>
           <h3 style={{ fontWeight: 800, fontSize: '2.2rem', color: 'var(--text)', letterSpacing: '-0.5px' }}>You are 100% Ready!</h3>
           <p style={{ color: '#a7f3d0', fontSize: '1.15rem', marginTop: '0.75rem', maxWidth: '600px', margin: '0.75rem auto 0' }}>
             You have mastered all the required skills for <strong>{data.role}</strong>. It's time to update your resume and start applying. Great job!
           </p>
           <div style={{ marginTop: '2.5rem' }}>
              <Link to="/analysis" className="btn-primary" style={{ background: 'var(--green)', boxShadow: '0 4px 20px rgba(16,185,129,0.4)', color: '#000', fontWeight: 800 }}>
                 Analyze Another Role →
              </Link>
           </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
