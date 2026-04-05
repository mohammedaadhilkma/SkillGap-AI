import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: '🎯',
    color: 'var(--blue)',
    glow: 'rgba(59,130,246,0.25)',
    title: 'Target Job Roles',
    desc: 'Choose from 14+ industry roles including AI Engineer, Cloud Architect, Cybersecurity, and more.',
  },
  {
    icon: '🧠',
    color: 'var(--violet)',
    glow: 'rgba(124,58,237,0.25)',
    title: 'AI-Powered Analysis',
    desc: 'Smart skill comparison using set operations. Upload your resume or type in your skills for instant insights.',
  },
  {
    icon: '⚡',
    color: 'var(--cyan)',
    glow: 'rgba(6,182,212,0.25)',
    title: 'Instant Roadmap',
    desc: 'Get a week-by-week learning plan with curated resources from YouTube, Coursera, and Udemy.',
  },
  {
    icon: '💬',
    color: 'var(--pink)',
    glow: 'rgba(236,72,153,0.25)',
    title: 'AI Career Assistant',
    desc: 'Ask the integrated chatbot anything — project ideas, what to learn next, or how to prepare for interviews.',
  },
];

const STATS = [
  { value: '14+', label: 'Job Roles', color: 'var(--blue)' },
  { value: '100+', label: 'Skills Tracked', color: 'var(--cyan)' },
  { value: '100%', label: 'Free to Use', color: 'var(--green)' },
  { value: 'AI', label: 'Powered Analysis', color: 'var(--violet)' },
];

const ROLES = ['AI Engineer', 'Cloud Architect', 'Cybersecurity', 'DevOps Engineer', 'Full Stack Developer', 'Data Scientist'];

const Home = () => {
  return (
    <div>
      {/* ─── Hero ─── */}
      <section style={{ textAlign: 'center', padding: '6rem 1rem 5rem' }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--blue)', borderRadius: '9999px', padding: '0.35rem 1rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2rem' }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', display: 'inline-block', boxShadow: '0 0 6px var(--blue)' }} />
          AI-Powered Skill Gap Analysis
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px', margin: '0 0 1.5rem' }}
        >
          Bridge Your{' '}
          <span className="g-text">Skill Gap</span>
          <br />
          Land Your{' '}
          <span className="g-text-warm">Dream Job</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{ color: 'var(--muted)', fontSize: '1.15rem', maxWidth: '560px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}
        >
          Analyze your current skills against top industry roles, discover exactly what's missing, and get a personalized roadmap to close the gap — in seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link to="/analysis" className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.2rem' }}>
            Start Free Analysis →
          </Link>
          <Link to="/dashboard" className="btn-outline">
            View Sample Dashboard
          </Link>
        </motion.div>

        {/* Role chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2.5rem' }}
        >
          {ROLES.map(r => (
            <Link key={r} to="/analysis" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              borderRadius: '9999px',
              padding: '0.3rem 0.9rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'rgba(59,130,246,0.4)'; e.target.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)'; }}
            >
              {r}
            </Link>
          ))}
        </motion.div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section style={{ margin: '0 0 5rem' }}>
        <div className="glass" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', overflow: 'hidden', borderRadius: 'var(--radius-2xl)' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '2rem 1rem',
              borderRight: i < 3 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: s.color, marginBottom: '0.3rem', letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section style={{ marginBottom: '6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.75rem' }}>
            Everything You Need to <span className="g-text">Level Up</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto' }}>
            Our AI-powered platform guides you from where you are to where you want to be.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="glass"
              style={{ padding: '2rem', cursor: 'default' }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '14px',
                background: `linear-gradient(135deg, ${f.glow}, ${f.glow})`,
                border: `1px solid ${f.glow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', marginBottom: '1.25rem',
                boxShadow: `0 4px 20px ${f.glow}`,
              }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>{f.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(124,58,237,0.15))',
          border: '1px solid rgba(99,179,240,0.25)',
          borderRadius: 'var(--radius-3xl)',
          padding: '4rem 2rem',
        }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '1rem' }}>
            Ready to <span className="g-text">close the gap?</span>
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '1.05rem' }}>
            It only takes 60 seconds to get your personalized skill report.
          </p>
          <Link to="/analysis" className="btn-primary" style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }}>
            Analyze My Skills Now →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
