// The list of every app: the single source of truth.
//
// To add an app: create src/apps/<name>/index.tsx (default export a component
// that takes { windowId }), add its id to AppId in types.ts, then add one entry
// below. The taskbar, dock, start menu, search and window manager pick it up.
//
// Components are loaded lazily, so each app is its own small JavaScript file
// that downloads the first time it is opened.
import { lazy } from 'react';
import type { AppDefinition, AppId } from './types';

export const apps: AppDefinition[] = [
  {
    id: 'files',
    title: { windows: 'File Explorer', mac: 'Finder', linux: 'Files' },
    icon: 'files',
    component: lazy(() => import('../apps/files')),
    defaultSize: { w: 820, h: 480 },
    singleInstance: true,
    pinned: true,
  },
  {
    id: 'terminal',
    title: { windows: 'Terminal', mac: 'Terminal', linux: 'Terminal' },
    icon: 'terminal',
    component: lazy(() => import('../apps/terminal')),
    defaultSize: { w: 640, h: 400 },
    singleInstance: true,
    pinned: true,
  },
  {
    id: 'browser',
    title: { windows: 'Browser', mac: 'Browser', linux: 'Browser' },
    icon: 'browser',
    component: lazy(() => import('../apps/browser')),
    defaultSize: { w: 880, h: 580 },
    singleInstance: true,
    pinned: true,
  },
  {
    id: 'taskmgr',
    title: { windows: 'Task Manager', mac: 'Activity Monitor', linux: 'System Monitor' },
    icon: 'taskmgr',
    component: lazy(() => import('../apps/taskmgr')),
    defaultSize: { w: 700, h: 480 },
    singleInstance: true,
    pinned: true,
  },
  {
    id: 'eventlog',
    title: { windows: 'Event Viewer', mac: 'Console', linux: 'Logs' },
    icon: 'eventlog',
    component: lazy(() => import('../apps/eventlog')),
    defaultSize: { w: 720, h: 420 },
    singleInstance: true,
    pinned: true,
  },
  {
    id: 'network',
    title: { windows: 'Network Map', mac: 'Network Map', linux: 'Network Map' },
    icon: 'network',
    component: lazy(() => import('../apps/network-map')),
    defaultSize: { w: 660, h: 580 },
    singleInstance: true,
    pinned: true,
  },
  {
    id: 'settings',
    title: { windows: 'Settings', mac: 'System Settings', linux: 'Settings' },
    icon: 'settings',
    component: lazy(() => import('../apps/settings')),
    defaultSize: { w: 680, h: 460 },
    singleInstance: true,
    pinned: true,
  },
  {
    id: 'viewer',
    title: { windows: 'Viewer', mac: 'Preview', linux: 'Document Viewer' },
    icon: 'viewer',
    component: lazy(() => import('../apps/viewer')),
    defaultSize: { w: 640, h: 520 },
    singleInstance: true,
  },
  // Ticket Queue: removed from the plan for now. Mark will add his own
  // examples later; it slots in here as one more entry.
];

export const APP_IDS = apps.map((a) => a.id);

export function getApp(id: AppId): AppDefinition {
  const a = apps.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown app: ${id}`);
  return a;
}

export const isAppId = (v: unknown): v is AppId => typeof v === 'string' && (APP_IDS as string[]).includes(v);
