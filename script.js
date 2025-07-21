// Initialize map centered on India
const map = L.map('map').setView([22.9734, 78.6569], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let currentLayer;

function runSearch() {
  const input = document.getElementById("search").value.toLowerCase();
  let query = "";

  if (input.includes("temple") && input.includes("varanasi")) {
    map.setView([25.3, 82.97], 14);
    query = `
      [out:json][timeout:25];
      node["amenity"="place_of_worship"]["religion"="hindu"](25.25,82.95,25.35,83.05);
      out;
    `;
  } else if (input.includes("museum") && input.includes("delhi")) {
    map.setView([28.61, 77.21], 13);
    query = `
      [out:json][timeout:25];
      node["tourism"="museum"](28.4,76.8,28.9,77.4);
      out;
    `;
  } else if (input.includes("park") && input.includes("mumbai")) {
    map.setView([19.07, 72.88], 13);
    query = `
      [out:json][timeout:25];
      node["leisure"="park"](18.88,72.77,19.30,73.10);
      out;
    `;
  } else {
    alert("Try: temples in Varanasi, museums in Delhi, parks in Mumbai.");
    return;
  }

  fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query
  })
  .then(res => res.json())
  .then(osmData => {
    const geojson = osmtogeojson(osmData);

    if (currentLayer) map.removeLayer(currentLayer);

    currentLayer = L.geoJSON(geojson, {
      onEachFeature: (feature, layer) => {
        const tags = feature.properties.tags;
        const name = tags.name || 'Unnamed';
        const type = tags.amenity || tags.tourism || tags.leisure || 'Unknown';

        layer.bindPopup(`<b>${name}</b><br>Type: ${type}`);
      }
    }).addTo(map);

    map.fitBounds(currentLayer.getBounds());
  });
}
