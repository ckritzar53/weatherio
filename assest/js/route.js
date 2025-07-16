'use strict';

import { updateWeather, error404 } from "./app.js";

const defaultLocation = { lat: 51.5073219, lon: -0.1276474 }; 

const currentLocation = () => {
    window.navigator.geolocation.getCurrentPosition(res => {
        const { latitude, longitude } = res.coords;
        // The location name is not passed here, so it will be looked up via reverse geocoding.
        updateWeather(latitude, longitude);
    }, err => {
        console.warn(`Geolocation Error: ${err.message}. Falling back to default location.`);
        updateWeather(defaultLocation.lat, defaultLocation.lon);
    });
};

const searchedLocation = (query) => {
    const params = new URLSearchParams(query);
    const lat = params.get("lat");
    const lon = params.get("lon");
    const name = params.get("name"); // Get the location name from the URL.

    if (lat && lon) {
        // Pass the decoded name to the updateWeather function.
        updateWeather(parseFloat(lat), parseFloat(lon), decodeURIComponent(name));
    } else {
        error404();
    }
};

const routes = new Map([
    ["/current-location", currentLocation],
    ["/weather", searchedLocation]
]);

const checkHash = () => {
    const requestURL = window.location.hash.slice(1);
    
    const [route, query] = requestURL.includes("?") ? requestURL.split("?") : [requestURL];

    if (routes.has(route)) {
        routes.get(route)(query);
    } else {
        error404();
    }
};

window.addEventListener("hashchange", checkHash);

window.addEventListener("load", () => {
    if (!window.location.hash) {
        window.location.hash = "#/current-location";
    }
    checkHash();
});
