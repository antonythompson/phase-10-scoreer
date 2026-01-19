export interface PhaseInfo {
  number: number;
  description: string;
  requirement: string;
}

export const PHASES: PhaseInfo[] = [
  { number: 1, description: '2 sets of 3', requirement: 'Two groups of 3 cards with the same number' },
  { number: 2, description: '1 set of 3 + 1 run of 4', requirement: 'One group of 3 same numbers + 4 cards in sequence' },
  { number: 3, description: '1 set of 4 + 1 run of 4', requirement: 'One group of 4 same numbers + 4 cards in sequence' },
  { number: 4, description: '1 run of 7', requirement: 'Seven cards in sequence' },
  { number: 5, description: '1 run of 8', requirement: 'Eight cards in sequence' },
  { number: 6, description: '1 run of 9', requirement: 'Nine cards in sequence' },
  { number: 7, description: '2 sets of 4', requirement: 'Two groups of 4 cards with the same number' },
  { number: 8, description: '7 cards of one color', requirement: 'Seven cards of the same color' },
  { number: 9, description: '1 set of 5 + 1 set of 2', requirement: 'One group of 5 same numbers + one group of 2 same numbers' },
  { number: 10, description: '1 set of 5 + 1 set of 3', requirement: 'One group of 5 same numbers + one group of 3 same numbers' },
];

export const QUICK_SCORES = [5, 10, 15, 20, 25, 50, 75, 100];

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
