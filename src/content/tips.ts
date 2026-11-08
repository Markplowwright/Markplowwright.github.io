// Guided notifications shown after sign-in.
// target: an app id (opens that app) or a file tree id (opens that folder or file).

export type Tip = { title: string; body: string; label: string; target: { app: string } | { node: string } | { search: string } };

export const welcome = {
  title: 'Welcome to Mark Leslie Plowright OS',
  body: 'Look around to learn about me. Open the About Me folder to start, or right-click the desktop.',
};

export const tips: Tip[] = [
  { title: 'Start with my projects', body: 'Each build has an overview, what I built and links. This is the best place to begin.', label: 'Open Work & Projects', target: { node: 'work' } },
  { title: 'Search my portfolio in the Browser', body: 'Look up a skill like Group Policy or Intune and jump straight to the proof: projects, screenshots and video.', label: 'Search in the Browser', target: { search: 'Group Policy' } },
  { title: 'Check out my Windows Server Home Lab', body: 'A domain controller, a joined client and six Group Policies, all built in Azure.', label: 'Open the lab', target: { node: 'p-homelab' } },
  { title: 'Here is where my presentations live', body: 'Seminars on network security and machine learning in computational chemistry.', label: 'Open Presentations', target: { node: 'pres' } },
  { title: 'Get to know me outside of work', body: 'Music, chess, writing, books, sports, games and audio.', label: 'Open Interests', target: { node: 'interests' } },
  { title: 'Meet GradAisle', body: 'The graduate school matching platform I co-founded, with 1,000+ programs in one place.', label: 'Open GradAisle', target: { node: 'p-grad' } },
  { title: 'Want to get in touch?', body: 'Email me from the Contact file, or read my resume.', label: 'Open Contact', target: { node: 'contact' } },
];

/** Seconds after sign-in when each tip appears (first after about 15s, then every 30 to 40s). */
export const tipTimes = [15, 50, 85, 120, 155, 190, 225, 260];
