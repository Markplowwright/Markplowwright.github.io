// Terminal app: a fake shell. Parsing lives in commands.ts; this file only
// draws the history, the input line and the quick-command buttons.
import { useEffect, useRef, useState } from 'react';
import { create } from 'zustand';
import { useSkin } from '../../os/skins';
import { useSkinStore } from '../../os/skinStore';
import { openSearch, openTarget } from '../../os/actions';
import { terminalText } from '../../content/terminal';
import { runCommand } from './commands';
import { CommandGuide } from './CommandGuide';
import { forOs, useTermQueue } from './queue';
import { osLabel } from '../../content/commandGuide';

type Line = { cmd: boolean; prompt?: string; text: string };

// History lives in a store so it survives a skin switch.
const useTerm = create<{ lines: Line[]; shell: 0 | 1; history: string[]; set: (p: Partial<{ lines: Line[]; shell: 0 | 1; history: string[] }>) => void }>((set) => ({
  lines: [
    { cmd: true, prompt: '', text: 'whoami' },
    { cmd: false, text: terminalText.whoami },
    { cmd: false, text: terminalText.intro },
  ],
  shell: 0,
  history: [],
  set: (p) => set(p),
}));

export default function TerminalApp() {
  const skin = useSkin();
  const { lines, shell, history, set } = useTerm();
  const online = useSkinStore((s) => s.wifi);
  const [input, setInput] = useState('');
  const [histIdx, setHistIdx] = useState(-1);
  const [guide, setGuide] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prompt = skin.shells[shell].prompt(terminalText.user);
  const net = { windows: 'ipconfig /all', mac: 'ifconfig', linux: 'ip a' }[skin.id];
  const quick = ['commands', 'help', 'whoami', 'projects', 'skills', net, 'nslookup google.com', skin.id === 'windows' ? 'cls' : 'clear'];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  const run = (text: string) => {
    if (!text.trim()) return;
    const result = runCommand(text, { skin: skin.id, shell, online });
    const next = result.clear ? [] : [...lines, { cmd: true, prompt, text }, ...result.lines.map((t) => ({ cmd: false, text: t }))];
    set({ lines: next, history: [text, ...history].slice(0, 50) });
    // nslookup, ping and tracert print once the lookup answers.
    result.later?.then((more) => {
      const now = useTerm.getState().lines;
      set({ lines: [...now, ...more.map((t) => ({ cmd: false, text: t }))] });
    });
    if (result.guide) setGuide(true);
    if (result.open) openTarget(result.open);
    if (result.search) openSearch(result.search);
  };

  // A command sent from another app (Help Desk "Try it").
  const pending = useTermQueue((s) => s.pending);
  useEffect(() => {
    if (!pending) return;
    const c = useTermQueue.getState().take();
    if (c) run(forOs(c.cmd, c.os, skin.id));
  }, [pending]);

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="term-tabs" role="group" aria-label="Shell">
        {skin.shells.map((s, i) => (
          <button key={s.name} type="button" aria-pressed={shell === i} onClick={() => set({ shell: i as 0 | 1 })}>
            {s.name}
          </button>
        ))}
      </div>
      <div className="term-out" role="log" aria-live="polite" aria-label="Terminal output">
        {lines.map((l, i) => (
          <div key={i} className={l.cmd ? 'term-cmd' : 'term-line'}>
            {l.cmd ? `${l.prompt || prompt} ${l.text}` : l.text || '\u00a0'}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="term-chips">
        {quick.map((c) => (
          <button key={c} type="button" onClick={() => run(c)}>{c}</button>
        ))}
      </div>
      {guide && (
        <CommandGuide
          os={skin.id}
          onClose={() => {
            setGuide(false);
            inputRef.current?.focus();
          }}
          onRun={(cmd) => {
            setGuide(false);
            run(cmd);
            inputRef.current?.focus();
          }}
          note={(tab) =>
            tab === skin.id
              ? undefined
              : `These run when the desktop is in ${osLabel[tab]} mode: switch with the Windows, macOS and Linux buttons. Clicking one here shows what ${osLabel[skin.id]} would say.`
          }
        />
      )}
      <form
        className="term-input"
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
          setInput('');
          setHistIdx(-1);
        }}
      >
        <label htmlFor="term-in" className="term-prompt">{prompt}</label>
        <input
          id="term-in"
          ref={inputRef}
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="type a command and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // Up and down arrows walk through earlier commands.
            if (e.key === 'ArrowUp' && history.length) {
              e.preventDefault();
              const i = Math.min(histIdx + 1, history.length - 1);
              setHistIdx(i);
              setInput(history[i]);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              const i = Math.max(histIdx - 1, -1);
              setHistIdx(i);
              setInput(i < 0 ? '' : history[i]);
            }
          }}
        />
      </form>
    </div>
  );
}
