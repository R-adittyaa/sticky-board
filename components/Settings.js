'use client';

import { useEffect } from 'react';
import { translations, LANGUAGES } from './locales';

const BOARD_THEMES = [
  { id: 'cork', nameKey: 'cork', icon: '📌', preview: 'linear-gradient(135deg, #e6c9a0, #b8895a)' },
  { id: 'cream', nameKey: 'cream', icon: '📄', preview: 'linear-gradient(135deg, #faf0e1, #e8d4b8)' },
  { id: 'dark', nameKey: 'dark', icon: '🌙', preview: 'linear-gradient(135deg, #4a3728, #2b1d10)' },
];

const NOTE_SIZES = [
  { id: 'small', nameKey: 'small', icon: '▫️' },
  { id: 'medium', nameKey: 'medium', icon: '◻️' },
  { id: 'large', nameKey: 'large', icon: '⬜' },
];

export default function Settings({
  boardTheme, setBoardTheme,
  noteSize, setNoteSize,
  language, setLanguage,
  onClose,
  onResetData,
  noteCount,
  folderCount,
  pinnedCount,
}) {
  const t = translations[language];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] slide-in-right overflow-y-auto"
      style={{ background: 'var(--bg-panel)' }}
    >
      {/* Header — sticky */}
      <div
        className="sticky top-0 z-10 flex items-center gap-4 px-4 md:px-8 py-4 border-b"
        style={{
          background: 'var(--bg-panel-dark)',
          borderColor: 'var(--border)',
        }}
      >
        <button
          onClick={onClose}
          className="btn-ghost rounded-lg w-10 h-10 flex items-center justify-center text-base font-bold shrink-0"
          data-tooltip={t.back}
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h2
            className="text-lg md:text-xl font-bold truncate"
            style={{ color: 'var(--text)' }}
          >
            ⚙️ {t.settingsTitle}
          </h2>
          <p
            className="text-xs mt-0.5 truncate hidden md:block"
            style={{ color: 'var(--text-muted)' }}
          >
            {t.settingsSubtitle}
          </p>
        </div>
      </div>

      {/* Content — max width, center */}
      <div className="w-full flex justify-center px-4 md:px-8 py-6 md:py-10">
        <div className="w-full max-w-2xl flex flex-col gap-6">

          {/* ==== TEMA PAPAN ==== */}
          <section
            className="rounded-2xl p-5 md:p-6 border"
            style={{
              background: 'var(--bg-panel-dark)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-4">
              <h3
                className="text-base md:text-lg font-bold"
                style={{ color: 'var(--text)' }}
              >
                🎨 {t.boardTheme}
              </h3>
              <p
                className="text-xs md:text-sm mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {t.boardThemeDesc}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BOARD_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setBoardTheme(theme.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                    boardTheme === theme.id
                      ? 'ring-2 ring-[var(--accent)]'
                      : 'hover:bg-[var(--bg-hover)]'
                  }`}
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div
                    className="w-14 h-14 rounded-lg shadow-inner shrink-0"
                    style={{ background: theme.preview }}
                  />
                  <div className="text-left flex-1 min-w-0">
                    <div
                      className="text-sm font-bold truncate"
                      style={{ color: 'var(--text)' }}
                    >
                      {theme.icon} {t[theme.nameKey]}
                    </div>
                    {boardTheme === theme.id && (
                      <div
                        className="text-[10px] font-semibold mt-0.5"
                        style={{ color: 'var(--accent)' }}
                      >
                        ✓ Dipilih
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* ==== UKURAN NOTE ==== */}
          <section
            className="rounded-2xl p-5 md:p-6 border"
            style={{
              background: 'var(--bg-panel-dark)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-4">
              <h3
                className="text-base md:text-lg font-bold"
                style={{ color: 'var(--text)' }}
              >
                📐 {t.noteSize}
              </h3>
              <p
                className="text-xs md:text-sm mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {t.noteSizeDesc}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {NOTE_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setNoteSize(size.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition ${
                    noteSize === size.id
                      ? 'btn-accent'
                      : 'hover:bg-[var(--bg-hover)]'
                  }`}
                  style={noteSize !== size.id ? { borderColor: 'var(--border)' } : {}}
                >
                  <span className="text-2xl md:text-3xl">{size.icon}</span>
                  <span
                    className="text-xs md:text-sm font-bold"
                    style={{ color: noteSize === size.id ? '#fff' : 'var(--text)' }}
                  >
                    {t[size.nameKey]}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ==== BAHASA ==== */}
          <section
            className="rounded-2xl p-5 md:p-6 border"
            style={{
              background: 'var(--bg-panel-dark)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-4">
              <h3
                className="text-base md:text-lg font-bold"
                style={{ color: 'var(--text)' }}
              >
                🌐 {t.languageSection}
              </h3>
              <p
                className="text-xs md:text-sm mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {t.languageDesc}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition ${
                    language === lang.id
                      ? 'btn-accent'
                      : 'hover:bg-[var(--bg-hover)]'
                  }`}
                  style={language !== lang.id ? { borderColor: 'var(--border)' } : {}}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left flex-1 min-w-0">
                    <div
                      className="text-sm font-bold truncate"
                      style={{ color: language === lang.id ? '#fff' : 'var(--text)' }}
                    >
                      {lang.name}
                    </div>
                  </div>
                  {language === lang.id && <span className="text-xs text-white">✓</span>}
                </button>
              ))}
            </div>
          </section>

          {/* ==== STATISTIK ==== */}
          <section
            className="rounded-2xl p-5 md:p-6 border"
            style={{
              background: 'var(--bg-panel-dark)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-4">
              <h3
                className="text-base md:text-lg font-bold"
                style={{ color: 'var(--text)' }}
              >
                📊 {t.statistics}
              </h3>
              <p
                className="text-xs md:text-sm mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {t.statsDesc}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div
                className="p-4 rounded-xl border text-center"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: 'var(--accent)' }}
                >
                  {noteCount}
                </div>
                <div
                  className="text-[10px] md:text-xs mt-1 font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {t.totalNotes}
                </div>
              </div>
              <div
                className="p-4 rounded-xl border text-center"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: 'var(--accent)' }}
                >
                  {folderCount}
                </div>
                <div
                  className="text-[10px] md:text-xs mt-1 font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {t.totalFolders}
                </div>
              </div>
              <div
                className="p-4 rounded-xl border text-center"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: 'var(--accent)' }}
                >
                  {pinnedCount}
                </div>
                <div
                  className="text-[10px] md:text-xs mt-1 font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {t.pinnedNotes}
                </div>
              </div>
            </div>
          </section>

          {/* ==== DANGER ZONE ==== */}
          <section
            className="rounded-2xl p-5 md:p-6 border-2"
            style={{
              background: 'rgba(201, 74, 58, 0.05)',
              borderColor: 'rgba(201, 74, 58, 0.4)',
            }}
          >
            <div className="mb-4">
              <h3
                className="text-base md:text-lg font-bold"
                style={{ color: '#c94a3a' }}
              >
                ⚠️ {t.dangerZone}
              </h3>
              <p
                className="text-xs md:text-sm mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {t.dangerDesc}
              </p>
            </div>
            <button
              onClick={onResetData}
              className="w-full p-4 rounded-xl font-bold text-sm transition border-2 hover:bg-[rgba(201,74,58,0.1)]"
              style={{
                borderColor: '#c94a3a',
                color: '#c94a3a',
                background: 'transparent',
              }}
            >
              🗑️ {t.resetData}
            </button>
          </section>

          {/* Footer */}
          <div
            className="text-center text-xs py-4"
            style={{ color: 'var(--text-dim)' }}
          >
            📌 Pinboard • Made with ❤️
          </div>
        </div>
      </div>
    </div>
  );
}