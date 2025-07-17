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
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => callback(data))
        .catch(err => {
            console.error("API Fetch Error:", err);
            callback(null); // Pass null on error to be handled in the app.
        });
};

export const url = {
    /**
     * **UPGRADED:** URL for the One Call API, which provides all necessary data.
     * @param {number} lat - Latitude.
     * @param {number} lon - Longitude.
     */
    oneCall(lat, lon) {
        return `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely`;
    },
    /**
     * URL for geocoding by city name or zip code.
     * @param {string} query - Search query (e.g., "London", "90210").
     */
    geo(query) {
        return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`;
    }
};
