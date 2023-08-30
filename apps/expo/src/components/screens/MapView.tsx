import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    StatusBar,
    Dimensions,
    LayoutAnimation,
    Keyboard,
} from "react-native";
import MapView, { type LatLng, PROVIDER_GOOGLE, Polyline, Circle } from 'react-native-maps';
import { type BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useAtom, } from 'jotai';
import { useKeepAwake } from 'expo-keep-awake';
import { useColorScheme } from 'nativewind';
import NetInfo from '@react-native-community/netinfo';
import type {
    DrawerNavigationProp
} from '@react-navigation/drawer';
import { Accuracy, getCurrentPositionAsync } from 'expo-location';

import { View } from '~/components/shared/Themed';
import { NightMap } from '~/constants/NightMap';
import UserMarker from '~/components/map/UserMarker';
import { type UserMarkerIconType, userMarkersAtom } from '~/components/map/SelectMarkerIcon';
import UserMarkerIcon from '~/components/map/UserMarkerIcon';
import SelectMarkerIcon from '~/components/map/SelectMarkerIcon';
import AnimatedRouteMarker from '~/components/map/AnimatedRouteMarker';
import BottomSheet from '~/components/containers/BottomSheeetModal';
import NavigationMenu from '~/components/containers/NavigationMenu';
import SearchBar from '../map/SearchBar';
import type { DrawerParamList } from '~/app';
import { polylineDecode } from '~/utils/helpers';

/* 
    
    wtf AIzaSyB-7B_Jh6ZXK9jWiY-VjXbvxhx-4QeXbJU

    wtf AIzaSyBVW-J8k9X8Y0gL5CK2Lhwz-w7Q2K5Yjn4

*/

const MapViewComponent = ({ navigation }: { navigation: DrawerNavigationProp<DrawerParamList, "Map"> }) => {
    useKeepAwake();
    console.log("Map re-rendered")
    const { colorScheme } = useColorScheme();
    const { width, height } = Dimensions.get('window');
    const { isConnected, isInternetReachable } = NetInfo.useNetInfo();

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMenuVisible, setIsMenuVisible] = useState(true)
    const navigationAnimValue = useRef(new Animated.Value(0)).current;

    const [isAddingMarker, setIsAddingMarker] = useState(false);

    const mapViewRef = useRef<MapView>(null);
    // const userMarkerRef = useRef<MapMarker>(null);
    const [userMarkers, setUserMarkers] = useAtom(userMarkersAtom)

    const [userSelected, setUserSelected] = useState(true);
    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [activeRoute, setActiveRoute] = useState<LatLng[] | null>(null)

    /* useEffect(() => {
        if (selectedMarkerIndex !== null && mapViewRef.current) {
            const selectedMarker = markers[selectedMarkerIndex];
            if (selectedMarker) {
                mapViewRef.current.animateToRegion({
                    longitude: selectedMarker.coordinate.longitude,
                    latitude: selectedMarker.coordinate.latitude,
                    latitudeDelta: 0.009,
                    longitudeDelta: 0.009,
                });
            }
        }

    }, [markers, selectedMarkerIndex]); */

    /* const animateToRegion = useCallback((region: Region) => {
        mapViewRef.current && mapViewRef.current.animateToRegion(region)
    }, []) */

    /* const handlePresentModal = useCallback(() => {
        bottomSheetModalRef.current?.present();
        setIsModalVisible(true);
    }, []) */

    /* const handleMarkerPress = useCallback((index: number) => {
        setUserSelected(false);
        setSelectedMarkerIndex(index);

        handlePresentModal();

        const marker = markers[index];

        if (marker) {
            animateToRegion({
                latitude: marker.coordinate.latitude,
                longitude: marker.coordinate.longitude,
                longitudeDelta: 0.0033333,
                latitudeDelta: 0.0033333,
            });
        }
    }, [animateToRegion, handlePresentModal, markers]); */

    const toggleNavMenu = useCallback(() => {
        const toValue = isMenuOpen ? 0 : 1
        setIsMenuOpen(!isMenuOpen)
        Keyboard.dismiss()

        Animated.spring(navigationAnimValue, {
            toValue,
            friction: 5,
            useNativeDriver: true,
        }).start()

    }, [isMenuOpen, navigationAnimValue])

    // Add marker functionality
    const addMarkerHandler = useCallback(() => {
        LayoutAnimation.linear()
        setIsMenuVisible(false)
        setIsAddingMarker(!isAddingMarker)
        if (isMenuOpen) {
            toggleNavMenu()
        }
    }, [isAddingMarker, isMenuOpen, toggleNavMenu])

    const confirmAddMarkerIcon = useCallback((newMarker: UserMarkerIconType) => {
        LayoutAnimation.linear()
        setIsAddingMarker(false)

        const getPoint = async () => {
            const pointCoords = await mapViewRef.current?.coordinateForPoint({
                x: (width / 2),
                y: (height / 2),
            })

            if (!pointCoords) {
                throw new Error('Trouble colecting the coordinates')
            }

            await setUserMarkers([...userMarkers, {
                // Fix this later, add a new method for creating ids
                id: Date.now().toString(),
                coords: {
                    latitude: pointCoords.latitude,
                    longitude: pointCoords.longitude,
                },
                icon: newMarker.icon,
                name: newMarker.name
            }])
        }

        void getPoint()
        setIsMenuVisible(true)
    }, [height, setUserMarkers, userMarkers, width])

    const openUserProfileHandler = useCallback(() => {
        bottomSheetModalRef.current?.present();
        setUserSelected(true)
        setIsModalVisible(true);
        setSelectedMarkerIndex(null);
        if (isMenuOpen) {
            toggleNavMenu()
        }
    }, [isMenuOpen, toggleNavMenu])

    const taxiBtnHandler = useCallback(async () => {
        console.log({ isConnected, isInternetReachable })
    }, [isConnected, isInternetReachable])

    return (
        <BottomSheetModalProvider>

            <View className={"bg-transparent w-full h-full relative"}>


                <MapView
                    onTouchMove={() => {
                        // _fadeOutNav()
                    }}
                    onTouchEnd={() => {
                        // _fadeInNav()
                    }}
                    onPress={() => {
                        if (isMenuOpen) {
                            toggleNavMenu()
                        }
                    }}
                    className={"w-full h-full"}
                    initialRegion={{
                        latitude: 23.118644,
                        longitude: -82.3806211,
                        latitudeDelta: 0.0322,
                        longitudeDelta: 0.0221,
                    }}
                    /* showsMyLocationButton
                    showsUserLocation */
                    showsCompass={false}
                    toolbarEnabled={false}
                    ref={mapViewRef}
                    provider={PROVIDER_GOOGLE}
                    customMapStyle={colorScheme === 'dark' ? NightMap : undefined}
                >

                    {/* {markers.map((marker: MarkerData, index: number) => {
                        return (
                                <React.Fragment
                                    key={index}
                                >

                                    <CarMarker
                                        onPress={() => handleMarkerPress(index)}
                                        coordinate={marker.coordinate}
                                        description=''
                                        title=''
                                        imageURL=''
                                    />
                                </React.Fragment>
                        )
                    })} */}

                    {
                        userMarkers.map((userMarker, index) => {
                            return (
                                <React.Fragment
                                    key={index}
                                >
                                    <UserMarkerIcon
                                        {...userMarker}
                                        colorScheme={colorScheme}
                                    />
                                </React.Fragment>
                            )
                        })
                    }

                    <Polyline
                        coordinates={activeRoute ?? []}
                        strokeColor="white"
                        strokeWidth={5}
                    />

                    <Circle center={{
                        longitude: -82.38052,
                        latitude: 23.11848
                    }} radius={200} />

                    <AnimatedRouteMarker />

                    <UserMarker
                        onPress={openUserProfileHandler}
                        description=''
                        title=''
                        userId=''
                    />

                </MapView>


                <SearchBar navigation={navigation} onPlacePress={async (data, details) => {
                    // just use the directions api
                    const apiKey = 'AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE';
                    let url = 'https://maps.googleapis.com/maps/api/directions/json';


                    if (!details) {
                        return
                    }

                    const position = await getCurrentPositionAsync({
                        accuracy: Accuracy.Highest,
                    })

                    url += `?destination=place_id:${data.place_id}`
                    url += `&origin=${position.coords.latitude}%2C${position.coords.longitude}`
                    url += `&key=${apiKey}`
                    url += `&language=es`

                    try {
                        const res = await fetch(url)
                        const json = await res.json()
                        setActiveRoute((polylineDecode(json.routes[0].overview_polyline.points) ?? []).map(([lat, lng]) => ({ latitude: lat, longitude: lng })))
                        console.log(JSON.stringify({ activeRoute }, null, 2))
                    } catch (error) {
                        if (error instanceof Error) {
                            console.error(error.message)
                        }
                    }

                }} />

                {
                    isAddingMarker &&
                    <SelectMarkerIcon
                        onConfirmFn={confirmAddMarkerIcon}
                    />
                }

                {
                    isMenuVisible &&
                    <NavigationMenu
                        addMarkerHandler={addMarkerHandler}
                        navigationAnimValue={navigationAnimValue}
                        openUserProfileHandler={openUserProfileHandler}
                        taxiBtnHandler={taxiBtnHandler}
                        toggleNavMenu={toggleNavMenu}
                    />
                }

                <BottomSheet
                    bottomSheetModalRef={bottomSheetModalRef}
                    userSelected={userSelected}
                    selectedMarkerIndex={selectedMarkerIndex}
                    isVisible={isModalVisible}
                    setIsVisible={setIsModalVisible}
                />


            </View>

            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

        </BottomSheetModalProvider>
    );
};

export default MapViewComponent
