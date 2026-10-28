// The search page inside the Browser, used on the desktop and the phone.
// Home page: logo, search box and suggested searches. Results page: tabs,
// a skill answer with proof, results, images, videos and related searches.
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  engineName,
  inTab,
  popularSearches,
  questionSearches,
  relatedSearches,
  search,
  suggest,
  type SearchDoc,
  type Tab,
  type Target,
} from '../../content/search';
import type { BrowserEntry } from './store';
import './search.css';

type Props = {
  entry: BrowserEntry;
  onSearch: (q: string, tab?: Tab) => void;
  onOpen: (t: Target) => void;
  phone?: boolean;
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'projects', label: 'Projects' },
  { id: 'images', label: 'Images' },
  { id: 'videos', label: 'Videos' },
];

const TYPE_LABEL: Record<SearchDoc['type'], string> = {
  project: 'Project',
  folder: 'Screenshots',
  page: 'Page',
  link: 'Opens in a new tab',
  image: 'Screenshot',
  video: 'Video',
};

function Logo({ big }: { big?: boolean }) {
  return (
    <span className={`sx-logo${big ? ' is-big' : ''}`} aria-hidden={!big}>
      <span className="sx-logo-a">Plowright</span>{' '}
      <span className="sx-logo-b">Search</span>
    </span>
  );
}

/** The search box with suggestions underneath (a combobox). */
function SearchBox({ initial, onSearch, onOpen, autoFocus }: { initial: string; onSearch: (q: string) => void; onOpen: (t: Target) => void; autoFocus?: boolean }) {
  const [text, setText] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const list = useMemo(() => suggest(text), [text]);

  useEffect(() => {
    setText(initial);
  }, [initial]);
  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);

  const pick = (i: number) => {
    const s = list[i];
    setOpen(false);
    setActive(-1);
    if (!s) return;
    if (s.doc) onOpen(s.doc.target);
    else {
      setText(s.text);
      onSearch(s.text);
    }
    input.current?.blur();
  };

  const submit = () => {
    if (active >= 0) return pick(active);
    setOpen(false);
    if (text.trim()) onSearch(text);
    input.current?.blur();
  };

  return (
    <form
      className="sx-box"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <span className="sx-mag" aria-hidden="true" />
      <input
        ref={input}
        type="search"
        value={text}
        placeholder="Search Mark's portfolio"
        aria-label={`Search with ${engineName}`}
        role="combobox"
        aria-expanded={open && list.length > 0}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
        autoComplete="off"
        enterKeyHint="search"
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setActive((a) => Math.min(list.length - 1, a + 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(-1, a - 1));
          } else if (e.key === 'Escape') {
            setOpen(false);
            setActive(-1);
          }
        }}
      />
      {text && (
        <button type="button" className="sx-clear" aria-label="Clear" onClick={() => { setText(''); input.current?.focus(); }}>
          ×
        </button>
      )}
      {open && list.length > 0 && (
        <ul className="sx-suggest" id={`${id}-list`} role="listbox" aria-label="Suggestions">
          {!text.trim() && <li className="sx-suggest-head" role="presentation">Popular searches</li>}
          {list.map((s, i) => (
            <li
              key={s.text + i}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'is-active' : ''}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(i)}
            >
              <span className={s.doc ? 'sx-ico-page' : 'sx-ico-search'} aria-hidden="true" />
              <span className="sx-suggest-text">{s.text}</span>
              {s.doc && <span className="sx-suggest-kind">{TYPE_LABEL[s.doc.type]}</span>}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

function Chips({ items, onSearch }: { items: string[]; onSearch: (q: string) => void }) {
  return (
    <div className="sx-chips">
      {items.map((q) => (
        <button key={q} type="button" className="sx-chip" onClick={() => onSearch(q)}>
          {q}
        </button>
      ))}
    </div>
  );
}

function Result({ d, onOpen }: { d: SearchDoc; onOpen: (t: Target) => void }) {
  const ext = 'href' in d.target;
  return (
    <article className="sx-result">
      <div className="sx-result-text">
        <div className="sx-where">
          <span className={`sx-fav is-${d.type}`} aria-hidden="true" />
          <span className="sx-where-text">{d.where}</span>
        </div>
        <h3>
          <button type="button" className="sx-title" onClick={() => onOpen(d.target)}>
            {d.title}
            {ext && <span className="sx-ext" aria-label=" (opens in a new tab)"> ↗</span>}
          </button>
        </h3>
        <p className="sx-snippet">{d.snippet}</p>
      </div>
      {d.thumb && (d.type === 'project' || d.type === 'folder') && (
        <button type="button" className="sx-result-thumb" tabIndex={-1} aria-hidden="true" onClick={() => onOpen(d.target)}>
          <img src={d.thumb} alt="" loading="lazy" />
        </button>
      )}
    </article>
  );
}

function Thumbs({ docs, onOpen, big }: { docs: SearchDoc[]; onOpen: (t: Target) => void; big?: boolean }) {
  return (
    <div className={`sx-thumbs${big ? ' is-big' : ''}`}>
      {docs.map((d) => (
        <button key={d.id} type="button" className="sx-thumb" onClick={() => onOpen(d.target)} title={d.snippet}>
          <span className={`sx-thumb-img${d.type === 'video' ? ' is-video' : ''}`}>
            <img src={d.thumb} alt="" loading="lazy" />
          </span>
          <span className="sx-thumb-title">{d.title}</span>
          {big && <span className="sx-thumb-where">{d.where.split(' › ').slice(2, 3).join('') || d.where}</span>}
        </button>
      ))}
    </div>
  );
}

export function SearchView({ entry, onSearch, onOpen, phone }: Props) {
  const { q, tab } = entry;
  const res = useMemo(() => search(q), [q]);
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    top.current?.scrollTo?.(0, 0);
  }, [q, tab]);

  if (!q) {
    return (
      <div className={`sx sx-home${phone ? ' is-phone' : ''}`} ref={top}>
        <Logo big />
        <SearchBox initial="" onSearch={(t) => onSearch(t)} onOpen={onOpen} autoFocus={!phone} />
        <p className="sx-note">Searches Mark's portfolio: projects, screenshots, skills, presentations and profiles. Not the web.</p>
        <h2 className="sx-label">Try asking</h2>
        <Chips items={questionSearches} onSearch={onSearch} />
        <h2 className="sx-label">Popular searches</h2>
        <Chips items={popularSearches} onSearch={onSearch} />
      </div>
    );
  }

  const count = (t: Tab) => res.results.filter((d) => inTab(d, t)).length;
  const list = res.results.filter((d) => inTab(d, tab));
  const images = res.results.filter((d) => inTab(d, 'images'));
  const videos = res.results.filter((d) => inTab(d, 'videos'));
  const related = relatedSearches(q);

  return (
    <div className={`sx sx-results${phone ? ' is-phone' : ''}`} ref={top}>
      <div className="sx-head">
        <button type="button" className="sx-logo-btn" aria-label={`${engineName} home`} onClick={() => onSearch('')}>
          <Logo />
        </button>
        <SearchBox initial={q} onSearch={(t) => onSearch(t)} onOpen={onOpen} />
      </div>
      <nav className="sx-tabs" aria-label="Result type">
        {TABS.map((t) => (
          <button key={t.id} type="button" className="sx-tab" aria-current={tab === t.id ? 'page' : undefined} onClick={() => onSearch(q, t.id)}>
            {t.label}
            {t.id !== 'all' && <span className="sx-tab-n">{count(t.id)}</span>}
          </button>
        ))}
      </nav>

      <div className="sx-body">
        <p className="sx-count" aria-live="polite">
          {list.length ? `${list.length} result${list.length === 1 ? '' : 's'}` : 'No results'}
          {res.partial && list.length > 0 && ' · no page has every word, so these match some of them'}
        </p>

        {tab === 'all' && res.answer && (
          <section className="sx-answer" aria-label={`Answer: ${res.answer.title}`}>
            <div className="sx-answer-kicker">Skill · {res.answer.title}</div>
            <p className="sx-answer-text">{res.answer.answer}</p>
            <div className="sx-answer-proof-label">See the proof</div>
            <ul className="sx-proof">
              {res.answer.proof.map((p) => (
                <li key={p.label}>
                  <button type="button" className="sx-title" onClick={() => onOpen(p.target)}>{p.label} ›</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {list.length === 0 && (
          <div className="sx-empty">
            <p>
              No results for <strong>“{q}”</strong>{tab !== 'all' ? ` in ${TABS.find((t) => t.id === tab)?.label}` : ''}. {engineName} only searches Mark's portfolio.
            </p>
            {TABS.some((t) => t.id !== tab && count(t.id) > 0) ? (
              <div className="sx-chips">
                {TABS.filter((t) => t.id !== tab && count(t.id) > 0).map((t) => (
                  <button key={t.id} type="button" className="sx-chip" onClick={() => onSearch(q, t.id)}>
                    See {count(t.id)} in {t.label}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <h2 className="sx-label">Try one of these</h2>
                <Chips items={popularSearches.slice(0, 8)} onSearch={onSearch} />
              </>
            )}
          </div>
        )}

        {tab === 'images' || tab === 'videos' ? (
          <Thumbs docs={list} onOpen={onOpen} big />
        ) : (
          list.map((d, i) => (
            <div key={d.id}>
              <Result d={d} onOpen={onOpen} />
              {tab === 'all' && i === Math.min(1, list.length - 1) && images.length > 0 && (
                <section className="sx-strip" aria-label="Images">
                  <div className="sx-strip-head">
                    <h2 className="sx-label">Images</h2>
                    <button type="button" className="sx-more" onClick={() => onSearch(q, 'images')}>All {images.length} images ›</button>
                  </div>
                  <Thumbs docs={images.slice(0, phone ? 4 : 6)} onOpen={onOpen} />
                </section>
              )}
              {tab === 'all' && i === Math.min(3, list.length - 1) && videos.length > 0 && (
                <section className="sx-strip" aria-label="Videos">
                  <div className="sx-strip-head">
                    <h2 className="sx-label">Videos</h2>
                  </div>
                  <Thumbs docs={videos} onOpen={onOpen} />
                </section>
              )}
            </div>
          ))
        )}

        {list.length > 0 && related.length > 0 && (
          <section className="sx-related">
            <h2 className="sx-label">People also search for</h2>
            <Chips items={related} onSearch={onSearch} />
          </section>
        )}
      </div>
    </div>
  );
}
