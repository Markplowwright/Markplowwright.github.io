// Guided notifications shown after sign-in, written in the third person.
// target: an app id (opens that app) or a file tree id (opens that folder or file).

export type Tip = { title: string; body: string; label: string; target: { app: string } | { node: string } };

export const welcome = {
  title: 'Welcome to Mark Leslie Plowright OS',
  body: 'Look around to learn about Mark. Open the About Mark folder to start, or right-click the desktop.',
};

export const tips: Tip[] = [
  { title: "Start with Mark's projects", body: 'Each build has an overview, what he built and links. This is the best place to begin.', label: 'Open Work & Projects', target: { node: 'work' } },
  { title: "Check out Mark's Windows Server Home Lab", body: 'A domain controller, a joined client and six Group Policies, all built in Azure.', label: 'Open the lab', target: { node: 'p-homelab' } },
  { title: "Here is where Mark's presentations live", body: 'Seminars on network security and machine learning in computational chemistry.', label: 'Open Presentations', target: { node: 'pres' } },
  { title: "Try Mark's Terminal", body: 'Type help to see what it can do. There is an easter egg too.', label: 'Open Terminal', target: { app: 'terminal' } },
  { title: 'Meet GradAisle', body: 'The graduate school matching platform Mark co-founded, with 1,000+ programs in one place.', label: 'Open GradAisle', target: { node: 'p-grad' } },
  { title: 'See how Mark reads a security alert', body: 'Sample events, what each one means and the right response.', label: 'Open Event Viewer', target: { app: 'eventlog' } },
  { title: 'Want to get in touch with Mark?', body: 'Email him from the Contact file, or read his resume.', label: 'Open Contact', target: { node: 'contact' } },
];

/** Seconds after sign-in when each tip appears (first after about 15s, then every 30 to 40s). */
export const tipTimes = [15, 50, 85, 120, 155, 190, 225];
