import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3DarkTheme, ActivityIndicator } from 'react-native-paper';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import PersonaSelectionScreen from './src/screens/PersonaSelectionScreen';
import DebateScreen from './src/screens/DebateScreen';
import BeliefTrackerScreen from './src/screens/BeliefTrackerScreen';
import GroupDebateLobbyScreen from './src/screens/GroupDebateLobbyScreen';
import GroupDebateScreen from './src/screens/GroupDebateScreen';
import IntellectualResumeScreen from './src/screens/IntellectualResumeScreen';
import BlindSpotScreen from './src/screens/BlindSpotScreen';
import DeEscalationScreen from './src/screens/DeEscalationScreen';
import PredictionScreen from './src/screens/PredictionScreen';
import AnonymousLobbyScreen from './src/screens/AnonymousLobbyScreen';
import CommunitiesScreen from './src/screens/CommunitiesScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#BB86FC',
    secondary: '#03DAC6',
    background: '#121212',
  },
};

function Navigation() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#121212' },
        animation: 'fade',
        animationDuration: 150,
        presentation: 'card',
        cardStyle: { backgroundColor: '#121212' },
        cardOverlayEnabled: false,
      }}
    >
      {session && session.user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="PersonaSelection" component={PersonaSelectionScreen} />
          <Stack.Screen name="Debate" component={DebateScreen} />
          <Stack.Screen name="BeliefTracker" component={BeliefTrackerScreen} />
          <Stack.Screen name="GroupDebateLobby" component={GroupDebateLobbyScreen} />
          <Stack.Screen name="GroupDebate" component={GroupDebateScreen} />
          <Stack.Screen name="IntellectualResume" component={IntellectualResumeScreen} />
          <Stack.Screen name="BlindSpot" component={BlindSpotScreen} />
          <Stack.Screen name="DeEscalation" component={DeEscalationScreen} />
          <Stack.Screen name="Prediction" component={PredictionScreen} />
          <Stack.Screen name="AnonymousLobby" component={AnonymousLobbyScreen} />
          <Stack.Screen name="Communities" component={CommunitiesScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function App() {
  return (
    <SafeAreaProvider style={{ backgroundColor: '#121212' }}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer>
            <Navigation />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
