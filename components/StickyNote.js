'use client';

import { useState } from 'react';

export default function StickyNote({ note, onClick }) {
  const [hover, setHover] = useState(false);

  const text = (note.text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim();

  const sentences = text.split(/\n|\. |\! |\? /).filter(Boolean);
  const title = sentences[0] || '';
  const preview = sentences.slice(1, 3).join(' ');

  const rotation = ((parseInt(note.id.slice(-2), 36) % 5) - 2) * 0.5;

  const colorClass = `note-${note.color || 'yellow'}`;
  const pinClass = note.pinColor || '';

  return (
    <div
      className={`sticky-note ${colorClass}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        '--rot': `${rotation}deg`,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      <div className={`sticky-pin ${pinClass}`} />

      {title ? (
        <>
          <div className="sticky-title">{title}</div>
          {preview && <div className="sticky-preview">{preview}...</div>}
        </>
      ) : (
        <div className="sticky-empty">Klik untuk menulis...</div>
      )}

      {hover && (
        <div
          className="absolute bottom-2 right-2 text-[10px] font-semibold px-2 py-1 rounded hidden md:block"
          style={{ background: 'rgba(43, 29, 16, 0.15)', color: '#2b1d10' }}
        >
          Buka →
        </div>
      )}

      {note.pinned && (
        <div
          className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(201, 74, 58, 0.9)', color: '#fff' }}
        >
          📌
        </div>
      )}
    </div>
  );
}