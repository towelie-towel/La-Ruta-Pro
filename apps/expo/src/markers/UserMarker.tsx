import React, { memo, useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { type LocationHeadingObject } from 'expo-location'
import { Circle, type MapMarkerProps, MarkerAnimated } from 'react-native-maps'

import { View } from '../styles/Themed'
import { type MarkerData } from '../constants/Markers'

const UserMarker = ({ coordinate, description, title, userId, heading, ...props }: Omit<MarkerData, "image"> & { heading?: LocationHeadingObject } & MapMarkerProps) => {
    const animatedValue = useRef(new Animated.Value(1)).current;

    const rotate = () => {
        Animated.timing(animatedValue, {
            toValue: heading?.trueHeading || 0,
            duration: 900,
            useNativeDriver: true
        }).start();
        return true
    };

    useEffect(() => {
        rotate()
    }, [heading])

    return (
        <>
            <MarkerAnimated
                {...props}
                anchor={{ x: 0.5, y: 0.6 }}
                coordinate={{
                    latitude: coordinate.latitude,
                    longitude: coordinate.longitude,
                }}
                flat
                style={{
                    ...(heading?.trueHeading !== -1 && {
                        transform: [
                            {
                                rotate: animatedValue.interpolate({
                                    inputRange: [0, 360],
                                    outputRange: ['0deg', '360deg'],
                                }),
                            },
                        ],
                    }),
                }}>
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                }}>
                    <View style={[{
                        width: 0,
                        height: 0,
                        backgroundColor: 'transparent',
                        borderStyle: 'solid',
                        borderLeftWidth: 6,
                        borderRightWidth: 6,
                        borderBottomWidth: 10,
                        borderLeftColor: 'transparent',
                        borderRightColor: 'transparent',
                        borderBottomColor: 'rgb(0, 120, 255)',
                    }]} />
                    <View style={{
                        backgroundColor: 'rgb(0, 120, 255)',
                        width: 24,
                        height: 24,
                        borderWidth: 3,
                        borderColor: 'white',
                        borderRadius: 12,
                        shadowColor: 'black',
                        shadowOffset: {
                            width: 1,
                            height: 1,
                        },
                        shadowOpacity: 0.3,
                        shadowRadius: 1.5,
                        elevation: 4,
                    }} />
                </View>
            </MarkerAnimated>
            <Circle
                center={{
                    latitude: coordinate.latitude,
                    longitude: coordinate.longitude,
                }}
                radius={coordinate.accuracy || 0}
                strokeColor="rgba(0, 150, 255, 0.5)"
                fillColor="rgba(0, 150, 255, 0.5)"
            />
        </>
    )
}

export default memo(UserMarker);