import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { rankPlayers } from '../utils/scoring';
import { useStableLandscape } from '../utils/useStableLandscape';

export default function GameHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLandscape = useStableLandscape();
  const { gameHistory, clearHistory, setPendingPlayers } = useGameStore();

  const handlePlayAgain = (playerNames: string[]) => {
    setPendingPlayers(playerNames);
    router.push('/setup');
  };

  const handleClearHistory = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete all past games?')) {
        clearHistory();
      }
    } else {
      Alert.alert('Clear History', 'Are you sure you want to delete all past games?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearHistory,
        },
      ]);
    }
  };

  if (gameHistory.length === 0) {
    return (
      <View style={[
        styles.container,
        isLandscape && {
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        }
      ]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No completed games</Text>
          <Text style={styles.emptySubtext}>Finish a game to see it here</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={[
        styles.content,
        isLandscape && {
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
          paddingBottom: Math.max(insets.bottom, 16),
        }
      ]}>
        {gameHistory.map((game) => {
          const rankedPlayers = rankPlayers(game.players);
          const winner = game.winner ? game.players.find((p) => p.id === game.winner) : rankedPlayers[0];
          const date = new Date(game.createdAt).toLocaleDateString();

          return (
            <View key={game.id} style={styles.gameCard}>
              <View style={styles.gameHeader}>
                <Text style={styles.gameDate}>{date}</Text>
                <Text style={styles.roundCount}>{game.currentRound - 1} rounds</Text>
              </View>

              {winner && (
                <View style={styles.winnerRow}>
                  <Text style={styles.winnerLabel}>Winner:</Text>
                  <Text style={styles.winnerName}>{winner.name}</Text>
                </View>
              )}

              <View style={styles.playersList}>
                {rankedPlayers.map((player, index) => (
                  <View key={player.id} style={styles.playerRow}>
                    <Text style={styles.rank}>{index + 1}.</Text>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerScore}>{player.totalScore} pts</Text>
                    <Text style={styles.playerPhase}>P{Math.min(player.currentPhase, 10)}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.playAgainButton}
                onPress={() => handlePlayAgain(game.players.map((p) => p.name))}
              >
                <Text style={styles.playAgainButtonText}>Play Again</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.clearButton,
          { marginBottom: Math.max(insets.bottom, 16) }
        ]}
        onPress={handleClearHistory}
      >
        <Text style={styles.clearButtonText}>Clear History</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  gameCard: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gameDate: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  roundCount: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  winnerLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginRight: 8,
  },
  winnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e94560',
  },
  playersList: {
    gap: 8,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    width: 24,
    fontSize: 14,
    color: '#a0a0a0',
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  playerScore: {
    fontSize: 14,
    color: '#fff',
    marginRight: 12,
  },
  playerPhase: {
    fontSize: 14,
    color: '#e94560',
    fontWeight: '600',
  },
  playAgainButton: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    alignItems: 'center',
  },
  playAgainButtonText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e94560',
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#e94560',
  },
});
