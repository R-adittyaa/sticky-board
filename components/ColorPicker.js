'use client';

import { useEffect, useRef } from 'react';

const COLORS = [
  '#f9e2af', '#a6e3a1', '#f5c2e7', '#89dceb',
  '#fab387', '#cba6f7', '#f38ba8', '#94e2d5',
  '#f2cdcd', '#b4befe', '#eba0ac', '#f5e0dc',
];

export default function ColorPicker({ current, onPick, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div
        ref={ref}
        className="glass-strong rounded-2xl w-full max-w-sm shadow-2xl modal-in overflow-hidden"
      >
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              🎨
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>
                Pilih Warna
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Klik warna buat ganti
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-sm"
          >
            ✖
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-6 gap-3">
            {COLORS.map((c, i) => (
              <button
                key={i}
                onClick={() => { onPick(c); onClose(); }}
                style={{
                  background: c,
                  boxShadow:
                    current === c
                      ? `0 0 0 3px var(--accent), 0 0 20px ${c}`
                      : '0 4px 10px rgba(0,0,0,0.3)',
                }}
                className="w-10 h-10 rounded-xl hover:scale-110 transition-transform"
                title={c}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}