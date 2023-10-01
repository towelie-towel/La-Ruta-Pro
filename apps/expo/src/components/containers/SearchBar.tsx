import React, { useEffect, useRef } from 'react'
import { Keyboard, useWindowDimensions } from 'react-native'
import { AntDesign } from '@expo/vector-icons';
// import { useColorScheme } from 'nativewind';
import { useAtomValue } from 'jotai';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import { View } from '../shared/Themed'
import type { GooglePlacesAutocompleteRef } from '../map/lib/GooglePlacesAutocomplete';
import { GooglePlacesAutocomplete, type GooglePlaceData, type GooglePlaceDetail } from '../map/lib/GooglePlacesAutocomplete';
import { PressBtn } from '../shared/PressBtn';
// import Colors from '~/constants/Colors';
import type { DrawerParamList } from '~/app';
import { userMarkersAtom } from '~/components/map/AddUserMarker';

/* 
https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&input=23%20y%2025&inputtype=textquery&locationbias=circle%3A2000%4023.1383300%2C-82.3641700&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE
https://maps.googleapis.com/maps/api/place/autocomplete/json?input=23%20y%2026&location=23.1383300%2C-82.3641700&radius=5000&types=geocode&language=es&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE
https://maps.googleapis.com/maps/api/place/textsearch/json?query=23%20y%2025&location=23.1383300%2C-82.3641700&radius=500&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE
*/

interface Params {
    navigation: DrawerNavigationProp<DrawerParamList, "Map">,
    onPlacePress: (data: GooglePlaceData, details: GooglePlaceDetail | null) => void | Promise<void>
    onFocus: () => void
    onBlur: () => void
    refFor?: (r: GooglePlacesAutocompleteRef | null) => void

}

const SearchBar = ({ navigation, onPlacePress, onFocus, onBlur, refFor }: Params) => {
    const { width } = useWindowDimensions()
    const userMarkers = useAtomValue(userMarkersAtom)
    // const { colorScheme } = useColorScheme()

    const ref = useRef<GooglePlacesAutocompleteRef | null>(null);
    const keyboardDidHide = () => ref.current?.blur();

    useEffect(() => {
        Keyboard.addListener("keyboardDidHide", keyboardDidHide);

        return () => Keyboard.removeAllListeners("keyboardDidHide");
    }, []);

    return (
        <View
            className='absolute top-12 bg-transparent overflow-hidden'
            style={{
                flexDirection: 'row',
                width: width * 0.9,
                left: (width - (width * 0.9)) / 2,
                backgroundColor: 'white',
                borderRadius: 30,
            }}
        >
            <PressBtn
                onPress={() => {
                    navigation.openDrawer();
                    Keyboard.dismiss()
                }}
                className={'w-12 h-12 pt-1 absolute left-2 -top-[2px] justify-center items-center rounded-full bg-transparent borderborder-orange-600border-dashed'}
            >
                <AntDesign
                    name={'menuunfold'}
                    size={30}
                    color={"black"}
                />
            </PressBtn>
            <GooglePlacesAutocomplete
                ref={instance => {
                    ref.current = instance;
                    refFor && refFor(instance);
                }}
                predefinedPlaces={userMarkers.map(marker => ({
                    description: marker.name,
                    geometry: {
                        location: {
                            lat: marker.coords.latitude,
                            lng: marker.coords.longitude
                        }
                    }
                }))}
                textInputProps={{
                    onFocus: onFocus,
                    onBlur: onBlur,
                }}
                placeholder='A dónde vamos?'
                onPress={(data, details,) => void onPlacePress(data, details)}
                styles={{
                    textInputContainer: {
                        paddingLeft: 60
                    }
                }}
                fetchDetails
                query={{
                    key: 'AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE',
                    language: 'es',
                    components: 'country:cu',
                    location: "23.11848,-82.38052",
                    radius: 100,
                }}
                /* nearbyPlacesAPI='GooglePlacesSearch' */
                currentLocation
                currentLocationLabel='My Location'

            />
        </View>
    )
}
export default SearchBar
