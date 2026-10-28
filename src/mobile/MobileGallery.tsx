// A project's Screenshots folder on the phone. It walks the same folder tree
// as the desktop Files app: folders first, then a grid of screenshots, then
// one screenshot full width with its caption and Previous / Next.
import { useRef, useState } from 'react';
import { fileTree, type FsNode } from '../content/fileTree';

const isMedia = (n?: FsNode) => n?.kind === 'image' || n?.kind === 'video';
// "2 Group Policy" -> "Group Policy", "03 Map SHARED as S.jpg" -> "Map SHARED as S"
const label = (n: FsNode) => n.name.replace(/^\d+ /, '').replace(/\.(jpg|png|mp4)$/i, '');
const subfolders = (n: FsNode) => (n.kids ?? []).filter((k) => fileTree[k].kind === 'folder').length;
const thumbOf =(n: FsNode) => (n.kind === 'video' ? n.poster : n.src);

function firstThumb(id: string): string | undefined {
  const n = fileTree[id];
  if (isMedia(n)) return thumbOf(n);
  for (const kid of n.kids ?? []) {
    const t = firstThumb(kid);
    if (t) return t;
  }
  return undefined;
}

function countMedia(id: string): { shots: number; videos: number } {
  const n = fileTree[id];
  if (n.kind === 'image') return { shots: 1, videos: 0 };
  if (n.kind === 'video') return { shots: 0, videos: 1 };
  return (n.kids ?? []).map(countMedia).reduce((a, b) => ({ shots: a.shots + b.shots, videos: a.videos + b.videos }), { shots: 0, videos: 0 });
}

function countText(id: string) {
  const { shots, videos } = countMedia(id);
  const parts = [];
  if (shots) parts.push(`${shots} screenshot${shots === 1 ? '' : 's'}`);
  if (videos) parts.push(`${videos} video${videos === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

export function MobileGallery({ rootId, project, onClose }: { rootId: string; project: string; onClose: () => void }) {
  const [path, setPath] = useState<string[]>([rootId]);
  const [view, setView] = useState<string | null>(null);
  const swipe = useRef<number | null>(null);

  const folder = fileTree[path[path.length - 1]];
  const kids = (folder.kids ?? []).map((id) => fileTree[id]);
  const folders = kids.filter((n) => n.kind === 'folder');
  const media = kids.filter(isMedia);
  const shown = view ? fileTree[view] : null;
  const i = view ? media.findIndex((n) => n.id === view) : -1;

  const back = () => {
    if (view) setView(null);
    else if (path.length > 1) setPath(path.slice(0, -1));
    else onClose();
  };
  const backText = view ? label(folder) : path.length > 1 ? label(fileTree[path[path.length - 2]]) : 'Projects';
  const crumbs = [project, ...path.map((id) => label(fileTree[id]))];
  const go = (d: number) => {
    const next = media[i + d];
    if (next) setView(next.id);
  };

  return (
    <div className="m-sheet m-gal" role="dialog" aria-label={`${project} screenshots`}>
      <div className="m-sheet-head">
        <button type="button" className="m-back" onClick={back}>‹ {backText}</button>
        <h2>{shown ? label(shown) : label(folder)}</h2>
      </div>
      <div className="m-gal-crumbs">{crumbs.join(' › ')}</div>

      {shown ? (
        <div
          key={shown.id}
          className="m-sheet-body m-gal-view"
          onTouchStart={(e) => { swipe.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (swipe.current === null) return;
            const dx = e.changedTouches[0].clientX - swipe.current;
            swipe.current = null;
            if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
          }}
        >
          {shown.kind === 'video' ? (
            <video className="m-gal-big" src={shown.src} poster={shown.poster} controls playsInline preload="metadata" aria-label={shown.body} />
          ) : (
            <img className="m-gal-big" src={shown.src} alt={shown.body ?? label(shown)} />
          )}
          <p className="m-gal-caption">{shown.body}</p>
          {shown.kind === 'image' && (
            <a className="m-gal-full" href={shown.src} target="_blank" rel="noopener noreferrer">Open full size to zoom</a>
          )}
          {media.length > 1 && (
            <div className="m-gal-nav">
              <button type="button" className="m-btn-soft" disabled={i <= 0} onClick={() => go(-1)}>‹ Previous</button>
              <span aria-live="polite">{i + 1} of {media.length}</span>
              <button type="button" className="m-btn-soft" disabled={i >= media.length - 1} onClick={() => go(1)}>Next ›</button>
            </div>
          )}
        </div>
      ) : (
        <div key={folder.id} className="m-sheet-body">
          {media.filter((n) => n.kind === 'video').map((n) => (
            <button key={n.id} type="button" className="m-gal-feature" onClick={() => setView(n.id)}>
              <span className="m-gal-thumb is-video"><img src={n.poster} alt="" loading="lazy" /></span>
              <strong>{label(n)}</strong>
              <span className="m-muted">Watch first: a short tour of the project.</span>
            </button>
          ))}

          {folders.length > 0 && (
            <div className="m-gal-folders">
              {folders.map((f) => (
                <button key={f.id} type="button" className="m-gal-folder" onClick={() => setPath([...path, f.id])}>
                  <span className="m-gal-fthumb">{firstThumb(f.id) && <img src={firstThumb(f.id)} alt="" loading="lazy" />}</span>
                  <span className="m-gal-ftext">
                    <strong>{label(f)}</strong>
                    <span className="m-muted">
                      {subfolders(f) ? `${subfolders(f)} folders · ` : ''}
                      {countText(f.id)}
                    </span>
                  </span>
                  <span className="m-gal-chev" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          )}

          {media.some((n) => n.kind === 'image') && (
            <div className="m-gal-grid">
              {media.filter((n) => n.kind === 'image').map((n) => (
                <button key={n.id} type="button" className="m-gal-tile" onClick={() => setView(n.id)}>
                  <span className="m-gal-thumb"><img src={n.src} alt="" loading="lazy" /></span>
                  <span className="m-gal-name">{label(n)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
