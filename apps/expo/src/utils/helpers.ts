export const getDirections = async (startLoc: string, destinationLoc: string) => {
    try {
        const resp = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY || ""}`
        );
        const respJson = await resp.json();
        const decodedCoords = polylineDecode(respJson.routes[0].overview_polyline.points).map((point, index) => ({ latitude: point[0] as number, longitude: point[1] as number }));
        return decodedCoords;
    } catch (error) {
        console.error(error);
    }
};

export const duplicateCoords = (coords: {
    latitude: number;
    longitude: number;
}[]) => {

    const newCoords: {
        latitude: number;
        longitude: number;
    }[] = [];

    for (let i = 0; i < coords.length - 1; i++) {
        newCoords.push({ latitude: Number(coords[i]?.latitude), longitude: Number(coords[i]?.longitude) });
        newCoords.push({ latitude: ((Number(coords[i]?.latitude)) + (Number(coords[i + 1]?.latitude))) / 2, longitude: (Number(coords[i]?.longitude) + Number(coords[i + 1]?.longitude)) / 2 });
    }
    return newCoords;

}

export function polylineDecode(str: string, precision?: number) {
    let index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision !== undefined ? precision : 5);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 1;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result += (byte & 0x1f) * shift;
            shift *= 32;
        } while (byte >= 0x20);

        latitude_change = (result & 1) ? ((-result - 1) / 2) : (result / 2);

        shift = 1;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result += (byte & 0x1f) * shift;
            shift *= 32;
        } while (byte >= 0x20);

        longitude_change = (result & 1) ? ((-result - 1) / 2) : (result / 2);

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
};