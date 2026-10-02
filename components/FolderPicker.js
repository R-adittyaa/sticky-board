'use client';

import { useEffect, useRef, useState } from 'react';

const FOLDER_ICONS = [
  { emoji: '📁', name: 'Folder' },
  { emoji: '📌', name: 'Umum' },
  { emoji: '⭐', name: 'Penting' },
  { emoji: '💼', name: 'Kerja' },
  { emoji: '🎯', name: 'Target' },
  { emoji: '💡', name: 'Ide' },
  { emoji: '🔥', name: 'Prioritas' },
  { emoji: '❤️', name: 'Favorit' },
  { emoji: '🎨', name: 'Kreatif' },
  { emoji: '📚', name: 'Belajar' },
  { emoji: '🏠', name: 'Pribadi' },
  { emoji: '🎵', name: 'Hiburan' },
];

export default function FolderPicker({
  folders, current, onPick, onClose, onCreateFolder,
}) {
  const ref = useRef(null);
  const [mode, setMode] = useState('list');
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📁');

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const newId = onCreateFolder(name, newIcon);
    onPick(newId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
      <div
        ref={ref}
        className="rounded-2xl w-full max-w-md shadow-2xl modal-in overflow-hidden"
        style={{ background: 'var(--bg-panel)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {mode === 'list' ? '📁' : '➕'}
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>
                {mode === 'list' ? 'Pindah ke Folder' : 'Folder Baru'}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {mode === 'list' ? 'Pilih folder tujuan' : 'Ketik nama & pilih icon'}
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

        {mode === 'list' ? (
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <button
              onClick={() => setMode('create')}
              className="w-full flex items-center gap-3 p-3 rounded-xl mb-3 transition btn-accent"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-white/20">
                ➕
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm text-white">Bikin Folder Baru</div>
                <div className="text-xs mt-0.5 text-white/80">Ketik nama & pilih icon</div>
              </div>
              <span className="text-white text-sm">→</span>
            </button>

            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span
                className="text-[10px] font-bold tracking-widest"
                style={{ color: 'var(--text-dim)' }}
              >
                ATAU PILIH FOLDER
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            <button
              onClick={() => { onPick(null); onClose(); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition text-left border ${
                current === null ? 'btn-accent' : 'hover:bg-[var(--bg-hover)]'
              }`}
              style={current !== null ? { borderColor: 'var(--border)' } : {}}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ background: current === null ? 'rgba(255,255,255,0.2)' : 'var(--bg-panel-dark)' }}
              >
                🚫
              </div>
              <div className="flex-1">
                <div
                  className="font-semibold text-sm"
                  style={{ color: current === null ? '#fff' : 'var(--text)' }}
                >
                  Tanpa Folder
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: current === null ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}
                >
                  Lepas dari folder manapun
                </div>
              </div>
              {current === null && <span className="text-xs text-white">✓</span>}
            </button>

            {folders.map((f) => {
              const isActive = current === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => { onPick(f.id); onClose(); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition text-left border ${
                    isActive ? 'btn-accent' : 'hover:bg-[var(--bg-hover)]'
                  }`}
                  style={!isActive ? { borderColor: 'var(--border)' } : {}}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-panel-dark)' }}
                  >
                    {f.icon || '📁'}
                  </div>
                  <div className="flex-1">
                    <div
                      className="font-semibold text-sm"
                      style={{ color: isActive ? '#fff' : 'var(--text)' }}
                    >
                      {f.name}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: isActive ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}
                    >
                      Pindah ke folder ini
                    </div>
                  </div>
                  {isActive && <span className="text-xs text-white">✓</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-5">
            <div
              className="flex items-center gap-3 mb-4 p-3 rounded-xl"
              style={{ background: 'var(--bg-panel-dark)' }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ background: 'var(--bg-hover)' }}
              >
                {newIcon}
              </div>
              <div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Preview</div>
                <div className="font-bold" style={{ color: 'var(--text)' }}>
                  {newName || 'Nama folder...'}
                </div>
              </div>
            </div>

            <label
              className="block text-xs font-bold mb-2 tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              NAMA FOLDER
            </label>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              placeholder="Misal: Projek Penting"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-4"
              style={{
                background: 'var(--bg-panel-dark)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
            />

            <label
              className="block text-xs font-bold mb-2 tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              PILIH ICON
            </label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {FOLDER_ICONS.map(({ emoji, name }) => (
                <button
                  key={emoji}
                  onClick={() => setNewIcon(emoji)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition border ${
                    newIcon === emoji ? 'btn-accent' : 'hover:bg-[var(--bg-hover)]'
                  }`}
                  style={newIcon !== emoji ? { borderColor: 'var(--border)' } : {}}
                >
                  <span className="text-xl">{emoji}</span>
                  <span
                    className="text-[10px] mt-1 font-medium"
                    style={{ color: newIcon === emoji ? '#fff' : 'var(--text-muted)' }}
                  >
                    {name}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMode('list')}
                className="btn-ghost flex-1 py-3 rounded-xl text-sm font-semibold"
              >
                ← Kembali
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="btn-accent flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
              >
                Buat Folder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}