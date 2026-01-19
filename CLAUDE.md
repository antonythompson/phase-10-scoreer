# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Phase 10 Scorer is a React Native cross-platform mobile app (iOS, Android, Web) built with Expo and TypeScript. It's a digital scoreboard for tracking the card game Phase 10.

## Development Commands

```bash
# Start development server (interactive platform selection)
npm start

# Platform-specific
npm run android     # Launch Android emulator/device
npm run ios         # Launch iOS simulator
npm run web         # Launch web browser

# Install dependencies
npm install
```

## Tech Stack

- **Framework**: Expo 54 with React Native 0.81
- **Navigation**: Expo Router (file-based routing in `/app`)
- **State Management**: Zustand with AsyncStorage persistence
- **Language**: TypeScript (strict mode)
- **Node Version**: 22 (see `.nvmrc`)

## Architecture

### Directory Structure

- `app/` - Expo Router screens (file-based routing)
- `store/gameStore.ts` - Zustand store (single global store, persisted)
- `types/game.ts` - TypeScript interfaces (Game, Player, RoundScore)
- `constants/phases.ts` - Phase definitions, game constants
- `utils/scoring.ts` - Scoring utilities (rankPlayers, checkWinner, generateId)

### State Management

Single Zustand store (`useGameStore`) with three branches:
- **Game state**: `currentGame`, `savedGames`, `gameHistory`
- **Scoring state**: Temporary round scoring (`scoring`, `currentPlayerIndex`)
- **UI state**: `lastPlayerNames`, `pendingPlayerNames`

### Data Model

- **Game**: id, status (active/completed), players[], currentRound, winner
- **Player**: id, name, currentPhase (1-10, >10 = winner), totalScore, rounds[]
- **RoundScore**: score, phaseCompleted, phaseAttempted per round

### Styling

- React Native StyleSheet (no CSS-in-JS library)
- Dark theme: primary (#1a1a2e), background (#16213e), accent (#e94560)
- Responsive layouts using `useWindowDimensions()` with landscape detection

## Key Business Rules

- 10 phases total, players advance individually
- Scores < 50 automatically trigger phase completion
- Game completes when a player finishes Phase 10
- All data persists locally via AsyncStorage (no backend)
- Players: min 2, max 6

## Configuration Notes

- TypeScript strict mode enabled
- Dark mode enforced (`userInterfaceStyle: "dark"` in app.json)
- React Native New Architecture enabled
- No testing infrastructure currently configured
- No ESLint/Prettier config (uses Expo defaults)
