'use client';

import { useEffect, useRef, useState } from 'react';

const NOTE_COLORS = [
  { id: 'yellow', name: 'Kuning', bg: '#fef3a7' },
  { id: 'blue', name: 'Biru', bg: '#c5e8ff' },
  { id: 'green', name: 'Hijau', bg: '#c8f7c5' },
  { id: 'pink', name: 'Pink', bg: '#ffd6e0' },
  { id: 'purple', name: 'Ungu', bg: '#e0d4ff' },
  { id: 'orange', name: 'Oranye', bg: '#ffd9a8' },
];

const PIN_COLORS = [
  { id: '', name: 'Merah', cls: '' },
  { id: 'pin-blue', name: 'Biru', cls: 'pin-blue' },
  { id: 'pin-green', name: 'Hijau', cls: 'pin-green' },
  { id: 'pin-purple', name: 'Ungu', cls: 'pin-purple' },
  { id: 'pin-orange', name: 'Oranye', cls: 'pin-orange' },
  { id: 'pin-pink', name: 'Pink', cls: 'pin-pink' },
  { id: 'pin-teal', name: 'Teal', cls: 'pin-teal' },
];

export default function NoteFullPage({ note, onUpdate, onClose, folders, onDelete }) {
  const contentRef = useRef(null);
  const [showColors, setShowColors] = useState(false);
  const [showPins, setShowPins] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (el.innerHTML !== note.text) el.innerHTML = note.text || '';
  }, [note.text]);

  // ESC buat close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        // Blur contenteditable dulu biar gak keluar saat ngetik
        if (document.activeElement?.isContentEditable) {
          document.activeElement.blur();
        }
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const bgColor = NOTE_COLORS.find((c) => c.id === note.color)?.bg || '#fef3a7';
  const pinClass = note.pinColor || '';
  const currentFolder = folders.find((f) => f.id === note.folderId);

  return (
    <div className="fixed inset-0 z-[100] slide-in-right" style={{ background: bgColor }}>
      {/* TOP BAR */}
      <div
        className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-6 z-10"
        style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="btn-ghost rounded-lg w-9 h-9 flex items-center justify-center text-sm"
            data-tooltip="Tutup (ESC)"
          >
            ←
          </button>
          <div className="flex items-center gap-2">
            {currentFolder && (
              <span
                className="text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{ background: 'rgba(43, 29, 16, 0.1)', color: '#2b1d10' }}
              >
                {currentFolder.icon} {currentFolder.name}
              </span>
            )}
            {note.pinned && (
              <span
                className="text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{ background: 'rgba(201, 74, 58, 0.15)', color: '#c94a3a' }}
              >
                📌 Disematkan
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Color picker */}
          <div className="relative">
            <button
              onClick={() => { setShowColors((s) => !s); setShowPins(false); }}
              className="btn-ghost rounded-lg w-9 h-9 flex items-center justify-center text-sm"
              data-tooltip="Warna kertas"
            >
              🎨
            </button>
            {showColors && (
              <div
                className="absolute top-12 right-0 p-3 rounded-xl shadow-lg grid grid-cols-3 gap-2 z-20"
                style={{ background: 'var(--bg-panel)' }}
              >
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onUpdate(note.id, { color: c.id });
                      setShowColors(false);
                    }}
                    style={{ background: c.bg }}
                    className={`w-10 h-10 rounded-lg transition ${
                      note.color === c.id ? 'ring-2 ring-[var(--accent)] scale-110' : 'hover:scale-110'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pin picker */}
          <div className="relative">
            <button
              onClick={() => { setShowPins((s) => !s); setShowColors(false); }}
              className="btn-ghost rounded-lg w-9 h-9 flex items-center justify-center text-sm"
              data-tooltip="Warna pin"
            >
              📌
            </button>
            {showPins && (
              <div
                className="absolute top-12 right-0 p-3 rounded-xl shadow-lg grid grid-cols-4 gap-2 z-20 w-56"
                style={{ background: 'var(--bg-panel)' }}
              >
                {PIN_COLORS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onUpdate(note.id, { pinColor: p.cls });
                      setShowPins(false);
                    }}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition ${
                      note.pinColor === p.cls ? 'bg-[var(--bg-hover)] ring-2 ring-[var(--accent)]' : 'hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div className={`sticky-pin ${p.cls}`} style={{ position: 'relative', top: 0, left: 0, transform: 'none', height: 24 }} />
                    <span className="text-[9px] font-semibold">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pin toggle */}
          <button
            onClick={() => onUpdate(note.id, { pinned: !note.pinned })}
            className="btn-ghost rounded-lg w-9 h-9 flex items-center justify-center text-sm"
            data-tooltip={note.pinned ? 'Lepas semat' : 'Sematkan'}
          >
            {note.pinned ? '📍' : '📌'}
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              if (confirm('Hapus note ini?')) {
                onDelete(note.id);
                onClose();
              }
            }}
            className="btn-ghost rounded-lg w-9 h-9 flex items-center justify-center text-sm"
            style={{ color: '#c94a3a' }}
            data-tooltip="Hapus"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* PIN BESAR di atas */}
      <div className={`sticky-pin ${pinClass}`} style={{ top: 10, width: 32, height: 32 }} />

      {/* CONTENT */}
      <div className="full-page-note paper-texture">
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onUpdate(note.id, { text: e.target.innerHTML })}
          className="full-page-content"
          style={{ marginTop: '20px' }}
        />
      </div>
    </div>
  );
}