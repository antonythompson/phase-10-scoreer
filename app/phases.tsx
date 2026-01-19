import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PHASES } from '../constants/phases';
import { useGameStore } from '../store/gameStore';
import { useStableLandscape } from '../utils/useStableLandscape';

export default function PhasesScreen() {
  const insets = useSafeAreaInsets();
  const isLandscape = useStableLandscape();
  const { currentGame } = useGameStore();

  const getPlayersOnPhase = (phaseNumber: number) => {
    if (!currentGame) return [];
    return currentGame.players.filter((p) => p.currentPhase === phaseNumber);
  };

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
      <Text style={styles.intro}>
        Complete each phase in order. You must complete your current phase before moving to the next.
      </Text>

      {PHASES.map((phase) => {
        const playersOnPhase = getPlayersOnPhase(phase.number);
        return (
          <View key={phase.number} style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <View style={styles.phaseNumber}>
                <Text style={styles.phaseNumberText}>{phase.number}</Text>
              </View>
              <Text style={styles.phaseTitle}>{phase.description}</Text>
            </View>
            <Text style={styles.phaseRequirement}>{phase.requirement}</Text>
            {playersOnPhase.length > 0 && (
              <View style={styles.playersOnPhase}>
                {playersOnPhase.map((player) => (
                  <View key={player.id} style={styles.playerBadge}>
                    <Text style={styles.playerBadgeText}>{player.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}

      <View style={styles.scoringSection}>
        <Text style={styles.sectionTitle}>Scoring</Text>
        <View style={styles.scoringCard}>
          <View style={styles.scoringRow}>
            <Text style={styles.cardType}>1-9</Text>
            <Text style={styles.cardPoints}>5 points each</Text>
          </View>
          <View style={styles.scoringRow}>
            <Text style={styles.cardType}>10-12</Text>
            <Text style={styles.cardPoints}>10 points each</Text>
          </View>
          <View style={styles.scoringRow}>
            <Text style={styles.cardType}>Skip</Text>
            <Text style={styles.cardPoints}>15 points each</Text>
          </View>
          <View style={styles.scoringRow}>
            <Text style={styles.cardType}>Wild</Text>
            <Text style={styles.cardPoints}>25 points each</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  intro: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 20,
    lineHeight: 20,
  },
  phaseCard: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phaseNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  phaseRequirement: {
    fontSize: 14,
    color: '#a0a0a0',
    marginLeft: 44,
  },
  playersOnPhase: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginLeft: 44,
  },
  playerBadge: {
    backgroundColor: '#e94560',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  playerBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  scoringSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  scoringCard: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  scoringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardType: {
    fontSize: 16,
    color: '#fff',
  },
  cardPoints: {
    fontSize: 16,
    color: '#e94560',
    fontWeight: '600',
  },
});
