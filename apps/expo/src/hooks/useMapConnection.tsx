/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useCallback } from 'react'
import * as ExpoLocation from 'expo-location';
import { useUser } from '@clerk/clerk-expo';
import { useAtom, atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo';

import { type MarkerData, initialMarkers } from '../constants/Markers';
import { stringToBuffer } from '~/utils/helpers';

export const markersAtom = atom<MarkerData[]>(initialMarkers)

const storedPositionHistory = createJSONStorage<ExpoLocation.LocationObject[] | undefined>(() => AsyncStorage)
const positionHistoryAtom = atomWithStorage<ExpoLocation.LocationObject[] | undefined>('historyPosition', undefined, storedPositionHistory)

export const positionAtom = atom<ExpoLocation.LocationObject | undefined>(undefined);
export const headingAtom = atom<ExpoLocation.LocationHeadingObject>({
    trueHeading: 0,
    magHeading: 0,
    accuracy: 0,
})

const storedProfileRole = createJSONStorage<'taxi' | 'client'>(() => AsyncStorage)
export const profileRoleAtom = atomWithStorage<'taxi' | 'client'>('userRole', "client", storedProfileRole)

const storedProfileState = createJSONStorage<'active' | 'streaming' | 'inactive'>(() => AsyncStorage)
export const profileStateAtom = atomWithStorage<'active' | 'streaming' | 'inactive'>('profileState', "inactive", storedProfileState)

// const storedIsRecievingTaxis = createJSONStorage<boolean>(() => AsyncStorage)
// export const isRecievingTaxisAtom = atomWithStorage<boolean>('isRecievingTaxis', false, storedIsRecievingTaxis)

const storedStreamingTo = createJSONStorage<string | null>(() => AsyncStorage)
export const streamingToAtom = atomWithStorage<string | null>('streamingTo', null, storedStreamingTo)

const useMapConnection = () => {
    const [markers, setMarkers] = useAtom(markersAtom);
    const [positionHistory, setPositionHistory] = useAtom(positionHistoryAtom);

    const [heading, setHeading] = useAtom(headingAtom);

    const [position, setPosition] = useAtom(positionAtom);
    const positionRef = useRef(position);
    positionRef.current = position;

    const [profileRole, _setProfileRole] = useAtom(profileRoleAtom)
    const profileRoleRef = useRef(profileRole);
    profileRoleRef.current = profileRole;

    const [profileState, setProfileState] = useAtom(profileStateAtom)
    //const [isRecievingTaxis, setIsRecievingTaxis] = useAtom(isRecievingTaxisAtom)
    const profileStateRef = useRef(profileState);
    profileStateRef.current = profileState;

    const [streamingTo, _setStreamingTo] = useAtom(streamingToAtom)
    const streamingToRef = useRef(streamingTo);
    streamingToRef.current = streamingTo;

    const ws = useRef<WebSocket | null>(null);
    const positionSubscrition = useRef<ExpoLocation.LocationSubscription | null>()
    const positionStreaming = useRef<NodeJS.Timer | null>()

    const { isConnected, isInternetReachable } = NetInfo.useNetInfo();
    const { user, isLoaded, isSignedIn } = useUser();

    const resetConnection = async () => {
        try {

            if (!isConnected || !isInternetReachable) {
                throw new Error("No internet connection");
            }

            if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
                ws.current = await asyncNewWebSocket()
            } else {
                console.log("a web socket is already stored", JSON.stringify(ws.current, null, 2))
            }

        } catch (error) {
            console.error(error)
        }
    }

    const reseTracking = () => {
        if (!isConnected || !isInternetReachable) {
            throw new Error("No internet connection");
        }

        if (!positionSubscrition.current) {
            trackPosition().then((suscription) => {
                positionSubscrition.current = suscription
            }).catch((error) => {
                console.log(error)
            })
        }
    }

    // i dont like this
    const throwSocketError = () => {
        if (!isConnected || !isInternetReachable) {
            throw new Error("No internet connection");
        }

        if (ws.current?.readyState === WebSocket.CONNECTING) {
            throw new Error("WS is connecting");
        }

        if (ws.current?.readyState === WebSocket.CLOSING) {
            throw new Error("WS is closing");
        }

        if (ws.current?.readyState === WebSocket.CLOSED) {
            throw new Error("WS is closed");
        }
    }

    const sendStringToServer = (message: string) => {
        const messageBuffer = stringToBuffer(message)
        try {

            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current?.send(messageBuffer);
                return;
            } else {
                // Why would i do this
                throwSocketError()
            }

        } catch (error) {
            console.error(error)
        }
    }

    const getLocation = () => {
        return ExpoLocation.getCurrentPositionAsync({});
    }

    const getHeading = () => {
        return ExpoLocation.getHeadingAsync();
    }

    const handleWebSocketMessage = useCallback((event: MessageEvent<string>) => {
        // event.data.startsWith("markers-") ? void setMarkers(JSON.parse(event.data.replace("markers-", ""))) : null;
        console.log(event.data)
        // event.data.startsWith("taxisActives-") ? void setMarkers(JSON.parse(event.data.replace("markers-", ""))) : null;
    }, []);

    const asyncNewWebSocket = async () => {
        let protocol = (await AsyncStorage.getItem('userRole'))?.includes("client") ? 'map-client' : 'map-taxi';
        if (isSignedIn) protocol += "-" + user.id

        console.log("establishing web socket connection")
        const suckItToMeBBy = new WebSocket(`ws://192.168.1.103:8658/subscribe`, protocol);

        suckItToMeBBy.addEventListener("open", (event) => {
            console.log('%c Connection opened', 'background: orange; color: black;', event);
            void setProfileState("streaming")
        });

        suckItToMeBBy.addEventListener('close', (event) => {
            void setProfileState("inactive")
            positionStreaming.current && clearInterval(positionStreaming.current)
            console.log('%c Connection closed', 'background: orange; color: black;', event);
            console.log("a web socket is already stored", JSON.stringify(ws.current, null, 2))
        });

        suckItToMeBBy.addEventListener('error', (error) => {
            void setProfileState("inactive")
            positionStreaming.current && clearInterval(positionStreaming.current)
            console.log('%c WebSocket error', 'background: red; color: black;', error);
        });

        suckItToMeBBy.addEventListener('message', handleWebSocketMessage);

        return suckItToMeBBy;
    }

    const trackPosition = async () => {
        const { granted } = await ExpoLocation.getForegroundPermissionsAsync()

        if (!granted) {
            console.error('Permission to access location was denied');
            return;
        }

        await ExpoLocation.enableNetworkProviderAsync()

        const positionSubscrition = await ExpoLocation.watchPositionAsync(
            {
                accuracy: ExpoLocation.Accuracy.BestForNavigation,
                timeInterval: 2000,
            },
            (newPosition) => {
                try {
                    if (profileState === "streaming") {
                        console.log("streaming")
                        const stringMessage = `${newPosition.coords.latitude},${newPosition.coords.longitude}`
                        sendStringToServer(stringMessage)
                    }
                    getHeading()
                        .then((heading) => {
                            setHeading(heading);
                            setPosition({ ...newPosition, coords: { ...newPosition.coords, heading: heading.trueHeading } })
                            void setPositionHistory(async (oldPositionHistory) => [...((await oldPositionHistory) ?? []), newPosition])
                        })
                        .catch((error) => {
                            console.log(error)
                        })

                } catch (error) {
                    console.error(error)
                }
            },

        )
        return positionSubscrition
    }

    const initWebSocket = async () => {
        if (!ws.current) {
            ws.current = await asyncNewWebSocket()
        } else {
            console.log("a web socket is already stored")
        }
    }

    useEffect(() => {
        console.log("useEffect-useMapConnection")
        if (
            isConnected
            && isInternetReachable
        ) {
            if (ws.current?.readyState === ws.current?.CLOSED) {
                void initWebSocket()
            }

            if (!positionSubscrition.current) {
                trackPosition().then((suscription) => {
                    positionSubscrition.current = suscription
                }).catch((error) => {
                    console.log(error)
                })
            }
        };
        return () => {
            console.log("useEffect-useMapConnection-return")
            if (positionStreaming.current) {
                clearInterval(positionStreaming.current)
                positionStreaming.current = null
            }
            if (positionSubscrition.current) {
                positionSubscrition.current.remove()
                positionSubscrition.current = null
            }

        }
    }, [isConnected]);

    return {
        markers,
        setMarkers,
        ws,
        sendStringToServer,
        location,
        heading,
        handleWebSocketMessage,
        positionHistory,
        resetConnection,
        reseTracking
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