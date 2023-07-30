import React, { useState } from 'react';
import {
    /* NativeModules,
    Pressable, */
    LayoutAnimation,
    TextInput,
    useColorScheme,
    ActivityIndicator
} from 'react-native';
import { View, Text } from '../styles/Themed';
import { useSignUp } from "@clerk/clerk-expo";
import { Stack } from 'expo-router';
import { type DrawerNavigationProp } from '@react-navigation/drawer';
import { PressBtn } from '../styles/PressBtn';
import SignWithOAuth from './SignWithOAuth';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TuRutaLogo from '../../assets/Logo.png'
import { type DrawerParamList } from '../app';
import Colors from '../styles/Colors';

// import { useUser } from '@clerk/clerk-expo';

import { useAtom/* , atom  */ } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

import AsyncStorage from '@react-native-async-storage/async-storage'
// import NetInfo from '@react-native-community/netinfo';


const storedSignMethod = createJSONStorage<'oauth' | 'password' | 'undefined'>(() => AsyncStorage)
export const signMethodAtom = atomWithStorage<'oauth' | 'password' | 'undefined'>('signMethod', 'undefined', storedSignMethod)

export default function SignUp({ navigation }: { navigation?: DrawerNavigationProp<DrawerParamList> }) {

    const { isLoaded, signUp, setActive } = useSignUp();
    const colorScheme = useColorScheme();

    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [emailError, _setEmailError] = useState('');

    const [oauthCompleted, setOauthCompleted] = useState(false)
    const [isInfoProvided, setIsInfoProvided] = useState(false)

    const [firstName, setFirstName] = useState('');
    const [firstNameError, _setFirstNameError] = useState('');

    const [lastName, setLastName] = useState('');
    const [lastNameError, _setLastNameError] = useState('');

    const [password, setPassword] = useState('');
    const [passwordError, _setPasswordError] = useState('');

    const [phoneNumber, setPhoneNumber] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false)
    const [phoneError, setPhoneError] = useState('');

    const [code, setCode] = useState("");
    const [codeError, _setCodeError] = useState('');

    const [isReduced, setIsReduced] = useState(false)

    const [signMethod, setSignMethod] = useAtom(signMethodAtom);

    const reduceLogo = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsReduced(true)
    }

    const isValidPhone = (phoneNumber: string) => {
        // Check if the phone number has exactly 8 digits
        if (phoneNumber.length !== 8) {
            setPhoneError('¿Por qué su numero no tiene 8 cifras? 🤨')
            return false;
        }

        // Check if the first digit is 5
        if (phoneNumber.charAt(0) !== '5') {
            setPhoneError('Su número no comienza por 5 😐')
            return false;
        }

        // Check if all characters are digits
        for (let i = 0; i < phoneNumber.length; i++) {
            if (isNaN(Number(phoneNumber.charAt(i)))) {
                setPhoneError('Todos los caractéres deben ser números 🤌, sobra el: "' + phoneNumber.charAt(i) + '"')
                return false;
            }
        }

        setPhoneError('')
        return true;
    }

    function isValidEmail(value: string): boolean {
        // Check if the value ends with "gmail.com"
        if (!value.endsWith("gmail.com")) {
            return false;
        }

        // Check if there is at least one character before "@"
        const atIndex = value.indexOf("@");
        if (atIndex <= 0) {
            return false;
        }

        // Check if there is at least one character between "@" and "."
        const dotIndex = value.indexOf(".");
        if (dotIndex - atIndex <= 1) {
            return false;
        }

        // Check if there is at least one character after "."
        if (dotIndex === value.length - 1) {
            return false;
        }

        // If all checks pass, return true
        return true;
    }

    const handleSendCode = async () => {
        if (!isLoaded) {
            return;
        }

        try {
            setIsLoading(true);
            const isPhoneValid = isValidPhone(phoneNumber.trim())

            if (!isPhoneValid) {
                throw new Error("phone number is invalid")
            }

            await signUp.update({
                phoneNumber: '53' + phoneNumber.trim(),
                password: '3rWx7Hf8'
            })
            await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
            console.log("Código de verificación enviado a: +53 " + phoneNumber)

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setIsLoading(false);
            setPendingVerification(true);

        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
            setIsLoading(false);
        }
    }

    const handleVerifyPhone = async () => {

        if (!isLoaded) {
            return;
        }

        try {
            setIsLoading(true);

            const completeVerifyPhone = await signUp.attemptPhoneNumberVerification({
                code,
            });
            console.log("Código de verificación verificado")

            await setActive({ session: completeVerifyPhone.createdSessionId })

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setIsPhoneVerified(true)
            setPendingVerification(false);
            setIsLoading(false);
            setSignMethod(oauthCompleted ? "oauth" : "password")

            navigation?.navigate('Map');
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
            setIsLoading(false);
        }
    };

    const handleProvidedInfo = async () => {

        if (!isLoaded) {
            return;
        }

        try {
            setIsLoading(true);

            const isEmailValid = isValidEmail(email.trim())

            if (!isEmailValid) {
                throw new Error("email is invalid")
            }

            await signUp.create({
                emailAddress: email.trim(),
                password: password.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim()
            });

            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            setIsInfoProvided(true);
            setIsLoading(false);

        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
            setIsLoading(false);
        }
    };

    /* if (signMethod) {
        return (
            <>
                
            </>
        )
    } */

    return (
        <View className={'w-full h-full justify-center items-center'}>
            <Stack.Screen options={{
                title: 'Sign Up',
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
                >Bienvenido</Text>
                <Text
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    className='text-center'
                >
                    Seleccione el método para crear su cuenta
                </Text>
                <Image
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    source={TuRutaLogo}
                    alt='Tu-Ruta Logo'
                    className='h-16 w-14 max-[367px]:h-12 max-[367px]:w-12 max-[340px]:h-12 max-[340px]:w-10 mt-4 max-[367px]:my-0'
                />
            </View>

            {(oauthCompleted || isInfoProvided) && !pendingVerification && !isPhoneVerified && (
                <>
                    <View className={'w-4/5 max-[367px]:w-2/3 my-4 max-[367px]:my-2 flex-row justify-center items-center'}>
                        <View className='relative w-4/5 flex-row justify-center items-center'>
                            <View className='h-12 max-[367px]:h-10 w-[20%] border border-r-0 rounded-l border-gray-300 dark:border-gray-600 dark:bg-transparent justify-center items-center'>
                                <Text className='text-gray-500 dark:text-slate-500'>+53</Text>
                            </View>
                            <TextInput
                                className={'h-12 max-[367px]:h-10 w-4/5 px-4 border rounded-r border-gray-300 dark:border-gray-600 dark:bg-transparent text-gray-500 dark:text-slate-500'}
                                placeholder="Número de Móvil"
                                autoCapitalize="none"
                                keyboardType='numeric'
                                placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                                onChangeText={setPhoneNumber}
                                value={phoneNumber}

                                onFocus={() => {
                                    reduceLogo()
                                }}
                            />
                            {
                                phoneError &&
                                <View className='absolute right-2 my-auto'>
                                    <MaterialIcons
                                        name='error'
                                        size={24}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </View>
                            }
                        </View>
                    </View>

                    <PressBtn onPress={() => { handleSendCode() }} className={'w-[200px] max-[367px]:w-[180px] max-w-[280px] bg-[#FCCB6F] mb-2 dark:bg-white rounded-3xl h-12 max-[367px]:h-8 flex-row justify-center items-center'} >
                        <Text darkColor="black" className={'text-white dark:text-black font-bold text-lg max-[367px]:text-base mr-3'}>Continuar</Text>
                        {isLoading && <ActivityIndicator
                            size={'small'}
                            animating
                            color={colorScheme === 'light' ? 'white' : 'black'}
                        />}
                    </PressBtn>
                </>
            )}

            {pendingVerification && (
                <>
                    <View className='w-4/5 max-[367px]:w-2/3 mb-4 max-[367px]:mb-2 justify-center items-center relative'>
                        <View className='w-full justify-center flex-row items-center'>
                            <Text numberOfLines={2}
                                adjustsFontSizeToFit className='my-4 mr-4'>No Te Ha Llegado? Intenta de nuevo</Text>
                            <PressBtn onPress={() => { handleSendCode() }}>
                                <ActivityIndicator
                                    size={'large'}
                                    animating
                                    color={colorScheme === 'light' ? 'black' : 'white'}
                                />
                            </PressBtn>
                        </View>
                        <TextInput
                            className={'h-12 max-[367px]:h-10 w-4/5 px-4 border rounded border-gray-300 dark:border-gray-800 dark:bg-transparent text-gray-500 dark:text-slate-500'}
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                            value={code}
                            placeholder="Codigo"
                            onChangeText={(code) => setCode(code)}

                            onFocus={() => {
                                reduceLogo()
                            }}
                        />
                        {
                            codeError &&
                            <View className='absolute right-2 my-auto'>
                                <MaterialIcons
                                    name='error'
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </View>
                        }
                    </View>
                    <PressBtn onPress={() => { handleVerifyPhone() }} className={'w-[200px] max-[367px]:w-[180px] max-w-[280px] bg-[#FCCB6F] mb-2 dark:bg-white rounded-3xl h-12 max-[367px]:h-8 flex-row justify-center items-center'} >
                        <Text darkColor="black" className={'text-white dark:text-black font-bold text-lg max-[367px]:text-base mr-3'}>Verificar</Text>
                        {isLoading && <ActivityIndicator
                            size={'small'}
                            animating
                            color={colorScheme === 'light' ? 'white' : 'black'}
                        />}
                    </PressBtn>
                </>
            )}

            {!oauthCompleted && !isInfoProvided && (
                <>
                    <SignWithOAuth afterOauthFlow={() => {

                        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                        setOauthCompleted(true)

                    }} action={'sign-up'} phoneNumber={phoneNumber} password={password} isReduced={isReduced} isPhoneVerified={isPhoneVerified} SignUp={signUp} />
                    <View className={'w-4/5 max-[367px]:w-2/3 mb-4 max-[367px]:mb-2 justify-center items-center relative'}>
                        <TextInput
                            className={'h-12 max-[367px]:h-10 w-4/5 px-4 border rounded border-gray-300 dark:bg-transparent dark:border-gray-600 text-gray-500 dark:text-slate-500'}
                            placeholder="Email"
                            autoCapitalize="none"
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                            onChangeText={setEmail}
                            value={email}

                            onFocus={() => {
                                reduceLogo()
                            }}
                        />
                        {
                            emailError &&
                            <View className='absolute right-2 my-auto'>
                                <MaterialIcons
                                    name='error'
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </View>
                        }
                    </View>
                    <View className={'w-4/5 max-[367px]:w-2/3 mb-4 max-[367px]:mb-2 justify-center items-center'}>
                        <TextInput
                            className={'h-12 max-[367px]:h-10 w-4/5 px-4 border rounded border-gray-300 dark:bg-transparent dark:border-gray-600 text-gray-500 dark:text-slate-500'}
                            placeholder="Contraseña"
                            autoCapitalize="none"
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                            onChangeText={setPassword}
                            value={password}

                            onFocus={() => {
                                reduceLogo()
                            }}
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

                    <View className={'w-4/5 max-[367px]:w-2/3 mb-4 max-[367px]:mb-2 justify-center items-center'}>
                        <View className='w-4/5 flex-row justify-between items-center'>
                            <View className='w-[47%] relative'>
                                <TextInput
                                    className={'h-12 max-[367px]:h-10 w-full px-4 border rounded border-gray-300 dark:bg-transparent dark:border-gray-600 text-gray-500 dark:text-slate-500'}
                                    placeholder="Nombre"
                                    autoCapitalize="none"
                                    placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                                    onChangeText={setFirstName}
                                    value={firstName}

                                    onFocus={() => {
                                        reduceLogo()
                                    }}
                                />
                                {
                                    firstNameError &&
                                    <View className='absolute right-2 my-auto'>
                                        <MaterialIcons
                                            name='error'
                                            size={24}
                                            color={Colors[colorScheme ?? 'light'].text}
                                        />
                                    </View>
                                }
                            </View>
                            <View className='w-[47%] relative'>
                                <TextInput
                                    className={'h-12 max-[367px]:h-10 w-full px-4 border rounded border-gray-300 dark:bg-transparent dark:border-gray-600 text-gray-500 dark:text-slate-500'}
                                    placeholder="Apellido"
                                    autoCapitalize="none"
                                    placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                                    onChangeText={setLastName}
                                    value={lastName}

                                    onFocus={() => {
                                        reduceLogo()
                                    }}
                                />
                                {
                                    lastNameError &&
                                    <View className='absolute right-2 my-auto'>
                                        <MaterialIcons
                                            name='error'
                                            size={24}
                                            color={Colors[colorScheme ?? 'light'].text}
                                        />
                                    </View>
                                }
                            </View>
                        </View>
                    </View>

                    <PressBtn onPress={() => { void handleProvidedInfo() }} className={'w-[200px] max-[367px]:w-[180px] max-w-[280px] bg-[#FCCB6F] mb-2 dark:bg-white rounded-3xl h-12 max-[367px]:h-8 flex-row justify-center items-center'} >
                        <Text darkColor="black" className={'text-white dark:text-black font-bold text-lg max-[367px]:text-base mr-3'}>Continuar</Text>
                        {isLoading && <ActivityIndicator
                            size={'small'}
                            animating
                            color={colorScheme === 'light' ? 'white' : 'black'}
                        />}
                    </PressBtn>
                </>
            )}

            <PressBtn className={'flex-row items-center justify-center mt-2'} onPress={() => { navigation && navigation?.jumpTo('Sign-In') }}>
                <Text className={'text-sm max-[367px]:text-xs font-light dark:text-gray-400'}>Ya Tienes Cuenta?</Text>
                <Text className={'text-[#2e78b7] font-normal ml-1 text-sm max-[367px]:text-xs'}>Inicia Sesión</Text>
            </PressBtn>
        </View>
    );
}