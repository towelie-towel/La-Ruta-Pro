import { useState } from 'react';
import {
    ActivityIndicator,
    LayoutAnimation,
    Pressable,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import {
    Text,
    View
} from '~/components/shared/Themed';
import Colors from '~/constants/Colors';
import AbsoluteLoading from './AbsoluteLoading';

interface Action {
    onPress: () => void;
    icon?: string;
    title?: string;
    color?: string;
    backgroundColor?: string;
    disabled?: boolean;
    loading?: boolean;
    loadingColor?: string;
    loadingBackgroundColor?: string;
}

const AbsoluteDropdown = ({ actions }: { actions: Action[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { colorScheme } = useColorScheme();

    const [isLoading, setIsLoading] = useState(false)

    const [width, setWidth] = useState(32);
    const [height, setHeight] = useState(32);

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

    return (
        <>
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

                {isOpen && actions.map((action) => (
                    <Pressable
                        key={action.title}
                        onPress={() => { action.onPress(); }}
                        className='w-full flex-row justify-start items-center pl-2'
                    >
                        <MaterialIcons
                            name='close'
                            size={16}
                            color={Colors[colorScheme ?? 'light'].text}
                        />
                        <Text className='text-sm ml-2 text-red-600'>Cerrar Sesión</Text>
                    </Pressable>
                ))
                }

            </Pressable>

            {isOpen && <Pressable
                onPress={handleCloseDropdown}
                className='w-full h-full absolute z-20 opacity-20 bg-slate-500'
            />}

        </>
    )
};


export default AbsoluteDropdown;