import React, { useCallback } from "react";
import {
  NativeModules,
  Platform,
} from 'react-native'
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider/* , SignedIn, SignedOut, useUser */ } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import { useFonts } from 'expo-font';
import { useColorScheme } from "nativewind";
// import * as NavigationBar from 'expo-navigation-bar';
// import { useAtom, atom } from 'jotai'
// import { atomWithStorage, createJSONStorage } from 'jotai/utils'
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import NetInfo from '@react-native-community/netinfo';

import { tokenCache } from "../utils/cache";
import { View } from "~/styles/Themed";

if (Platform.OS === 'android') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  NativeModules.UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// Keep the splash screen visible while we fetch resources
void SplashScreen.preventAutoHideAsync();

const RootLayout = () => {

  const { colorScheme } = useColorScheme()
  const [fontsLoaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    'Inter-Regular': require('../../assets/Inter-Regular.otf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_Z3JhdGVmdWwtc2FpbGZpc2gtMTQuY2xlcmsuYWNjb3VudHMuZGV2JA"}
      tokenCache={tokenCache}
    >

      <SafeAreaProvider onLayout={onLayoutRootView} >

        <StatusBar />
        <Stack
          screenOptions={{
            headerShown: false
          }}
        >

          <Stack.Screen
            name="auth/sign-in"
            options={{
              headerShown: true,
              headerTintColor: colorScheme === 'dark' ? 'white' : 'black',
              headerStyle: {
                backgroundColor: colorScheme === 'dark' ? 'black' : 'white',
              },
            }}
          />
          <Stack.Screen name="auth/sign-up" options={{
            headerShown: true,
            headerTintColor: colorScheme === 'dark' ? 'white' : 'black',
            headerStyle: {
              backgroundColor: colorScheme === 'dark' ? 'black' : 'white',
            },
          }} />

        </Stack>

      </SafeAreaProvider>

    </ClerkProvider>
  );
};

export default RootLayout;
