'use strict';

// Note: It's best practice to keep API keys secure and not expose them in client-side code.
const apiKey = "511c0d53e786d6e701870951d85c605d";

/**
 * Fetches data from the server.
 * @param {string} URL - The API URL to fetch from.
 * @param {function} callback - The callback function to handle the fetched data.
 */
export const fetchData = (URL, callback) => {
    fetch(`${URL}&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => callback(data))
        .catch(err => console.error("API fetch error:", err)); // Added error logging
};

export const url = {
    /**
     * URL for current weather data.
     * @param {number} lat - Latitude.
     * @param {number} lon - Longitude.
     */
    currentWeather(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric`;
    },
    /**
     * URL for 5-day forecast data.
     * @param {number} lat - Latitude.
     * @param {number} lon - Longitude.
     */
    forecast(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric`;
    },
    /**
     * URL for air pollution data.
     * @param {number} lat - Latitude.
     * @param {number} lon - Longitude.
     */
    airPollution(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}`;
    },
    /**
     * URL for reverse geocoding.
     * @param {number} lat - Latitude.
     * @param {number} lon - Longitude.
     */
    reverseGeo(lat, lon) {
        return `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5`;
    },
    /**
     * URL for forward geocoding.
     * @param {string} query - Search query (e.g., "London", "New York").
     */
    geo(query) {
        return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`;
    }
};
