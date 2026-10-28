// Viewer app (Viewer / Preview / Document Viewer): PDFs, slides, images,
// text files, and the Contact file with an email form.
import { fileTree, pathTo } from '../../content/fileTree';
import { presentations } from '../../content/presentations';
import { profile } from '../../content/profile';
import { useViewerStore } from './store';

function ContactForm() {
  const { mailSubject, mailBody, setMail } = useViewerStore();
  const href = `mailto:${profile.email}?subject=${encodeURIComponent(mailSubject || 'Hello Mark')}&body=${encodeURIComponent(mailBody)}`;
  return (
    <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
      <strong>Write Mark an email</strong>
      <label className="sr-only" htmlFor="mail-subject">Subject</label>
      <input id="mail-subject" type="text" placeholder="Subject" value={mailSubject} onChange={(e) => setMail({ mailSubject: e.target.value })} />
      <label className="sr-only" htmlFor="mail-body">Message</label>
      <textarea id="mail-body" placeholder="Message" rows={4} value={mailBody} onChange={(e) => setMail({ mailBody: e.target.value })} />
      <a className="btn-accent" href={href}>Open in my email app</a>
      <div className="contact-links">
        <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="/resume.pdf" download>Download resume</a>
      </div>
    </form>
  );
}

/** Shows a PDF inline. Browsers that cannot (most phones) get a link instead. */
function PdfFrame({ src, title }: { src: string; title: string }) {
  return (
    <object className="pdf-frame" data={`${src}#view=FitH`} type="application/pdf" aria-label={title}>
      <div className="pdf-fallback">
        <p>This browser cannot show the PDF here.</p>
        <a className="btn-accent" href={src} target="_blank" rel="noopener noreferrer">Open {title}</a>
      </div>
    </object>
  );
}

/** Turns URLs inside text into links that open in a new tab. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default function ViewerApp() {
  const { fileId, page, setPage } = useViewerStore();
  const node = fileTree[fileId] ?? fileTree.resume;

  if (node.kind === 'pdf' && node.src) {
    return (
      <div className="viewer">
        <PdfFrame src={node.src} title={node.name} />
        <div className="viewer-bar">
          <a className="tool-btn" href={node.src} target="_blank" rel="noopener noreferrer">Open in new tab</a>
          <a className="btn-accent" href={node.src} download>Download</a>
        </div>
      </div>
    );
  }

  if (node.special === 'slides') {
    const p = presentations.find((x) => x.id === node.presentationId)!;
    // Page 0 is a title card, page 1 the summary, page 2 the full deck as a PDF.
    const pages = 3;
    const pg = Math.min(page, pages - 1);
    return (
      <div className="viewer">
        <div className="viewer-stage">
          {pg === 0 && (
            <div className="slide">
              <div className="slide-title">{p.title}</div>
              <div className="slide-sub">{p.subtitle}</div>
              <div className="slide-meta">{p.context} · {p.slides} slides · {p.date}</div>
            </div>
          )}
          {pg === 1 && (
            <div className="slide">
              <div className="slide-head">Summary</div>
              <div className="slide-text">{p.summary}</div>
              <div className="tags">{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
            </div>
          )}
          {pg === 2 && <PdfFrame src={p.pdf} title={`${p.title} (full deck)`} />}
        </div>
        <div className="viewer-bar">
          <button type="button" className="tool-btn" disabled={pg === 0} onClick={() => setPage(pg - 1)}>Previous</button>
          <span aria-live="polite">{['Title', 'Summary', 'Full deck'][pg]} · {pg + 1} of {pages}</span>
          <button type="button" className="tool-btn" disabled={pg === pages - 1} onClick={() => setPage(pg + 1)}>Next</button>
          <a className="btn-accent" href={p.pdf} download>Download PDF</a>
        </div>
      </div>
    );
  }

  if ((node.kind === 'image' || node.kind === 'video') && node.src) {
    // Previous / Next walk through the other images and videos in the same folder.
    const parent = fileTree[pathTo(node.id).slice(-2)[0]];
    const isMedia = (id: string) => fileTree[id]?.kind === 'image' || fileTree[id]?.kind === 'video';
    const siblings = (parent?.kids ?? []).filter(isMedia);
    const i = siblings.indexOf(node.id);
    const open = useViewerStore.getState().open;
    return (
      <div className="viewer">
        <div className="viewer-stage">
          {node.kind === 'video' ? (
            <video key={node.src} className="viewer-img" src={node.src} poster={node.poster} controls playsInline preload="metadata" aria-label={node.body ?? node.name} />
          ) : (
            <img className="viewer-img" src={node.src} alt={node.body ?? node.name} />
          )}
        </div>
        {node.body && <p className="viewer-caption">{node.body}</p>}
        {siblings.length > 1 && (
          <div className="viewer-bar">
            <button type="button" className="tool-btn" disabled={i <= 0} onClick={() => open(siblings[i - 1])}>Previous</button>
            <span aria-live="polite">{i + 1} of {siblings.length}</span>
            <button type="button" className="tool-btn" disabled={i >= siblings.length - 1} onClick={() => open(siblings[i + 1])}>Next</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="viewer">
      <div className="viewer-stage is-top">
        <article className="paper">
          <h2>{node.name}</h2>
          {(node.body ?? '').split('\n\n').map((para, i) => (
            <p key={i}>
              <Linkified text={para} />
            </p>
          ))}
          {node.special === 'contact' && <ContactForm />}
        </article>
      </div>
    </div>
  );
}
