/* eslint-disable */
import { useOAuth } from "@clerk/clerk-expo";
import React, { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from 'expo-auth-session'
import { Svg, Defs, G, Path } from "react-native-svg";
import { Text, View } from "../styles/Themed";
import { PressBtn } from "../styles/PressBtn";
import { AntDesign } from '@expo/vector-icons';
import { useColorScheme } from "nativewind";
import {
  LayoutAnimation,
  Dimensions,
  Platform
} from "react-native";

/* const config = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: '795271227886-uq0n8g7p4j1h2i7h7d7n1h4hq7uj6q1.apps.googleusercontent.com',
} */


const SignWithOAuth = ({ action = 'sign-in', phoneNumber, password, isReduced = false, isPhoneVerified, SignUp, afterOauthFlow }: { action?: 'sign-in' | 'sign-up', phoneNumber?: string, password?: string, isReduced?: boolean, isPhoneVerified?: boolean, SignUp?: any, afterOauthFlow?: () => void }) => {

  const redirectUrl = AuthSession.makeRedirectUri({
    path: '/',
  })

  const { startOAuthFlow: googleOAuthFlow } = useOAuth({ strategy: "oauth_google", redirectUrl: redirectUrl });
  const { startOAuthFlow: appleOAuthFlow } = useOAuth({ strategy: "oauth_apple" });
  const { colorScheme } = useColorScheme()
  const { width, height } = Dimensions.get('window')

  const [btnsWidth, setBtnsWidth] = useState(width > 375 ? 240 : 170)
  const [containerWidth, setContainerWidth] = useState(width > 375 ? 240 : 170)
  const [containerHeight, setContainerHeight] = useState(Platform.OS === 'ios' ? (width > 375 ? 105 : 87) : 45)

  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios' && false) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
      if (isReduced) {
        setBtnsWidth(width > 375 ? 48 : 40)
        setContainerWidth(width > 375 ? 120 : 110)
        setContainerHeight(width > 375 ? 50 : 40)
      } else {
        setBtnsWidth(width > 375 ? 240 : 170)
        setContainerWidth(width > 375 ? 240 : 170)
        setContainerHeight(width > 375 ? 105 : 87)
      }
    }
  }, [isReduced]);

  const googleSignHandler = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await googleOAuthFlow();

      if (createdSessionId) {
        void setActive?.({ session: createdSessionId });
      } else {

        if (action === 'sign-in') {
          console.log(JSON.stringify(signIn, null, 2))
          signIn && void setActive?.({ session: signIn.createdSessionId });
        }

        if (action === 'sign-up') {
          console.log(JSON.stringify(signUp, null, 2))
          signUp && void setActive?.({ session: signUp.createdSessionId });
        }

      }
      afterOauthFlow && afterOauthFlow()
      console.log("afterOauthFlow")

    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      console.error("OAuth error", err);
    }
  }, []);

  const appleSignHandler = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await appleOAuthFlow();

      if (createdSessionId) {
        void setActive?.({ session: createdSessionId });
      } else {
        // Modify this code to use signIn or signUp to set this missing requirements you set in your dashboard.
        throw new Error("There are unmet requirements, modifiy this else to handle them")
      }
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      console.error("OAuth error", err);
    }
  }, []);

  return (
    <View
      className="relative my-4 max-[367px]:my-2 w-1/2"
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
    >

      {Platform.OS !== 'ios' && <View
        className='absolute top-0 left-0'
        style={{
          top: 0
        }}
      >
        <PressBtn onPress={googleSignHandler}>
          <View
            className={'h-12 max-[367px]:h-10 mb-2 max-[367px]:mb-1 flex-row border border-solid border-gray-500 dark:border-none dark:bg-white rounded-3xl justify-center items-center'}
            style={{
              width: btnsWidth,
            }}
          >

            <Svg className="h-6 w-6 max-[367px]:h-5 max-[367px]:w-5" viewBox="-0.5 0 48 48">
              <Defs>
              </Defs>
              <G id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <G id="Color-" transform="translate(-401.000000, -860.000000)">
                  <G id="Google" transform="translate(401.000000, 860.000000)">
                    <Path d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24" id="Fill-1" fill="#FBBC05" />
                    <Path d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333" id="Fill-2" fill="#EB4335" />
                    <Path d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667" id="Fill-3" fill="#34A853" />
                    <Path d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24" id="Fill-4" fill="#4285F4" />
                  </G>
                </G>
              </G>
            </Svg>
            {btnsWidth > 50 && <Text
              className='dark:text-gray-800 ml-3 font-medium text-base max-[367px]:text-sm'
            >
              Usar Google
            </Text>}
          </View>
        </PressBtn>
      </View>}
      {Platform.OS === 'ios' &&
        <View
          className="absolute bottom-0 right-0"
          style={{
            bottom: 0
          }}
        >
          <PressBtn onPress={() => {
            console.log(JSON.stringify({ phoneNumber, SignUp }, null, 2));
          }}>
            <View
              className={'h-12 max-[367px]:h-10 flex-row bg-black dark:border-slate-600 border rounded-3xl justify-center items-center'}
              style={{
                width: btnsWidth,
              }}
            >
              <AntDesign name="apple1" size={width <= 367 ? 20 : 24} color={"white"} />
              {btnsWidth > 50 && <Text
                className='text-white ml-3 font-medium text-base max-[367px]:text-sm'
              >
                Usar Apple
              </Text>}
            </View>
          </PressBtn>
        </View>
      }

    </View>
  );
}

export default SignWithOAuth;