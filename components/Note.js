'use client';

import { useRef, useEffect, useState } from 'react';
import ColorPicker from './ColorPicker';
import FolderPicker from './FolderPicker';

export default function Note({
  note, onUpdate, onDelete, onBringFront, onToast, folders,
  onStartDrag, onCreateFolder,
}) {
  const ref = useRef(null);
  const contentRef = useRef(null);
  const latestPos = useRef({ x: note.x, y: note.y });
  const latestSize = useRef({ w: note.w || 220, h: note.h || 180 });
  const [showColor, setShowColor] = useState(false);
  const [showFolder, setShowFolder] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    latestPos.current = { x: note.x, y: note.y };
    latestSize.current = { w: note.w || 220, h: note.h || 180 };
  }, [note.x, note.y, note.w, note.h]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerHTML !== note.text) el.innerHTML = note.text || '';
  }, [note.text]);

  // ESC buat keluar fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  // DRAG (skip kalau fullscreen)
  useEffect(() => {
    if (fullscreen) return;
    const el = ref.current;
    if (!el) return;

    let isDragging = false;
    let offsetX = 0, offsetY = 0;
    let curX = note.x, curY = note.y;

    const startDrag = (clientX, clientY) => {
      isDragging = true;
      offsetX = clientX - curX;
      offsetY = clientY - curY;
      onBringFront(note.id);
      el.style.transition = 'none';
      el.style.opacity = '0.85';
      if (onStartDrag) onStartDrag(note.id);
    };

    const moveDrag = (clientX, clientY) => {
      if (!isDragging) return;
      let x = clientX - offsetX;
      let y = clientY - offsetY;
      x = Math.max(0, Math.min(window.innerWidth - el.offsetWidth, x));
      y = Math.max(0, Math.min(window.innerHeight - 68 - el.offsetHeight, y));
      curX = x;
      curY = y;
      el.style.transform = `translate(${x}px, ${y}px)`;
      latestPos.current = { x, y };
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      el.style.opacity = '1';
      onUpdate(note.id, { x: latestPos.current.x, y: latestPos.current.y });
      if (onStartDrag) onStartDrag(null);
    };

    const onMouseDown = (e) => {
      if (e.target.closest('.note-header')) return;
      if (e.target.closest('.resize-handle')) return;
      if (e.target.closest('.folder-badge')) return;
      if (e.target.isContentEditable && e.target.tagName === 'DIV') return;
      startDrag(e.clientX, e.clientY);
    };
    const onMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => endDrag();

    const onTouchStart = (e) => {
      const t = e.touches[0];
      if (e.target.closest('.note-header')) return;
      if (e.target.closest('.resize-handle')) return;
      if (e.target.closest('.folder-badge')) return;
      if (e.target.isContentEditable && e.target.tagName === 'DIV') return;
      startDrag(t.clientX, t.clientY);
    };
    const onTouchMove = (e) => {
      if (!isDragging) return;
      const t = e.touches[0];
      moveDrag(t.clientX, t.clientY);
    };
    const onTouchEnd = () => endDrag();

    el.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [note.id, onUpdate, onBringFront, onStartDrag, fullscreen]);

  // RESIZE
  useEffect(() => {
    if (fullscreen) return;
    const el = ref.current;
    const handle = el?.querySelector('.resize-handle');
    if (!handle) return;

    let isResizing = false;
    let startX, startY, startW, startH;

    const startResize = (clientX, clientY) => {
      isResizing = true;
      startX = clientX;
      startY = clientY;
      startW = el.offsetWidth;
      startH = el.offsetHeight;
      el.style.transition = 'none';
    };

    const moveResize = (clientX, clientY) => {
      if (!isResizing) return;
      let w = Math.max(150, startW + (clientX - startX));
      let h = Math.max(120, startH + (clientY - startY));
      el.style.width = w + 'px';
      el.style.height = h + 'px';
      latestSize.current = { w, h };
    };

    const endResize = () => {
      if (!isResizing) return;
      isResizing = false;
      onUpdate(note.id, { w: latestSize.current.w, h: latestSize.current.h });
    };

    const onMD = (e) => { e.stopPropagation(); startResize(e.clientX, e.clientY); };
    const onMM = (e) => moveResize(e.clientX, e.clientY);
    const onMU = () => endResize();
    const onTS = (e) => {
      e.stopPropagation();
      const t = e.touches[0];
      startResize(t.clientX, t.clientY);
    };
    const onTM = (e) => {
      const t = e.touches[0];
      moveResize(t.clientX, t.clientY);
    };
    const onTE = () => endResize();

    handle.addEventListener('mousedown', onMD);
    document.addEventListener('mousemove', onMM);
    document.addEventListener('mouseup', onMU);
    handle.addEventListener('touchstart', onTS, { passive: true });
    document.addEventListener('touchmove', onTM, { passive: true });
    document.addEventListener('touchend', onTE);

    return () => {
      handle.removeEventListener('mousedown', onMD);
      document.removeEventListener('mousemove', onMM);
      document.removeEventListener('mouseup', onMU);
      handle.removeEventListener('touchstart', onTS);
      document.removeEventListener('touchmove', onTM);
      document.removeEventListener('touchend', onTE);
    };
  }, [note.id, onUpdate, fullscreen]);

  const handlePin = (e) => {
    e.stopPropagation();
    onUpdate(note.id, { pinned: !note.pinned });
    onToast(note.pinned ? 'Unpinned' : 'Pinned 📌', 'info');
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (note.pinned) {
      onToast('Unpin dulu bro!', 'warn');
      return;
    }
    const el = ref.current;
    el.classList.add('note-removing');
    setTimeout(() => {
      onDelete(note.id);
      onToast('Note dihapus', 'success');
    }, 250);
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    setFullscreen((f) => !f);
  };

  const currentFolder = folders.find((f) => f.id === note.folderId);

  // ============ STYLE (FIX WARNING) ============
  const noteStyle = fullscreen
    ? {
        background: note.color,
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        borderRadius: 0,
        padding: '32px',
        // ❌ GAK ADA top/left/right/bottom di sini
      }
    : {
        background: note.color,
        position: 'absolute',
        transform: `translate(${note.x}px, ${note.y}px)`,
        width: note.w || 220,
        height: note.h || 180,
        zIndex: note.z || 1,
        top: 0,
        left: 0,
        // ❌ GAK ADA inset di sini
      };

  return (
    <>
      <div
        ref={ref}
        onMouseDown={() => !fullscreen && onBringFront(note.id)}
        onTouchStart={() => !fullscreen && onBringFront(note.id)}
        style={noteStyle}
        className={`p-3 rounded-2xl flex flex-col ${
          fullscreen
            ? 'animate-[modalIn_0.3s_ease]'
            : 'cursor-grab active:cursor-grabbing animate-[pop_0.25s_ease] will-change-transform shadow-2xl'
        } ${note.pinned && !fullscreen ? 'ring-4 ring-[#f9e2af] border-2 border-dashed border-black/40' : ''}`}
      >
        {/* Header */}
        <div className={`note-header flex justify-between items-center ${fullscreen ? 'mb-4' : 'mb-2'}`}>
          <div className="flex gap-1">
            <button
              onClick={handlePin}
              className="note-action"
              data-tooltip="Pin / Semat"
            >
              {note.pinned ? '📍' : '📌'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowColor(true); }}
              className="note-action"
              data-tooltip="Warna"
            >
              🎨
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowFolder(true); }}
              className="note-action"
              data-tooltip={currentFolder ? `Di: ${currentFolder.name}` : 'Pindah folder'}
            >
              📁
            </button>
            <button
              onClick={toggleFullscreen}
              className="note-action"
              data-tooltip={fullscreen ? 'Keluar (ESC)' : 'Fullscreen'}
            >
              ⛶
            </button>
          </div>
          <button
            onClick={handleDelete}
            className="note-action"
            data-tooltip="Hapus"
            style={{ color: '#dc2626' }}
          >
            🗑️
          </button>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onUpdate(note.id, { text: e.target.innerHTML })}
          className={`note-content flex-1 outline-none overflow-y-auto px-1 empty:before:content-['Tulis_di_sini...'] empty:before:opacity-40 empty:before:italic ${
            fullscreen ? 'text-xl leading-relaxed' : 'text-[0.95rem]'
          }`}
        />

        {/* Footer info fullscreen */}
        {fullscreen && (
          <div className="mt-4 flex items-center justify-between text-xs opacity-70">
            <div className="flex items-center gap-2">
              {currentFolder && (
                <span className="px-2 py-1 rounded-full bg-black/20 text-white font-semibold">
                  {currentFolder.icon} {currentFolder.name}
                </span>
              )}
              {note.pinned && (
                <span className="px-2 py-1 rounded-full bg-black/20 text-white font-semibold">
                  📌 Pinned
                </span>
              )}
            </div>
            <span className="text-black/70 font-medium">
              Tekan <kbd className="px-1.5 py-0.5 rounded bg-black/20 text-white">ESC</kbd> buat keluar
            </span>
          </div>
        )}

        {/* Folder badge — small mode only */}
        {!fullscreen && currentFolder && (
          <div
            className="folder-badge absolute -bottom-2.5 left-3 text-[10px] px-2.5 py-1 rounded-full font-bold shadow-lg flex items-center gap-1 border"
            style={{
              background: '#1e1e2e',
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <span>{currentFolder.icon || '📁'}</span>
            <span>{currentFolder.name}</span>
          </div>
        )}

        {!fullscreen && <div className="resize-handle" />}
      </div>

      {showColor && (
        <ColorPicker
          current={note.color}
          onPick={(c) => {
            onUpdate(note.id, { color: c });
            onToast('Warna diubah', 'success');
          }}
          onClose={() => setShowColor(false)}
        />
      )}

      {showFolder && (
        <FolderPicker
          folders={folders}
          current={note.folderId}
          onPick={(folderId) => {
            onUpdate(note.id, { folderId });
            if (folderId === null) onToast('Note dilepas dari folder', 'success');
            else {
              const f = folders.find((x) => x.id === folderId);
              onToast(`Pindah ke ${f?.name || 'folder'}`, 'success');
            }
          }}
          onCreateFolder={onCreateFolder}
          onClose={() => setShowFolder(false)}
        />
      )}
    </>
  );
}