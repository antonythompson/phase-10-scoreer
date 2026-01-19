import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { QUICK_SCORES, PHASES } from '../constants/phases';
import { useStableLandscape } from '../utils/useStableLandscape';

export default function ScoringScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isLandscape = useStableLandscape();
  const { currentGame, scoring, setPlayerScore, nextPlayer, previousPlayer, finishRound, cancelScoring } =
    useGameStore();

  const [currentScore, setCurrentScore] = useState(0);
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const currentPlayer = currentGame?.players[scoring?.currentPlayerIndex ?? 0];
  const isLastPlayer = scoring ? scoring.currentPlayerIndex === (currentGame?.players.length ?? 0) - 1 : false;

  useEffect(() => {
    if (currentPlayer) {
      navigation.setOptions({
        title: `Score Round - ${currentPlayer.name}`,
      });
    }
  }, [currentPlayer?.name, navigation]);

  useEffect(() => {
    if (scoring && currentPlayer) {
      const existingScore = scoring.scores.find((s) => s.playerId === currentPlayer.id);
      if (existingScore) {
        setCurrentScore(existingScore.score);
        setPhaseCompleted(existingScore.phaseCompleted);
      } else {
        setCurrentScore(0);
        setPhaseCompleted(false);
      }
    }
  }, [scoring?.currentPlayerIndex, currentPlayer?.id]);

  useEffect(() => {
    // Auto-toggle phase completed based on score
    if (currentScore < 50) {
      setPhaseCompleted(true);
    } else {
      setPhaseCompleted(false);
    }
  }, [currentScore]);

  if (!currentGame || !scoring || !currentPlayer) {
    return null;
  }

  const handleQuickScore = (value: number) => {
    setCurrentScore((prev) => prev + value);
  };

  const handleClear = () => {
    setCurrentScore(0);
    setPhaseCompleted(false);
  };

  const handleCustomSubmit = () => {
    const value = parseInt(customValue, 10);
    if (!isNaN(value) && value >= 0) {
      setCurrentScore((prev) => prev + value);
    }
    setCustomValue('');
    setShowCustomInput(false);
  };

  const handleNext = () => {
    setPlayerScore(currentPlayer.id, currentScore, phaseCompleted);

    if (isLastPlayer) {
      finishRound();
      router.back();
    } else {
      nextPlayer();
    }
  };

  const handleBack = () => {
    setPlayerScore(currentPlayer.id, currentScore, phaseCompleted);
    previousPlayer();
  };

  const handleCancel = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel? All scores for this round will be lost.')) {
        cancelScoring();
        router.back();
      }
    } else {
      Alert.alert('Cancel Scoring', 'Are you sure you want to cancel? All scores for this round will be lost.', [
        { text: 'Continue Scoring', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            cancelScoring();
            router.back();
          },
        },
      ]);
    }
  };

  const currentPhaseInfo = PHASES[currentPlayer.currentPhase - 1];

  const LeftPanel = () => (
    <View style={[styles.leftPanel, isLandscape && styles.leftPanelLandscape]}>
      <View style={styles.header}>
        <Text style={styles.phaseText}>Phase {currentPlayer.currentPhase}</Text>
        {currentPhaseInfo && <Text style={styles.phaseDescription}>{currentPhaseInfo.description}</Text>}
      </View>

      <View style={styles.scoreDisplay}>
        <Text style={styles.scoreLabel}>Round Score</Text>
        <Text style={[styles.scoreValue, isLandscape && styles.scoreValueLandscape]}>{currentScore}</Text>
      </View>
    </View>
  );

  const RightPanel = () => (
    <View style={[styles.rightPanel, isLandscape && styles.rightPanelLandscape]}>
      <View style={[styles.buttonsContainer, isLandscape && styles.buttonsContainerLandscape]}>
        <View style={[styles.quickButtons, isLandscape && styles.quickButtonsLandscape]}>
          {QUICK_SCORES.map((value) => (
            <TouchableOpacity key={value} style={styles.quickButton} onPress={() => handleQuickScore(value)}>
              <Text style={styles.quickButtonText}>+{value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.bottomRow, isLandscape && styles.bottomRowLandscape]}>
          <TouchableOpacity style={[styles.quickButton, styles.customButton]} onPress={() => setShowCustomInput(true)}>
            <Text style={styles.quickButtonText}>...</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.phaseCheckbox, phaseCompleted && styles.phaseCheckboxChecked]}
        onPress={() => setPhaseCompleted(!phaseCompleted)}
      >
        <View style={[styles.checkbox, phaseCompleted && styles.checkboxChecked]}>
          {phaseCompleted && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.phaseCheckboxText}>Phase Completed</Text>
      </TouchableOpacity>

      <View style={styles.navigation}>
        <View style={styles.navRow}>
          {scoring.currentPlayerIndex > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>{isLastPlayer ? 'Finish Round' : 'Next Player →'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLandscape) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.containerLandscapeContent,
          {
            paddingTop: insets.top,
            paddingBottom: Math.max(insets.bottom, 12),
            paddingLeft: Math.max(insets.left, 16),
            paddingRight: Math.max(insets.right, 16),
          }
        ]}
      >
        <LeftPanel />
        <RightPanel />

        <Modal visible={showCustomInput} transparent animationType="fade">
          <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalContent}>
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
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowCustomInput(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmButton} onPress={handleCustomSubmit}>
                  <Text style={styles.modalConfirmText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.containerContent,
        { padding: 20, paddingBottom: Math.max(insets.bottom, 20) }
      ]}
    >
      <LeftPanel />
      <RightPanel />

      <Modal visible={showCustomInput} transparent animationType="fade">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
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
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowCustomInput(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={handleCustomSubmit}>
                <Text style={styles.modalConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerContent: {
    flexGrow: 1,
  },
  containerLandscapeContent: {
    flexGrow: 1,
    flexDirection: 'row',
  },
  leftPanel: {},
  leftPanelLandscape: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: '#0f3460',
  },
  rightPanel: {},
  rightPanelLandscape: {
    flex: 2,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  buttonsContainer: {},
  buttonsContainerLandscape: {
    flexDirection: 'row',
    gap: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  playerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  phaseText: {
    fontSize: 18,
    color: '#e94560',
    marginTop: 4,
  },
  phaseDescription: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 4,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#0f3460',
    borderRadius: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreValueLandscape: {
    fontSize: 72,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 16,
  },
  quickButtonsLandscape: {
    flex: 1,
    marginBottom: 0,
  },
  quickButton: {
    width: 70,
    height: 50,
    backgroundColor: '#e94560',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    backgroundColor: '#4a4a6a',
  },
  quickButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  bottomRowLandscape: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 0,
  },
  clearButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  phaseCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#0f3460',
    borderRadius: 12,
    marginBottom: 20,
  },
  phaseCheckboxChecked: {
    backgroundColor: '#1a4a3a',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#a0a0a0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
  },
  checkmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  phaseCheckboxText: {
    fontSize: 18,
    color: '#fff',
  },
  navigation: {
    marginTop: 'auto',
    gap: 12,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#e94560',
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
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  customInput: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#4a4a6a',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#fff',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#e94560',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
