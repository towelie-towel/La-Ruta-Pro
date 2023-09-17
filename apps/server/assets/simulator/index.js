const subscriberTable = document.getElementById("subscribers-table");

const originInput = document.getElementById("origin-input");
const destinationInput = document.getElementById("destination-input");
const stopBtn = document.getElementById("stop-btn");
const connectAndEmmitBtn = document.getElementById("connectAndEmmit-btn");

stopBtn.addEventListener("click", () => {
  console.log("Hello");
});

connectAndEmmitBtn.addEventListener("click", () => {
  fetch("https://www.uuidtools.com/api/generate/v4")
    .then((res) => res.json())
    .then((data) => {
      connectAndEmmit(
        getDirections(originInput.textContent, destinationInput.textContent),
        "taxi",
        data[0],
      );
    });
});

function connectAndEmmit(route, type, uuid) {
  let i = 0;
  const conn = new WebSocket(
    `ws://${location.host}/subscribe?id=${uuid}&lat=${route[i].latitude}&lon=${route[i].longitude}`,
    `map-${type}`,
  );
  conn.addEventListener("close", (ev) => {
    console.log("Connection closed");
  });
  conn.addEventListener("open", (ev) => {
    console.info("websocket connected");

    const closeBtn = document.createElement("button");
    closeBtn.addEventListener("click", () => {
      conn.close();
    });
    const thType = document.createElement("th");
    const thStatus = document.createElement("td");
    const thLatitude = document.createElement("td");
    const thLongitude = document.createElement("td");
    const thClose = document.createElement("td");
    const tr = document.createElement("tr");

    thType.innerText = type;
    thStatus.innerText = "Open";
    thLatitude.innerText = route[i].latitude;
    thLongitude.innerText = route[i].longitude;
    closeBtn.innerText = "Close";
    thClose.replaceChildren(closeBtn);
    tr.id = `subscriber-${uuid}`;
    tr.append(thType, thStatus, thLatitude, thLongitude, thClose);
    subscriberTable.append(tr);

    const interval = setInterval(() => {
      if (conn.readyState === conn.CLOSED) {
        console.info("clearing interval");
        clearInterval(interval);
      } else {
        conn.send(`${route[i].latitude},${route[i].longitude}`);
        i++;
      }
    }, 1700);
  });
}


export const getDirections = async (startLoc, destinationLoc) => {
  try {
    const resp = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE`,
    );
    const respJson = await resp.json();
    const decodedCoords = polylineDecode(
      respJson.routes[0].overview_polyline.points,
    ).map((point, index) => ({ latitude: point[0], longitude: point[1] }));
    return decodedCoords;
  } catch (error) {
    console.error(error);
  }
};
export const duplicateCoords = (coords) => {
  const newCoords = [];
  for (let i = 0; i < coords.length - 1; i++) {
    newCoords.push({
      latitude: Number(coords[i]?.latitude),
      longitude: Number(coords[i]?.longitude),
    });
    newCoords.push({
      latitude:
        (Number(coords[i]?.latitude) + Number(coords[i + 1]?.latitude)) / 2,
      longitude:
        (Number(coords[i]?.longitude) + Number(coords[i + 1]?.longitude)) / 2,
    });
  }
  return newCoords;
};
export function polylineDecode(str, precision) {
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
    latitude_change = result & 1 ? (-result - 1) / 2 : result / 2;
    shift = 1;
    result = 0;
    do {
      byte = str.charCodeAt(index++) - 63;
      result += (byte & 0x1f) * shift;
      shift *= 32;
    } while (byte >= 0x20);
    longitude_change = result & 1 ? (-result - 1) / 2 : result / 2;
    lat += latitude_change;
    lng += longitude_change;
    coordinates.push([lat / factor, lng / factor]);
  }
  return coordinates;
}
