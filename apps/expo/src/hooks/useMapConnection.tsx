/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useCallback } from 'react'
import * as Location from 'expo-location';
import { useUser } from '@clerk/clerk-expo';
import { useAtom, atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo';

import { type MarkerData, initialMarkers } from '../constants/Markers';

export const markersAtom = atom<MarkerData[]>(initialMarkers)

const storedHistoryLocation = createJSONStorage<Location.LocationObject[] | undefined>(() => AsyncStorage)
const historyLocationAtom = atomWithStorage<Location.LocationObject[] | undefined>('historyLocation', undefined, storedHistoryLocation)

const locationAtom = atom<Location.LocationObject | undefined>(undefined);
const headingAtom = atom<Location.LocationHeadingObject>({
    trueHeading: 0,
    magHeading: 0,
    accuracy: 0,
})

const storedProfileRole = createJSONStorage<'taxi' | 'client'>(() => AsyncStorage)
export const profileRoleAtom = atomWithStorage<'taxi' | 'client'>('userRole', "client", storedProfileRole)

const storedProfileState = createJSONStorage<'active' | 'streaming' | 'inactive'>(() => AsyncStorage)
export const profileStateAtom = atomWithStorage<'active' | 'streaming' | 'inactive'>('profileState', "inactive", storedProfileState)

const storedStreamingTo = createJSONStorage<string | null>(() => AsyncStorage)
export const streamingToAtom = atomWithStorage<string | null>('streamingTo', null, storedStreamingTo)

const IS_WEB_SOCKET_CONNECTION = false

const useMapConnection = () => {
    const [markers, setMarkers] = useAtom(markersAtom);
    const [historyLocation, setHistoryLocation] = useAtom(historyLocationAtom);

    const [heading, setHeading] = useAtom(headingAtom);

    const [location, setLocation] = useAtom(locationAtom);
    const locationRef = useRef(location);
    locationRef.current = location;

    const [profileRole, _setProfileRole] = useAtom(profileRoleAtom)
    const profileRoleRef = useRef(profileRole);
    profileRoleRef.current = profileRole;

    const [profileState, _setProfileState] = useAtom(profileStateAtom)
    const profileStateRef = useRef(profileState);
    profileStateRef.current = profileState;

    const [streamingTo, _setStreamingTo] = useAtom(streamingToAtom)
    const streamingToRef = useRef(streamingTo);
    streamingToRef.current = streamingTo;

    const ws = useRef<WebSocket | null>(null);

    const { isConnected, isInternetReachable } = NetInfo.useNetInfo();
    const { user, isLoaded, isSignedIn } = useUser();

    const sendMessageToServer = (message: string) => {
        try {
            if (!isConnected || !isInternetReachable) {
                console.error("No internet connection");
                return;
            }

            if (ws.current?.readyState === WebSocket.CONNECTING) {
                setTimeout(() => {
                    sendMessageToServer(message)
                }, 3000);
                return;
            }

            if (ws.current?.readyState === WebSocket.CLOSING) {
                console.log("WebSocket is closing");
                return;
            }

            if (ws.current?.readyState === WebSocket.CLOSED) {
                console.log("WebSocket is closed");
                return;
            }

            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current?.send(message);
                return;
            }

        } catch (error) {
            console.error(error)
        }
    }

    const getLocation = () => {
        return Location.getCurrentPositionAsync({});
    }

    const getHeading = () => {
        return Location.getHeadingAsync();
    }

    const handleWebSocketMessage = useCallback((event: MessageEvent<string>) => {

        // event.data.startsWith("markers-") ? void setMarkers(JSON.parse(event.data.replace("markers-", ""))) : null;

        console.log(event.data)

        // event.data.startsWith("taxisActives-") ? void setMarkers(JSON.parse(event.data.replace("markers-", ""))) : null;

    }, []);

    useEffect(() => {

        const asyncWebSocket = async () => {
            if (!isConnected || !isInternetReachable) {
                console.error("No internet connection");
                return;
            }

            let protocol = (await AsyncStorage.getItem('userRole'))?.includes("client") ? 'map-client' : 'map-worker';
            if (isSignedIn) protocol += "-" + user.id

            ws.current = new WebSocket("ws://192.168.135.191:3333", protocol);

            ws.current.addEventListener("open", (event) => {
                console.log('%c Connection opened', 'background: orange; color: black;', event);
            });

            ws.current.addEventListener('message', handleWebSocketMessage);

            ws.current.addEventListener('close', (event) => {
                console.log('%c Connection closed', 'background: orange; color: black;', event);
            });

            ws.current.addEventListener('error', (error) => {
                console.log('%c WebSocket error', 'background: red; color: black;', error);
            });

        }

        if (IS_WEB_SOCKET_CONNECTION)
            void asyncWebSocket()

        let PositionSubscrition: Location.LocationSubscription | undefined = undefined;

        const trackPosition = async () => {
            const { status } = await Location.getForegroundPermissionsAsync()
            await Location.enableNetworkProviderAsync()

            if (status.includes('granted')) {
                console.error('Permission to access location was denied');
                return;
            }

            PositionSubscrition = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 3000,
                },
                (newLocation) => {
                    try {
                        void setHistoryLocation(async (oldHistoryLocation) => [...((await oldHistoryLocation) ?? []), newLocation])

                        getHeading()
                            .then((heading) => {
                                setHeading(heading);
                                setLocation({ ...newLocation, coords: { ...newLocation.coords, heading: heading.trueHeading } })
                            })
                            .catch((error) => {
                                console.log(error)
                            })

                    } catch (error) {
                        console.error(error)
                    }
                },

            )

            const firstLocation = await getLocation()
            await setHistoryLocation([...(historyLocation || []), firstLocation])
            setLocation(firstLocation);

        }

        if (IS_WEB_SOCKET_CONNECTION)
            void trackPosition()

        let positionStreaming: NodeJS.Timer;

        const streamPosition = () => {


            if (isSignedIn && isLoaded) {

                if (profileState === 'active' && profileRole === 'taxi') {

                    positionStreaming = setInterval(() => {

                        sendMessageToServer(`taxiDriver-` + JSON.stringify({
                            ...locationRef.current, coords: {
                                heading: heading.trueHeading,
                                ...locationRef.current?.coords
                            },
                            userId: user.id,
                            profileRole: profileRoleRef.current,
                            isConnected: isConnected,
                        }))

                    }, 3000)

                } else if (profileState === 'streaming') {

                    if (profileRole === 'client') {

                        positionStreaming = setInterval(() => {

                            sendMessageToServer(`clientTo-` + JSON.stringify({
                                ...locationRef.current, coords: {
                                    heading: heading.trueHeading,
                                    ...locationRef.current?.coords
                                },
                                userId: user.id,
                                profileRole: profileRoleRef.current,
                                isConnected: isConnected,
                                streamingTo: streamingToRef,
                            }))

                        }, 3000)

                    } else if (profileRole === 'taxi') {

                        positionStreaming = setInterval(() => {

                            sendMessageToServer(`taxiDriverTo-` + JSON.stringify({
                                ...locationRef.current, coords: {
                                    heading: heading.trueHeading,
                                    ...locationRef.current?.coords
                                },
                                userId: user.id,
                                profileRole: profileRoleRef.current,
                                isConnected: isConnected,
                            }))

                        }, 3000)

                    }

                }


            }

        }
        if (IS_WEB_SOCKET_CONNECTION)
            void streamPosition

        return () => {
            if (IS_WEB_SOCKET_CONNECTION) {
                positionStreaming && clearInterval(positionStreaming)
                if (ws.current?.readyState === WebSocket.OPEN) {
                    ws.current?.close();
                    ws.current?.removeEventListener("message", handleWebSocketMessage);
                }
                PositionSubscrition && PositionSubscrition.remove()
            }
        };
    }, [isSignedIn, isConnected, profileRole, profileState]);

    return {
        markers,
        setMarkers,
        ws,
        sendMessageToServer,
        location,
        heading,
        handleWebSocketMessage,
        historyLocation,
    }
}

export default useMapConnection


/* CREATE TABLE Location (
    id INT PRIMARY KEY,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    accuracy FLOAT,
    altitude FLOAT,
    altitudeAccuracy FLOAT,
    heading FLOAT,
    speed FLOAT
);

CREATE TABLE Marker (
    id INT PRIMARY KEY,
    location_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    imageURL TEXT NOT NULL,
    FOREIGN KEY (location_id) REFERENCES Location(id)
);

CREATE TABLE Profile (
    id INT PRIMARY KEY,
    userId VARCHAR(255),
    marker_id INT,
    phone_number VARCHAR(255),
    email VARCHAR(255),
    userName VARCHAR(255),
    alias VARCHAR(255),
    profile_identifier VARCHAR(255) UNIQUE NOT NULL,
    userRole VARCHAR(255) DEFAULT 'client',
    licenceNo VARCHAR(255),
    taxi_category VARCHAR(255),
    taxi_start FLOAT(2) CHECK (taxi_start >= 1 AND taxi_start <= 5),
    active BOOLEAN DEFAULT false,
    last_location_id INT NOT NULL,
    FOREIGN KEY (last_location_id) REFERENCES Location(id),
    FOREIGN KEY (marker_id) REFERENCES Marker(id)
); */