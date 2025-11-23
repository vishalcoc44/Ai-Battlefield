import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
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
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
    return null; // Or a loading spinner
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
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
