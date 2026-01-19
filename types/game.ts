export interface RoundScore {
  round: number;
  score: number;
  phaseCompleted: boolean;
  phaseAttempted: number;
}

export interface Player {
  id: string;
  name: string;
  currentPhase: number; // 1-10, becomes 11 when game is won
  totalScore: number;
  rounds: RoundScore[];
}

export interface Game {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed';
  currentRound: number;
  players: Player[];
  winner?: string; // Player ID
}

export interface GameHistory {
  games: Game[];
}
