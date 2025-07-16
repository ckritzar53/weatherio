'use strict';

import { updateWeather, error404 } from "./app.js";

// Default to London if geolocation fails or is denied
const defaultLocation = { lat: 51.5073219, lon: -0.1276474 }; 

const currentLocation = () => {
    window.navigator.geolocation.getCurrentPosition(res => {
        const { latitude, longitude } = res.coords;
        updateWeather(latitude, longitude);
    }, err => {
        console.warn(`Geolocation Error: ${err.message}. Falling back to default location.`);
        updateWeather(defaultLocation.lat, defaultLocation.lon);
    });
};

const searchedLocation = (query) => {
    // Example query: "lat=51.5073&lon=-0.1276"
    const params = new URLSearchParams(query);
    const lat = params.get("lat");
    const lon = params.get("lon");

    if (lat && lon) {
        updateWeather(parseFloat(lat), parseFloat(lon));
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

    // If a valid route is found in our map, call its function
    if (routes.has(route)) {
        routes.get(route)(query);
    } else {
        // If the route is invalid, show the 404 page
        error404();
    }
};

window.addEventListener("hashchange", checkHash);

// This function runs when the page first loads
window.addEventListener("load", () => {
    // If there is no location hash in the URL, default to getting the current location
    if (!window.location.hash) {
        window.location.hash = "#/current-location";
    }
    
    // Process the URL hash to load the correct weather data
    checkHash();
});
