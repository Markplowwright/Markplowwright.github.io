// Mark outside of work. Shown as the About Mark/Interests folder, in the
// phone's About app and by the terminal's "interests" command.
// Club details come from Mark's old portfolio site.

export type Interest = { id: string; name: string; title: string; summary: string; body: string[] };

export const interests: Interest[] = [
  {
    id: 'int-music',
    name: 'Music.txt',
    title: 'Music',
    summary: 'Musician and composer',
    body: [
      'I am a musician and I compose my own music.',
    ],
  },
  {
    id: 'int-audio',
    name: 'Audio.txt',
    title: 'Audio',
    summary: 'Audiophile',
    body: [
      'I am an audiophile.',
      'I love music, whether I am making it or listening to it, but on a geek level.',
    ],
  },
  {
    id: 'int-chess',
    name: 'Chess.txt',
    title: 'Chess',
    summary: 'Chess player, founded a university chess club',
    body: [
      'I play chess and founded the Methodist University Chess Club (2022 to 2024).',
      'I recruited members, taught beginners strategy and ran tournaments: the club grew to 45+ active members and held 12+ tournaments with 100+ participants.',
    ],
  },
  {
    id: 'int-reading',
    name: 'Reading.txt',
    title: 'Reading',
    summary: 'Last finished: Never Split the Difference',
    body: ['I enjoy reading.', 'Last book finished: Never Split the Difference by Chris Voss.'],
  },
  {
    id: 'int-sports',
    name: 'Sports & Fitness.txt',
    title: 'Sports and fitness',
    summary: 'Gym, ultimate frisbee, basketball and football',
    body: [
      'I am a regular at the gym, and I play ultimate frisbee.',
      'I play and follow basketball and football, and am learning more about the American football game.',
    ],
  },
  {
    id: 'int-games',
    name: 'Video Games.txt',
    title: 'Video games',
    summary: 'Gamer',
    body: ['I enjoy video games.'],
  },
];

export const writing = {
  title: 'Writing',
  summary: 'Writer and published poet',
  body: [
    'I write, and have published poems.',
    'I founded Writers Ink, a creative writing club at Methodist University (2022 to 2024): it ran writing workshops and critique sessions and published 3 student anthologies with 50+ contributors.',
  ],
};

/**
 * Poems and music live on their own site. Put its address in url and a
 * "See my poems and music" link appears in Interests. Hidden while empty.
 */
export const creativeSite = { name: 'See my poems and music', url: '' };

/** One line used by the terminal and short summaries. */
export const interestsOneLine = 'Musician, chess player, writer and published poet, reader, gym, ultimate frisbee, basketball and football, video games, audiophile';
