const TLE_URL = "https://celestrak.org/NORAD/elements/gp.php?NAME=ISS&FORMAT=TLE";

async function fetchTLE() {
  const response = await fetch(TLE_URL);
  const text = await response.text();
  const lines = text.trim().split("\n");
  return {
    name: lines[0].trim(),
    line1: lines[1].trim(),
    line2: lines[2].trim()
  };
}

function predictPasses(tle, lat, lon, hoursAhead = 24) {
  const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
  const observerGd = {
    latitude: satellite.degreesToRadians(lat),
    longitude: satellite.degreesToRadians(lon),
    height: 0.1 // km above sea level
  };

  const passes = [];
  let inPass = false;
  let currentPass = null;

  const start = new Date();
  const stepSeconds = 30;

  for (let t = 0; t < hoursAhead * 3600; t += stepSeconds) {
    const time = new Date(start.getTime() + t * 1000);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const gmst = satellite.gstime(time);
    const positionEcf = satellite.eciToEcf(positionAndVelocity.position, gmst);
    const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

    const elevationDeg = satellite.radiansToDegrees(lookAngles.elevation);

    if (elevationDeg > 0 && !inPass) {
      inPass = true;
      currentPass = { start: time, maxElevation: elevationDeg };
    } else if (elevationDeg > 0 && inPass) {
      if (elevationDeg > currentPass.maxElevation) {
        currentPass.maxElevation = elevationDeg;
      }
    } else if (elevationDeg <= 0 && inPass) {
      inPass = false;
      currentPass.end = time;
      passes.push(currentPass);
    }
  }

  return passes;
}
const map = L.map('map').setView([37.7749, -122.4194], 3);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

document.getElementById('loadBtn').addEventListener('click', async () => {
  const lat = parseFloat(document.getElementById('lat').value);
  const lon = parseFloat(document.getElementById('lon').value);

  document.getElementById('results').innerHTML = "Loading TLE data...";

  const tle = await fetchTLE();
  const passes = predictPasses(tle, lat, lon);

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `<h3>Upcoming passes for ${tle.name}</h3>`;

  if (passes.length === 0) {
    resultsDiv.innerHTML += "<p>No passes found in the next 24 hours.</p>";
  } else {
    passes.forEach(p => {
      resultsDiv.innerHTML += `
        <div class="pass">
          <strong>${p.start.toLocaleString()}</strong> → ${p.end.toLocaleTimeString()}<br>
          Max elevation: ${p.maxElevation.toFixed(1)}°
        </div>`;
    });
  }

  L.marker([lat, lon]).addTo(map).bindPopup("Your location").openPopup();
  map.setView([lat, lon], 5);
});