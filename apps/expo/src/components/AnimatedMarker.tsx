import React, { useRef, useCallback, useEffect, memo } from 'react'
import { Dimensions, Easing } from 'react-native';
import { AnimatedRegion, Marker, type MapMarker } from 'react-native-maps';

type AnimatedMarkerParams = {
    longitude: number
    latitude: number
}

const AnimatedMarker: React.FC<AnimatedMarkerParams> = ({ latitude, longitude }) => {

    const { width, height } = Dimensions.get('window');
    const ASPECT_RATIO = width / height;
    const LATITUDE_DELTA = 0.003;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

    const anim_marker_ref = useRef<MapMarker | null>(null);
    const anim_marker_coords_ref = useRef<AnimatedRegion>(new AnimatedRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    }))


    const animateTo = useCallback((toLatitude: number, toLongitude: number) => {
        anim_marker_coords_ref.current.timing({
            latitude: toLatitude,
            longitude: toLongitude,
            duration: 2000,
            easing: Easing.linear,
            toValue: 0,
            useNativeDriver: false,
            latitudeDelta: 0,
            longitudeDelta: 0
        }).start();
    }, [anim_marker_coords_ref])

    useEffect(() => {
        animateTo(latitude, longitude)
    }, [latitude, longitude, animateTo])

    return (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <Marker.Animated coordinate={anim_marker_coords_ref.current} ref={(_ref) => anim_marker_ref.current = _ref} />
    )
}

export default memo(AnimatedMarker)