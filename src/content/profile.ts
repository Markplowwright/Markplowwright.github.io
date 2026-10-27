// Everything about Mark that appears on the site. Facts come from his resume
// (public/resume.pdf), his old portfolio site and his GitHub repositories.

export type Job = {
  title: string;
  company: string;
  location: string;
  period: string;
  points: string[];
};

export const profile = {
  name: 'Mark Plowright',
  fullName: 'Mark Leslie Plowright',
  initials: 'MP',
  osName: 'Mark Leslie Plowright OS',
  role: 'Field Systems Engineer at Fairdinkum',
  tagline: 'IT support, networking, and systems',
  location: 'New York City, NY',
  motto: 'Learn a little about a lot.',
  summary:
    'IT support professional with experience since 2022 across K-12 schools, a university research lab, and summer programs. Hands-on with Mac and Windows support, Jamf, networks, AV and video conferencing, ticketing, and end-user training.',
  bio: [
    'Mark Plowright. Field Systems Engineer at Fairdinkum in New York City, starting November 2026.',
    'IT support professional with experience since 2022 across K-12 schools, a university research lab, and summer programs. Hands-on with Mac and Windows support, Jamf, networks, AV and video conferencing, ticketing, and end-user training.',
    'Outside of support work he builds things: GradAisle, a free graduate school discovery platform he co-founded, plus home labs for Windows Server, Active Directory and Microsoft 365 administration.',
    'B.S. in Computer Information Technology (Cyber Security and Information Assurance) from Methodist University. "Learn a little about a lot."',
  ],
  // Mark's public contact details, as listed on his resume.
  email: 'mlpplowright@gmail.com',
  links: {
    github: 'https://github.com/Markplowwright',
    linkedin: 'https://www.linkedin.com/in/mark-plowright-a667a1167',
    gradaisle: 'https://gradaisle.com',
  },
  // Shown in the desktop widget under "Currently building".
  building: ['GradAisle (web app)', 'Windows Server home lab in Azure', 'This portfolio OS'],
  experience: [
    {
      title: 'Field Systems Engineer',
      company: 'Fairdinkum',
      location: 'New York City, NY',
      period: 'Nov 2026 – Present',
      points: ['[add what you do in this role once you start]'],
    },
    {
      title: 'School Technology Specialist',
      company: 'ACS International Resources (Inspiroz)',
      location: 'New York City, NY',
      period: 'Feb 2026 – Oct 2026',
      points: [
        'Provided on-site support for multiple school environments. Solved technical issues for staff and students on Mac and Windows, including Adobe, Office 365, and Zoom. AV and video conferencing set up for events.',
        'Maintained accurate documentation trails for tickets in ConnectWise and Incident IQ. Jamf enrollment for MacBooks, iPads, inventory tracking, user policies set up.',
        'Troubleshot printer servers, Mac mini, routers, switches, MDF with IDF server rack cabling, Wi-Fi, firewalls, access point management, along with key fob set up.',
        'Onsite for 5 schools per week providing support for buildings by provisioning, patching, inventory for all tech management.',
      ],
    },
    {
      title: 'STEM Problem-Solving Teacher',
      company: 'Success Academy Charter School',
      location: 'Brooklyn, NY',
      period: 'Jul 2025 – Jan 2026',
      points: [
        'Collected and analyzed performance data from exams, quizzes, and assignments across each classroom to identify learning gaps and adjust instruction accordingly. Used the (LMS) Education Institute (EI) Learning Portal for tracking students and data to determine outcomes.',
        'Made engaging slides for 35 students per class across 4 different classrooms, encompassing topics of logic-based mathematics and problem-solving strategies.',
      ],
    },
    {
      title: 'Technical Trainer, Computational Chemistry Machine Learning',
      company: 'University of Richmond (short-term contract)',
      location: 'Richmond, VA',
      period: 'Apr 2025 – Jul 2025',
      points: [
        'Trained Post-Baccalaureate researchers through a Python/LLM-driven research tool through presentations, group sessions, and 1-on-1 coaching.',
        'Created and continuously improved SOPs, FAQs, troubleshooting guides, and internal knowledge bases to standardize processes and reduce reliance on ad hoc support.',
        'Owned the technical lifecycle of hardware computer lab systems, coordinating maintenance and access across a shared research environment.',
      ],
    },
    {
      title: 'IT Coordinator / AV Coordinator',
      company: 'The Exploration School Summer Program',
      location: 'Bronxville, NY',
      period: 'Jun 2022 – Aug 2024',
      points: [
        'Delivered Tier 2/3 technical support using Windows CLI and Task Manager based diagnostics and PowerShell scripting.',
        'Configured and secured network connectivity for 100+ endpoints (iPads, phones, laptops, VoIP handsets) using NEC Univerge Blue.',
        'Managed integrated building systems (Crestron touch panels, AV distribution, lighting/control systems). AV and video conferencing set up for events.',
      ],
    },
    {
      title: 'Co-Founder and Lead Project Manager',
      company: 'GradAisle',
      location: 'GradAisle.com',
      period: 'Apr 2025 – Present',
      points: [
        'Led a 3-person distributed team through biweekly planning syncs for planning and building the platform.',
        'Built an AI-assisted pipeline that turns unstructured university PDFs into a structured PostgreSQL schema powering a 1,000+ program dataset.',
        'Built and shipped the core platform end-to-end (Next.js 14, Supabase/Postgres, Redis), including the deployment pipeline on a self-hosted VPS (Dokploy, Traefik).',
      ],
    },
  ] satisfies Job[],
  education: {
    degree: 'B.S. Computer Information Technology, Cyber Security and Information Assurance concentration',
    school: 'Methodist University',
    location: 'Fayetteville, NC',
    period: 'Jan 2021 – Dec 2024',
  },
};
