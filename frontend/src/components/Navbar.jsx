import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import ThemeToggle from './ThemeToggle';

const NavLink = ({ to, children }) => {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      style={{
        color: active ? 'var(--text)' : 'var(--muted)',
        fontWeight: active ? '600' : '500',
        fontSize: '0.9rem',
        textDecoration: 'none',
        transition: 'color 0.2s',
        position: 'relative',
        paddingBottom: '2px',
        borderBottom: active ? '2px solid var(--blue)' : '2px solid transparent',
      }}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--bg-2)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, var(--blue), var(--cyan))',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 5a2 2 0 1 0 4 0 2 2 0 0 0-4 0"></path>
              <path d="M4 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0"></path>
              <path d="M16 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0"></path>
              <path d="M6.5 17.5L10.5 6.5"></path>
              <path d="M17.5 17.5L13.5 6.5"></path>
              <path d="M8 19h8"></path>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Skill<span className="g-text">Gap</span>
            <span style={{ fontSize: '0.68rem', background: 'rgba(59,130,246,0.15)', color: 'var(--blue)', borderRadius: '4px', padding: '1px 6px', marginLeft: '6px', fontWeight: 700, verticalAlign: 'middle', border: '1px solid rgba(59,130,246,0.3)' }}>AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden-mobile">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/analysis">Analyze</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle />
          <Link to="/analysis" className="btn-primary" style={{ padding: '0.55rem 1.3rem', fontSize: '0.88rem', boxShadow: '0 4px 20px rgba(59,130,246,0.35)' }}>
            Get Started →
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
