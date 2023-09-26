import React, { memo } from 'react'
import { type MapMarkerProps } from 'react-native-maps'
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind'

import AnimatedMarker from '~/components/map/AnimatedMarker'
import Colors from '~/constants/Colors';
import { useWSConnection } from '~/context/WSContext';

interface props extends Omit<MapMarkerProps,"coordinate"> {
    description: string, 
    title: string, 
    userId: string, 
    onSelectTaxi: (taxiId: string) => void 
} 

const TaxisMarkers = ({ description, title, userId, onSelectTaxi, ...props }: props) => {
    const { colorScheme } = useColorScheme();
    const { wsTaxis } = useWSConnection();

    return (
        <>
            {wsTaxis?.map(taxi => {

                return (
                    <AnimatedMarker
                        key={taxi.userId}
                        {...props}
                        onPress={() => {
                            onSelectTaxi(taxi.userId);
                        }}
                        heading={0}
                        headingAnimated={false}
                        latitude={taxi.latitude}
                        longitude={taxi.longitude}
                        anchor={{ x: 0.5, y: 0.6 }}
                        flat
                    >
                        <MaterialIcons
                            name="location-on"
                            size={24}
                            color={Colors[colorScheme ?? 'light'].text}
                        />
                    </AnimatedMarker>
                )
            }
            )}
        </>
    )
}

export default memo(TaxisMarkers);