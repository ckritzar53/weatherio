'use strict';

import { updateWeather, error404 } from "./app.js";

// Default to London if geolocation fails or is denied.
const defaultLocation = { lat: 51.5073219, lon: -0.1276474, name: "London" }; 

const currentLocation = () => {
    window.navigator.geolocation.getCurrentPosition(res => {
        const { latitude, longitude } = res.coords;
        updateWeather(latitude, longitude);
    }, err => {
        console.warn(`Geolocation Error: ${err.message}. Falling back to default location.`);
        window.location.hash = `#/weather?lat=${defaultLocation.lat}&lon=${defaultLocation.lon}&name=${defaultLocation.name}`;
    });
};

const searchedLocation = (query) => {
    const params = new URLSearchParams(query);
    const lat = params.get("lat");
    const lon = params.get("lon");
    const name = params.get("name");

    if (lat && lon) {
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
    
    if (!requestURL) {
        window.location.hash = "#/current-location";
    }

    const [route, query] = requestURL.includes("?") ? requestURL.split("?") : [requestURL];

    if (routes.has(route)) {
        routes.get(route)(query);
    } else {
        error404();
    }
};

window.addEventListener("hashchange", checkHash);
window.addEventListener("load", checkHash);
