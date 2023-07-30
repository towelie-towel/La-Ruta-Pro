import React, { memo } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    TouchableWithoutFeedback,
} from "react-native";
import { useColorScheme } from 'nativewind';
import { MaterialIcons } from '@expo/vector-icons';

import { PressBtn } from '../styles/PressBtn';
import Colors from '../styles/Colors';

type NavigationMenuParams = {
    navigationAnimValue: Animated.Value,
    toggleNavMenu: () => void,
    addMarkerHandler: () => void,
    openUserProfileHandler: () => void,
    taxiBtnHandler: () => void,

}

const NavigationMenu: React.FC<NavigationMenuParams> = ({ navigationAnimValue, toggleNavMenu, addMarkerHandler, openUserProfileHandler, taxiBtnHandler }) => {

    console.log("Navigation menu re-rendered")

    const { colorScheme } = useColorScheme();
    const { width, height } = Dimensions.get('window');

    return (
        <Animated.View
            style={{
                right: (width / 7),
                bottom: (height / 10),
            }}
            className='absolute bg-transparent items-center'
        >

            <TouchableWithoutFeedback>
                <Animated.View
                    style={{
                        position: "absolute",
                        transform:
                            [
                                {
                                    scale: navigationAnimValue
                                },
                                {
                                    translateY: navigationAnimValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -195]
                                    })
                                }
                            ]
                    }}
                >
                    <PressBtn
                        onPress={taxiBtnHandler}
                        className={'h-14 w-14 justify-center items-center rounded-full border border-zinc-500'}
                    >
                        <MaterialIcons
                            name={'local-taxi'}
                            size={40}
                            color={Colors[colorScheme ?? 'light'].text}
                        />
                    </PressBtn>
                </Animated.View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback>
                <Animated.View
                    style={{
                        position: "absolute",
                        transform:
                            [
                                {
                                    scale: navigationAnimValue
                                },
                                {
                                    translateY: navigationAnimValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -130]
                                    })
                                }
                            ]
                    }}
                >
                    <PressBtn
                        className={'h-14 w-14 justify-center items-center rounded-full border border-zinc-500'}
                        onPress={openUserProfileHandler}
                    >
                        <MaterialIcons
                            name={'account-circle'}
                            size={40}
                            color={Colors[colorScheme ?? 'light'].text}
                        />
                    </PressBtn>
                </Animated.View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback>
                <Animated.View
                    style={{
                        position: "absolute",
                        transform:
                            [
                                {
                                    scale: navigationAnimValue
                                },
                                {
                                    translateY: navigationAnimValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -65]
                                    })
                                }
                            ]
                    }}
                >
                    <PressBtn onPress={addMarkerHandler} className={'h-14 w-14 justify-center items-center rounded-full border border-zinc-500'}>
                        <MaterialIcons
                            name={'add-location-alt'}
                            size={40}
                            color={Colors[colorScheme ?? 'light'].text}
                        />
                    </PressBtn>
                </Animated.View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback>
                <Animated.View
                    style={{
                        transform:
                            [
                                {
                                    rotate: navigationAnimValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '135deg']
                                    }),
                                }
                            ]
                    }}
                >
                    <Pressable onPress={toggleNavMenu} className={' h-16 w-16 justify-center items-center rounded-full border border-zinc-500'}>

                        <MaterialIcons
                            name={'add'}
                            size={48}
                            color={Colors[colorScheme ?? 'light'].text}
                        />
                    </Pressable>
                </Animated.View>
            </TouchableWithoutFeedback>

        </Animated.View>
    );
};

export default memo(NavigationMenu)
