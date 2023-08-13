import React, { useRef, useCallback, useEffect, memo } from 'react'
import { Animated, Dimensions, Easing } from 'react-native';
import type { MapMarkerProps } from 'react-native-maps';
import { AnimatedRegion, MarkerAnimated, type MapMarker } from 'react-native-maps';

type AnimatedMarkerParams = {
    longitude: number;
    latitude: number;
    heading: number
} & Omit<MapMarkerProps, "coordinate">

const AnimatedMarker: React.FC<AnimatedMarkerParams> = ({ latitude, longitude, heading, children, style, ...restProps }) => {

    const { width, height } = Dimensions.get('window');
    const ASPECT_RATIO = width / height;
    const LATITUDE_DELTA = 0.003;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

    const animatedHeading = useRef(new Animated.Value(heading)).current;

    const anim_marker_ref = useRef<MapMarker | null>(null);
    const anim_marker_coords_ref = useRef<AnimatedRegion>(new AnimatedRegion({
        latitude,
        longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    }))

    const animateTo = useCallback((toLatitude: number, toLongitude: number, heading: number) => {
        anim_marker_coords_ref.current.timing({
            latitude: toLatitude,
            longitude: toLongitude,
            duration: 2000,
            easing: Easing.linear,
            toValue: 0,
            useNativeDriver: false,
            latitudeDelta: 0,
            longitudeDelta: 0,
        }).start();

        Animated.timing(animatedHeading, {
            toValue: heading,
            duration: 900,
            useNativeDriver: true
        }).start();
    }, [animatedHeading])

    useEffect(() => {
        animateTo(latitude, longitude, heading)
    }, [latitude, longitude, heading, animateTo])

    return (
        <MarkerAnimated
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            coordinate={anim_marker_coords_ref.current} ref={(_ref) => anim_marker_ref.current = _ref}
            {...restProps}
            style={style}
        >
            <Animated.View
                style={{
                    ...(heading !== -1 && {
                        transform: [
                            {
                                rotate: animatedHeading.interpolate({
                                    inputRange: [0, 360],
                                    outputRange: ['0deg', '360deg'],
                                }),
                            },
                        ],
                    }),
                }}
            >
                {children}
            </Animated.View>
        </MarkerAnimated>
    )
}

export default memo(AnimatedMarker)