'use strict';

import { updateWeather, error404 } from "./app.js";

// Default location set to London as a fallback
const defaultLocation = "#/weather?lat=51.5073219&lon=-0.1276474";

const currentLocation = () => {
    window.navigator.geolocation.getCurrentPosition(res => {
        const { latitude, longitude } = res.coords;
        updateWeather(latitude, longitude);
    }, err => {
        console.warn("Geolocation Error:", err.message);
        // If user denies location, redirect to the default location
        window.location.hash = defaultLocation;
    });
};

/**
 * @param {string} query - The query string from the URL (e.g., "lat=51.5&lon=-0.12")
 */
const searchedLocation = (query) => {
    // Safely extract lat and lon from the query string
    const params = new URLSearchParams(query);
    const lat = parseFloat(params.get("lat"));
    const lon = parseFloat(params.get("lon"));
    
    if (!isNaN(lat) && !isNaN(lon)) {
        updateWeather(lat, lon);
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
    
    // Default to current location if the hash is empty
    if (!requestURL) {
        currentLocation();
        return;
    }

    const [route, query] = requestURL.includes("?") ? requestURL.split("?") : [requestURL];

    if (routes.has(route) && routes.get(route)) {
        routes.get(route)(query);
    } else {
        error404();
    }
};

window.addEventListener("hashchange", checkHash);

// Handle the initial page load
window.addEventListener("load", () => {
    // If there's no hash, trigger the logic to get the current location
    if (!window.location.hash) {
        window.location.hash = "#/current-location";
    }
    // Trigger the checkHash to process the initial URL
    checkHash();
});
