import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { MIN_PLAYERS, MAX_PLAYERS } from '../constants/phases';
import { useStableLandscape } from '../utils/useStableLandscape';

export default function SetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLandscape = useStableLandscape();
  const { startNewGame, lastPlayerNames, pendingPlayerNames, clearPendingPlayers } = useGameStore();

  // Initialize with pending players (from Play Again) or last game's players
  const getInitialNames = () => {
    if (pendingPlayerNames && pendingPlayerNames.length >= MIN_PLAYERS) {
      return pendingPlayerNames;
    }
    if (lastPlayerNames.length >= MIN_PLAYERS) {
      return lastPlayerNames;
    }
    return ['', ''];
  };

  const initialNames = getInitialNames();
  const [playerCount, setPlayerCount] = useState(initialNames.length);
  const [playerNames, setPlayerNames] = useState<string[]>(initialNames);

  const updatePlayerCount = (count: number) => {
    if (count < MIN_PLAYERS || count > MAX_PLAYERS) return;

    setPlayerCount(count);
    setPlayerNames((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill('')];
      }
      return prev.slice(0, count);
    });
  };

  const updatePlayerName = (index: number, name: string) => {
    setPlayerNames((prev) => {
      const updated = [...prev];
      updated[index] = name;
      return updated;
    });
  };

  const movePlayer = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= playerCount) return;

    setPlayerNames((prev) => {
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  };

  const handleStartGame = () => {
    const names = playerNames.map((name, i) => name.trim() || `Player ${i + 1}`);
    clearPendingPlayers();
    startNewGame(names);
    router.replace('/game');
  };

  const canStart = playerNames.some((name) => name.trim().length > 0) || true;

  const playersSection = (
    <>
      <Text style={styles.sectionTitle}>Player Names</Text>
      <Text style={styles.orderHint}>Use arrows to set play order</Text>
      <View style={styles.namesContainer}>
        {playerNames.map((name, index) => (
          <View key={index} style={styles.nameInputContainer}>
            <View style={styles.nameRow}>
              <View style={styles.nameInputWrapper}>
                <Text style={styles.playerLabel}>Player {index + 1}</Text>
                <TextInput
                  style={styles.nameInput}
                  value={name}
                  onChangeText={(text) => updatePlayerName(index, text)}
                  placeholder={`Player ${index + 1}`}
                  placeholderTextColor="#666"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
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
                  style={[styles.orderButton, index === playerCount - 1 && styles.orderButtonDisabled]}
                  onPress={() => movePlayer(index, 'down')}
                  disabled={index === playerCount - 1}
                >
                  <Text style={[styles.orderButtonText, index === playerCount - 1 && styles.orderButtonTextDisabled]}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </>
  );

  const controlsSection = (
    <View style={[styles.controlsSection, isLandscape && styles.controlsSectionLandscape]}>
      <Text style={[styles.sectionTitle, isLandscape && styles.sectionTitleLandscape]}>Number of Players</Text>
      <View style={styles.counterContainer}>
        <TouchableOpacity
          style={[styles.counterButton, playerCount <= MIN_PLAYERS && styles.counterButtonDisabled]}
          onPress={() => updatePlayerCount(playerCount - 1)}
          disabled={playerCount <= MIN_PLAYERS}
        >
          <Text style={styles.counterButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{playerCount}</Text>
        <TouchableOpacity
          style={[styles.counterButton, playerCount >= MAX_PLAYERS && styles.counterButtonDisabled]}
          onPress={() => updatePlayerCount(playerCount + 1)}
          disabled={playerCount >= MAX_PLAYERS}
        >
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.startButton, !canStart && styles.startButtonDisabled]}
        onPress={handleStartGame}
        disabled={!canStart}
      >
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLandscape) {
    return (
      <KeyboardAvoidingView
        style={[
          styles.containerLandscape,
          {
            paddingLeft: Math.max(insets.left, 16),
            paddingRight: Math.max(insets.right, 16),
          }
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.leftPanel}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) }
          ]}
        >
          {playersSection}
        </ScrollView>
        <View style={[styles.rightPanel, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {controlsSection}
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {controlsSection}
        {playersSection}
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  controlsSection: {},
  controlsSectionLandscape: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    marginTop: 20,
  },
  sectionTitleLandscape: {
    marginTop: 0,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  counterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonDisabled: {
    backgroundColor: '#4a4a6a',
  },
  counterButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  counterValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    minWidth: 60,
    textAlign: 'center',
  },
  orderHint: {
    fontSize: 13,
    color: '#a0a0a0',
    marginBottom: 12,
  },
  namesContainer: {
    gap: 12,
  },
  nameInputContainer: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInputWrapper: {
    flex: 1,
  },
  playerLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 18,
    color: '#fff',
    paddingVertical: 8,
  },
  orderButtons: {
    marginLeft: 12,
    gap: 4,
  },
  orderButton: {
    width: 32,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 6,
  },
  orderButtonDisabled: {
    backgroundColor: 'transparent',
  },
  orderButtonText: {
    fontSize: 12,
    color: '#e94560',
  },
  orderButtonTextDisabled: {
    color: '#4a4a6a',
  },
  startButton: {
    backgroundColor: '#e94560',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  startButtonDisabled: {
    backgroundColor: '#4a4a6a',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
