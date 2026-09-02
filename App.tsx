import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { RootStackParamList } from './src/navigation/types';
import { checkForOtaUpdate } from './src/services/ota';

const Stack = createNativeStackNavigator<RootStackParamList>();

export type { RootStackParamList };

function RootNavigation() {
  useEffect(() => {
    checkForOtaUpdate();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Camera"
          getComponent={() => require('./src/screens/CameraScreen').default}
        />
        <Stack.Screen
          name="Result"
          getComponent={() => require('./src/screens/ResultScreen').default}
        />
        <Stack.Screen
          name="Chatbot"
          getComponent={() => require('./src/screens/ChatbotScreen').default}
        />
        <Stack.Screen
          name="History"
          getComponent={() => require('./src/screens/HistoryScreen').default}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <LanguageProvider>
            <RootNavigation />
          </LanguageProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
