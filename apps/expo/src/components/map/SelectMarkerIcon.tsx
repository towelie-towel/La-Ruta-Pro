import { useState, useRef, memo } from 'react'
import { Dimensions, LayoutAnimation, Pressable, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { atomWithStorage, createJSONStorage, } from 'jotai/utils';
import { useAtom, } from 'jotai';

import { View, Text } from '~/components/shared/Themed';
import { PressBtn } from '~/components/shared/PressBtn';

import Colors from '~/constants/Colors';

const storedUserMarkers = createJSONStorage<UserMarkerIconType[]>(() => AsyncStorage)
export const userMarkersAtom = atomWithStorage<UserMarkerIconType[]>('userMarkers', [], storedUserMarkers)

const selectableMarkerIcons = [
    {
        type: "MCI",
        name: "airplane-marker"
    },
    {
        type: "MCI",
        name: "archive-marker"
    },
    {
        type: "MCI",
        name: "book-marker"
    },
    {
        type: "MCI",
        name: "bus-marker"
    },
    {
        type: "MCI",
        name: "camera-marker"
    },
    {
        type: "MCI",
        name: "cash-marker"
    },
    {
        type: "MCI",
        name: "cellphone-marker"
    },
    {
        type: "MCI",
        name: "credit-card-marker"
    }
]

export interface UserMarkerIconType {
    id: string,
    name: string,
    description?: string,
    icon: {
        type: string,
        name: string,
        color?: string,
        size?: number,
    },
    coords: {
        latitude: number,
        longitude: number
    }
}

const SelectMarkerIcon: React.FC<{
    onConfirmFn: (newMarker: UserMarkerIconType) => void
}> = ({ onConfirmFn }) => {

    const { width, height } = Dimensions.get('window');
    const { colorScheme } = useColorScheme();

    const [userMarkers, _setUserMarkers] = useAtom(userMarkersAtom)

    const [isSelectMarkerIconOpen, setIsSelectMarkerIconOpen] = useState(false);
    const [selectMarkerWidth, setSelectMarkerWidth] = useState(96);
    const [selectMarkerHeight, setSelectMarkerHeight] = useState(40);
    const addingMarkerDataRef = useRef<UserMarkerIconType>({
        // Fix this later, add a new method for creating ids
        id: Date.now().toString(),
        coords: {
            latitude: 69.420,
            longitude: 69.420
        },
        icon: selectableMarkerIcons.find(markerIcon => !userMarkers.some(marker => marker.icon.name === markerIcon.name)) ?? {
            type: "MCI",
            name: "airplane-marker"
        },
        name: "airplane-marker"
    });

    const toggleSelectMarkerIcon = () => {
        LayoutAnimation.configureNext({
            duration: 300,
            update: {
                type: 'easeInEaseOut',
                property: 'scaleXY',
            },
            create: {
                type: 'easeInEaseOut',
                property: 'scaleXY',
            },
            delete: {
                type: 'easeInEaseOut',
                property: 'scaleXY',
            },
        })
        const newWidth = isSelectMarkerIconOpen ? 96 : 216;
        const newHeight = isSelectMarkerIconOpen ? 40 : 136;

        setIsSelectMarkerIconOpen(!isSelectMarkerIconOpen)
        setSelectMarkerWidth(newWidth)
        setSelectMarkerHeight(newHeight)
    }

    const onMarkerIconPress = (markerIcon: { type: string; name: string; }) => {
        addingMarkerDataRef.current = {
            ...addingMarkerDataRef.current,
            icon: markerIcon,
            name: markerIcon.name,
            coords: {
                latitude: 69.420,
                longitude: 69.420
            }
        }
        toggleSelectMarkerIcon()
    }

    const onConfirmInternal = () => {
        onConfirmFn(addingMarkerDataRef.current);
    }

    return (
        <>
            <View
                style={{
                    right: (width / 2) - 24,
                    top: (height / 2) - 48,
                }}
                className='absolute bg-transparent h-12 w-12 overflow-hidden justify-end items-center'
            >
                <MaterialIcons
                    name={'location-pin'}
                    size={48}
                    color={Colors[colorScheme ?? 'light'].text}
                />
            </View>
            {
                isSelectMarkerIconOpen &&
                <Pressable onPress={toggleSelectMarkerIcon} className='absolute w-full h-full z-10'>

                </Pressable>
            }
            <TouchableWithoutFeedback>
                <Pressable
                    onPress={!isSelectMarkerIconOpen ? toggleSelectMarkerIcon : undefined}
                    className={'absolute z-20 bottom-24 bg-white rounded-3xl shadow-lg flex-row items-center'}
                    style={{
                        height: selectMarkerHeight,
                        width: selectMarkerWidth,
                        justifyContent: isSelectMarkerIconOpen ? 'center' : 'space-evenly',
                        flexWrap: isSelectMarkerIconOpen ? 'wrap' : 'nowrap',
                        flexDirection: isSelectMarkerIconOpen ? 'column' : 'row',
                        gap: isSelectMarkerIconOpen ? 6 : 0,
                        padding: isSelectMarkerIconOpen ? 8 : 0,
                        left: (width / 2) - (selectMarkerWidth / 2),
                    }}
                >
                    {
                        !isSelectMarkerIconOpen &&
                        <>
                            <MaterialCommunityIcons
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                name={addingMarkerDataRef.current.icon.name}
                                size={28}
                                color={'black'}
                            />
                            <MaterialIcons
                                name={'arrow-drop-up'}
                                size={24}
                                color={'black'}
                            />
                        </>
                    }
                    {
                        isSelectMarkerIconOpen &&
                        <>
                            {selectableMarkerIcons.map((markerIcon) => {
                                return (
                                    <Pressable
                                        key={markerIcon.name}
                                        onPress={() => { onMarkerIconPress(markerIcon) }}
                                        style={{
                                            display: isSelectMarkerIconOpen ? 'flex' : 'none'
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                            // @ts-ignore
                                            name={markerIcon.name}
                                            size={45}
                                            color={'black'}
                                        />
                                    </Pressable>
                                )
                            })}
                        </>
                    }
                </Pressable>
            </TouchableWithoutFeedback>

            <PressBtn
                onPress={onConfirmInternal}
                className={'h-12 max-[367px]:h-8 w-[200px] max-[367px]:w-[180px] bg-[#FCCB6F] dark:bg-white rounded-3xl justify-center items-center'}
                style={{
                    position: 'absolute',
                    zIndex: 20,
                    left: (width > 367) ? (width / 2) - 100 : (width / 2) - 90,
                    bottom: 20,
                }}
            >
                <Text darkColor="black" className={'text-white dark:text-black font-bold text-lg max-[367px]:text-base'}>Confirmar</Text>
            </PressBtn>

        </>
    )
}

export default memo(SelectMarkerIcon)