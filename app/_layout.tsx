import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

function WebBackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
      <Text style={styles.backButtonText}>← Back</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#16213e',
          },
          headerLeft: Platform.OS === 'web' ? () => <WebBackButton /> : undefined,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Phase 10',
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="setup"
          options={{
            title: 'New Game',
          }}
        />
        <Stack.Screen
          name="game"
          options={{
            title: 'Scoreboard',
            headerBackVisible: false,
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="scoring"
          options={{
            title: 'Score Round',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            title: 'Round History',
          }}
        />
        <Stack.Screen
          name="phases"
          options={{
            title: 'Phase Reference',
          }}
        />
        <Stack.Screen
          name="game-history"
          options={{
            title: 'Past Games',
          }}
        />
        <Stack.Screen
          name="saved-games"
          options={{
            title: 'Saved Games',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
