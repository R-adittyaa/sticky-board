'use client';

import { useRef } from 'react';

export default function Toolbar({
  search, setSearch, onAdd,
  onExport, onImport, onUndo, canUndo,
  theme, toggleTheme,
  grid, toggleGrid,
  noteCount,
  onToggleSidebar,
}) {
  const fileRef = useRef(null);

  const handleImportClick = () => fileRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) onImport(data);
        else alert('Format file salah bro!');
      } catch {
        alert('File JSON gak valid!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header
      className="glass-strong flex flex-wrap gap-2 md:gap-3 px-3 md:px-6 py-3 items-center z-50 relative"
      style={{ height: '64px' }}
    >
      <button
        onClick={onToggleSidebar}
        className="btn-ghost rounded-lg w-9 h-9 flex items-center justify-center"
        title="Toggle sidebar"
      >
        ☰
      </button>

      <h1 className="text-base md:text-xl font-bold mr-auto flex items-center gap-2 glow-text">
        🎨 Sticky Board
        <span
          className="text-xs font-normal px-2 py-0.5 rounded-full"
          style={{
            background: 'var(--bg-hover)',
            color: 'var(--text-muted)',
          }}
        >
          {noteCount}
        </span>
      </h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Cari..."
        className="px-3 py-2 rounded-lg outline-none w-32 md:w-60 text-sm transition"
        style={{
          background: 'var(--bg-main)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
      />

      {/* Theme toggle - RED/BLUE */}
      <button
        onClick={toggleTheme}
        title="Ganti tema"
        className="btn-ghost rounded-lg px-3 py-2 text-sm font-bold flex items-center gap-2"
      >
        {theme === 'blue' ? (
          <>
            <span className="w-3 h-3 rounded-full" style={{ background: '#4a7fff', boxShadow: '0 0 10px #4a7fff' }} />
            <span className="hidden md:inline">Blue</span>
          </>
        ) : (
          <>
            <span className="w-3 h-3 rounded-full" style={{ background: '#ff4a6b', boxShadow: '0 0 10px #ff4a6b' }} />
            <span className="hidden md:inline">Red</span>
          </>
        )}
      </button>

      <button
        onClick={toggleGrid}
        title="Grid"
        className="btn-ghost rounded-lg px-3 py-2 text-sm"
      >
        {grid ? '🔲' : '⬜'}
      </button>

      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
          canUndo ? 'btn-accent' : 'btn-ghost opacity-40 cursor-not-allowed'
        }`}
      >
        ↩️
      </button>

      <button
        onClick={onExport}
        title="Export"
        className="btn-ghost rounded-lg px-3 py-2 text-sm"
      >
        📤
      </button>

      <button
        onClick={handleImportClick}
        title="Import"
        className="btn-ghost rounded-lg px-3 py-2 text-sm"
      >
        📥
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={onAdd}
        title="Note baru (N)"
        className="btn-accent rounded-lg px-4 py-2 text-sm"
      >
        + Note
      </button>
    </header>
  );
}