import React from 'react';
import { Text, View } from '../styles/Themed';

import NetInfo from '@react-native-community/netinfo';

export default function NetworkScreen() {
    const { details, isConnected, isInternetReachable, type } = NetInfo.useNetInfo()
    return (
        <View className={'w-full h-full'}>
            <View className='w-1/2 m-auto'>
                <Text className={'text-lg font-bold'}>Network</Text>
                <Text className={'text-lg'}>Type: {type}</Text>
                <Text className={'text-lg'}>Is connected: {isConnected ? 'Yes' : 'No'}</Text>
                <Text className={'text-lg'}>Is internet reachable: {isInternetReachable ? 'Yes' : 'No'}</Text>
                <Text className={'text-lg'}>Details: {JSON.stringify(details)}</Text>
            </View>
        </View>
    );
} 