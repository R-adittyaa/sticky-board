'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Note from '@/components/Note';
import Toolbar from '@/components/Toolbar';
import Toast from '@/components/Toast';
import Sidebar from '@/components/Sidebar';

const COLORS = [
  '#f9e2af', '#a6e3a1', '#f5c2e7', '#89dceb',
  '#fab387', '#cba6f7', '#f38ba8', '#94e2d5',
];

const DEFAULT_FOLDER = { id: 'default', name: 'Umum', icon: '📌' };

// ============ UID UNIK (anti-tabrakan) ============
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
  const [theme, setTheme] = useState('blue');
  const [grid, setGrid] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dragNoteId, setDragNoteId] = useState(null);
  const topZ = useRef(1);

  // ============ LOAD ============
  useEffect(() => {
    try {
      const savedNotes = JSON.parse(localStorage.getItem('sticky-notes') || '[]');
      const notesArr = Array.isArray(savedNotes) ? savedNotes : [];

      // 🔧 FIX: pastikan semua note punya ID unik
      const seenIds = new Set();
      const fixedNotes = notesArr.map((n) => {
        let id = n.id;
        if (!id || seenIds.has(id)) {
          id = uid();
        }
        seenIds.add(id);
        return { ...n, id };
      });

      setNotes(fixedNotes);

      const savedFolders = JSON.parse(localStorage.getItem('sticky-folders') || 'null');
      const foldersArr =
        savedFolders && Array.isArray(savedFolders) && savedFolders.length > 0
          ? savedFolders
          : [DEFAULT_FOLDER];

      // 🔧 FIX: pastikan folder ID unik juga
      const seenFolderIds = new Set();
      const fixedFolders = foldersArr.map((f) => {
        let id = f.id;
        if (!id || seenFolderIds.has(id)) {
          id = uid();
        }
        seenFolderIds.add(id);
        return { ...f, id };
      });

      setFolders(fixedFolders);
      setTheme(localStorage.getItem('sticky-theme') || 'blue');
      const savedGrid = localStorage.getItem('sticky-grid');
      setGrid(savedGrid === null ? true : savedGrid === 'true');
      setSidebarCollapsed(localStorage.getItem('sticky-sidebar') === 'true');
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
    localStorage.setItem('sticky-theme', theme);
    document.documentElement.classList.toggle('theme-red', theme === 'red');
  }, [theme, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('sticky-grid', grid);
  }, [grid, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('sticky-sidebar', sidebarCollapsed);
  }, [sidebarCollapsed, loaded]);

  // ============ TOAST ============
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: uid() });
  }, []);

  // ============ NOTE ACTIONS ============
  const addNote = useCallback(() => {
    const folderId = activeFolder === 'all' ? 'default' : activeFolder;
    const newNote = {
      id: uid(),
      text: '',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      x: Math.random() * Math.max(100, window.innerWidth - 400),
      y: Math.random() * Math.max(100, window.innerHeight - 300),
      w: 220,
      h: 180,
      pinned: false,
      folderId,
      z: ++topZ.current,
    };
    setNotes((prev) => [...prev, newNote]);
  }, [activeFolder]);

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
        showToast('Gak ada yang bisa di-undo', 'warn');
        return stack;
      }
      const last = stack[stack.length - 1];
      setNotes((prev) => {
        const copy = [...prev];
        copy.splice(last.index, 0, last.note);
        return copy;
      });
      showToast('Note dikembalikan', 'success');
      return stack.slice(0, -1);
    });
  }, [showToast]);

  const bringFront = useCallback((id) => {
    const z = ++topZ.current;
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, z } : n)));
  }, []);

  // ============ AUTO CREATE NOTE ============
  useEffect(() => {
    if (loaded && notes.length === 0) {
      addNote();
    }
    // eslint-disable-next-line
  }, [loaded]);

  // ============ IMPORT / EXPORT ============
  const exportNotes = () => {
    const blob = new Blob(
      [JSON.stringify({ notes, folders }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sticky-notes-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Notes ke-export', 'success');
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
      color: n.color || COLORS[0],
      x: n.x ?? 100,
      y: n.y ?? 100,
      w: n.w || 220,
      h: n.h || 180,
      pinned: !!n.pinned,
      folderId: n.folderId || 'default',
      z: ++topZ.current,
    }));
    setNotes(normalized);
    if (data.folders && Array.isArray(data.folders)) {
      setFolders(
        data.folders.map((f) => ({ ...f, id: f.id || uid() }))
      );
    }
    setUndoStack([]);
    showToast(`${normalized.length} notes ke-import`, 'success');
  };

  // ============ FOLDER ACTIONS ============
  const addFolder = useCallback((name, icon = '📁') => {
    const newFolder = { id: uid(), name, icon };
    setFolders((prev) => [...prev, newFolder]);
    showToast(`Folder "${name}" dibuat`, 'success');
    return newFolder.id;
  }, [showToast]);

  const deleteFolder = useCallback((id) => {
    if (id === 'default') return;
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setNotes((prev) =>
      prev.map((n) => (n.folderId === id ? { ...n, folderId: 'default' } : n))
    );
    setActiveFolder((cur) => (cur === id ? 'all' : cur));
    showToast('Folder dihapus', 'success');
  }, [showToast]);

  const handleDropNote = useCallback((noteId, folderId) => {
    updateNote(noteId, { folderId });
    const f = folders.find((x) => x.id === folderId);
    showToast(`Note dipindah ke ${f?.name || 'folder'}`, 'success');
    setDragNoteId(null);
  }, [folders, updateNote, showToast]);

  // ============ KEYBOARD ============
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undoDelete();
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        const el = document.activeElement;
        const isTyping =
          el?.isContentEditable ||
          el?.tagName === 'INPUT' ||
          el?.tagName === 'TEXTAREA';
        if (!isTyping) {
          e.preventDefault();
          addNote();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undoDelete, addNote]);

  // ============ FILTER ============
  const filtered = notes.filter((n) => {
    const matchSearch = (n.text || '').toLowerCase().includes(search.toLowerCase());
    const matchFolder = activeFolder === 'all' || n.folderId === activeFolder;
    return matchSearch && matchFolder;
  });

  // ============ NOTE COUNTS ============
  const noteCounts = { all: notes.length };
  folders.forEach((f) => {
    noteCounts[f.id] = notes.filter((n) => n.folderId === f.id).length;
  });

  if (!loaded) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ color: 'var(--text-muted)' }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-deep)' }}>
      <Toolbar
        search={search}
        setSearch={setSearch}
        onAdd={addNote}
        onExport={exportNotes}
        onImport={importNotes}
        onUndo={undoDelete}
        canUndo={undoStack.length > 0}
        theme={theme}
        toggleTheme={() => setTheme((t) => (t === 'blue' ? 'red' : 'blue'))}
        grid={grid}
        toggleGrid={() => setGrid((g) => !g)}
        noteCount={notes.length}
        onToggleSidebar={() => setSidebarCollapsed((s) => !s)}
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
        />

        <main className={`relative flex-1 overflow-hidden ${grid ? 'grid-bg' : 'no-grid'}`}>
          {filtered.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-4">
              <div className="text-7xl opacity-20">📝</div>
              <div className="text-xl" style={{ color: 'var(--text-muted)' }}>
                {search ? `Gak ada note yang cocok sama "${search}"` : 'Folder ini kosong'}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Tekan{' '}
                <kbd className="px-2 py-1 rounded" style={{ background: 'var(--bg-hover)' }}>
                  N
                </kbd>{' '}
                atau klik "+ Note"
              </div>
            </div>
          )}

          {filtered.map((note) => (
            <Note
              key={note.id}
              note={note}
              folders={folders}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onBringFront={bringFront}
              onToast={showToast}
              onStartDrag={setDragNoteId}
              onCreateFolder={addFolder}
            />
          ))}
        </main>
      </div>

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