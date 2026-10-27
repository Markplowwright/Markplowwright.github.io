// Which file the Viewer shows, the current slide, and the email draft.
import { create } from 'zustand';

type ViewerState = {
  fileId: string;
  page: number;
  mailSubject: string;
  mailBody: string;
  open: (fileId: string) => void;
  setPage: (page: number) => void;
  setMail: (patch: { mailSubject?: string; mailBody?: string }) => void;
};

export const useViewerStore = create<ViewerState>((set) => ({
  fileId: 'resume',
  page: 0,
  mailSubject: '',
  mailBody: '',
  open: (fileId) => set({ fileId, page: 0 }),
  setPage: (page) => set({ page }),
  setMail: (patch) => set(patch),
}));
