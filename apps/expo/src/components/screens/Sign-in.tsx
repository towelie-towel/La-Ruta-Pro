import React, { useEffect, useRef, useState } from 'react';
import {
    LayoutAnimation, TextInput, ActivityIndicator, KeyboardAvoidingView, TouchableOpacity,
} from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { type DrawerNavigationProp } from '@react-navigation/drawer';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from "nativewind";

import { supabase } from '~/lib/supabase'
import { type DrawerParamList } from '~/app';
import { PressBtn } from '~/components/shared/PressBtn';
import { View, Text } from '~/components/shared/Themed';
import Colors from '~/constants/Colors';
import { isValidPassword, isValidPhone } from '~/utils/auth';
import Popover, { PopoverMode, PopoverPlacement } from 'react-native-popover-view';
import type { SignInConfig } from '~/constants/Configs';

export default function SignIn({ navigation }: { navigation?: DrawerNavigationProp<DrawerParamList> }) {

    const { colorScheme } = useColorScheme();
    const pathName = usePathname()
    const { replace } = useRouter()
    const isOnSignInRoute = pathName.includes("sign-in")
    const [signInConfigs, setSignInConfigs] = useState<SignInConfig>();

    const passWordRef = useRef<TextInput>(null)
    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isReduced, setIsReduced] = useState(false)

    const [showPhonePopover, setShowPhonePopover] = useState(false);
    const [showPasswordPopover, setShowPasswordPopover] = useState(false);

    const reduceLogo = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsReduced(true)
    }

    const handleSignIn = async () => {
        const [phoneOk, phoneErr] = isValidPhone(phone.trim(), signInConfigs?.errors.phoneError)
        const [passwordOk, passwordErr] = isValidPassword(password, signInConfigs?.errors.passwordError)
        console.log("handleSignIn");

        if (!phoneOk || !passwordOk) {
            if (!phoneOk) {
                setPhoneError(phoneErr)
                setShowPhonePopover(true)
                console.error("invalid phone: " + phoneErr)
            }
            if (!passwordOk) {
                setPasswordError(passwordErr)
                setShowPasswordPopover(true)
                console.error("invalid password: " + passwordErr)
            }
            setIsLoading(false)
            return
        }

        const { error } = await supabase.auth.signInWithPassword({
            phone: '+53' + phone.trim(),
            password
        })
        if (error) {
            console.error(JSON.stringify(error, null, 2))
            setIsLoading(false)
            return
        }
        setIsLoading(false)
    }

    useEffect(() => {
    })

    return (
        <View className={'w-full h-full justify-center items-center'}>
            <Stack.Screen options={{
                title: signInConfigs?.screenTitle ?? "Inicio de Sesión",
            }} />

            <View
                className='w-1/2 items-center justify-center font-[Inter-Regular]'
                style={{
                    display: isReduced ? 'none' : 'flex',
                }}
            >
                <Text numberOfLines={2} adjustsFontSizeToFit className='font-bold text-3xl text-center max-[367px]:text-2xl'>{signInConfigs?.title ?? "Bienvenida Otra Vez"}</Text>
                {signInConfigs?.description && <Text numberOfLines={2} adjustsFontSizeToFit className='mt-4 dark:text-white font-bold text-3xl text-center max-[367px]:text-2xl'>{signInConfigs?.description}</Text>}
                <Image
                    source={signInConfigs?.image ?? require('../../../assets/Logo.png')}
                    alt='Tu-Ruta Logo'
                    className='h-16 w-14 max-[367px]:h-12 max-[367px]:w-12 max-[340px]:h-12 max-[340px]:w-10 mt-4 max-[367px]:my-0'
                />
            </View>


            <KeyboardAvoidingView behavior="height" className='w-full justify-center items-center'>
                <View className='w-2/3 items-center justify-center gap-4 my-6'>
                    <View className='relative w-full flex-row justify-center items-center'>
                        <View className='h-12 w-[20%] border border-r-0 rounded-l border-gray-300 dark:border-gray-600 dark:bg-transparent justify-center items-center'>
                            <Text className='text-gray-500 dark:text-slate-500'>+53</Text>
                        </View>
                        <TextInput
                            className={'h-12 w-[80%] pl-4 pr-10 border rounded-r border-gray-300 dark:border-gray-600 dark:bg-transparent text-gray-500 dark:text-slate-500'}
                            placeholder={signInConfigs?.fields.phone.placeholder ?? "Número de Móvil"}
                            placeholderTextColor={colorScheme === 'dark' ? signInConfigs?.fields.phone.placeholderTextColor.dark ?? "rgb(107 114 128)" : signInConfigs?.fields.phone.placeholderTextColor.light ?? "rgb(100 116 139)"}
                            autoCapitalize={signInConfigs?.fields.phone.autoCapitalize ?? "none"}
                            keyboardType={signInConfigs?.fields.phone.keyboardType}
                            maxLength={signInConfigs?.fields.phone.maxLength}
                            onChangeText={setPhone}
                            autoCorrect={signInConfigs?.fields.phone.autoCorrect}
                            value={phone}

                            onFocus={() => {
                                reduceLogo()
                            }}
                        />
                        {
                            phoneError &&
                            <View className='absolute right-2 my-auto'>
                                    <Popover
                                        verticalOffset={-32}
                                        mode={PopoverMode.RN_MODAL}
                                        placement={PopoverPlacement.LEFT}
                                        isVisible={showPhonePopover}
                                        onRequestClose={() => setShowPhonePopover(false)}
                                        from={(
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setShowPhonePopover(true)
                                                }}
                                            >
                                                    <MaterialIcons
                                                        name='error'
                                                        size={24}
                                                        color={Colors[colorScheme ?? 'light'].text}
                                                    />
                                            </TouchableOpacity>
                                        )}
                                    >
                                    <Text /* numberOfLines={1} */ className='text-black p-2'>{phoneError}</Text>
                                </Popover>
                            </View>
                        }
                    </View>
                    <View className={'relative w-full flex-row justify-center items-center'}>
                        <TextInput
                            className={'h-12 w-full px-4 border rounded border-gray-300 dark:text-slate-500 dark:bg-transparent dark:border-gray-600'}
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
                                <Popover
                                    verticalOffset={-32}
                                    mode={PopoverMode.RN_MODAL}
                                    placement={PopoverPlacement.LEFT}
                                    isVisible={showPasswordPopover}
                                    onRequestClose={() => setShowPasswordPopover(false)}
                                    from={(
                                        <TouchableOpacity
                                            onPress={() => {
                                                setShowPasswordPopover(true)
                                            }}
                                        >
                                            <MaterialIcons
                                                name='error'
                                                size={24}
                                                color={Colors[colorScheme ?? 'light'].text}
                                            />
                                        </TouchableOpacity>
                                    )}
                                >
                                        <Text /* numberOfLines={1} */ className='text-black p-2'>{passwordError}</Text>
                                </Popover>
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
                </View>

            </KeyboardAvoidingView>
        </View>
    );
}