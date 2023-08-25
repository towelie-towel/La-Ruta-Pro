/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useCallback } from 'react'
import * as ExpoLocation from 'expo-location';
import { useAtom, atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo';

import { type MarkerData, initialMarkers } from '~/constants/Markers';

export const markersAtom = atom<MarkerData[]>(initialMarkers)

// 🔓🔒🗡️💣🔫🔪📴📳📲💻🖥️
// 📸📷📺🎬🎥📽️💡🕯️🔎🔍🔦
// 📃🔖🏷️💰💵📨📦📪📭📬📫
// 📁📂💼📌📈📉⌛⏲️🕰️⏱️⏰
// 🎭🪄🔮🎲🔨⛏️⚒️🛠️🔧🪛🔩
// 🎶🎵🗑️🪠🧻🚽🛁🚿🎯🌀🌬️
// ⚡🔥❄️🌊💧💨💦💥💫🕳️♻️
// ❌🆘⛔⭕🔞📵🚭🚫☢️❗☣️

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
    const profileStateRef = useRef(profileState);
    profileStateRef.current = profileState;

    const [streamingTo, _setStreamingTo] = useAtom(streamingToAtom)
    const streamingToRef = useRef(streamingTo);
    streamingToRef.current = streamingTo;

    const ws = useRef<WebSocket | null>(null);
    const positionSubscription = useRef<ExpoLocation.LocationSubscription | null>()
    const headingSubscription = useRef<ExpoLocation.LocationSubscription | null>()

    const { isConnected, isInternetReachable } = NetInfo.useNetInfo();

    const sendStringToServer = (message: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current?.send(message);
            return;
        } else {
            console.error("❌ sendStringToServer ==> !WebSocket.OPEN")
        }
    }

    const handleWebSocketMessage = useCallback((event: MessageEvent) => {
        // event.data.startsWith("taxis-") ? void setMarkers(JSON.parse(event.data.replace("markers-", ""))) : null;
        // event.data.startsWith("stream-") ? void setMarkers(JSON.parse(event.data.replace("markers-", ""))) : null;
        if (event.data instanceof ArrayBuffer) {
            const view = new DataView(event.data);
            console.log(view.getInt32(0));
        } else {
            console.log(event.data);
        }
    }, []);

    const asyncNewWebSocket = async () => {
        const role = profileRoleRef.current;
        const protocol = `map-${role}`;

        console.log("🌊 asyncNewWebSocket ==> websuckItToMeBBy ", protocol)
        const suckItToMeBBy = new WebSocket(`ws://192.168.1.103:6942/subscribe?id=6ec0bd7f-11c0-43da-975e-2a8ad9eba&lat=51.5073509&lon=-0.1277581999999997`, protocol);

        // TODO: stream depending the role
        suckItToMeBBy.addEventListener("open", (_event) => {
            console.log("🎯 asyncNewWebSocket ==> (Connection opened) state profileState===\"streaming\"");
            // TODO: handle admin case
            if (profileRoleRef.current === "taxi") {
                void setProfileState("active")
            } else if (profileRoleRef.current === "client" && streamingToRef.current !== null) {
                void setProfileState("streaming")
            }
        });

        suckItToMeBBy.addEventListener('close', (_event) => {
            console.log("❌ asyncNewWebSocket ==> (Connection closed) state profileState===\"inactive\"");
            void setProfileState("inactive")
        });

        suckItToMeBBy.addEventListener('error', (_error) => {
            console.log("💥 asyncNewWebSocket ==> (Connection error) state profileState===\"inactive\"");
            void setProfileState("inactive")
        });

        suckItToMeBBy.addEventListener('message', handleWebSocketMessage);

        return suckItToMeBBy;
    }

    const trackPosition = async () => {
        const { granted: permissionGranted } = await ExpoLocation.getForegroundPermissionsAsync()

        if (!permissionGranted) {
            console.log('🚫 trackPosition ==> permissionGranted = false (requesting permission)');
            await ExpoLocation.requestForegroundPermissionsAsync();
        }

        if (positionSubscription.current) {
            console.log("🌬️ trackPosition ==> positionSubscription = true ")
            return;
        }

        await ExpoLocation.enableNetworkProviderAsync()

        const posSubscrition = await ExpoLocation.watchPositionAsync(
            {
                accuracy: ExpoLocation.Accuracy.BestForNavigation,
                timeInterval: 2000,
            },
            (newPosition) => {
                try {
                    if (profileStateRef.current === "streaming") {
                        sendStringToServer(`${newPosition.coords.latitude},${newPosition.coords.longitude}`)
                    }
                    setPosition(newPosition)
                    void setPositionHistory(async (oldPositionHistory) => [...((await oldPositionHistory) ?? []), newPosition])
                } catch (error) {
                    console.error(error)
                }
            },

        )

        console.log("📌 trackPosition ==> (Setted position subscriptions)")
        positionSubscription.current = posSubscrition
    }

    const trackHeading = async () => {
        if (headingSubscription.current) {
            console.log("🌬️ trackHeading ==> headingSubscription = true ")
            return;
        }
        const headSubscrition = await ExpoLocation.watchHeadingAsync(
            (newHeading) => {
                setHeading(newHeading);
            },
        )

        console.log("📌 trackPosition ==> (Setted heading subscriptions)")
        headingSubscription.current = headSubscrition
    }

    const resetConnection = async () => {
        if (!isConnected || !isInternetReachable) {
            console.warn("💣 ==> No internet connection ==> profileState===\"inactive\"");
            void setProfileState("inactive")
            return;
        }

        try {
            if (!ws.current) {
                console.log("🎯 resetConnection ==> initializasing web socket")
                ws.current = await asyncNewWebSocket()
            } else if (ws.current.readyState === WebSocket.OPEN) {
                console.warn("🌬️ resetConnection ==> a connection is already open")
            } else if (ws.current.readyState === WebSocket.CLOSED) {
                console.log("🚿 resetConnection ==> reseting connection")
                ws.current = await asyncNewWebSocket()
            } else {
                console.error("🪠 resetConnection ==> ws.current.readyState = \"CONNECTING\" || \"CLOSING\" ", JSON.stringify(ws.current, null, 2))
                // TODO: handle CONNECTING and CLOSING cases
            }

        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (!positionSubscription.current) {
            console.log("📭 <== useEffect ==> hooks/useMapConnection.tsx ==> [] (📌trackPosition) ")
            void trackPosition()
        }
        if (!headingSubscription.current) {
            console.log("📭 <== useEffect ==> hooks/useMapConnection.tsx ==> [] (📌trackHeading) ")
            void trackHeading()
        }

        return () => {
            console.log("📪 <== useEffect-return ==> hooks/useMapConnection.tsx ==> [] (🔪position/heading subscriptions)")
            if (positionSubscription.current) {
                positionSubscription.current.remove()
                positionSubscription.current = null
            }
            if (headingSubscription.current) {
                headingSubscription.current.remove()
                headingSubscription.current = null
            }
        }
    }, []);

    useEffect(() => {
        console.log("📭 <== useEffect ==> hooks/useMapConnection.tsx ==> [isConnected] (📈resetConnection)")
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