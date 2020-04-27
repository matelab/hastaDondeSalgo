import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import turfCircle from "@turf/circle";
import { point as turfPoint } from "@turf/helpers";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwYW1hdGVsYWIiLCJhIjoiY2s5aWxkeDB0MWFmbjNobzQ5eG1raXRqdCJ9.CZBR_2z_Rc9Z5995UJTTbA";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  //style: 'https://geoserveis.icgc.cat/contextmaps/osm-bright.json',
  //style: 'img/osm-bright-icgc-cloudfront.json',
  center: [-63.6166725, -38.4160957],
  zoom: 5,
  bearing: 0
});

const geolocationControl = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  showUserLocation: false
});

const createBuffer = function(e) {
  const center = turfPoint([e.lngLat.lng, e.lngLat.lat]);
  const radius = 0.25;
  const options = {
    steps: 100,
    units: "kilometers",
    properties: { foo: "bar" }
  };
  const circle = turfCircle(center, radius, options);

  map.getSource("buffer_center").setData(center);
  map.getSource("buffer").setData(circle);

  const bounds = circle.geometry.coordinates[0].reduce(function(bounds, coord) {
    return bounds.extend(coord);
  }, new mapboxgl.LngLatBounds());

  map.fitBounds(bounds, { padding: 25 });
};

map.on("drag", function(e) {
  document.getElementById("openSidebarMenu").checked = false;
});

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    placeholder: "Busca tu casa...",
    zoom: 17,
    marker: false,
    language: "es-ES",
    countries: "ar",
    minLength: 3
  })
);
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.ScaleControl({ position: "bottom-right" }));

map.on("load", function(e) {
  map.addSource("buffer", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });
  map.addSource("buffer_center", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });

  map.addLayer({
    id: "buffer",
    type: "fill",
    source: "buffer",
    paint: {
      "fill-color": "#159E4A",
      "fill-opacity": 0.3
    }
  });

  map.addLayer({
    id: "buffer_center",
    type: "circle",
    source: "buffer_center",
    paint: {
      "circle-color": "#159E4A",
      "circle-radius": 5,
      "circle-stroke-color": "#FFF",
      "circle-stroke-width": 2
    }
  });

  map.on("click", function f(e) {
    document.getElementById("openSidebarMenu").checked = false;
    createBuffer(e);
  });

  map.addControl(geolocationControl);

  geolocationControl.on("geolocate", function(position) {
    document.getElementById("openSidebarMenu").checked = false;
    createBuffer({
      lngLat: {
        lng: position.coords.longitude,
        lat: position.coords.latitude
      }
    });
  });
});
