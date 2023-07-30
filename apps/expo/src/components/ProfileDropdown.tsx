import React, { useRef } from 'react';
import {
    Pressable,
    Animated,
    TouchableWithoutFeedback
} from 'react-native';
import { Text } from '../styles/Themed';
import { Feather } from '@expo/vector-icons';
import Colors from '../styles/Colors';
import { useColorScheme } from 'nativewind';
import { useAuth } from '@clerk/clerk-expo';

const ProfileDropdown = () => {
    const dropdownVisible = useRef(new Animated.Value(0)).current;
    const [isOpen, setIsOpen] = React.useState(false);
    const { colorScheme } = useColorScheme()
    const { isLoaded, signOut } = useAuth();

    const handleOpenDropdown = () => {
        setIsOpen(() => true)
        Animated.timing(dropdownVisible, {
            toValue: 1,
            duration: 175,
            useNativeDriver: true,
        }).start();
    };

    const handleCloseDropdown = () => {
        Animated.timing(dropdownVisible, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => {
            setIsOpen(() => false)
        });
    };

    return (
        <>
            <Pressable
                onPress={handleOpenDropdown}
                className='w-8 h-8 absolute justify-center items-center rounded-full right-5 top-5 z-20'
                style={{
                    backgroundColor: colorScheme === 'light' ? 'white' : 'black',
                }}
            >
                <Feather
                    name='more-vertical'
                    size={20}
                    color={Colors[colorScheme ?? 'light'].text}
                />
            </Pressable>

            {isOpen && <Pressable onPress={handleCloseDropdown} className='w-full h-full absolute z-20'>
                <TouchableWithoutFeedback className='w-full h-full'>
                    <Animated.View
                        className='absolute z-30 pl-4 right-5 top-5 justify-evenly bg-gray-200 dark:bg-zinc-900 shadow-sm dark:shadow-zinc-300 rounded-md w-40 h-44'
                        style={[
                            {
                                transform: [
                                    { scale: dropdownVisible },
                                ],
                                opacity: dropdownVisible.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 1],
                                })
                            },
                        ]}
                    >
                        <Pressable onPress={() => { console.log("Cambiar Imagen") }}>
                            <Text className='text-sm '>Cambiar Imagen</Text>
                        </Pressable>
                        <Pressable onPress={() => { console.log("Cambiar Nombre") }}>
                            <Text className='text-sm '>Cambiar Nombre</Text>
                        </Pressable>
                        <Pressable onPress={() => {
                            console.log('closing session')
                            if (isLoaded) {
                                void signOut()
                            }
                        }}>
                            <Text className='text-sm '>Cerrar Sesión</Text>
                        </Pressable>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </Pressable>}

        </>
    )
};


export default ProfileDropdown;