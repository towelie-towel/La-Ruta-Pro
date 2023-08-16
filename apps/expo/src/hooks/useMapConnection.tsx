/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useCallback } from 'react'
import * as ExpoLocation from 'expo-location';
import { useUser } from '@clerk/clerk-expo';
import { useAtom, atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo';

import { type MarkerData, initialMarkers } from '../constants/Markers';

export const markersAtom = atom<MarkerData[]>(initialMarkers)

const storedPositionHistory = createJSONStorage<ExpoLocation.LocationObject[] | undefined>(() => AsyncStorage)
const positionHistoryAtom = atomWithStorage<ExpoLocation.LocationObject[] | undefined>('historyPosition', undefined, storedPositionHistory)

export const positionAtom = atom<ExpoLocation.LocationObject | undefined>(undefined);
export const headingAtom = atom<ExpoLocation.LocationHeadingObject>({
    trueHeading: 0,
    magHeading: 0,
    accuracy: 0,
})

const storedProfileRole = createJSONStorage<'taxi' | 'client' | 'admin'>(() => AsyncStorage)
export const profileRoleAtom = atomWithStorage<'taxi' | 'client' | 'admin'>('userRole', "client", storedProfileRole)

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

    const { isConnected, isInternetReachable } = NetInfo.useNetInfo();
    const { user, isLoaded, isSignedIn } = useUser();

    const getLocation = () => {
        return ExpoLocation.getCurrentPositionAsync({});
    }

    const getHeading = () => {
        return ExpoLocation.getHeadingAsync();
    }

    const sendStringToServer = (message: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current?.send(message);
            return;
        } else {
            console.error("there is not websocket connnection open")
        }
    }

    const handleWebSocketMessage = useCallback((event: MessageEvent<any>) => {
        // event.data.startsWith("markers-") ? void setMarkers(JSON.parse(event.data.replace("markers-", ""))) : null;
        if (event.data instanceof ArrayBuffer) {
            // binary frame
            const view = new DataView(event.data);
            console.log(view.getInt32(0));
        } else {
            console.log(event.data);
        }
        // event.data.startsWith("taxisActives-") ? void setMarkers(JSON.parse(event.data.replace("markers-", ""))) : null;
    }, []);

    const asyncNewWebSocket = async () => {
        const role = profileRoleRef.current;
        const protocol = `map-${role}`;

        console.log("establishing web socket connection with protocol: ", protocol)
        const suckItToMeBBy = new WebSocket(`ws://192.168.1.103:6942/subscribe`, protocol);

        suckItToMeBBy.addEventListener("open", (event) => {
            console.log('Connection opened', event);
            // TODO: send the user id and role
            // TODO: stream depending the role
            void setProfileState("streaming")
        });

        suckItToMeBBy.addEventListener('close', (event) => {
            void setProfileState("inactive")
            console.log('Connection closed', event);
        });

        suckItToMeBBy.addEventListener('error', (error) => {
            void setProfileState("inactive")
            console.log('WebSocket error', error);
        });

        suckItToMeBBy.addEventListener('message', handleWebSocketMessage);

        return suckItToMeBBy;
    }

    const trackPosition = async () => {
        const { granted: permissionGranted } = await ExpoLocation.getForegroundPermissionsAsync()

        if (!permissionGranted) {
            console.log('No Location permission granted, requesting permission');
            await ExpoLocation.requestForegroundPermissionsAsync();
        }

        await ExpoLocation.enableNetworkProviderAsync()

        const subscrition = await ExpoLocation.watchPositionAsync(
            {
                accuracy: ExpoLocation.Accuracy.BestForNavigation,
                timeInterval: 2000,
            },
            (newPosition) => {
                console.log(newPosition)
                try {
                    if (profileStateRef.current === "streaming") {
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
                            console.error(error)
                        })

                } catch (error) {
                    console.error(error)
                }
            },

        )
        console.log("Setting positionSubscrition")
        positionSubscrition.current = subscrition
    }

    const resetConnection = async () => {
        try {
            if (!ws.current) {
                console.log("initializasing web socket")
                ws.current = await asyncNewWebSocket()
            } else if (ws.current.readyState === WebSocket.OPEN) {
                console.warn("a connection is already open")
            } else if (ws.current.readyState === WebSocket.CLOSED) {
                console.log("reseting connection")
            } else {
                console.error("(Cleaning ws) Unespected error - ws: ", JSON.stringify(ws.current, null, 2))
                // TODO: handle CONNECTING and CLOSING cases
            }

        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        console.log("useMapConnection/useEffect/")
        if (!positionSubscrition.current) {
            void trackPosition()
        }

        return () => {
            console.log("useMapConnection/useEffect/return")
            if (positionSubscrition.current) {
                console.log("removing positionSubscrition")
                positionSubscrition.current.remove()
                positionSubscrition.current = null
            }
        }
    }, []);

    useEffect(() => {
        console.log("useMapConnection/useEffect/isConnected/")
        if (!isConnected || !isInternetReachable) {
            console.error("No internet connection");
            void setProfileState("inactive")
            return;
        }
        void resetConnection()
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
        trackPosition
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