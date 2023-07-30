import React, { useRef, useState } from 'react';
import {
    LayoutAnimation, TextInput, ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { View, Text } from '../styles/Themed';
import { useSignIn } from "@clerk/clerk-expo";
import { Stack } from 'expo-router';
import { type DrawerNavigationProp } from '@react-navigation/drawer';
import { PressBtn } from '../styles/PressBtn';
import SignWithOAuth from './SignWithOAuth';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from "nativewind";
import Colors from '../styles/Colors';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TuRutaLogo from '../../assets/Logo.png'
import { type DrawerParamList } from '../app';

import { useAtom/* , atom  */ } from 'jotai'
import { signMethodAtom } from './Sign-up';

export default function SignIn({ navigation }: { navigation?: DrawerNavigationProp<DrawerParamList> }) {

    const { signIn, setActive, isLoaded } = useSignIn();

    const { colorScheme } = useColorScheme();
    const passWordRef = useRef<TextInput>(null)

    const [credential, setCredential] = useState('');
    const [credentialError, _setCredentialError] = useState('');

    const [password, setPassword] = useState('');
    const [passwordError, _setPasswordError] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const [isReduced, setIsReduced] = useState(false)

    const [signMethod, _setSignMethod] = useAtom(signMethodAtom);

    const reduceLogo = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsReduced(true)
    }

    const handleSignIn = async () => {
        if (!isLoaded) {
            throw new Error("useSignIn isn't loaded")
            return;
        }
        try {
            setIsLoading(true);

            const completeSignIn = await signIn.create({
                identifier: credential.trim(),
                password,
            });

            await setActive({ session: completeSignIn.createdSessionId });

            setIsLoading(false);
            navigation?.navigate('Map')
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
            setIsLoading(false);
        }
    }

    return (
        <View className={'w-full h-full justify-center items-center'}>
            <Stack.Screen options={{
                title: 'Sign In',
            }} />

            <View
                className='w-1/2 items-center justify-center font-[Inter-Regular]'
                style={{
                    display: isReduced ? 'none' : 'flex',
                }}
            >
                <Text
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    className='font-bold text-3xl text-center max-[367px]:text-2xl'
                >Bienvenido Otra Vez</Text>
                <Image
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    source={TuRutaLogo}
                    alt='Tu-Ruta Logo'
                    className='h-16 w-14 max-[367px]:h-12 max-[367px]:w-12 max-[340px]:h-12 max-[340px]:w-10 mt-4 max-[367px]:my-0'
                />
            </View>


            <KeyboardAvoidingView behavior="height" className='w-full justify-center items-center'>
                <SignWithOAuth action={'sign-in'} isReduced={isReduced}
                    afterOauthFlow={() => {
                        navigation?.navigate('Map')
                    }}
                />
                <View className={'w-4/5 max-[367px]:w-2/3 mb-4 max-[367px]:mb-2 relative justify-center items-center'}>
                    <TextInput
                        className={'h-12 max-[367px]:h-10 w-[80%] px-4 border rounded border-gray-300 dark:text-slate-500 dark:bg-transparent dark:border-gray-600'}
                        placeholder="Teléfono, email o usuario"
                        autoCapitalize="none"
                        placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "gray"}
                        onChangeText={setCredential}
                        value={credential}

                        onFocus={() => {
                            reduceLogo()
                        }}
                        onSubmitEditing={() => passWordRef.current?.focus()}
                    />
                    {
                        credentialError &&
                        <View className='absolute right-2 my-auto'>
                            <MaterialIcons
                                name='error'
                                size={24}
                                color={Colors[colorScheme ?? 'light'].text}
                            />
                        </View>
                    }
                </View>
                <View className={'w-4/5 max-[367px]:w-2/3 mb-4 max-[367px]:mb-2 relative justify-center items-center'}>
                    <TextInput
                        className={'h-12 max-[367px]:h-10 w-[80%] px-4 border rounded border-gray-300 dark:text-slate-500 dark:bg-transparent dark:border-gray-600'}
                        placeholder="Contraseña"
                        autoCapitalize="none"
                        placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "gray"}
                        onChangeText={setPassword}
                        value={password}

                        onFocus={() => {
                            reduceLogo()
                        }}
                        ref={passWordRef}
                        textContentType='password'
                        inputMode='text'
                        keyboardType='default'
                        autoComplete='off'
                        autoCorrect={false}

                    />
                    {
                        passwordError &&
                        <View className='absolute right-2 my-auto'>
                            <MaterialIcons
                                name='error'
                                size={24}
                                color={Colors[colorScheme ?? 'light'].text}
                            />
                        </View>
                    }
                </View>
                <PressBtn onPress={() => { void handleSignIn() }} className={'w-[200px] max-[367px]:w-[180px] max-w-[280px] bg-[#FCCB6F] mb-2 dark:bg-white rounded-3xl h-12 max-[367px]:h-8 flex-row justify-center items-center'} >
                    <Text darkColor="black" className={'text-white dark:text-black font-bold text-lg max-[367px]:text-base mr-3'}>Iniciar Sesión</Text>
                    {isLoading && <ActivityIndicator
                        size={'small'}
                        animating
                        color={colorScheme === 'light' ? 'white' : 'black'}
                    />}
                </PressBtn>
                <PressBtn className={'flex-row items-center justify-center my-2'}
                    onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                        navigation && navigation.navigate('Sign-Up');
                    }}
                >
                    <Text className={'text-sm max-[367px]:text-xs font-light dark:text-gray-400'}>No Tienes Cuenta?</Text>
                    <Text className={'text-[#2e78b7] font-normal ml-1 text-sm max-[367px]:text-xs'}>Crear Cuenta</Text>
                </PressBtn>

            </KeyboardAvoidingView>
        </View>
    );
}