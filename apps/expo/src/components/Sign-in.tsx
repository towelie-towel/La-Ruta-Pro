import React, { useEffect, useRef, useState } from 'react';
import {
    LayoutAnimation, TextInput, ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { type DrawerNavigationProp } from '@react-navigation/drawer';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from "nativewind";

import { supabase } from '../lib/supabase'
import { type DrawerParamList } from '../app';
import { PressBtn } from '../styles/PressBtn';
import { View, Text } from '../styles/Themed';
import Colors from '../styles/Colors';

export default function SignIn({ navigation }: { navigation?: DrawerNavigationProp<DrawerParamList> }) {

    const { colorScheme } = useColorScheme();
    const pathName = usePathname()
    const { replace } = useRouter()
    const isOnSignInRoute = pathName.includes("sign-in")

    const passWordRef = useRef<TextInput>(null)
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneNumberError, _sePphoneNumberError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, _setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isReduced, setIsReduced] = useState(false)

    useEffect(() => {
        console.log("open Sign-in")
        return () => {
            console.log("closing Sign-in")
        }
    }, [])

    const reduceLogo = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsReduced(true)
    }

    const handleSignIn = async () => {

        const { error } = await supabase.auth.signInWithPassword({
            phone: '+53' + phoneNumber.trim(),
            password: "some-password"
        })
        if (error) {
            console.error(JSON.stringify(error, null, 2))
            setIsLoading(false)
            return
        }
        setIsLoading(false)
    }

    return (
        <View className={'w-full h-full justify-center items-center'}>
            <Stack.Screen options={{
                title: 'Inicio de Sesión',
            }} />

            <View
                className='w-1/2 items-center justify-center font-[Inter-Regular]'
                style={{
                    display: isReduced ? 'none' : 'flex',
                }}
            >
                <Text numberOfLines={2} adjustsFontSizeToFit className='font-bold text-3xl text-center max-[367px]:text-2xl'>Bienvenido Otra Vez</Text>
                <Image
                    source={require('../../assets/Logo.png')}
                    alt='Tu-Ruta Logo'
                    className='h-16 w-14 max-[367px]:h-12 max-[367px]:w-12 max-[340px]:h-12 max-[340px]:w-10 mt-4 max-[367px]:my-0'
                />
            </View>


            <KeyboardAvoidingView behavior="height" className='w-full justify-center items-center'>
                <View className={'w-4/5 max-[367px]:w-2/3 mb-4 max-[367px]:mb-2 relative justify-center items-center'}>
                    <TextInput
                        className={'h-12 max-[367px]:h-10 w-[80%] px-4 border rounded border-gray-300 dark:text-slate-500 dark:bg-transparent dark:border-gray-600'}
                        placeholder="Teléfono"
                        autoCapitalize="none"
                        placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "gray"}
                        onChangeText={setPhoneNumber}
                        value={phoneNumber}

                        onFocus={() => {
                            reduceLogo()
                        }}
                        onSubmitEditing={() => passWordRef.current?.focus()}
                    />
                    {
                        phoneNumberError &&
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
                        if (isOnSignInRoute) {
                            replace('auth/sign-up')
                        } else {
                            navigation?.navigate('Sign-Up')
                        }
                    }}
                >
                    <Text className={'text-sm max-[367px]:text-xs font-light dark:text-gray-400'}>No Tienes Cuenta?</Text>
                    <Text className={'text-[#2e78b7] font-normal ml-1 text-sm max-[367px]:text-xs'}>Crear Cuenta</Text>
                </PressBtn>

            </KeyboardAvoidingView>
        </View>
    );
}