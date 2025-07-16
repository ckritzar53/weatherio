'use strict';

const apiKey = "511c0d53e786d6e701870951d85c605d";

/**
 * Fetches data from the server and handles errors.
 * @param {string} URL - The API URL to fetch from.
 * @param {function} callback - The callback function to handle the fetched data.
 */
export const fetchData = (URL, callback) => {
    fetch(`${URL}&appid=${apiKey}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => callback(data))
        .catch(err => {
            console.error("API Fetch Error:", err);
            // Pass an empty object or array to the callback on error
            // to prevent the app from crashing.
            callback([]); 
        });
};

export const url = {
    currentWeather(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric`;
    },
    forecast(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric`;
    },
    airPollution(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}`;
    },
    reverseGeo(lat, lon) {
        return `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5`;
    },
    /**
     * URL for forward geocoding by city name.
     * @param {string} query - Search query (e.g., "London", "New York").
     */
    geo(query) {
        return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`;
    },
    /**
     * URL for geocoding by zip code.
     * @param {string} query - Search query (e.g., "90210" or "90210,US").
     */
    zip(query) {
        return `https://api.openweathermap.org/geo/1.0/zip?zip=${query}`;
    }
};
