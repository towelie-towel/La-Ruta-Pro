console.log("Running script");
let wsConnections = []
const subscriberTable = document.getElementById("subscribers-table-body");
const streamingTable = document.getElementById("streaming-table-body");

const originInput = document.getElementById("origin-input");
const destinationInput = document.getElementById("destination-input");
const connectAndEmmitBtn = document.getElementById("connect-and-emmit-btn");
const radioInputs =
  document.querySelectorAll('input[type="radio"]');

connectAndEmmitBtn.addEventListener("click", () => {
  let selectedRole;
  radioInputs.forEach((input) => {
    if (input.checked) {
      selectedRole = input.value;
      return;
    }
  });
  fetch("https://www.uuidtools.com/api/generate/v4")
    .then((res) => res.json())
    .then((data) => {
      getRoute(originInput.value, destinationInput.value)
        .then((route) => {
          connectAndEmmit(route, selectedRole, data[0]);
        });
    });
});

function connectAndEmmit(route, type, uuid) {
  let i = 0;
  console.log("Running web sockets");
  if (wsConnections.find(ws => ws.protocol === "client")) {
    throw new Error("Client already connected");
  }
  const conn = new WebSocket(
    `ws://${location.host}/subscribe?id=${uuid}&lat=${route[i].latitude}&lon=${route[i].longitude}`,
    `map-${type}`,
  );
  wsConnections.push(conn);
  conn.addEventListener("close", (ev) => {
    console.log("Connection closed");
    tdStatus = document.getElementById(`status-td-${uuid}`);
    if (tdStatus) {
      tdStatus.innerText = "Closed";
    }
  });
  conn.addEventListener("open", (ev) => {
    console.info("websocket connected");

    const tdStatus = document.createElement("td");
    tdStatus.id = `status-td-${uuid}`;
    tdStatus.innerText = "Open";
    let tdType = document.createElement("td");
    tdType.innerText = type;
    let tdLatitude = document.createElement("td");
    tdLatitude.innerText = route[i].latitude;
    let tdLongitude = document.createElement("td");
    tdLongitude.innerText = route[i].longitude;
    const closeBtn = document.createElement("button");
    closeBtn.classList.add("btn");
    closeBtn.addEventListener("click", () => {
      conn.close();
    });
    closeBtn.innerText = "Close";
    const tdClose = document.createElement("td");
    tdClose.replaceChildren(closeBtn);
    const trSubscribers = document.createElement("tr");
    trSubscribers.id = `subscriber-${uuid}`;
    trSubscribers.append(tdType, tdStatus, tdLatitude, tdLongitude, tdClose);
    trSubscribers.classList.add("hover");
    subscriberTable.append(trSubscribers);

    if (type === "client") {
      conn.addEventListener("message", (ev) => {
        const message = ev.data;
        if (typeof message !== "string") {
          return;
        }
        const taxis = message.split("$");
        streamingTable.innerHTML = "";
        for (let taxi of taxis) {
          taxi = taxi.split("&");
          const coords = taxi[0].split(",");
          const tdId = document.createElement("td");
          tdId.innerText = taxi[1];
          tdLatitude = document.createElement("td");
          tdLatitude.innerText = coords[0];
          tdLongitude = document.createElement("td");
          tdLongitude.innerText = coords[1];
          tdType = document.createElement("td");
          tdType.innerText = "taxi";
          const trStreaming = document.createElement("tr");
          trStreaming.id = `streaming-${taxi[1]}`;
          trStreaming.append(tdType, tdId, tdLatitude, tdLongitude);
          trStreaming.classList.add("hover");
          streamingTable.append(trStreaming);
        }
      });
    }

    if (type === "taxi") {
      const interval = setInterval(() => {
        if (conn.readyState === conn.CLOSED) {
          console.info("clearing interval");
          clearInterval(interval);
        } else {
          if (i === route.length - 1) {
            clearInterval(interval);
          }
          console.log("pos");
          conn.send(`pos#${route[i].latitude},${route[i].longitude}`);
          i++;
        }
      }, 1700);
    }
  });
}
const getRoute = async (startLoc, destinationLoc) => {
  try {
    const resp = await fetch(
      `http://${location.host}/route?from=${startLoc}&to=${destinationLoc}`,
    );
    const respJson = await resp.json();
    const decodedCoords = polylineDecode(
      respJson[0].overview_polyline.points,
    ).map((point, index) => ({ latitude: point[0], longitude: point[1] }));
    return decodedCoords;
  } catch (error) {
    console.error("getRoute error", error);
  }
};

const duplicateCoords = (coords) => {
  const newCoords = [];
  for (let i = 0; i < coords.lengtd - 1; i++) {
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
function polylineDecode(str, precision) {
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
