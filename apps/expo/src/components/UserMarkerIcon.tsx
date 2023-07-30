import React, { memo } from 'react'
import { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { type UserMarkerIconType } from './SelectMarkerIcon';
import Colors from '../styles/Colors';

const UserMarkerIcon: React.FC<UserMarkerIconType & { colorScheme: 'light' | 'dark' }> = ({ coords, icon, id, name, description, colorScheme }) => {
    console.log('Rendering UserMarkerIcon ' + id)
    return (
        <Marker
            coordinate={coords}
        >
            <MaterialCommunityIcons
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                name={icon.name}
                size={28}
                color={Colors[colorScheme ?? 'light'].text}
            />
        </Marker>
    )
}

export default memo(UserMarkerIcon)