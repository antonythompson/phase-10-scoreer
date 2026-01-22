import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { rankPlayers } from '../utils/scoring';
import { useStableLandscape } from '../utils/useStableLandscape';

export default function GameScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { currentGame, startScoring, endGame, saveGameForLater } = useGameStore();
  const insets = useSafeAreaInsets();
  const isLandscape = useStableLandscape();
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (!currentGame) {
      router.replace('/');
    }
  }, [currentGame, router]);

  useEffect(() => {
    if (currentGame) {
      navigation.setOptions({
        title: `Scoreboard - Round ${currentGame.currentRound}`,
      });
    }
  }, [currentGame?.currentRound, navigation]);

  if (!currentGame) {
    return null;
  }

  const rankedPlayers = rankPlayers(currentGame.players);

  const handleEndGame = () => {
    setMenuVisible(false);
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to end this game? It will be saved to your history.')) {
        endGame();
        router.replace('/');
      }
    } else {
      Alert.alert(
        'End Game',
        'Are you sure you want to end this game? It will be saved to your history.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'End Game',
            style: 'destructive',
            onPress: () => {
              endGame();
              router.replace('/');
            },
          },
        ]
      );
    }
  };

  const handleSaveForLater = () => {
    setMenuVisible(false);
    saveGameForLater();
    router.replace('/');
  };

  const handleSortPlayers = () => {
    setMenuVisible(false);
    router.push('/player-order');
  };

  const handleScoreRound = () => {
    startScoring();
    router.push('/scoring');
  };

  const PlayersList = () => (
    <ScrollView style={styles.playersList} contentContainerStyle={styles.playersContent}>
      {rankedPlayers.map((player, index) => (
        <View key={player.id} style={styles.playerCard}>
          <View style={styles.rankContainer}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerPhase}>Phase {player.currentPhase}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{player.totalScore}</Text>
            <Text style={styles.scoreLabel}>pts</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const DropdownMenu = () => (
    <Modal
      transparent
      visible={menuVisible}
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={handleSortPlayers}>
            <Text style={styles.menuItemText}>Sort Players</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={handleSaveForLater}>
            <Text style={[styles.menuItemText, styles.menuItemSave]}>Save for Later</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={handleEndGame}>
            <Text style={[styles.menuItemText, styles.menuItemEnd]}>End Game</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );

  const ControlPanel = () => (
    <View style={[styles.buttonContainer, isLandscape && styles.buttonContainerLandscape]}>
      <TouchableOpacity style={styles.primaryButton} onPress={handleScoreRound}>
        <Text style={styles.primaryButtonText}>Score Round</Text>
      </TouchableOpacity>

      <View style={styles.secondaryButtons}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/history')}
        >
          <Text style={styles.secondaryButtonText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/phases')}
        >
          <Text style={styles.secondaryButtonText}>Phases</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={styles.secondaryButtonText}>More</Text>
        </TouchableOpacity>
      </View>
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
        <DropdownMenu />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PlayersList />

      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleScoreRound}>
          <Text style={styles.primaryButtonText}>Score Round</Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/history')}
          >
            <Text style={styles.secondaryButtonText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/phases')}
          >
            <Text style={styles.secondaryButtonText}>Phases</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={styles.secondaryButtonText}>More</Text>
          </TouchableOpacity>
        </View>
      </View>
      <DropdownMenu />
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
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
  },
  rankContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
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
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#0f3460',
  },
  buttonContainerLandscape: {
    borderTopWidth: 0,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#a0a0a0',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    minWidth: 200,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
  },
  menuItemSave: {
    color: '#4ade80',
  },
  menuItemEnd: {
    color: '#e94560',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#0f3460',
  },
});
