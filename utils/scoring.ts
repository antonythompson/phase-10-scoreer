import { Player } from '../types/game';

export const shouldAutoCompletePhase = (score: number): boolean => {
  return score < 50;
};

export const rankPlayers = (players: Player[]): Player[] => {
  return [...players].sort((a, b) => {
    // First by phase (higher = better)
    if (b.currentPhase !== a.currentPhase) {
      return b.currentPhase - a.currentPhase;
    }
    // Then by score (lower = better)
    return a.totalScore - b.totalScore;
  });
};

export const checkWinner = (players: Player[]): Player | undefined => {
  return players.find(p => p.currentPhase > 10);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
