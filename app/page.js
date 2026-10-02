'use client';

import { useEffect, useState, useCallback } from 'react';
import Toolbar from '@/components/Toolbar';
import Toast from '@/components/Toast';
import Sidebar from '@/components/Sidebar';
import StickyNote from '@/components/StickyNote';
import NoteFullPage from '@/components/NoteFullPage';
import Settings from '@/components/Settings';
import { translations } from '@/components/locales';

const NOTE_COLORS = ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'];
const PIN_COLORS = ['', 'pin-blue', 'pin-green', 'pin-purple', 'pin-orange', 'pin-pink', 'pin-teal'];

const DEFAULT_FOLDER = { id: 'default', name: 'Umum', icon: '📌' };

let uidCounter = 0;
const uid = () => {
  uidCounter += 1;
  return `${Date.now().toString(36)}-${uidCounter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([DEFAULT_FOLDER]);
  const [activeFolder, setActiveFolder] = useState('all');
  const [search, setSearch] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [toast, setToast] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dragNoteId, setDragNoteId] = useState(null);
  const [openNoteId, setOpenNoteId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // ============ SETTINGS ============
  const [boardTheme, setBoardTheme] = useState('cork');
  const [noteSize, setNoteSize] = useState('medium');
  const [language, setLanguage] = useState('id');

  // Translation helper
  const t = translations[language] || translations.id;

  // ============ LOAD ============
  useEffect(() => {
    try {
      const savedNotes = JSON.parse(localStorage.getItem('sticky-notes') || '[]');
      const notesArr = Array.isArray(savedNotes) ? savedNotes : [];

      const seenIds = new Set();
      const fixedNotes = notesArr.map((n) => {
        let id = n.id;
        if (!id || seenIds.has(id)) id = uid();
        seenIds.add(id);
        return {
          id,
          text: n.text || '',
          color: n.color && NOTE_COLORS.includes(n.color) ? n.color : NOTE_COLORS[0],
          pinColor: n.pinColor || PIN_COLORS[0],
          pinned: !!n.pinned,
          folderId: n.folderId || 'default',
        };
      });

      setNotes(fixedNotes);

      const savedFolders = JSON.parse(localStorage.getItem('sticky-folders') || 'null');
      const foldersArr =
        savedFolders && Array.isArray(savedFolders) && savedFolders.length > 0
          ? savedFolders
          : [DEFAULT_FOLDER];

      const seenFolderIds = new Set();
      const fixedFolders = foldersArr.map((f) => {
        let id = f.id;
        if (!id || seenFolderIds.has(id)) id = uid();
        seenFolderIds.add(id);
        return { ...f, id };
      });

      setFolders(fixedFolders);
      setSidebarCollapsed(localStorage.getItem('sticky-sidebar') === 'true');
      setBoardTheme(localStorage.getItem('pinboard-theme') || 'cork');
      setNoteSize(localStorage.getItem('pinboard-size') || 'medium');
      setLanguage(localStorage.getItem('pinboard-language') || 'id');
    } catch {
      setNotes([]);
    }
    setLoaded(true);
  }, []);

  // ============ SAVE ============
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('sticky-notes', JSON.stringify(notes));
  }, [notes, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('sticky-folders', JSON.stringify(folders));
  }, [folders, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('sticky-sidebar', sidebarCollapsed);
  }, [sidebarCollapsed, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('pinboard-theme', boardTheme);
  }, [boardTheme, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('pinboard-size', noteSize);
  }, [noteSize, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('pinboard-language', language);
  }, [language, loaded]);

  // Auto-add note
  useEffect(() => {
    if (loaded && notes.length === 0) addNote();
    // eslint-disable-next-line
  }, [loaded]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: uid() });
  }, []);

  // ============ NOTE ACTIONS ============
  const addNote = useCallback(() => {
    const folderId = activeFolder === 'all' ? 'default' : activeFolder;
    const newNote = {
      id: uid(),
      text: '',
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      pinColor: PIN_COLORS[Math.floor(Math.random() * PIN_COLORS.length)],
      pinned: false,
      folderId,
    };
    setNotes((prev) => [...prev, newNote]);
    showToast(translations[language]?.noteCreated || 'Note baru dibuat', 'success');
  }, [activeFolder, showToast, language]);

  const updateNote = useCallback((id, patch) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target) {
        setUndoStack((stack) => [
          ...stack,
          { note: target, index: prev.indexOf(target) },
        ]);
      }
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  const undoDelete = useCallback(() => {
    setUndoStack((stack) => {
      if (stack.length === 0) {
        showToast(t.nothingToUndo, 'warn');
        return stack;
      }
      const last = stack[stack.length - 1];
      setNotes((prev) => {
        const copy = [...prev];
        copy.splice(last.index, 0, last.note);
        return copy;
      });
      showToast(t.noteRestored, 'success');
      return stack.slice(0, -1);
    });
  }, [showToast, t]);

  // ============ IMPORT / EXPORT ============
  const exportNotes = () => {
    const blob = new Blob(
      [JSON.stringify({ notes, folders }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pinboard-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t.notesExported, 'success');
  };

  const importNotes = (data) => {
    if (!confirm('Import bakal nge-replace notes yang ada. Lanjut?')) return;
    const arr = Array.isArray(data) ? data : data.notes;
    if (!Array.isArray(arr)) {
      showToast('Format file salah!', 'error');
      return;
    }
    const normalized = arr.map((n) => ({
      id: uid(),
      text: n.text || '',
      color: n.color && NOTE_COLORS.includes(n.color) ? n.color : NOTE_COLORS[0],
      pinColor: n.pinColor || PIN_COLORS[0],
      pinned: !!n.pinned,
      folderId: n.folderId || 'default',
    }));
    setNotes(normalized);
    if (data.folders && Array.isArray(data.folders)) {
      setFolders(data.folders.map((f) => ({ ...f, id: f.id || uid() })));
    }
    setUndoStack([]);
    showToast(`${normalized.length} ${t.notesImported}`, 'success');
  };

  // ============ FOLDER ============
  const addFolder = useCallback((name, icon = '📁') => {
    const newFolder = { id: uid(), name, icon };
    setFolders((prev) => [...prev, newFolder]);
    showToast(`${t.folderCreated}: "${name}"`, 'success');
    return newFolder.id;
  }, [showToast, t]);

  const deleteFolder = useCallback((id) => {
    if (id === 'default') return;
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setNotes((prev) =>
      prev.map((n) => (n.folderId === id ? { ...n, folderId: 'default' } : n))
    );
    setActiveFolder((cur) => (cur === id ? 'all' : cur));
    showToast(t.folderDeleted, 'success');
  }, [showToast, t]);

  const handleDropNote = useCallback((noteId, folderId) => {
    updateNote(noteId, { folderId });
    const f = folders.find((x) => x.id === folderId);
    showToast(`${t.noteMoved} ${f?.name || 'folder'}`, 'success');
    setDragNoteId(null);
  }, [folders, updateNote, showToast, t]);

  // ============ RESET ============
  const resetData = () => {
    if (!confirm(t.resetConfirm1)) return;
    if (!confirm(t.resetConfirm2)) return;

    setNotes([]);
    setFolders([DEFAULT_FOLDER]);
    setUndoStack([]);
    localStorage.removeItem('sticky-notes');
    localStorage.removeItem('sticky-folders');

    // Bikin note default
    setTimeout(() => {
      const newNote = {
        id: uid(),
        text: '',
        color: NOTE_COLORS[0],
        pinColor: PIN_COLORS[0],
        pinned: false,
        folderId: 'default',
      };
      setNotes([newNote]);
    }, 100);

    setShowSettings(false);
    showToast(t.resetSuccess, 'success');
  };

  // ============ KEYBOARD ============
  useEffect(() => {
    const onKey = (e) => {
      if (openNoteId || showSettings) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undoDelete();
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        const el = document.activeElement;
        const isTyping =
          el?.isContentEditable || el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA';
        if (!isTyping) {
          e.preventDefault();
          addNote();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undoDelete, addNote, openNoteId, showSettings]);

  // ============ FILTER ============
  const filtered = notes.filter((n) => {
    const text = (n.text || '').toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchFolder = activeFolder === 'all' || n.folderId === activeFolder;
    return matchSearch && matchFolder;
  });

  const noteCounts = { all: notes.length };
  folders.forEach((f) => {
    noteCounts[f.id] = notes.filter((n) => n.folderId === f.id).length;
  });

  const openNote = notes.find((n) => n.id === openNoteId);
  const pinnedCount = notes.filter((n) => n.pinned).length;

  if (!loaded) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: 'var(--cork-base)', color: 'var(--text)' }}
      >
        Loading...
      </div>
    );
  }

  // Build board theme class
  const boardClass =
    boardTheme === 'cork' ? '' : boardTheme === 'cream' ? 'board-cream' : 'board-dark';

  // Build size class
  const sizeClass =
    noteSize === 'small' ? 'size-small' : noteSize === 'large' ? 'size-large' : 'size-medium';

  return (
    <div className={`flex flex-col h-screen ${boardClass} ${sizeClass}`}>
      <Toolbar
        search={search}
        setSearch={setSearch}
        onAdd={addNote}
        onExport={exportNotes}
        onImport={importNotes}
        onUndo={undoDelete}
        canUndo={undoStack.length > 0}
        noteCount={notes.length}
        onToggleSidebar={() => setSidebarCollapsed((s) => !s)}
        onOpenSettings={() => setShowSettings(true)}
        language={language}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          folders={folders}
          activeFolder={activeFolder}
          onSelectFolder={setActiveFolder}
          onAddFolder={addFolder}
          onDeleteFolder={deleteFolder}
          noteCounts={noteCounts}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((s) => !s)}
          onDropNote={handleDropNote}
          dragNoteId={dragNoteId}
          language={language}
        />

        <main className="corkboard relative flex-1 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="empty-board absolute inset-0">
              <div className="text-7xl opacity-40">📌</div>
              <div className="text-xl font-semibold">
                {search ? `${t.searchNoResult} "${search}"` : t.emptyBoard}
              </div>
              <div className="text-sm">
                {t.pressN}{' '}
                <kbd className="px-2 py-1 rounded bg-black/10 font-bold">N</kbd>{' '}
                {t.orClick} "+ Note"
              </div>
            </div>
          ) : (
            <div className="board-grid">
              {filtered.map((note) => (
                <StickyNote
                  key={note.id}
                  note={note}
                  onClick={() => setOpenNoteId(note.id)}
                  language={language}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {openNote && (
        <NoteFullPage
          note={openNote}
          folders={folders}
          onUpdate={updateNote}
          onDelete={deleteNote}
          onClose={() => setOpenNoteId(null)}
          language={language}
        />
      )}

      {showSettings && (
        <Settings
          boardTheme={boardTheme}
          setBoardTheme={setBoardTheme}
          noteSize={noteSize}
          setNoteSize={setNoteSize}
          language={language}
          setLanguage={setLanguage}
          onClose={() => setShowSettings(false)}
          onResetData={resetData}
          noteCount={notes.length}
          folderCount={folders.length}
          pinnedCount={pinnedCount}
        />
      )}

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}