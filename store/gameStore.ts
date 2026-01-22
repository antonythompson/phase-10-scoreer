import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, Player, RoundScore } from '../types/game';
import { generateId, checkWinner } from '../utils/scoring';

interface ScoringState {
  currentPlayerIndex: number;
  scores: { playerId: string; score: number; phaseCompleted: boolean }[];
}

interface GameState {
  currentGame: Game | null;
  savedGames: Game[];
  gameHistory: Game[];
  scoring: ScoringState | null;
  lastPlayerNames: string[];
  pendingPlayerNames: string[] | null;

  // Game actions
  startNewGame: (playerNames: string[]) => void;
  startNewGameWithPlayers: (playerNames: string[]) => void;
  setPendingPlayers: (playerNames: string[]) => void;
  clearPendingPlayers: () => void;
  continueGame: () => boolean;
  endGame: () => void;
  saveGameForLater: () => void;
  loadSavedGame: (gameId: string) => void;
  deleteSavedGame: (gameId: string) => void;
  endSavedGame: (gameId: string) => void;

  // Scoring actions
  startScoring: () => void;
  setPlayerScore: (playerId: string, score: number, phaseCompleted: boolean) => void;
  nextPlayer: () => boolean;
  previousPlayer: () => void;
  finishRound: () => void;
  cancelScoring: () => void;

  // History actions
  clearHistory: () => void;

  // Round editing
  updateRoundScore: (playerId: string, round: number, score: number, phaseCompleted: boolean) => void;

  // Player ordering
  reorderPlayers: (fromIndex: number, toIndex: number) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentGame: null,
      savedGames: [],
      gameHistory: [],
      scoring: null,
      lastPlayerNames: [],
      pendingPlayerNames: null,

      startNewGame: (playerNames: string[]) => {
        const players: Player[] = playerNames.map((name) => ({
          id: generateId(),
          name,
          currentPhase: 1,
          totalScore: 0,
          rounds: [],
        }));

        const newGame: Game = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          currentRound: 1,
          players,
        };

        set({ currentGame: newGame, scoring: null, lastPlayerNames: playerNames });
      },

      startNewGameWithPlayers: (playerNames: string[]) => {
        get().startNewGame(playerNames);
      },

      setPendingPlayers: (playerNames: string[]) => {
        set({ pendingPlayerNames: playerNames });
      },

      clearPendingPlayers: () => {
        set({ pendingPlayerNames: null });
      },

      continueGame: () => {
        const { currentGame } = get();
        return currentGame !== null && currentGame.status === 'active';
      },

      endGame: () => {
        const { currentGame, gameHistory } = get();
        if (currentGame) {
          const completedGame: Game = {
            ...currentGame,
            status: 'completed',
            updatedAt: new Date().toISOString(),
          };
          set({
            currentGame: null,
            gameHistory: [completedGame, ...gameHistory],
            scoring: null,
          });
        }
      },

      saveGameForLater: () => {
        const { currentGame, savedGames } = get();
        if (currentGame) {
          const gameToSave: Game = {
            ...currentGame,
            updatedAt: new Date().toISOString(),
          };
          // Remove if already saved (update), then add to front
          const filteredSaved = savedGames.filter((g) => g.id !== currentGame.id);
          set({
            currentGame: null,
            savedGames: [gameToSave, ...filteredSaved],
            scoring: null,
          });
        }
      },

      loadSavedGame: (gameId: string) => {
        const { savedGames, currentGame } = get();
        const gameToLoad = savedGames.find((g) => g.id === gameId);
        if (gameToLoad) {
          // If there's a current game, save it first
          let updatedSavedGames = savedGames.filter((g) => g.id !== gameId);
          if (currentGame) {
            updatedSavedGames = [
              { ...currentGame, updatedAt: new Date().toISOString() },
              ...updatedSavedGames,
            ];
          }
          set({
            currentGame: gameToLoad,
            savedGames: updatedSavedGames,
            scoring: null,
          });
        }
      },

      deleteSavedGame: (gameId: string) => {
        const { savedGames } = get();
        set({
          savedGames: savedGames.filter((g) => g.id !== gameId),
        });
      },

      endSavedGame: (gameId: string) => {
        const { savedGames, gameHistory } = get();
        const gameToEnd = savedGames.find((g) => g.id === gameId);
        if (gameToEnd) {
          const completedGame: Game = {
            ...gameToEnd,
            status: 'completed',
            updatedAt: new Date().toISOString(),
          };
          set({
            savedGames: savedGames.filter((g) => g.id !== gameId),
            gameHistory: [completedGame, ...gameHistory],
          });
        }
      },

      startScoring: () => {
        const { currentGame } = get();
        if (!currentGame) return;

        const scores = currentGame.players.map((player) => ({
          playerId: player.id,
          score: 0,
          phaseCompleted: false,
        }));

        set({
          scoring: {
            currentPlayerIndex: 0,
            scores,
          },
        });
      },

      setPlayerScore: (playerId: string, score: number, phaseCompleted: boolean) => {
        const { scoring } = get();
        if (!scoring) return;

        const updatedScores = scoring.scores.map((s) =>
          s.playerId === playerId ? { ...s, score, phaseCompleted } : s
        );

        set({
          scoring: {
            ...scoring,
            scores: updatedScores,
          },
        });
      },

      nextPlayer: () => {
        const { scoring, currentGame } = get();
        if (!scoring || !currentGame) return false;

        const nextIndex = scoring.currentPlayerIndex + 1;
        if (nextIndex >= currentGame.players.length) {
          return false; // No more players
        }

        set({
          scoring: {
            ...scoring,
            currentPlayerIndex: nextIndex,
          },
        });
        return true;
      },

      previousPlayer: () => {
        const { scoring } = get();
        if (!scoring || scoring.currentPlayerIndex <= 0) return;

        set({
          scoring: {
            ...scoring,
            currentPlayerIndex: scoring.currentPlayerIndex - 1,
          },
        });
      },

      finishRound: () => {
        const { currentGame, scoring, gameHistory } = get();
        if (!currentGame || !scoring) return;

        const updatedPlayers = currentGame.players.map((player) => {
          const playerScore = scoring.scores.find((s) => s.playerId === player.id);
          if (!playerScore) return player;

          const roundScore: RoundScore = {
            round: currentGame.currentRound,
            score: playerScore.score,
            phaseCompleted: playerScore.phaseCompleted,
            phaseAttempted: player.currentPhase,
          };

          return {
            ...player,
            totalScore: player.totalScore + playerScore.score,
            currentPhase: playerScore.phaseCompleted ? player.currentPhase + 1 : player.currentPhase,
            rounds: [...player.rounds, roundScore],
          };
        });

        const updatedGame: Game = {
          ...currentGame,
          currentRound: currentGame.currentRound + 1,
          players: updatedPlayers,
          updatedAt: new Date().toISOString(),
        };

        // Check for winner
        const winner = checkWinner(updatedPlayers);
        if (winner) {
          const completedGame: Game = {
            ...updatedGame,
            status: 'completed',
            winner: winner.id,
          };
          set({
            currentGame: null,
            gameHistory: [completedGame, ...gameHistory],
            scoring: null,
          });
        } else {
          set({
            currentGame: updatedGame,
            scoring: null,
          });
        }
      },

      cancelScoring: () => {
        set({ scoring: null });
      },

      clearHistory: () => {
        set({ gameHistory: [] });
      },

      updateRoundScore: (playerId: string, round: number, score: number, phaseCompleted: boolean) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const updatedPlayers = currentGame.players.map((player) => {
          if (player.id !== playerId) return player;

          const updatedRounds = player.rounds.map((r) => {
            if (r.round !== round) return r;
            return { ...r, score, phaseCompleted };
          });

          // Recalculate total score
          const totalScore = updatedRounds.reduce((sum, r) => sum + r.score, 0);

          // Recalculate current phase (1 + number of completed phases)
          const completedPhases = updatedRounds.filter((r) => r.phaseCompleted).length;
          const currentPhase = 1 + completedPhases;

          return {
            ...player,
            rounds: updatedRounds,
            totalScore,
            currentPhase,
          };
        });

        set({
          currentGame: {
            ...currentGame,
            players: updatedPlayers,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      reorderPlayers: (fromIndex: number, toIndex: number) => {
        const { currentGame } = get();
        if (!currentGame) return;
        if (fromIndex < 0 || fromIndex >= currentGame.players.length) return;
        if (toIndex < 0 || toIndex >= currentGame.players.length) return;
        if (fromIndex === toIndex) return;

        const updatedPlayers = [...currentGame.players];
        [updatedPlayers[fromIndex], updatedPlayers[toIndex]] = [
          updatedPlayers[toIndex],
          updatedPlayers[fromIndex],
        ];

        set({
          currentGame: {
            ...currentGame,
            players: updatedPlayers,
            updatedAt: new Date().toISOString(),
          },
        });
      },
    }),
    {
      name: 'phase10-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
