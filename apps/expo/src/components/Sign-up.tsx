import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    LayoutAnimation,
    TextInput,
    useColorScheme,
    ActivityIndicator
} from 'react-native';
import { useSignUp, useAuth } from "@clerk/clerk-expo";
import { Stack, usePathname, useRouter } from 'expo-router';
import { type DrawerNavigationProp } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAtom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TuRutaLogo from '../../assets/Logo.png'
import { type DrawerParamList } from '../app';
import { View, Text } from '../styles/Themed';
import { PressBtn } from '../styles/PressBtn';
import SignWithOAuth from './SignWithOAuth';
import Colors from '../styles/Colors';

const storedSignMethod = createJSONStorage<'oauth' | 'password' | 'undefined'>(() => AsyncStorage)
export const signMethodAtom = atomWithStorage<'oauth' | 'password' | 'undefined'>('signMethod', 'undefined', storedSignMethod)

export default function SignUp({ navigation }: { navigation?: DrawerNavigationProp<DrawerParamList> }) {

    const { isLoaded, signUp, setActive } = useSignUp();
    const { isSignedIn } = useAuth();
    const colorScheme = useColorScheme();
    const pathName = usePathname()
    const { replace } = useRouter()
    const isOnSignUpRoute = pathName.includes("sign-up")

    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [oauthCompleted, setOauthCompleted] = useState(false)
    const [isInfoProvided, setIsInfoProvided] = useState(false)
    const [firstName, setFirstName] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastName, setLastName] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false)
    const [phoneError, setPhoneError] = useState('');
    const [codeTimer, setCodeTimer] = useState(60);
    const codeTimerRef = useRef(60);
    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState('');
    const [isReduced, setIsReduced] = useState(false)
    const [signMethod, setSignMethod] = useAtom(signMethodAtom);

    useEffect(() => {
        console.log("open Sign-up")
        return () => {
            console.log("closing Sign-up")
        }
    }, [])

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
        if (!phoneNumber.startsWith('5')) {
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
            setEmailError("El email no termina en gmail.com")
            return false;
        }

        // Check if there is at least one character before "@"
        const atIndex = value.indexOf("@");
        if (atIndex <= 0) {
            setEmailError("there is at least one character before @")
            return false;
        }

        // Check if there is at least one character between "@" and "."
        /* const dotIndex = value.indexOf(".");
        if (dotIndex - atIndex <= 1) {
            setEmailError("there is at least one character between @ and .")
            return false;
        } */

        // Check if there is at least one character after "."
        /* if (dotIndex === value.length - 1) {
            setEmailError("there is at least one character after .")
            return false;
        } */

        // If all checks pass, return true
        return true;
    }

    const startTimer = () => {
        setCodeTimer(() => 60);
        codeTimerRef.current = 60;
        console.log('Starting timer at: ' + codeTimerRef.current)

        const timer = setInterval(() => {
            if (codeTimerRef.current !== 0) {
                setCodeTimer((prevCount) => {
                    codeTimerRef.current = prevCount - 1
                    return prevCount - 1
                });
                console.log(codeTimerRef.current)
            } else {
                console.log('clearing interval')
                clearInterval(timer);
            }
        }, 1000);

    };

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
            console.log("code sended")

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setIsLoading(false);
            setPendingVerification(true);

            startTimer()
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

            await setActive({ session: completeVerifyPhone.createdSessionId })

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setIsPhoneVerified(true)
            setPendingVerification(false);
            setIsLoading(false);
            void setSignMethod(oauthCompleted ? "oauth" : "password")

            /* if (isOnSignUpRoute) {
                back()
            } else {
                navigation?.navigate('Map')
            } */
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
                console.error(emailError)
                throw new Error(emailError)
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

    if (isSignedIn) {
        if (isOnSignUpRoute) {
            console.log(`SignUp_signed_Render - path_${pathName} - action_replace('/')`)
            replace('/')
        } else {
            console.log(`SignUp_signed_Render - path_${pathName} - action_navigation?.navigate('Map')`)
            navigation?.navigate('Map')
        }
    }

    return (
        <View className={'w-full h-full justify-center items-center'}>
            <Stack.Screen options={{
                title: 'Cuenta Nueva',
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
                        <View className='w-full justify-center items-center'>
                            <Text numberOfLines={1} adjustsFontSizeToFit className='mt-4' >
                                No Te Ha Llegado?
                            </Text>
                            <View className='w-full justify-center items-center flex-row mb-4'>
                                <Text numberOfLines={1} adjustsFontSizeToFit className='mr-2' >
                                    Intenta de nuevo en {codeTimer}.
                                </Text>
                                <PressBtn
                                    onPress={() => {
                                        if (codeTimer === 0) {
                                            handleSendCode()
                                        }
                                    }}
                                >
                                    <Text className='font-bold text-base'>Enviar</Text>
                                </PressBtn>
                            </View>
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
                    <PressBtn
                        disabled={code === '' || isLoading}
                        onPress={() => { handleVerifyPhone() }}
                        className={'w-[200px] max-[367px]:w-[180px] max-w-[280px] bg-[#FCCB6F] mb-2 dark:bg-white rounded-3xl h-12 max-[367px]:h-8 flex-row justify-center items-center'}
                    >
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
                        console.log(`SignUp_afterOauthFlow - path_${pathName} - isSignedIn_${isSignedIn}`)
                        if (isSignedIn) {
                            /* if (isOnSignUpRoute) {
                                replace('/')
                            } else {
                                navigation?.navigate('Map')
                            } */
                        } else {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                            setOauthCompleted(true)
                        }
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

            <PressBtn
                className={'flex-row items-center justify-center mt-2'}
                onPress={() => {
                    if (isOnSignUpRoute) {
                        replace('auth/sign-in')
                    } else {
                        navigation?.navigate('Sign-In')
                    }
                }}
            >
                <Text className={'text-sm max-[367px]:text-xs font-light dark:text-gray-400'}>Ya Tienes Cuenta?</Text>
                <Text className={'text-[#2e78b7] font-normal ml-1 text-sm max-[367px]:text-xs'}>Inicia Sesión</Text>
            </PressBtn>
        </View>
    );
}