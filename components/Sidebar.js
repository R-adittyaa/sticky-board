'use client';

import { useState } from 'react';

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

export default function Sidebar({
  folders, activeFolder, onSelectFolder, onAddFolder, onDeleteFolder,
  noteCounts, collapsed, onToggleCollapse, onDropNote, dragNoteId,
}) {
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📁');
  const [dragOverFolder, setDragOverFolder] = useState(null);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    if (folders.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      alert('Folder udah ada bro!');
      return;
    }
    onAddFolder(name, newIcon);
    setNewName('');
    setNewIcon('📁');
    setShowInput(false);
  };

  const handleDragOver = (e, folderId) => {
    if (!dragNoteId) return;
    e.preventDefault();
    setDragOverFolder(folderId);
  };

  const handleDragLeave = () => setDragOverFolder(null);

  const handleDrop = (e, folderId) => {
    e.preventDefault();
    setDragOverFolder(null);
    if (dragNoteId && onDropNote) onDropNote(dragNoteId, folderId);
  };

  return (
    <aside
      className={`glass-strong flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      style={{ height: 'calc(100vh - 64px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        {!collapsed && (
          <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--text-muted)' }}>
            FOLDERS
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="btn-ghost rounded-lg w-7 h-7 flex items-center justify-center text-xs ml-auto"
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => onSelectFolder('all')}
          onDragOver={(e) => handleDragOver(e, 'all')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'default')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition ${
            activeFolder === 'all' ? 'btn-accent' : 'hover:bg-[var(--bg-hover)]'
          } ${dragOverFolder === 'all' ? 'ring-2 ring-[var(--accent)]' : ''}`}
        >
          <span className="text-lg">🗂️</span>
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-sm font-medium">Semua Notes</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(0,0,0,0.2)' }}>
                {noteCounts.all || 0}
              </span>
            </>
          )}
        </button>

        {folders.map((f) => (
          <div key={f.id} className="group relative">
            <button
              onClick={() => onSelectFolder(f.id)}
              onDragOver={(e) => handleDragOver(e, f.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, f.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition ${
                activeFolder === f.id ? 'btn-accent' : 'hover:bg-[var(--bg-hover)]'
              } ${
                dragOverFolder === f.id ? 'ring-2 ring-[var(--accent)] bg-[var(--bg-hover)] scale-[1.02]' : ''
              }`}
            >
              <span className="text-lg">{f.icon || '📁'}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 text-left text-sm font-medium truncate">{f.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    {noteCounts[f.id] || 0}
                  </span>
                </>
              )}
            </button>
            {!collapsed && f.id !== 'default' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Hapus folder "${f.name}"?`)) onDeleteFolder(f.id);
                }}
                className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-red-500/80 hover:bg-red-500 text-white w-6 h-6 rounded-full text-xs transition"
              >
                ✖
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
        {showInput && !collapsed ? (
          <div className="flex flex-col gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-main)' }}>
            <label className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
              PILIH ICON
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {FOLDER_ICONS.map(({ emoji, name }) => (
                <button
                  key={emoji}
                  onClick={() => setNewIcon(emoji)}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition border ${
                    newIcon === emoji ? 'btn-accent' : 'hover:bg-[var(--bg-hover)]'
                  }`}
                  style={newIcon !== emoji ? { borderColor: 'var(--border)' } : {}}
                  title={name}
                >
                  <span className="text-base">{emoji}</span>
                  <span
                    className="text-[8px] mt-0.5 font-medium"
                    style={{ color: newIcon === emoji ? '#fff' : 'var(--text-muted)' }}
                  >
                    {name}
                  </span>
                </button>
              ))}
            </div>

            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') { setShowInput(false); setNewName(''); }
              }}
              placeholder="Nama folder..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: 'var(--bg-deep)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
            />

            <div className="flex gap-1">
              <button onClick={handleAdd} className="btn-accent flex-1 py-2 rounded-lg text-sm font-semibold">
                Buat
              </button>
              <button
                onClick={() => { setShowInput(false); setNewName(''); }}
                className="btn-ghost px-3 py-2 rounded-lg text-sm"
              >
                ✖
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="btn-ghost w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium"
          >
            <span className="text-lg">➕</span>
            {!collapsed && <span>Folder Baru</span>}
          </button>
        )}
      </div>
    </aside>
  );
}