'use strict';

import { updateWeather, error404 } from "./app.js";

// Default to London if geolocation fails or is denied.
const defaultLocation = { lat: 51.5073219, lon: -0.1276474, name: "London" }; 

const currentLocation = () => {
    window.navigator.geolocation.getCurrentPosition(res => {
        const { latitude, longitude } = res.coords;
        // **FIX:** Pass latitude and longitude as separate numbers.
        updateWeather(latitude, longitude);
    }, err => {
        console.warn(`Geolocation Error: ${err.message}. Falling back to default location.`);
        // On error, redirect to the default location's weather page.
        window.location.hash = `#/weather?lat=${defaultLocation.lat}&lon=${defaultLocation.lon}&name=${defaultLocation.name}`;
    });
};

const searchedLocation = (query) => {
    // **FIX:** This logic correctly parses the lat, lon, and name from the URL.
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

// A simple map to handle the different routes in the app.
const routes = new Map([
    ["/current-location", currentLocation],
    ["/weather", searchedLocation]
]);

const checkHash = () => {
    const requestURL = window.location.hash.slice(1);
    
    // If the URL is empty, default to the current location.
    if (!requestURL) {
        window.location.hash = "#/current-location";
    }

    const [route, query] = requestURL.includes("?") ? requestURL.split("?") : [requestURL];

    // If the route exists in our map, call the associated function.
    if (routes.has(route)) {
        routes.get(route)(query);
    } else {
        error404();
    }
};

// Add event listeners to handle navigation.
window.addEventListener("hashchange", checkHash);
window.addEventListener("load", checkHash);
