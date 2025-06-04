import { Colors } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/context/AuthContext'; // Adjusted path
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { isLoading, token } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync(); // Hide splash screen once auth state is determined
      const inAuthGroup = segments[0] === '(tabs)';

      if (token && !inAuthGroup) {
        router.replace('/(tabs)/home');
      } else if (!token && inAuthGroup) {
        router.replace('/login');
      }
    }
  }, [isLoading, token, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      {/* Add a global not found screen if desired */}
      {/* <Stack.Screen name="+not-found" /> */}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    </GestureHandlerRootView>
  );
} 