// Terminal app: a fake shell. Parsing lives in commands.ts; this file only
// draws the history, the input line and the quick-command buttons.
import { useEffect, useRef, useState } from 'react';
import { create } from 'zustand';
import { useSkin } from '../../os/skins';
import { openSearch, openTarget } from '../../os/actions';
import { terminalText } from '../../content/terminal';
import { runCommand } from './commands';

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
  const [input, setInput] = useState('');
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prompt = skin.shells[shell].prompt(terminalText.user);
  const quick = ['help', 'whoami', 'projects', 'skills', skin.id === 'windows' ? 'ipconfig' : 'ifconfig', 'clear'];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  const run = (text: string) => {
    if (!text.trim()) return;
    const result = runCommand(text, { skin: skin.id, shell });
    const next = result.clear ? [] : [...lines, { cmd: true, prompt, text }, ...result.lines.map((t) => ({ cmd: false, text: t }))];
    set({ lines: next, history: [text, ...history].slice(0, 50) });
    if (result.open) openTarget(result.open);
    if (result.search) openSearch(result.search);
  };

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
            {l.cmd ? `${l.prompt || prompt} ${l.text}` : l.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="term-chips">
        {quick.map((c) => (
          <button key={c} type="button" onClick={() => run(c)}>{c}</button>
        ))}
      </div>
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
