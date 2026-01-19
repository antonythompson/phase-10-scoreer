import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { useStableLandscape } from '../utils/useStableLandscape';

export default function SavedGamesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLandscape = useStableLandscape();
  const { savedGames, loadSavedGame, deleteSavedGame, endSavedGame } = useGameStore();

  const handleLoad = (gameId: string) => {
    loadSavedGame(gameId);
    router.replace('/game');
  };

  const handleEnd = (gameId: string, playerNames: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('End this game and move it to past games?')) {
        endSavedGame(gameId);
      }
    } else {
      Alert.alert('End Game', `End this game and move it to past games?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Game',
          onPress: () => endSavedGame(gameId),
        },
      ]);
    }
  };

  const handleDelete = (gameId: string, playerNames: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete saved game with ${playerNames}?`)) {
        deleteSavedGame(gameId);
      }
    } else {
      Alert.alert('Delete Game', `Delete saved game with ${playerNames}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSavedGame(gameId),
        },
      ]);
    }
  };

  if (savedGames.length === 0) {
    return (
      <View style={[
        styles.container,
        isLandscape && {
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        }
      ]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No saved games</Text>
          <Text style={styles.emptySubtext}>Save a game to continue it later</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isLandscape && {
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
          paddingBottom: Math.max(insets.bottom, 16),
        }
      ]}
    >
      {savedGames.map((game) => {
        const playerNames = game.players.map((p) => p.name).join(', ');
        const date = new Date(game.updatedAt).toLocaleDateString();

        return (
          <View key={game.id} style={styles.gameCard}>
            <TouchableOpacity style={styles.gameInfo} onPress={() => handleLoad(game.id)}>
              <Text style={styles.playerNames} numberOfLines={1}>
                {playerNames}
              </Text>
              <View style={styles.gameDetails}>
                <Text style={styles.detailText}>Round {game.currentRound}</Text>
                <Text style={styles.detailText}>•</Text>
                <Text style={styles.detailText}>{date}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.loadButton} onPress={() => handleLoad(game.id)}>
                <Text style={styles.loadButtonText}>Load</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.endButton}
                onPress={() => handleEnd(game.id, playerNames)}
              >
                <Text style={styles.endButtonText}>End</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(game.id, playerNames)}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
  },
  gameInfo: {
    flex: 1,
  },
  playerNames: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  gameDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#a0a0a0',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  endButton: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  endButtonText: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#a0a0a0',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
