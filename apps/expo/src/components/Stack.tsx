import React from 'react';
import { View, Text } from '../styles/Themed';
import { PressBtn } from '../styles/PressBtn';

export default function StackComponent() {

    return (
        <View className={'w-full h-full justify-center items-center'} >
            <View className={'w-full h-full gap-8 justify-center items-center'}>
                <PressBtn onPress={() => { }} className={'w-[150px] max-w-[180px] bg-slate-500 dark:bg-slate-700 rounded h-8 justify-center items-center'} >
                    <Text className={'text-white'}>Map</Text>
                </PressBtn>
                <PressBtn onPress={() => { }} className={'w-[150px] max-w-[180px] bg-slate-500 dark:bg-slate-700 rounded h-8 justify-center items-center'} >
                    <Text className={'text-white'}>Map Demo</Text>
                </PressBtn>
                <PressBtn onPress={() => { }} className={'w-[150px] max-w-[180px] bg-slate-500 dark:bg-slate-700 rounded h-8 justify-center items-center'} >
                    <Text className={'text-white'}>Map Snack</Text>
                </PressBtn>
                <PressBtn onPress={() => { }} className={'w-[150px] max-w-[180px] bg-slate-500 dark:bg-slate-700 rounded h-8 justify-center items-center'} >
                    <Text className={'text-white'}>Map Snack Class</Text>
                </PressBtn>
                <PressBtn onPress={() => { }} className={'w-[150px] max-w-[180px] bg-slate-500 dark:bg-slate-700 rounded h-8 justify-center items-center'} >
                    <Text className={'text-white'}>Location</Text>
                </PressBtn>
                <PressBtn onPress={() => { }} className={'w-[150px] max-w-[180px] bg-slate-500 dark:bg-slate-700 rounded h-8 justify-center items-center'} >
                    <Text className={'text-white'}>Accelelometer</Text>
                </PressBtn>
                <PressBtn onPress={() => { }} className={'w-[150px] max-w-[180px] bg-slate-500 dark:bg-slate-700 rounded h-8 justify-center items-center'} >
                    <Text className={'text-white'}>Shop</Text>
                </PressBtn>
                <PressBtn onPress={() => { }} className={'w-[150px] max-w-[180px] bg-slate-500 dark:bg-slate-700 rounded h-8 justify-center items-center'} >
                    <Text className={'text-white'}>Bottom Modal</Text>
                </PressBtn>
                <PressBtn onPress={() => { }} className={'w-[150px] max-w-[180px] bg-slate-500 dark:bg-slate-700 rounded h-8 justify-center items-center'} >
                    <Text className={'text-white'}>Slider</Text>
                </PressBtn>
            </View>
        </View>
    );
}