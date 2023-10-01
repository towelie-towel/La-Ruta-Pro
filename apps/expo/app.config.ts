import type { ExpoConfig } from "@expo/config";

const defineConfig = (): ExpoConfig => ({
  name: "La Ruta",
  slug: "la-ruta",
  scheme: "la-ruta-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    backgroundColor: "#FCCB6F",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    config: {
      googleMapsApiKey: "AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE",
    },
    supportsTablet: true,
    googleServicesFile: "./GoogleService-Info.plist",
    bundleIdentifier: "com.cubastore.laruta",
    entitlements: {
      "com.apple.developer.networking.wifi-info": true // https://docs.expo.dev/versions/latest/sdk/netinfo/
    },
  },
  android: {
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FCCB6F",
    },
    config: {
      googleMaps: {
        // @ts-ignore
        apiKey: "AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE",
      }
    },
    package: "com.cubastore.laruta",
  },
  web: {
    bundler: "metro"
  },
  extra: {
    eas: {
      projectId: "6672061b-f930-433e-81a0-6ef06407692c",
    },
  },
  experiments: {
    tsconfigPaths: true,
  },
  plugins: [
    "./expo-plugins/with-modify-gradle.js",
    "@react-native-google-signin/google-signin",
    "@react-native-firebase/app",
  ],
});

/* 
expo-location:
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
        }
      ]
    ]
  }
}

expo-notifications:
https://github.com/expo/expo/tree/sdk-49/packages/expo-notifications
{
  "expo": {
    ...
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./local/path/to/myNotificationIcon.png",
          "color": "#ffffff",
          "sounds": ["./local/path/to/mySound.wav", "./local/path/to/myOtherSound.wav"],
          "mode": "production"
        }
      ]
    ],
  }
}


plugins: ["./expo-plugins/with-modify-gradle.js", "expo-router"],

*/

export default defineConfig;
