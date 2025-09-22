/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import AuthScreen from './src/screens/AuthScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isAuthed, setIsAuthed] = useState(false);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent isAuthed={isAuthed} onAuthed={() => setIsAuthed(true)} />
    </SafeAreaProvider>
  );
}

function AppContent({ isAuthed, onAuthed }: { isAuthed: boolean; onAuthed: () => void }) {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {isAuthed ? (
        // Home screen composed of Search, Genre chips, Grid and Scan button
        <HomeScreen />
      ) : (
        // Newcomers and returning users land here to sign in or create an account
        <AuthScreen onAuthenticated={onAuthed} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
