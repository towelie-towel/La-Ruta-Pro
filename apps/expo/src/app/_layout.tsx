import React from "react";
import {
  NativeModules,
  Platform,
} from 'react-native'
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider/* , SignedIn, SignedOut */ } from "@clerk/clerk-expo";
import { tokenCache } from "../utils/cache";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import { useFonts } from 'expo-font';
// import * as NavigationBar from 'expo-navigation-bar';
// import { useColorScheme } from "nativewind";
// import { useUser } from '@clerk/clerk-expo';

// import { useAtom, atom } from 'jotai'
// import { atomWithStorage, createJSONStorage } from 'jotai/utils'

// import AsyncStorage from '@react-native-async-storage/async-storage'
// import NetInfo from '@react-native-community/netinfo';

const { UIManager } = NativeModules;

if (Platform.OS === 'android') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Keep the splash screen visible while we fetch resources
void SplashScreen.preventAutoHideAsync();

const RootLayout = () => {

  const [_fontsLoaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    'Inter-Regular': require('../../assets/Inter-Regular.otf'),
  });
  // const { colorScheme } = useColorScheme()

  // void NavigationBar.setBackgroundColorAsync(colorScheme === 'dark' ? 'black' : 'white')

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_Z3JhdGVmdWwtc2FpbGZpc2gtMTQuY2xlcmsuYWNjb3VudHMuZGV2JA"}
      tokenCache={tokenCache}
    >

      <SafeAreaProvider >

        <StatusBar />
        <Stack
          screenOptions={{
            headerShown: false
          }}
        />


      </SafeAreaProvider>

    </ClerkProvider>
  );
};

export default RootLayout;
