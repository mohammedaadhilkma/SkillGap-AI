import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const THEMES = [
  { id: 'default', label: 'Dark', color: '#3b82f6', icon: '🌌' },
  { id: 'white', label: 'White', color: '#ffffff', icon: '☀️' },
];

const ThemeToggle = () => {
  const [current, setCurrent] = useState('default');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'default';
    setCurrent(saved);
  }, []);

  const changeTheme = (id) => {
    setCurrent(id);
    localStorage.setItem('theme', id);
    document.documentElement.setAttribute('data-theme', id);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '0.4rem 0.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          color: 'var(--text)',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>{THEMES.find(t => t.id === current)?.icon}</span>
        <span className="hidden-mobile">{THEMES.find(t => t.id === current)?.label}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close */}
            <div 
              style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.98 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                width: '140px',
                background: 'var(--bg-2)',
                border: '1px solid var(--border-hi)',
                borderRadius: '12px',
                padding: '0.5rem',
                zIndex: 100,
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => changeTheme(theme.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: current === theme.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: current === theme.id ? 'var(--blue)' : 'var(--text)',
                    fontSize: '0.82rem',
                    fontWeight: current === theme.id ? 700 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (current !== theme.id) e.target.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (current !== theme.id) e.target.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{theme.icon}</span>
                  {theme.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;
