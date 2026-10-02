'use client';

import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    info: { bg: 'var(--accent)', color: '#fff' },
    success: { bg: '#22c55e', color: '#fff' },
    error: { bg: '#ef4444', color: '#fff' },
    warn: { bg: '#eab308', color: '#1e1e2e' },
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warn: '⚠️',
  };

  const c = colors[type] || colors.info;

  return (
    <div
      className="toast fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-2xl font-semibold z-[9999] flex items-center gap-2 glass-strong"
      style={{
        background: c.bg,
        color: c.color,
        boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${c.bg}40`,
      }}
    >
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}