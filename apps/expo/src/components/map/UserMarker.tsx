import React, { memo } from 'react'
import { Circle, type MapMarkerProps } from 'react-native-maps'
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind'

import AnimatedMarker from '~/components/map/AnimatedMarker'
import Colors from '~/constants/Colors';
import { useWSConnection } from '~/context/WSContext';

const UserMarker = ({ description, title, userId, ...props }: { description: string, title: string, userId: string } & Omit<MapMarkerProps, "coordinate">) => {
    const { colorScheme } = useColorScheme();
    const { position, heading } = useWSConnection();

    if (!position || !heading) {
        return
    }

    return (
        <>
            <AnimatedMarker
                {...props}
                heading={heading.trueHeading}
                headingAnimated={false}
                latitude={position.coords.latitude}
                longitude={position.coords.longitude}
                anchor={{ x: 0.5, y: 0.6 }}
                flat
            >
                <MaterialIcons
                    name="location-on"
                    size={24}
                    color={Colors[colorScheme ?? 'light'].text}
                />
            </AnimatedMarker>
            <Circle
                center={{
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }}
                radius={position.coords.accuracy || 0}
                strokeColor="rgba(0, 150, 255, 0.5)"
                fillColor="rgba(0, 150, 255, 0.5)"
            />
        </>
    )
}

export default memo(UserMarker);