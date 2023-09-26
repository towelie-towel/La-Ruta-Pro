import React, { useCallback } from "react";
import { NativeModules, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { UserProvider } from "~/context/UserContext";
import { WSProvider } from "~/context/WSContext";

if (Platform.OS === "android") {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  NativeModules.UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// Keep the splash screen visible while we fetch resources
void SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    "Inter-Regular": require("../../assets/Inter-Regular.otf"),
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
    <WSProvider>
      <UserProvider>
        <SafeAreaProvider onLayout={onLayoutRootView}>
          <StatusBar />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="auth/sign-in"
              options={{
                /* headerShown: true,
                headerTintColor: colorScheme === 'dark' ? 'white' : 'black',
                headerStyle: {
                  backgroundColor: colorScheme === 'dark' ? 'black' : 'white',
                }, */
                presentation: "transparentModal",
              }}
            />
            <Stack.Screen
              name="auth/sign-up"
              options={{
                /* headerShown: true,
                headerTintColor: colorScheme === 'dark' ? 'white' : 'black',
                headerStyle: {
                  backgroundColor: colorScheme === 'dark' ? 'black' : 'white',
                }, */
                presentation: "transparentModal",
              }}
            />
          </Stack>
        </SafeAreaProvider>
      </UserProvider>
    </WSProvider>
  );
};

export default RootLayout;
