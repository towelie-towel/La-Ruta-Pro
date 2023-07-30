import React, { memo, useRef, useState } from 'react';
import {
    Image,
    Animated,
    Dimensions,
    FlatList
} from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useAtom, } from 'jotai';
import { useUser } from '@clerk/clerk-expo';
import { useKeepAwake } from 'expo-keep-awake';
import { useColorScheme } from 'nativewind';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { type BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

import { View, Text } from '../styles/Themed';
import { PressBtn } from '../styles/PressBtn';
import Colors from '../styles/Colors';

// import { profileRoleAtom, profileStateAtom } from "../hooks/useMapConnection";
import { userMarkersAtom } from './SelectMarkerIcon';
import LayoutDropdown from './LayoutDropdown';

void Image.prefetch("https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c")

const snapPoints = ["25%", "50%", "75%"];

const FirstRoute = () => {
    return (
        (
            <View style={{ flex: 1, backgroundColor: '#ff4081' }} />
        )
    )
}

const MarkersProfileTab = () => {
    const { colorScheme } = useColorScheme();
    const [userMarkers, setUserMarkers] = useAtom(userMarkersAtom)

    return (
        (
            <View style={{ flex: 1, backgroundColor: 'transparent' }} >
                <FlatList
                    style={{
                        width: '100%'
                    }}
                    data={userMarkers}
                    renderItem={({ item }) => (
                        <View className='w-full h-14 flex-row items-center justify-evenly'>
                            <MaterialCommunityIcons
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                name={item.icon.name}
                                size={28}
                                color={Colors[colorScheme ?? 'light'].text}
                            />
                            <Text>
                                {item.name}
                            </Text>
                            <PressBtn
                                onPress={() => {
                                    void setUserMarkers(userMarkers.filter(marker => marker.id !== item.id))
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={'trash-can'}
                                    size={28}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </PressBtn>
                        </View>
                    )}
                />
            </View>
        )
    )
}

const renderTabsScene = SceneMap({
    first: FirstRoute,
    second: MarkersProfileTab,
});

const BottomSheet = ({ bottomSheetModalRef, selectedMarkerIndex, userSelected, isVisible, setIsVisible }: {
    bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>,
    selectedMarkerIndex: number | null,
    userSelected: boolean,
    isVisible: boolean,
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>,
}) => {

    const { colorScheme } = useColorScheme();
    const { user, isLoaded, isSignedIn } = useUser()
    const { width } = Dimensions.get('window');

    const [tabsIndex, setTabsIndex] = useState(0);
    const [tabsRoutes] = useState([
        { key: 'first', title: 'First' },
        { key: 'second', title: 'Second' },
    ]);

    console.log("BottomSheet re-rendered")

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            index={1}
            snapPoints={snapPoints}
            backgroundStyle={{ borderRadius: 50, backgroundColor: colorScheme === 'light' ? 'rgba(203,213,225,0.8)' : 'rgba(26,18,11,0.5)' }}
            handleIndicatorStyle={{
                backgroundColor: colorScheme === 'dark' ? 'rgba(203,213,225,0.8)' : 'rgba(26,18,11,0.5)'
            }}
            onDismiss={() => {
                setIsVisible(false)
            }}
        >
            <View className={'w-full h-full rounded-t-3xl overflow-hidden'}>

                {selectedMarkerIndex !== null && !userSelected && (
                    <View className='w-full h-full'>

                        <Animated.Image
                            source={{
                                uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                            }}
                            className={'w-full h-48'}
                            resizeMode="cover"
                        />

                        <View className={'absolute left-5 top-40 border-2 border-solid border-white dark:border-black w-16 h-16 rounded-full overflow-hidden'}>
                            <Animated.Image
                                source={{
                                    uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                                }}
                                className={'w-16 h-16'}
                                resizeMode="cover"
                            />
                        </View>

                        <View className={'w-full h-20 justify-between flex-row bg-transparent'}>
                            <View className='bg-transparent h-full justify-end ml-5'>
                                <Text className='font-bold text-lg'>Julio López</Text>
                                <Text className='font-medium text-sm text-slate-700 dark:text-slate-100'>@julydev</Text>
                            </View>
                            <View className='flex-row h-full justify-between items-center'>
                                <MaterialCommunityIcons
                                    name={colorScheme === 'dark' ? "message-text" : "message-text-outline"}
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </View>
                        </View>

                    </View>
                )}


                {(userSelected && isSignedIn && isLoaded) && (
                    <View className='w-full h-full'>

                        <Animated.Image
                            source={{
                                uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                            }}
                            className={'w-full h-48'}
                            resizeMode="cover"
                        />

                        <LayoutDropdown />

                        <View className={'absolute left-5 top-40 border-2 border-solid border-white dark:border-black w-16 h-16 rounded-full overflow-hidden'}>
                            <Animated.Image
                                source={{
                                    uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                                }}
                                className={'w-16 h-16'}
                                resizeMode="cover"
                            />
                        </View>

                        <View className={'w-full h-20 justify-between flex-row bg-transparent'}>
                            <View className='bg-transparent h-full justify-end ml-5'>
                                <View className='bg-transparent'>
                                    <Text className='font-bold text-lg'>{`${user.firstName} ${user.lastName}`}</Text>
                                </View>
                                <View>
                                    <Text className='font-medium text-sm text-slate-700 dark:text-slate-100'>@{`${user.username}`}</Text>
                                </View>
                            </View>
                            <PressBtn onPress={() => { return }}>
                                <View className='h-10 px-2 mt-3 mr-5 flex-row justify-center items-center rounded-2xl border-zinc-400 dark:border-zinc-800'>
                                    <MaterialIcons
                                        name='edit'
                                        size={16}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                    <Text className='font-bold ml-2 text-base'>Editar Perfil</Text>
                                </View>
                            </PressBtn>
                        </View>

                        <TabView
                            navigationState={{ index: tabsIndex, routes: tabsRoutes }}
                            renderScene={renderTabsScene}
                            onIndexChange={setTabsIndex}
                            initialLayout={{ width }}
                            renderTabBar={(props) => <TabBar style={{ backgroundColor: 'transparent' }} {...props} />}
                            lazy
                        />

                    </View>
                )}
            </View>
        </BottomSheetModal>
    );
};

export default memo(BottomSheet)
