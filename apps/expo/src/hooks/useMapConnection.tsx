/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useCallback, useState } from 'react'
import * as ExpoLocation from 'expo-location';
import NetInfo from '@react-native-community/netinfo';

import { type MarkerData } from '~/constants/Markers';
import { useUser } from '~/context/UserContext';

// 🔓🔒🗡️💣🔫🔪📴📳📲💻🖥️
// 📸📷📺🎬🎥📽️💡🕯️🔎🔍🔦
// 📃🔖🏷️💰💵📨📦📪📭📬📫
// 📁📂💼📌📈📉⌛⏲️🕰️⏱️⏰
// 🎭🪄🔮🎲🔨⛏️⚒️🛠️🔧🪛🔩
// 🎶🎵🗑️🪠🧻🚽🛁🚿🎯🌀🌬️
// ⚡🔥❄️🌊💧💨💦💥💫🕳️♻️
// ❌🆘⛔⭕🔞📵🚭🚫☢️❗☣️

const useMapConnection = () => {
    const [taxis, setTaxis] = useState<MarkerData[]>([]);
    const [heading, setHeading] = useState<ExpoLocation.LocationHeadingObject>();
    const [position, setPosition] = useState<ExpoLocation.LocationObject>();

    const [streamingTo, _setStreamingTo] = useState<string | null>(null)

    const ws = useRef<WebSocket | null>(null);
    const positionSubscription = useRef<ExpoLocation.LocationSubscription | null>()
    const headingSubscription = useRef<ExpoLocation.LocationSubscription | null>()

    const { isConnected, isInternetReachable } = NetInfo.useNetInfo();

    const sendStringToServer = useCallback((message: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current?.send(message);
            return;
        } else {
            console.error("❌ sendStringToServer ==> !WebSocket.OPEN")
        }
    }, [ws])

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

    const asyncNewWebSocket = useCallback(async () => {
        const protocol = `map`;

        console.log("🌊 asyncNewWebSocket ==> websuckItToMeBBy ", protocol)
        const suckItToMeBBy = new WebSocket(`ws://192.168.1.103:6942/subscribe?id=6ec0bd7f-11c0-43da-975e-2a8ad9eba&lat=51.5073509&lon=-0.1277581999999997`, protocol);

        // TODO: stream depending the role
        suckItToMeBBy.addEventListener("open", (_event) => {
            console.log("🎯 asyncNewWebSocket ==> (Connection opened)");
        });

        suckItToMeBBy.addEventListener('close', (_event) => {
            console.log("❌ asyncNewWebSocket ==> (Connection closed)");
        });

        suckItToMeBBy.addEventListener('error', (_error) => {
            console.log("💥 asyncNewWebSocket ==> (Connection error)");
        });

        suckItToMeBBy.addEventListener('message', handleWebSocketMessage);

        return suckItToMeBBy;
    }, [])

    const trackPosition = useCallback(async () => {
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
                    if (streamingTo) {
                        sendStringToServer(`${newPosition.coords.latitude},${newPosition.coords.longitude}`)
                    }
                    setPosition(newPosition)
                } catch (error) {
                    console.error(error)
                }
            },

        )

        console.log("📌 trackPosition ==> (Setted position subscriptions)")
        positionSubscription.current = posSubscrition
    }, [sendStringToServer, setPosition, streamingTo, positionSubscription])

    const trackHeading = useCallback(async () => {
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
    }, [setHeading, headingSubscription])

    const resetConnection = useCallback(async () => {
        if (!isConnected || !isInternetReachable) {
            console.warn("💣 ==> No internet connection ==> ");
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
    }, [isConnected, isInternetReachable, ws, asyncNewWebSocket])

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
        taxis,
        ws,
        sendStringToServer,
        position,
        heading,
        handleWebSocketMessage,
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