'use client';

import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2200);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    info: { bg: 'var(--accent)', color: '#fff' },
    success: { bg: '#2f9e44', color: '#fff' },
    error: { bg: '#c92a2a', color: '#fff' },
    warn: { bg: '#e8590c', color: '#fff' },
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
      className="toast fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl font-semibold z-[9999] flex items-center gap-2 shadow-lg"
      style={{ background: c.bg, color: c.color }}
    >
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}