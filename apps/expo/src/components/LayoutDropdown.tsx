import { useState } from 'react';
import {
    ActivityIndicator,
    LayoutAnimation,
    Pressable,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { BlurView } from 'expo-blur';

import {
    Text,
    View
} from '../styles/Themed';
import Colors from '../styles/Colors';

const LayoutDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { colorScheme } = useColorScheme();
    const { isLoaded, signOut } = useAuth();

    const [isLoading, setIsLoading] = useState(false)

    const [width, setWidth] = useState(32);
    const [height, setHeight] = useState(32);

    const handleSignOut = async () => {
        handleOpenLoading()
        if (isLoaded) {
            await signOut()
                .catch((error) => {
                    console.error(error)
                })
        }
        handleCloseLoading()
    }

    const handleOpenDropdown = () => {
        LayoutAnimation.configureNext({
            duration: 300,
            update: {
                type: 'easeInEaseOut',
                property: 'scaleXY',
            },
            create: {
                type: 'easeInEaseOut',
                property: 'opacity',
            }
        })
        setIsOpen(true)
        setWidth(150)
        setHeight(150)
    };

    const handleCloseDropdown = () => {
        LayoutAnimation.configureNext({
            duration: 300,
            update: {
                type: 'easeInEaseOut',
                property: 'scaleXY',
            },
            delete: {
                type: 'easeInEaseOut',
                property: 'opacity',
            }
        })
        setWidth(32)
        setHeight(32)
        setIsOpen(false)
    };

    const handleOpenLoading = () => {
        LayoutAnimation.configureNext({
            duration: 300,
            update: {
                type: 'easeInEaseOut',
                property: 'opacity',
            },
            create: {
                type: 'easeInEaseOut',
                property: 'opacity',
            },
            delete: {
                type: 'easeInEaseOut',
                property: 'opacity',
            },
        })
        setIsLoading(true)
    };

    const handleCloseLoading = () => {
        LayoutAnimation.configureNext({
            duration: 200,
            update: {
                type: 'easeInEaseOut',
                property: 'opacity',
            },
            create: {
                type: 'easeInEaseOut',
                property: 'opacity',
            },
            delete: {
                type: 'easeInEaseOut',
                property: 'opacity',
            },
        })
        setIsLoading(false)
    };

    return (
        <>

            <BlurView
                style={{
                    display: isLoading ? 'flex' : 'none',
                }}
                className='w-full h-full justify-center items-center absolute z-40'
                intensity={10}
            >
                {isLoading &&
                    <View className='absolute top-10 mx-auto bg-transparent z-50'>
                        <ActivityIndicator
                            size={'large'}
                            animating
                            color={colorScheme === 'light' ? 'black' : 'white'}
                        />
                        {/* <PressBtn onPress={() => { handleCloseLoading() }} className={'w-[200px] max-[367px]:w-[180px] max-w-[280px] bg-[#FCCB6F] mt-4 dark:bg-white rounded-3xl h-12 max-[367px]:h-8 flex-row justify-center items-center'} >
                            <Text darkColor="black" className={'text-white dark:text-black font-bold text-lg max-[367px]:text-base mr-3'}>Cancelar</Text>
                        </PressBtn> */}
                    </View>
                }
            </BlurView>

            <Pressable
                onPress={handleOpenDropdown}
                className='absolute justify-center items-center right-5 top-5 z-30'
                style={{
                    backgroundColor: colorScheme === 'light' ? 'white' : 'black',
                    width,
                    height,
                    borderRadius: isOpen ? 5 : 150,
                    justifyContent: isOpen ? 'space-evenly' : 'center',
                    alignItems: 'center',
                }}
            >
                {
                    !isOpen && <Feather
                        name='more-vertical'
                        size={20}
                        color={Colors[colorScheme ?? 'light'].text}
                    />
                }

                {isOpen &&
                    <>
                        <Pressable onPress={() => { handleOpenLoading() }}>
                            <Text className='text-sm '>Open Loading</Text>
                        </Pressable>
                        <Pressable onPress={() => { handleCloseLoading() }}>

                            <Text className='text-sm'>Close Loading</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSignOut}
                            className='w-full flex-row justify-start items-center pl-2'
                        >
                            <MaterialIcons
                                name='close'
                                size={16}
                                color={Colors[colorScheme ?? 'light'].text}
                            />
                            <Text className='text-sm ml-2 text-red-600'>Cerrar Sesión</Text>
                        </Pressable>
                    </>
                }

            </Pressable>

            {isOpen && <Pressable
                onPress={handleCloseDropdown}
                className='w-full h-full absolute z-20 opacity-20 bg-slate-500'
            />}

        </>
    )
};


export default LayoutDropdown;