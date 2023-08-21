import { Animated } from 'react-native'
import { type LocationHeadingObject } from 'expo-location'
import { useColorScheme } from 'nativewind'
import React, { memo, useEffect, useRef } from 'react'
import { type MapMarkerProps, MarkerAnimated } from 'react-native-maps'
import { Image } from 'expo-image'

import { View } from '~/components/shared/Themed'
import { type MarkerData } from '~/constants/Markers'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import BlackCarSVG from '~/assets/svgs/BlackCar.svg'
import BlackCarTSX from '~/components/svgs/BlackCarSVG'

type TaxiCategories = 'basic' | 'confort' | 'xl'

type CarMarkerProps = MarkerData & { heading?: LocationHeadingObject, category?: TaxiCategories } & MapMarkerProps

const CarMarker = ({ coordinate, description, title, userId, category, image, heading, ...props }: CarMarkerProps) => {
    const animatedRotation = useRef(new Animated.Value(1)).current;

    const animatedSize = useRef(new Animated.Value(1)).current;

    const { colorScheme } = useColorScheme()

    const rotate = () => {
        Animated.timing(animatedRotation, {
            toValue: heading?.trueHeading || 0,
            duration: 900,
            useNativeDriver: true
        }).start();
    };

    useEffect(() => {
        rotate();
    }, [heading])

    /* useEffect(() => {

        let isOscillating = true;

        const upSizeAnim = () => {
            Animated.timing(animatedSize, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true
            }).start(() => {
                if (isOscillating)
                    downSizeAnim()
            });
        };

        const downSizeAnim = () => {
            Animated.timing(animatedSize, {
                toValue: 0.8,
                duration: 1000,
                useNativeDriver: true
            }).start(() => {
                upSizeAnim()
            });
        };

        upSizeAnim()

        return () => {
            isOscillating = false;
        }
    }, []) */

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
                                rotate: animatedRotation.interpolate({
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
                    position: 'relative',
                    width: 48,
                    height: 48,
                }}>
                    <BlackCarTSX />
                    {/* <Animated.View style={{
                        backgroundColor: colorScheme === 'light' ? 'transparent' : 'rgba(26,18,11,0.5)',
                        position: 'absolute',
                        width: 48,
                        height: 48,
                        borderWidth: 1,
                        borderColor: colorScheme === 'dark' ? 'rgba(203,213,225,0.5)' : 'rgba(26,18,11,0.5)',
                        borderRadius: 999,
                        shadowColor: 'black',
                        shadowOffset: {
                            width: 1,
                            height: 1,
                        },
                        shadowOpacity: 0.3,
                        shadowRadius: 1.5,
                        elevation: 4,
                        zIndex: -1,
                        transform: [
                            {
                                scale: animatedSize
                            }
                        ]
                    }} /> */}
                </View>
            </MarkerAnimated>
        </>
    )
}

export default memo(CarMarker);