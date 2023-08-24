import type {
    ViewProps
} from 'react-native';
import {
    ActivityIndicator, LayoutAnimation
} from 'react-native';
import { useEffect, useState } from 'react';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'nativewind';

import {
    Text,
    View
} from '~/components/shared/Themed';
import { PressBtn } from './PressBtn';

type Params = {
    onCancel?: () => void,
    size?: number | 'small' | 'large',
    visible: boolean,
    intensity?: number,
} & ViewProps

const AbsoluteLoading = ({ onCancel, size, visible, intensity = 5, style, ...restProps }: Params) => {
    const { colorScheme } = useColorScheme()
    const [open, setOpen] = useState(visible)

    useEffect(() => {
        if (visible) {
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
            setOpen(true)
        } else {
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
            setOpen(false)
        }
    }, [visible])

    return (

        <BlurView
            style={[{
                display: open ? 'flex' : 'none',
            }, style]}
            {...restProps}
            className='w-full h-full justify-center items-center absolute z-40'
            intensity={intensity}
        >
            {open && <View className='absolute top-10 mx-auto bg-transparent z-50'>
                <ActivityIndicator
                    size={size}
                    animating
                    color={colorScheme === 'light' ? 'black' : 'white'}
                />
                {onCancel && <PressBtn onPress={() => { onCancel() }} className={'w-[200px] max-[367px]:w-[180px] max-w-[280px] bg-[#FCCB6F] mt-4 dark:bg-white rounded-3xl h-12 max-[367px]:h-8 flex-row justify-center items-center'} >
                    <Text darkColor="black" className={'text-white dark:text-black font-bold text-lg max-[367px]:text-base mr-3'}>Cancelar</Text>
                </PressBtn>}
            </View>}
        </BlurView>
    )
};


export default AbsoluteLoading;