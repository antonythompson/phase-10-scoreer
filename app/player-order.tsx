import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { useStableLandscape } from '../utils/useStableLandscape';

export default function PlayerOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLandscape = useStableLandscape();
  const { currentGame, reorderPlayers } = useGameStore();

  if (!currentGame) {
    router.replace('/');
    return null;
  }

  const movePlayer = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentGame.players.length) return;
    reorderPlayers(index, newIndex);
  };

  const PlayersList = () => (
    <ScrollView style={styles.playersList} contentContainerStyle={styles.playersContent}>
      <Text style={styles.hint}>Use arrows to change scoring order</Text>
      {currentGame.players.map((player, index) => (
        <View key={player.id} style={styles.playerCard}>
          <View style={styles.orderNumber}>
            <Text style={styles.orderNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerPhase}>Phase {player.currentPhase}</Text>
          </View>
          <View style={styles.orderButtons}>
            <TouchableOpacity
              style={[styles.orderButton, index === 0 && styles.orderButtonDisabled]}
              onPress={() => movePlayer(index, 'up')}
              disabled={index === 0}
            >
              <Text style={[styles.orderButtonText, index === 0 && styles.orderButtonTextDisabled]}>▲</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.orderButton, index === currentGame.players.length - 1 && styles.orderButtonDisabled]}
              onPress={() => movePlayer(index, 'down')}
              disabled={index === currentGame.players.length - 1}
            >
              <Text style={[styles.orderButtonText, index === currentGame.players.length - 1 && styles.orderButtonTextDisabled]}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const ControlPanel = () => (
    <View style={[styles.buttonContainer, isLandscape && styles.buttonContainerLandscape]}>
      <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLandscape) {
    return (
      <View style={[styles.containerLandscape, { paddingLeft: insets.left, paddingRight: insets.right }]}>
        <View style={styles.leftPanel}>
          <PlayersList />
        </View>
        <View style={[styles.rightPanel, { paddingBottom: insets.bottom }]}>
          <ControlPanel />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PlayersList />
      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLandscape: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#0f3460',
  },
  rightPanel: {
    width: 280,
    justifyContent: 'center',
  },
  playersList: {
    flex: 1,
  },
  playersContent: {
    padding: 16,
    gap: 12,
  },
  hint: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 8,
    textAlign: 'center',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
  },
  orderNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e94560',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  playerPhase: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 2,
  },
  orderButtons: {
    marginLeft: 12,
    gap: 4,
  },
  orderButton: {
    width: 40,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
  },
  orderButtonDisabled: {
    backgroundColor: 'transparent',
  },
  orderButtonText: {
    fontSize: 14,
    color: '#e94560',
  },
  orderButtonTextDisabled: {
    color: '#4a4a6a',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#0f3460',
  },
  buttonContainerLandscape: {
    borderTopWidth: 0,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  doneButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
