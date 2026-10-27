// Presentations and research, from Mark's old portfolio site (gh-pages branch of
// the Resume repo). The decks are exported PDFs in public/presentations.

export type Presentation = {
  id: string;
  fileName: string;
  title: string;
  subtitle: string;
  context: string;
  date: string;
  slides: number;
  summary: string;
  tags: string[];
  pdf: string;
};

export const presentations: Presentation[] = [
  {
    id: 'pres-netsec',
    fileName: 'Network Security Seminar.pptx',
    title: 'Navigating Network Security Through Network Protocols, Ports, NetStat, and Simulation of SQL Injection',
    subtitle: 'By Mark Plowright',
    context: 'Academic presentation',
    date: '[add date and audience]',
    slides: 14,
    summary:
      'A seminar covering network security fundamentals: network protocols analysis, port scanning techniques, NetStat, and a practical SQL injection simulation.',
    tags: ['Network security', 'Protocols', 'Port analysis', 'NetStat', 'SQL injection'],
    pdf: '/presentations/network-security-seminar.pdf',
  },
  {
    id: 'pres-chem',
    fileName: 'Chem + Comp Sci Seminar.pptx',
    title: 'GIGO: Computer Science + Machine Learning = Computational Chemistry and Discoveries',
    subtitle: 'By Mark Plowright',
    context: 'Chem + Comp Sci Seminar, University of Richmond',
    date: '[add date]',
    slides: 12,
    summary:
      'How machine learning and computational chemistry fit together: language levels in a computer system, SchNet, PIMM and molecular ML for predicting molecular properties and optimizing computational workflows.',
    tags: ['Machine learning', 'Computational chemistry', 'SchNet', 'PIMM', 'Molecular ML'],
    pdf: '/presentations/chem-comp-sci-seminar.pdf',
  },
  {
    id: 'pres-basis',
    fileName: 'Adaptive Basis Sets Seminar.pptx',
    title: 'Machine Learning Adaptive Basis Sets for Efficient Large Scale Density Functional Theory Simulation',
    subtitle: 'Revolutionizing DFT with Dynamic Basis Set Adaptation. By Mark Plowright',
    context: 'Research presentation on a Journal of Chemical Theory and Computation paper (Schütt and VandeVondele)',
    date: '[add date and audience]',
    slides: 19,
    summary:
      'How ML algorithms can optimize quantum mechanical basis set selection, improving computational efficiency while keeping accuracy in molecular property calculations.',
    tags: ['Machine learning', 'Computational chemistry', 'Adaptive basis sets', 'Quantum chemistry'],
    pdf: '/presentations/adaptive-basis-sets-seminar.pdf',
  },
];

export type Research = { id: string; name: string; kind: 'pdf' | 'link'; src: string; body: string };

export const research: Research[] = [
  {
    id: 'res-csc4111',
    name: 'CSC 4111 Network Traffic Analysis with ML.pdf',
    kind: 'pdf',
    src: '/papers/csc-4111-network-traffic-ml.pdf',
    body: 'Applied Network Traffic Analysis using Machine Learning: a Random Forest model in scikit-learn, trained on Wireshark captures, examining features of brute-force SSH and FTP attacks.',
  },
  {
    id: 'res-crc',
    name: 'Methodist University AI Research Publication.url',
    kind: 'link',
    src: 'https://www.methodist.edu/wp-content/uploads/2024/04/Booklet_CRC-Symposium_2024-1.pdf',
    body: 'AI technical research publication in higher education: computational chemistry and machine learning applications, published in the Methodist University CRC Symposium 2024 booklet.',
  },
];
