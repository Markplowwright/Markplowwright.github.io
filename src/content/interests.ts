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
      'Mark is a musician who composes his own music.',
      'He received the Young Musician Scholarship in the Cayman Islands (2017 to 2020) for musical excellence and winning performances, and performed at events throughout.',
    ],
  },
  {
    id: 'int-audio',
    name: 'Audio.txt',
    title: 'Audio',
    summary: 'Audiophile',
    body: [
      'Mark is an audiophile.',
      'It ties in with his AV work, where he has set up audio distribution, touch panels and video conferencing for events.',
    ],
  },
  {
    id: 'int-chess',
    name: 'Chess.txt',
    title: 'Chess',
    summary: 'Chess player, founded a university chess club',
    body: [
      'Mark plays chess and founded the Methodist University Chess Club (2022 to 2024).',
      'He recruited members, taught beginners strategy and ran tournaments: the club grew to 45+ active members and held 12+ tournaments with 100+ participants.',
    ],
  },
  {
    id: 'int-reading',
    name: 'Reading.txt',
    title: 'Reading',
    summary: 'Last finished: Never Split the Difference',
    body: ['Mark enjoys reading.', 'Last book finished: Never Split the Difference by Chris Voss.'],
  },
  {
    id: 'int-sports',
    name: 'Sports & Fitness.txt',
    title: 'Sports and fitness',
    summary: 'Gym, basketball and football',
    body: [
      'Regular at the gym.',
      'Plays and follows basketball and football, and is learning more about the American football game.',
    ],
  },
  {
    id: 'int-games',
    name: 'Video Games.txt',
    title: 'Video games',
    summary: 'Gamer',
    body: ['Mark enjoys video games.'],
  },
];

export const writing = {
  title: 'Writing',
  summary: 'Writer and published poet',
  body: [
    'Mark writes, and has published poems.',
    'He founded Writers Ink, a creative writing club at Methodist University (2022 to 2024): it ran writing workshops and critique sessions and published 3 student anthologies with 50+ contributors.',
  ],
  /** Mark's poems go here: { id, name: 'Title.txt', body: 'the poem' }. */
  poems: [] as { id: string; name: string; body: string }[],
  poemsPlaceholder: '[add Mark’s published poems: title, where it was published, and the poem or a link]',
};

/** One line used by the terminal and short summaries. */
export const interestsOneLine = 'Musician, chess player, writer and published poet, reader, gym, basketball and football, video games, audiophile';
