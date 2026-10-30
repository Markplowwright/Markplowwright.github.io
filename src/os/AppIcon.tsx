// One icon component for every app and file icon. Original SVG drawings.
//   Windows: flat, colorful, no container.
//   macOS:   glossy rounded-square container for apps.
//   Linux:   flat rounded-square container for apps.
import { useId } from 'react';
import type { SkinId } from './types';

type Shape = 'folder' | 'term' | 'net' | 'gear' | 'mon' | 'globe' | 'trash' | 'doc' | 'slides' | 'image' | 'video' | 'desk' | 'capture' | 'subnet' | 'chip';

const SHAPE: Record<string, Shape> = {
  files: 'folder', folder: 'folder', terminal: 'term', network: 'net', settings: 'gear', taskmgr: 'mon',
  browser: 'globe', link: 'globe', trash: 'trash', doc: 'doc', pdf: 'doc', viewer: 'doc',
  slides: 'slides', image: 'image', video: 'video', helpdesk: 'desk', capture: 'capture', subnet: 'subnet', devices: 'chip',
};
const APPS = ['files', 'terminal', 'network', 'settings', 'taskmgr', 'browser', 'helpdesk', 'capture', 'subnet', 'devices'];

// Colors per skin and icon: [fill 1, fill 2, fill 3, fill 4, stroke, container or '', folder tab bar, terminal strip]
type Colors = [string, string, string, string, string, string, boolean, boolean];

function palette(skin: SkinId, g: (name: string) => string): Record<string, Colors> {
  if (skin === 'windows')
    return {
      files: [g('wf'), g('wb'), '#0f6cbd', '', '', '', true, false],
      folder: [g('wf'), g('wb'), '#0f6cbd', '', '', '', false, false],
      terminal: ['#202020', '#0f6cbd', '#ffffff', '', '', '', false, true],
      network: ['#0f6cbd', '#7a8696', '', '', '', '', false, false],
      settings: [g('wg'), '', '#e5e7eb', '', '', '', false, false],
      doc: ['#ffffff', '#dbe6f6', '#8fa3c0', '', '#8b99ad', '', false, false],
      pdf: ['#ffffff', '#dbe6f6', '#8fa3c0', '#c42b1c', '#8b99ad', '', false, false],
      slides: ['#ffffff', '#ff8f3a', '#c43e1c', '#f2c744', '#8b99ad', '', false, false],
      image: ['#ffffff', '#58b6ff', '#2f9e44', '#f2c744', '#8b99ad', '', false, false],
      taskmgr: ['#ffffff', '', '#0f9d58', '', '#8b99ad', '', false, false],
      browser: ['#2f80ed', '#ffffff', '', '', '', '', false, false],
      helpdesk: ['', '', '#e8590c', '#0f6cbd', '', '', false, false],
      capture: ['#0f6cbd', '#e8f0fb', '#0f6cbd', '#2fa66a', '', '', false, false],
      subnet: ['#ffffff', '#0f6cbd', '#7a8696', '#2fa66a', '#8b99ad', '', false, false],
      devices: ['#5b6b80', '#0f6cbd', '#e8f0fb', '', '', '', false, false],
      trash: ['#e8eef7', '#8fa3c0', '', '', '#8b99ad', '', false, false],
    };
  if (skin === 'mac')
    return {
      files: ['#ffffff', 'rgba(255,255,255,0.72)', '', '', '', 'linear-gradient(160deg,#5ac8fa,#0a84ff)', false, false],
      folder: [g('mf'), g('mb'), '', '', '', '', false, false],
      terminal: ['rgba(0,0,0,0)', '', '#ffffff', '', '', 'linear-gradient(160deg,#4a4a50,#0b0b0c)', false, false],
      network: ['#ffffff', 'rgba(255,255,255,0.75)', '', '', '', 'linear-gradient(160deg,#34d399,#059669)', false, false],
      settings: ['#ffffff', '', '#5d6573', '', '', 'linear-gradient(160deg,#a9b1bf,#5d6573)', false, false],
      doc: ['#ffffff', '#e6e8ee', '#b4bac6', '', '#c7ccd6', '', false, false],
      pdf: ['#ffffff', '#e6e8ee', '#b4bac6', '#e5281d', '#c7ccd6', '', false, false],
      slides: ['#ffffff', '#ff9500', '#007aff', '#34c759', '#c7ccd6', '', false, false],
      image: ['#ffffff', '#5ac8fa', '#34c759', '#ffcc00', '#c7ccd6', '', false, false],
      taskmgr: ['#ffffff', '', '#34c759', '', 'rgba(0,0,0,0)', 'linear-gradient(160deg,#4a4a50,#161618)', false, false],
      browser: ['#ffffff', '#0a84ff', '', '', '', 'linear-gradient(160deg,#5ac8fa,#0a84ff)', false, false],
      helpdesk: ['', '', '#ffffff', '#ffffff', '', 'linear-gradient(160deg,#ffb347,#ff7a00)', false, false],
      capture: ['#ffffff', 'rgba(255,255,255,0.25)', '#ffffff', '#7dffb0', '', 'linear-gradient(160deg,#4a8cff,#1747a6)', false, false],
      subnet: ['rgba(255,255,255,0.2)', '#ffffff', 'rgba(255,255,255,0.55)', '#7dffb0', 'rgba(255,255,255,0.7)', 'linear-gradient(160deg,#34c3a0,#0b7a63)', false, false],
      devices: ['#ffffff', 'rgba(255,255,255,0.35)', '#3a4048', '', '', 'linear-gradient(160deg,#9aa4b2,#4b5563)', false, false],
      trash: ['rgba(255,255,255,0.75)', '#aeb4c0', '', '', '#8e95a3', '', false, false],
    };
  return {
    files: ['#ffffff', 'rgba(255,255,255,0.75)', '', '', '', '#3584e4', false, false],
    folder: [g('lf'), g('lb'), '', '', '', '', false, false],
    terminal: ['rgba(0,0,0,0)', '', '#26a269', '', '', '#2e3436', false, false],
    network: ['#ffffff', 'rgba(255,255,255,0.75)', '', '', '', '#26a269', false, false],
    settings: ['#ffffff', '', '#77767b', '', '', '#77767b', false, false],
    doc: ['#ffffff', '#e1e1e4', '#b8b8be', '', '#c0bfbc', '', false, false],
    pdf: ['#ffffff', '#e1e1e4', '#b8b8be', '#c01c28', '#c0bfbc', '', false, false],
    slides: ['#ffffff', '#e66100', '#3584e4', '#26a269', '#c0bfbc', '', false, false],
    image: ['#ffffff', '#62a0ea', '#26a269', '#f5c211', '#c0bfbc', '', false, false],
    taskmgr: ['#ffffff', '', '#26a269', '', 'rgba(0,0,0,0)', '#2e3436', false, false],
    browser: ['#ffffff', '#3584e4', '', '', '', '#3584e4', false, false],
    helpdesk: ['', '', '#ffffff', '#ffffff', '', '#e66100', false, false],
    capture: ['#ffffff', 'rgba(255,255,255,0.25)', '#ffffff', '#8ff0a4', '', '#1c71d8', false, false],
    subnet: ['rgba(255,255,255,0.2)', '#ffffff', 'rgba(255,255,255,0.55)', '#8ff0a4', 'rgba(255,255,255,0.7)', '#26a269', false, false],
    devices: ['#ffffff', 'rgba(255,255,255,0.35)', '#3d3846', '', '', '#5e5c64', false, false],
    trash: ['#e1e1e4', '#9a9996', '', '', '#77767b', '', false, false],
  };
}

export function AppIcon({ app, skin, size = 48 }: { app: string; skin: SkinId; size?: number }) {
  const uid = useId().replace(/:/g, '');
  const g = (name: string) => `url(#${uid}${name})`;
  const key = app === 'viewer' ? 'doc' : app === 'link' ? 'browser' : app === 'video' ? 'image' : app;
  const all = palette(skin, g);
  const [f1, f2, f3, f4, st, box, hasBar, hasStrip] = all[key] || all.doc;
  const shape = SHAPE[app] || 'doc';
  const contained = APPS.includes(key) && !!box;

  let gs = size;
  const boxStyle: React.CSSProperties = { width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' };
  if (contained) {
    if (skin === 'mac') {
      gs = Math.round(size * 0.62);
      boxStyle.borderRadius = Math.round(size * 0.24);
      boxStyle.background = `linear-gradient(180deg,rgba(255,255,255,0.38) 0%,rgba(255,255,255,0) 48%),${box}`;
      boxStyle.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.7),inset 0 -6px 10px rgba(0,0,0,0.12),0 0 0 0.5px rgba(0,0,0,0.3)';
    } else {
      gs = Math.round(size * 0.64);
      boxStyle.borderRadius = Math.round(size * 0.22);
      boxStyle.background = `linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0) 55%),${box}`;
      boxStyle.boxShadow = '0 1px 3px rgba(0,0,0,0.35),inset 0 -2px 0 rgba(0,0,0,0.16)';
    }
  }

  return (
    <span className="app-icon" style={boxStyle} aria-hidden="true">
      <svg width={gs} height={gs} viewBox="0 0 32 32" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`${uid}wf`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd869" /><stop offset="1" stopColor="#f4b400" /></linearGradient>
          <linearGradient id={`${uid}wb`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2b936" /><stop offset="1" stopColor="#d99a00" /></linearGradient>
          <linearGradient id={`${uid}mf`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#74c8ff" /><stop offset="1" stopColor="#2d8cff" /></linearGradient>
          <linearGradient id={`${uid}mb`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4aa8ff" /><stop offset="1" stopColor="#1f78f0" /></linearGradient>
          <linearGradient id={`${uid}lf`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8dbdf4" /><stop offset="1" stopColor="#62a0ea" /></linearGradient>
          <linearGradient id={`${uid}lb`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5c9ce8" /><stop offset="1" stopColor="#3584e4" /></linearGradient>
          <linearGradient id={`${uid}wg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a3afbf" /><stop offset="1" stopColor="#6b7480" /></linearGradient>
        </defs>
        {shape === 'folder' && (
          <>
            <path d="M3 8a2 2 0 0 1 2-2h7l3 3h12a2 2 0 0 1 2 2v2H3z" fill={f2} />
            <path d="M3 12h26v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill={f1} />
            {hasBar && <path d="M3 23h26v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill={f3} />}
          </>
        )}
        {shape === 'term' && (
          <>
            <rect x="3" y="5" width="26" height="22" rx="3.5" fill={f1} />
            {hasStrip && <path d="M3 8.5a3.5 3.5 0 0 1 3.5-3.5h19A3.5 3.5 0 0 1 29 8.5V10H3z" fill={f2} />}
            <path d="M8.5 14l5 4-5 4" stroke={f3} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.5 23h8" stroke={f3} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </>
        )}
        {shape === 'net' && (
          <>
            <path d="M16 11L7.5 21M16 11l8.5 10M11.5 25h9" stroke={f2} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <circle cx="16" cy="8" r="4.5" fill={f1} />
            <circle cx="7" cy="25" r="4.5" fill={f1} />
            <circle cx="25" cy="25" r="4.5" fill={f1} />
          </>
        )}
        {shape === 'gear' && (
          <>
            <circle cx="16" cy="16" r="12.5" fill="none" stroke={f1} strokeWidth="4.2" strokeDasharray="3.9 3.9" />
            <circle cx="16" cy="16" r="9" fill={f1} />
            <circle cx="16" cy="16" r="3.6" fill={f3} />
          </>
        )}
        {shape === 'doc' && (
          <>
            <path d="M8 3h11l7 7v17a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill={f1} stroke={st} strokeWidth="1.2" />
            <path d="M19 3v7h7" fill={f2} stroke={st} strokeWidth="1.2" strokeLinejoin="round" />
            {app === 'pdf' ? (
              <>
                <rect x="3" y="15" width="21" height="9.5" rx="2" fill={f4} />
                <text x="13.5" y="22.2" textAnchor="middle" fontSize="7" fontWeight="700" fill="#ffffff" fontFamily="Arial,sans-serif">PDF</text>
              </>
            ) : (
              <path d="M10 15h12M10 19h12M10 23h8" stroke={f3} strokeWidth="1.6" strokeLinecap="round" />
            )}
          </>
        )}
        {shape === 'slides' && (
          <>
            <rect x="3" y="5" width="26" height="17" rx="2" fill={f1} stroke={st} strokeWidth="1.2" />
            <path d="M16 22v4M10 28h12" stroke={st} strokeWidth="1.8" strokeLinecap="round" />
            <rect x="8" y="14" width="3.6" height="5" fill={f2} />
            <rect x="13.2" y="10.5" width="3.6" height="8.5" fill={f3} />
            <rect x="18.4" y="12.5" width="3.6" height="6.5" fill={f4} />
          </>
        )}
        {shape === 'image' && (
          <>
            <rect x="3" y="5" width="26" height="22" rx="2.5" fill={f1} stroke={st} strokeWidth="1.2" />
            <rect x="5.5" y="7.5" width="21" height="17" rx="1" fill={f2} />
            <path d="M5.5 24.5l7-8 5 5 3-3 6 6z" fill={f3} />
            <circle cx="21.5" cy="12" r="2.4" fill={f4} />
          </>
        )}
        {shape === 'video' && (
          <>
            <rect x="3" y="5" width="26" height="22" rx="2.5" fill={f1} stroke={st} strokeWidth="1.2" />
            <rect x="5.5" y="7.5" width="21" height="17" rx="1" fill={f2} />
            <path d="M13.5 11.5v9l7.5-4.5z" fill={f1} />
          </>
        )}
        {shape === 'chip' && (
          <>
            <path d="M11 4v4M16 4v4M21 4v4M11 24v4M16 24v4M21 24v4M4 11h4M4 16h4M4 21h4M24 11h4M24 16h4M24 21h4" stroke={f2} strokeWidth="2" strokeLinecap="round" />
            <rect x="8" y="8" width="16" height="16" rx="2.5" fill={f1} />
            <rect x="12" y="12" width="8" height="8" rx="1.2" fill={f3} />
          </>
        )}
        {shape === 'subnet' && (
          <>
            <rect x="3" y="4" width="26" height="24" rx="3" fill={f1} stroke={st} strokeWidth="1.2" />
            <rect x="6.5" y="7.5" width="8.5" height="7.5" rx="1.2" fill={f2} />
            <rect x="17" y="7.5" width="8.5" height="7.5" rx="1.2" fill={f3} />
            <rect x="6.5" y="17" width="8.5" height="7.5" rx="1.2" fill={f3} />
            <rect x="17" y="17" width="8.5" height="7.5" rx="1.2" fill={f4} />
          </>
        )}
        {shape === 'capture' && (
          <>
            <rect x="3" y="6" width="26" height="20" rx="3" fill={f2} stroke={f1} strokeWidth="1.6" />
            <path d="M6 18h4l2-6 3 10 3-13 3 9h5" stroke={f3} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="24" cy="18" r="1.8" fill={f4} />
          </>
        )}
        {shape === 'desk' && (
          <>
            <path d="M6.5 18v-3.5a9.5 9.5 0 0 1 19 0V18" stroke={f3} strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <rect x="4" y="16" width="6" height="9" rx="2.2" fill={f3} />
            <rect x="22" y="16" width="6" height="9" rx="2.2" fill={f3} />
            <path d="M25 25c0 2.8-3 4.3-7 4.3" stroke={f4 || f3} strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="16.8" cy="29.3" r="1.9" fill={f4 || f3} />
          </>
        )}
        {shape === 'mon' && (
          <>
            <rect x="3" y="5" width="26" height="19" rx="3" fill={f1} stroke={st} strokeWidth="1.2" />
            <path d="M7 19l4.5-5.5 4 3 5-7 4.5 5" stroke={f3} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 24v3M10.5 28h11" stroke={f3} strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}
        {shape === 'globe' && (
          <>
            <circle cx="16" cy="16" r="12.5" fill={f1} />
            <ellipse cx="16" cy="16" rx="5.2" ry="12.5" fill="none" stroke={f2} strokeWidth="1.5" />
            <path d="M3.8 12h24.4M3.8 20h24.4M16 3.5v25" stroke={f2} strokeWidth="1.5" fill="none" />
          </>
        )}
        {shape === 'trash' && (
          <>
            <rect x="5" y="6.5" width="22" height="3.6" rx="1.8" fill={f2} />
            <rect x="12" y="3.5" width="8" height="4" rx="1.6" fill={f2} />
            <path d="M7 11.5h18l-1.4 15a2.2 2.2 0 0 1-2.2 2H10.6a2.2 2.2 0 0 1-2.2-2z" fill={f1} stroke={st} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M12.5 15v9M16 15v9M19.5 15v9" stroke={f2} strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
      </svg>
    </span>
  );
}
