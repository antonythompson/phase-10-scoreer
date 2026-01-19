import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { useStableLandscape } from '../utils/useStableLandscape';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLandscape = useStableLandscape();
  const { currentGame, savedGames, gameHistory } = useGameStore();

  const hasActiveGame = currentGame !== null && currentGame.status === 'active';

  const TitleSection = () => (
    <View style={[styles.titleSection, isLandscape && styles.titleSectionLandscape]}>
      <Text style={styles.title}>Phase 10</Text>
      <Text style={[styles.subtitle, !isLandscape && styles.subtitlePortrait]}>Score Tracker</Text>
    </View>
  );

  const ButtonsSection = () => (
    <View style={[styles.buttonContainer, isLandscape && styles.buttonContainerLandscape]}>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push('/setup')}
      >
        <Text style={styles.primaryButtonText}>New Game</Text>
      </TouchableOpacity>

      {hasActiveGame && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/game')}
        >
          <Text style={styles.secondaryButtonText}>Continue Game</Text>
        </TouchableOpacity>
      )}

      {savedGames.length > 0 && (
        <TouchableOpacity
          style={styles.tertiaryButton}
          onPress={() => router.push('/saved-games')}
        >
          <Text style={styles.tertiaryButtonText}>
            Saved Games ({savedGames.length})
          </Text>
        </TouchableOpacity>
      )}

      {gameHistory.length > 0 && (
        <TouchableOpacity
          style={styles.tertiaryButton}
          onPress={() => router.push('/game-history')}
        >
          <Text style={styles.tertiaryButtonText}>Past Games</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.tertiaryButton}
        onPress={() => router.push('/phases')}
      >
        <Text style={styles.tertiaryButtonText}>Phase Reference</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLandscape) {
    return (
      <View style={[
        styles.containerLandscape,
        {
          paddingLeft: Math.max(insets.left, 20),
          paddingRight: Math.max(insets.right, 20),
        }
      ]}>
        <TitleSection />
        <ButtonsSection />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TitleSection />
      <ButtonsSection />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  containerLandscape: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
  },
  titleSectionLandscape: {
    flex: 1,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#0f3460',
    paddingRight: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#a0a0a0',
  },
  subtitlePortrait: {
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  buttonContainerLandscape: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  primaryButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e94560',
  },
  secondaryButtonText: {
    color: '#e94560',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a4a6a',
  },
  tertiaryButtonText: {
    color: '#a0a0a0',
    fontSize: 16,
  },
});
