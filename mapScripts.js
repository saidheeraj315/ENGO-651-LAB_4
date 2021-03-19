
const map = L.map('leafletMap', {
  center: [51.0447, -114.0719],
  zoom:10.5
});


L.tileLayer('https://api.mapbox.com/styles/v1/saidheeraj/ckmfx7ysd76fa17qm57stm3lj/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://apps.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoic2FpZGhlZXJhaiIsImEiOiJja201eWtrNGswZ2VqMnJvY2piY3h5ZmIwIn0.Ik4F9-k3CJUhDgbYRyiJGQ'


}).addTo(map);

function collectData() {

    const requestURL = "https://data.calgary.ca/resource/fd9t-tdn2.geojson";
    const requestURLClinics = "https://data.calgary.ca/resource/x34e-bcjz.geojson?$where=type == 'PHS Clinic' or type == 'Hospital'";

    const schoolData = new HttpClient();
    schoolData.get(requestURL, function(response) {
      createMarkers(response, "schools");
    });

    const clinicData = new HttpClient();
    clinicData.get(requestURLClinics, function(response) {
      createMarkers(response, "hospitals");
    });

}

const hospitalIcon = L.divIcon({className: 'hospitalIcon'});
const hospitalIconClicked = L.divIcon({className: 'hospitalIconClicked'});
const schoolIcon = L.divIcon({className: 'schoolIcon'});

let schools = L.featureGroup();
let hospitals = L.featureGroup();
let nearestHospitalPoint = L.featureGroup();

L.control.layers(null,
  {
    "Schools": schools,
    "Hospitals": hospitals
  }, {
  collapsed: false
}).addTo(map);

map.addLayer(schools);
map.addLayer(hospitals);

map.addLayer(nearestHospitalPoint);

schools.on("click", function (e) {

  nearestHospitalPoint.clearLayers();

  const clickedMarker = e.layer.toGeoJSON();

  const nearestHospital = turf.nearest(clickedMarker, hospitals.toGeoJSON());

  const nhLng = nearestHospital.geometry.coordinates[0];
  const nhLat = nearestHospital.geometry.coordinates[1];

  L.marker([nhLat, nhLng], {icon: hospitalIconClicked, zIndexOffset: 1000}).addTo(nearestHospitalPoint);

  document.getElementById('announcer').style.display = "block";
  document.getElementById('schoolName').innerHTML = e.layer.options.title;
  document.getElementById('kmDistance').innerHTML = nearestHospital.properties.distanceToPoint.toFixed(3);

  hospitals.eachLayer(function (e) {
    const hLat = e._latlng.lat.toFixed(6);
    const hLng = e._latlng.lng.toFixed(6);

    if (hLat == nhLat && hLng == nhLng) {
      document.getElementById('hospName').innerHTML = e.options.title;
    }
  });
});

let HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        let anHttpRequest = new XMLHttpRequest();

        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }
        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.setRequestHeader("X-App-Token", "0Yy2rHqfsSy863vVSti73hwb7");
        anHttpRequest.send();
    }
}

function createMarkers(json, type) {
  const data = JSON.parse(json);

  if (data.features.length == 0) {
    alert("no data available.");
  } else {
    for (i in data.features) {

      if (data.features[i].geometry != null) {

        let coords = data.features[i].geometry.coordinates;

        const name = data.features[i].properties.name || "N/A";

        let marker = new L.marker([coords[1], coords[0]], {title: name}).bindPopup(name);

        if (type == "hospitals") {
          marker.setIcon(hospitalIcon).addTo(hospitals);
        } else if (type == "schools") {
          marker.setIcon(schoolIcon).addTo(schools);
        }

      }
    }
  }
}
