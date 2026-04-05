import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const QUICK_PROMPTS = [
  'What should I learn next?',
  'Suggest projects for my role',
  'Give me a 3-month plan',
  'Best resources for Python',
];

const BOT_AVATAR = '🤖';
const USER_AVATAR = '🧑';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hi! I'm your **SkillGap AI** assistant 🚀\n\nI can help you figure out what to learn next, recommend projects, or generate a learning roadmap. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    const newMsgs = [...messages, { role: 'user', text: msg }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/analysis/chat', { message: msg }, { timeout: 10000 });
      const reply = res.data.reply;
      setMessages([...newMsgs, { role: 'ai', text: reply }]);
      if (!isOpen) setUnread(u => u + 1);
    } catch (err) {
      const errorMsg = err.code === 'ECONNABORTED' 
        ? "The request timed out. Please try again."
        : "I'm having trouble connecting to the server. Please check your connection.";
      setMessages([...newMsgs, { role: 'ai', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  /* Render message text with basic markdown (bold) */
  const renderText = (text) =>
    text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i} style={{ display: 'block' }}>
          {parts.map((part, j) =>
            j % 2 === 1
              ? <strong key={j} style={{ color: '#fff' }}>{part}</strong>
              : part
          )}
        </span>
      );
    });

  return (
    <>
      {/* ─── Toggle Button ─── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(o => !o)}
        aria-label="Open AI assistant"
        style={{
          position: 'fixed', bottom: '1.75rem', right: '1.75rem', zIndex: 200,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--blue), var(--cyan))',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
          boxShadow: '0 6px 30px rgba(59,130,246,0.5)',
        }}
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--pink)', color: '#fff',
            borderRadius: '50%', width: 20, height: 20,
            fontSize: '0.7rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg)',
          }}>{unread}</span>
        )}
      </motion.button>

      {/* ─── Chat Window ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              position: 'fixed', bottom: '5.5rem', right: '1.75rem',
              width: 'min(420px, calc(100vw - 2rem))',
              height: 520,
              zIndex: 200,
              display: 'flex', flexDirection: 'column',
              background: 'rgba(8,12,20,0.96)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--border-hi)',
              borderRadius: 'var(--radius-2xl)',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.95), rgba(6,182,212,0.95))',
              padding: '1rem 1.25rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ fontSize: '1.4rem' }}>🤖</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>SkillGap AI</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                    Online · Your Career Assistant
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '1rem',
              display: 'flex', flexDirection: 'column', gap: '0.85rem',
            }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '1.1rem', flexShrink: 0, width: 28, textAlign: 'center' }}>
                    {m.role === 'user' ? USER_AVATAR : BOT_AVATAR}
                  </div>
                  <div style={{
                    maxWidth: '78%',
                    background: m.role === 'user'
                      ? 'linear-gradient(135deg, var(--blue), var(--cyan))'
                      : 'rgba(255,255,255,0.06)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                    borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '0.65rem 0.9rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    color: m.role === 'user' ? '#fff' : 'var(--muted)',
                  }}>
                    {renderText(m.text)}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '1.1rem' }}>{BOT_AVATAR}</div>
                  <div style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                    borderRadius: '18px 18px 18px 4px',
                    padding: '0.65rem 1rem', display: 'flex', gap: '5px', alignItems: 'center',
                  }}>
                    {[0, 1, 2].map(dot => (
                      <span key={dot} style={{
                        width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)',
                        display: 'inline-block',
                        animation: `dotBounce 1.2s ease ${dot * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div style={{ padding: '0 1rem 0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {QUICK_PROMPTS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    style={{
                      background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
                      color: 'var(--blue)', borderRadius: '9999px',
                      padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 500,
                      cursor: 'pointer', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(59,130,246,0.2)'}
                    onMouseLeave={e => e.target.style.background = 'rgba(59,130,246,0.1)'}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--border)',
              display: 'flex', gap: '0.5rem',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask about skills, roadmaps, projects..."
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)', borderRadius: '12px',
                  padding: '0.6rem 0.9rem', color: 'var(--text)',
                  fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                style={{
                  width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
                  background: input.trim() ? 'linear-gradient(135deg, var(--blue), var(--cyan))' : 'rgba(255,255,255,0.07)',
                  border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', transition: 'all 0.2s',
                  boxShadow: input.trim() ? '0 4px 16px rgba(59,130,246,0.4)' : 'none',
                }}
              >
                ➤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(1); opacity: 0.5; }
          40% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Chatbot;
