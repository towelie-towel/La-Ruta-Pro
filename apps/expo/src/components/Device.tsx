import React from 'react';
import { Dimensions } from 'react-native';
import { Text, View } from '../styles/Themed';

export default function DeviceScreen() {

    const { height, width, fontScale, scale } = Dimensions.get('window')

    return (
        <View className={'w-full h-full'}>
            <View className='w-1/2 m-auto'>

                <Text className={'text-lg font-bold mb-2'}>Dimensions</Text>
                <Text className={'text-lg'}>Height: {height}</Text>
                <Text className={'text-lg'}>Width: {width}</Text>
                <Text className={'text-lg'}>Font Scale: {fontScale}</Text>
                <Text className={'text-lg'}>Scale: {scale}</Text>

            </View>
        </View>
    );
} 