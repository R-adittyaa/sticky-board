'use client';

import { useRef, useState } from 'react';
import { translations } from './locales';

export default function Toolbar({
  search, setSearch, onAdd,
  onExport, onImport, onUndo, canUndo,
  noteCount, onToggleSidebar,
  onOpenSettings,
  language,
}) {
  const t = translations[language];
  const fileRef = useRef(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleImportClick = () => fileRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data) || data.notes) onImport(data);
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
      className="flex gap-2 px-3 md:px-5 items-center border-b z-50 relative shrink-0"
      style={{
        height: '60px',
        background: 'var(--bg-panel)',
        borderColor: 'var(--border)',
      }}
    >
      <button
        onClick={onToggleSidebar}
        className="btn-ghost rounded-lg w-9 h-9 flex items-center justify-center shrink-0"
        data-tooltip={t.sidebar}
      >
        ☰
      </button>

      <div className="flex items-center gap-2 mr-auto min-w-0">
        <h1
          className="text-base md:text-lg font-bold truncate"
          style={{ color: 'var(--text)' }}
        >
          📌 <span className="hidden sm:inline">{t.appName}</span>
        </h1>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
        >
          {noteCount}
        </span>
      </div>

      {/* Search — desktop */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t.searchPlaceholder}
        className="hidden md:block px-3 py-2 rounded-lg outline-none w-56 text-sm transition"
        style={{
          background: 'var(--bg-panel-dark)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
      />

      {/* Search toggle — mobile */}
      <button
        onClick={() => setShowMobileSearch((s) => !s)}
        className="btn-ghost rounded-lg w-9 h-9 flex items-center justify-center md:hidden shrink-0"
        data-tooltip={t.search}
      >
        🔍
      </button>

      {/* Group actions */}
      <div
        className="hidden sm:flex items-center gap-1 rounded-xl p-1"
        style={{ background: 'var(--bg-panel-dark)' }}
      >
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`rounded-lg w-9 h-9 flex items-center justify-center text-sm transition ${
            canUndo ? 'hover:bg-[var(--bg-hover)]' : 'opacity-30 cursor-not-allowed'
          }`}
          data-tooltip={t.undo}
          style={{ color: 'var(--text)' }}
        >
          ↩️
        </button>
        <button
          onClick={onExport}
          className="rounded-lg w-9 h-9 flex items-center justify-center text-sm transition hover:bg-[var(--bg-hover)]"
          data-tooltip={t.export}
          style={{ color: 'var(--text)' }}
        >
          📤
        </button>
        <button
          onClick={handleImportClick}
          className="rounded-lg w-9 h-9 flex items-center justify-center text-sm transition hover:bg-[var(--bg-hover)]"
          data-tooltip={t.import}
          style={{ color: 'var(--text)' }}
        >
          📥
        </button>
        <button
          onClick={onOpenSettings}
          className="rounded-lg w-9 h-9 flex items-center justify-center text-sm transition hover:bg-[var(--bg-hover)]"
          data-tooltip={t.settings}
          style={{ color: 'var(--text)' }}
        >
          ⚙️
        </button>
      </div>

      {/* Settings — mobile */}
      <button
        onClick={onOpenSettings}
        className="btn-ghost rounded-lg w-9 h-9 flex items-center justify-center sm:hidden shrink-0"
        data-tooltip={t.settings}
      >
        ⚙️
      </button>

      {/* Add button */}
      <button
        onClick={onAdd}
        className="btn-accent rounded-lg px-3 md:px-4 h-9 flex items-center justify-center text-sm font-semibold shrink-0"
        data-tooltip={t.addNote}
      >
        <span className="md:hidden">+</span>
        <span className="hidden md:inline">+ {t.note}</span>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {showMobileSearch && (
        <div
          className="absolute top-full left-0 right-0 p-3 border-b md:hidden slide-up"
          style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}
        >
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full px-3 py-2 rounded-lg outline-none text-sm"
            style={{
              background: 'var(--bg-panel-dark)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />
        </div>
      )}
    </header>
  );
}