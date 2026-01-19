import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { QUICK_SCORES } from '../constants/phases';
import { RoundScore } from '../types/game';
import { useStableLandscape } from '../utils/useStableLandscape';

interface EditingRound {
  playerId: string;
  playerName: string;
  round: number;
  score: number;
  phaseCompleted: boolean;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const isLandscape = useStableLandscape();
  const { currentGame, updateRoundScore } = useGameStore();
  const [editing, setEditing] = useState<EditingRound | null>(null);
  const [editScore, setEditScore] = useState(0);
  const [editPhaseCompleted, setEditPhaseCompleted] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  if (!currentGame || currentGame.currentRound === 1) {
    return (
      <View style={[
        styles.container,
        isLandscape && {
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        }
      ]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No rounds played yet</Text>
          <Text style={styles.emptySubtext}>Complete a round to see history</Text>
        </View>
      </View>
    );
  }

  const handleEdit = (playerId: string, playerName: string, roundScore: RoundScore) => {
    setEditing({
      playerId,
      playerName,
      round: roundScore.round,
      score: roundScore.score,
      phaseCompleted: roundScore.phaseCompleted,
    });
    setEditScore(roundScore.score);
    setEditPhaseCompleted(roundScore.phaseCompleted);
  };

  const handleQuickScore = (value: number) => {
    const newScore = editScore + value;
    setEditScore(newScore);
    if (newScore < 50) {
      setEditPhaseCompleted(true);
    } else {
      setEditPhaseCompleted(false);
    }
  };

  const handleSetScore = (value: number) => {
    setEditScore(value);
    if (value < 50) {
      setEditPhaseCompleted(true);
    } else {
      setEditPhaseCompleted(false);
    }
  };

  const handleCustomSubmit = () => {
    const value = parseInt(customValue, 10);
    if (!isNaN(value) && value >= 0) {
      handleQuickScore(value);
    }
    setCustomValue('');
    setShowCustomInput(false);
  };

  const handleSave = () => {
    if (editing) {
      updateRoundScore(editing.playerId, editing.round, editScore, editPhaseCompleted);
      setEditing(null);
    }
  };

  const handleCancel = () => {
    setEditing(null);
  };

  const rounds = Array.from({ length: currentGame.currentRound - 1 }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[
        styles.content,
        isLandscape && {
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
          paddingBottom: Math.max(insets.bottom, 16),
        }
      ]}>
        {rounds.map((roundNum) => (
          <View key={roundNum} style={styles.roundCard}>
            <Text style={styles.roundTitle}>Round {roundNum}</Text>
            <View style={styles.playerScores}>
              {currentGame.players.map((player) => {
                const roundScore = player.rounds.find((r) => r.round === roundNum);
                if (!roundScore) return null;

                return (
                  <TouchableOpacity
                    key={player.id}
                    style={styles.playerRow}
                    onPress={() => handleEdit(player.id, player.name, roundScore)}
                  >
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{player.name}</Text>
                      <Text style={styles.phaseAttempt}>Phase {roundScore.phaseAttempted}</Text>
                    </View>
                    <View style={styles.scoreInfo}>
                      <Text style={styles.roundScore}>+{roundScore.score}</Text>
                      {roundScore.phaseCompleted && (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedText}>✓</Text>
                        </View>
                      )}
                      <View style={styles.editBadge}>
                        <Text style={styles.editIcon}>✎</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={editing !== null} transparent animationType="fade">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Score</Text>
            {editing && (
              <Text style={styles.modalSubtitle}>
                {editing.playerName} - Round {editing.round}
              </Text>
            )}

            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreValue}>{editScore}</Text>
            </View>

            <View style={styles.quickButtons}>
              {QUICK_SCORES.map((value) => (
                <TouchableOpacity key={value} style={styles.quickButton} onPress={() => handleQuickScore(value)}>
                  <Text style={styles.quickButtonText}>+{value}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.quickButton, styles.customButton]}
                onPress={() => setShowCustomInput(true)}
              >
                <Text style={styles.quickButtonText}>...</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.clearButton} onPress={() => handleSetScore(0)}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.phaseCheckbox, editPhaseCompleted && styles.phaseCheckboxChecked]}
              onPress={() => setEditPhaseCompleted(!editPhaseCompleted)}
            >
              <View style={[styles.checkbox, editPhaseCompleted && styles.checkboxChecked]}>
                {editPhaseCompleted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.phaseCheckboxText}>Phase Completed</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showCustomInput} transparent animationType="fade">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.customInputModal}>
            <Text style={styles.modalTitle}>Enter Score</Text>
            <TextInput
              style={styles.customInput}
              value={customValue}
              onChangeText={setCustomValue}
              keyboardType="number-pad"
              autoFocus
              placeholder="0"
              placeholderTextColor="#666"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCustomInput(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleCustomSubmit}>
                <Text style={styles.saveButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  roundCard: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
  },
  roundTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 12,
  },
  playerScores: {
    gap: 10,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    color: '#fff',
  },
  phaseAttempt: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  scoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roundScore: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  editBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4a4a6a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#0f3460',
    borderRadius: 12,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickButton: {
    width: 60,
    height: 44,
    backgroundColor: '#e94560',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    backgroundColor: '#4a4a6a',
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  phaseCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#0f3460',
    borderRadius: 10,
    marginBottom: 16,
  },
  phaseCheckboxChecked: {
    backgroundColor: '#1a4a3a',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#a0a0a0',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  phaseCheckboxText: {
    fontSize: 16,
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#4a4a6a',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#e94560',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  customInputModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  customInput: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 16,
  },
});
