'use strict';

import { fetchData, url } from "./api.js";
import * as module from "./module.js";

/**
 * Add event listener on multiple elements
 * @param {NodeList} elements Elements node array
 * @param {string} eventType Event Type e.g: "click", "mouseover"
 * @param {Function} callback Callback function
 */
const addEventOnElements = (elements, eventType, callback) => {
    for (const element of elements) element.addEventListener(eventType, callback);
}

const searchView = document.querySelector("[data-search-view]");
const searchTogglers = document.querySelectorAll("[data-search-toggler]");
const toggleSearch = () => searchView.classList.toggle("active");
addEventOnElements(searchTogglers, "click", toggleSearch);

const searchField = document.querySelector("[data-search-field]");
const searchResult = document.querySelector("[data-search-result]");
let searchTimeout = null;
const searchTimeoutDuration = 500;

searchField.addEventListener("input", function () {
    searchTimeout && clearTimeout(searchTimeout);
    if (!searchField.value) {
        searchResult.classList.remove("active");
        searchResult.innerHTML = "";
        searchField.classList.remove("searching");
    } else {
        searchField.classList.add("searching");
    }

    if (searchField.value) {
        searchTimeout = setTimeout(() => {
            fetchData(url.geo(searchField.value), function (locations) {
                searchField.classList.remove("searching");
                searchResult.classList.add("active");
                searchResult.innerHTML = `<ul class="view-list" data-search-list></ul>`;
                const searchList = searchResult.querySelector("[data-search-list]");
                const items = [];

                if (!locations || locations.length === 0) {
                    const noResultItem = document.createElement("li");
                    noResultItem.classList.add("view-item");
                    noResultItem.innerHTML = `<p class="item-title">No results found.</p>`;
                    searchList.appendChild(noResultItem);
                    return;
                }

                for (const { name, lat, lon, country, state } of locations) {
                    const searchItem = document.createElement("li");
                    searchItem.classList.add("view-item");
                    searchItem.innerHTML = `
                        <span class="m-icon">location_on</span>
                        <div>
                            <p class="item-title">${name}</p>
                            <p class="label-2 item-subtitle">${state || ""} ${country || ""}</p>
                        </div>
                        <a href="#/weather?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}" class="item-link has-state" aria-label="${name} weather" data-search-toggler></a>
                    `;
                    searchList.appendChild(searchItem);
                    items.push(searchItem.querySelector("[data-search-toggler]"));
                }
                addEventOnElements(items, "click", function () {
                    toggleSearch();
                    searchResult.classList.remove("active");
                });
            });
        }, searchTimeoutDuration);
    }
});

const container = document.querySelector("[data-container]");
const loading = document.querySelector("[data-loading]");
const currentLocationBtn = document.querySelector("[data-current-location-btn]");
const errorContent = document.querySelector("[data-error-content]");
const backgroundVideo = document.getElementById("background-video");

export const updateWeather = (lat, lon, locationName) => {
    loading.style.display = "grid";
    container.style.display = "none";
    errorContent.style.display = "none";
    if (backgroundVideo) backgroundVideo.classList.remove("visible");

    const currentWeatherSection = document.querySelector("[data-current-weather]");
    const highlightSection = document.querySelector("[data-highlights]");
    const hourlySection = document.querySelector("[data-hourly-forecast]");
    const forecastSection = document.querySelector("[data-5-day-forecast]");

    currentWeatherSection.innerHTML = "";
    highlightSection.innerHTML = "";
    hourlySection.innerHTML = "";
    forecastSection.innerHTML = "";

    if (window.location.hash.startsWith("#/current-location")) {
        currentLocationBtn.setAttribute("disabled", "");
    } else {
        currentLocationBtn.removeAttribute("disabled");
    }

    renderFavorites();

    fetchData(url.currentWeather(lat, lon), (currentWeather) => {
        if (!currentWeather || !currentWeather.weather) {
            error404();
            return;
        }

        const { weather, dt: dateUnix, sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC }, main: { temp, feels_like, pressure, humidity }, visibility, timezone } = currentWeather;
        const [{ description, icon, id: weatherId }] = weather;

        if (backgroundVideo) {
            const videoSrc = module.getVideoForWeather(weatherId, icon);
            if (backgroundVideo.src !== videoSrc) {
                backgroundVideo.src = videoSrc;
                backgroundVideo.load();
                backgroundVideo.play().catch(e => console.error("Video play failed:", e));
            }
            backgroundVideo.classList.add("visible");
        }

        const card = document.createElement("div");
        card.classList.add("card", "card-lg", "current-weather-card");
        card.innerHTML = `
            <button class="icon-btn add-favorite-btn" aria-label="Add to favorites" data-favorite-btn>
                <span class="m-icon">star</span>
            </button>
            <h2 class="title-2 card-title">Now</h2>
            <div class="weapper">
                <p class="heading">${module.formatTemp(temp, localStorage.getItem('temperature') || 'celsius')}</p>
                <img src="./assest/images/weather_icons/${icon}.png" width="64" height="64" alt="${description}" class="weather-icon">
            </div>
            <p class="body-3">${description}</p>
            <ul class="meta-list">
                <li class="meta-item">
                    <span class="m-icon">calendar_today</span>
                    <p class="title-3 meta-text">${module.getDate(dateUnix, timezone)}</p>
                </li>
                <li class="meta-item">
                    <span class="m-icon">location_on</span>
                    <p class="title-3 meta-text" data-location></p>
                </li>
            </ul>
        `;
        
        const locationElement = card.querySelector("[data-location]");
        const locationData = { lat, lon, name: locationName };
        updateLocationName(locationElement, locationData);

        const favoriteBtn = card.querySelector("[data-favorite-btn]");
        const favoriteIcon = favoriteBtn.querySelector(".m-icon");
        if (isFavorite(locationData)) {
            favoriteIcon.classList.add("active");
        }
        favoriteBtn.addEventListener("click", () => toggleFavorite(favoriteBtn, locationData));

        currentWeatherSection.appendChild(card);

        fetchData(url.airPollution(lat, lon), (airPollution) => {
            if (!airPollution || !airPollution.list) return;
            const [{ main: { aqi }, components: { no2, o3, so2, pm2_5 } }] = airPollution.list;
            const card = document.createElement("div");
            card.classList.add("card", "card-lg");
            card.innerHTML = `
                <h2 class="title-2" id="highlights-label">Today's Highlights</h2>
                <div class="highlight-list">
                    <div class="card card-sm highlight-card one">
                        <h3 class="title-3">Air Quality Index</h3>
                        <div class="wrapper">
                            <span class="m-icon">air</span>
                            <ul class="card-list">
                                <li class="card-item"><p class="title-1">${pm2_5.toPrecision(3)}</p><p class="label-1">PM<sub>2.5</sub></p></li>
                                <li class="card-item"><p class="title-1">${so2.toPrecision(3)}</p><p class="label-1">SO<sub>2</sub></p></li>
                                <li class="card-item"><p class="title-1">${no2.toPrecision(3)}</p><p class="label-1">NO<sub>2</sub></p></li>
                                <li class="card-item"><p class="title-1">${o3.toPrecision(3)}</p><p class="label-1">O<sub>3</sub></p></li>
                            </ul>
                        </div>
                        <span class="badge aqi-${aqi} label-${aqi}" title="${module.aqiText[aqi].message}">${module.aqiText[aqi].level}</span>
                    </div>
                    <div class="card card-sm highlight-card two">
                        <h3 class="title-3">Sunrise & Sunset</h3>
                        <div class="wrapper">
                            <div class="card-list">
                                <div class="card-item"><span class="m-icon">clear_day</span><div><p class="label-1">Sunrise</p><p class="title-1">${module.getTime(sunriseUnixUTC, timezone, localStorage.getItem('timeFormat') || '12h')}</p></div></div>
                                <div class="card-item"><span class="m-icon">clear_night</span><div><p class="label-1">Sunset</p><p class="title-1">${module.getTime(sunsetUnixUTC, timezone, localStorage.getItem('timeFormat') || '12h')}</p></div></div>
                            </div>
                        </div>
                    </div>
                    <div class="card card-sm highlight-card"><h3 class="title-3">Humidity</h3><div class="wrapper"><span class="m-icon">humidity_percentage</span><p class="title-1">${humidity}<sub>%</sub></p></div></div>
                    <div class="card card-sm highlight-card"><h3 class="title-3">Pressure</h3><div class="wrapper"><span class="m-icon">airwave</span><p class="title-1">${module.formatPressure(pressure, localStorage.getItem('pressure') || 'hPa')}</p></div></div>
                    <div class="card card-sm highlight-card"><h3 class="title-3">Visibility</h3><div class="wrapper"><span class="m-icon">visibility</span><p class="title-1">${module.formatDistance(visibility, localStorage.getItem('distance') || 'km')}</p></div></div>
                    <div class="card card-sm highlight-card"><h3 class="title-3">Feels Like</h3><div class="wrapper"><span class="m-icon">thermostat</span><p class="title-1">${module.formatTemp(feels_like, localStorage.getItem('temperature') || 'celsius')}</p></div></div>
                </div>
            `;
            highlightSection.appendChild(card);
        });

        fetchData(url.forecast(lat, lon), (forecast) => {
            if (!forecast || !forecast.list) return;
            const { list: forecastList, city: { timezone } } = forecast;
            hourlySection.innerHTML = `<h2 class="title-2">Today at</h2><div class="slider-container"><ul class="slider-list" data-temp></ul><ul class="slider-list" data-wind></ul></div>`;
            for (const [index, data] of forecastList.entries()) {
                if (index > 7) break;
                const { dt: dateTimeUnix, main: { temp }, weather, wind: { deg: windDirection, speed: windSpeed }, pop } = data;
                const [{ icon, description }] = weather;
                const tempLi = document.createElement("li");
                tempLi.classList.add("slider-item");
                tempLi.innerHTML = `<div class="card card-sm slider-card"><p class="body-3">${module.getTime(dateTimeUnix, timezone, localStorage.getItem('timeFormat') || '12h')}</p><img src="./assest/images/weather_icons/${icon}.png" width="48" height="48" loading="lazy" alt="${description}" class="weather-icon" title="${description}"><p class="body-3">${module.formatTemp(temp, localStorage.getItem('temperature') || 'celsius')}</p></div>`;
                hourlySection.querySelector("[data-temp]").appendChild(tempLi);
                const windLi = document.createElement("li");
                windLi.classList.add("slider-item");
                windLi.innerHTML = `<div class="card card-sm slider-card"><p class="body-3">${module.getTime(dateTimeUnix, timezone, localStorage.getItem('timeFormat') || '12h')}</p><img src="./assest/images/weather_icons/direction.png" width="48" height="48" loading="lazy" alt="wind direction" class="weather-icon" style="transform: rotate(${windDirection - 180}deg)"><p class="body-3">${module.formatWind(windSpeed, localStorage.getItem('windSpeed') || 'ms')}</p></div>`;
                hourlySection.querySelector("[data-wind]").appendChild(windLi);
            }

            forecastSection.innerHTML = `
                <h2 class="title-2" id="forecast-label">5-Day Forecast</h2>
                <div class="card card-lg forecast-card">
                    <ul data-forecast-list></ul>
                </div>
            `;
            const forecastListElement = forecastSection.querySelector("[data-forecast-list]");
            const uniqueForecastDays = [];
            const fiveDayForecast = forecastList.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            let startIndex = 0;
            if (new Date(fiveDayForecast[0].dt_txt).getDate() === new Date().getDate()) {
                startIndex = 1;
            }

            for (let i = startIndex; i < startIndex + 5 && i < fiveDayForecast.length; i++) {
                const { main: { temp_max }, weather, dt_txt, pop } = fiveDayForecast[i];
                const [{ icon, description }] = weather;
                const date = new Date(dt_txt);
                const li = document.createElement("li");
                li.classList.add("card-item");
                li.innerHTML = `
                    <div class="icon-wrapper">
                        <img src="./assest/images/weather_icons/${icon}.png" width="36" height="36" alt="${description}" class="weather-icon" title="${description}">
                        <span class="span"><p class="title-2">${module.formatTemp(temp_max, localStorage.getItem('temperature') || 'celsius')}</p></span>
                    </div>
                    <p class="label-1">${module.monthNames[date.getUTCMonth()]} ${date.getDate()}</p>
                    <p class="label-1">${module.weekDayNames[date.getUTCDay()]}</p>
                `;
                forecastListElement.appendChild(li);
            }

            loading.style.display = "none";
            container.style.display = "grid";
            container.classList.add("fade-in");
        });
    });
};

export const error404 = () => {
    loading.style.display = "none";
    container.style.display = "none";
    errorContent.style.display = "flex";
};

// --- FAVORITES LOGIC ---
const favoritesContainer = document.querySelector("[data-favorites-container]");
const favoritesToggler = document.querySelector("[data-favorites-toggler]");
const favoritesMenu = document.querySelector("[data-favorites-menu]");

const getFavorites = () => JSON.parse(localStorage.getItem("weatherio-favorites")) || [];

const saveFavorites = (favorites) => {
    localStorage.setItem("weatherio-favorites", JSON.stringify(favorites));
};

const isFavorite = ({ lat, lon }) => {
    const favorites = getFavorites();
    return favorites.some(fav => fav.lat.toFixed(4) === lat.toFixed(4) && fav.lon.toFixed(4) === lon.toFixed(4));
};

const toggleFavorite = (button, locationData) => {
    const favorites = getFavorites();
    const { lat, lon, name } = locationData;
    const favoriteIcon = button.querySelector(".m-icon");

    if (isFavorite(locationData)) {
        const updatedFavorites = favorites.filter(fav => fav.lat.toFixed(4) !== lat.toFixed(4) || fav.lon.toFixed(4) !== lon.toFixed(4));
        saveFavorites(updatedFavorites);
        favoriteIcon.classList.remove("active");
    } else {
        if (!name) {
            fetchData(url.reverseGeo(lat, lon), ([{ name: resolvedName }]) => {
                favorites.push({ lat, lon, name: resolvedName });
                saveFavorites(favorites);
                renderFavorites();
            });
        } else {
            favorites.push({ lat, lon, name });
            saveFavorites(favorites);
        }
        favoriteIcon.classList.add("active");
    }
    renderFavorites();
};

const renderFavorites = () => {
    const favorites = getFavorites();
    favoritesMenu.innerHTML = "";
    if (favorites.length > 0) {
        favoritesContainer.style.display = "block";
        favorites.forEach(({ lat, lon, name }) => {
            const item = document.createElement("div");
            item.classList.add("view-item");
            item.innerHTML = `
                <a href="#/weather?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}" class="item-link">
                    <p class="item-title">${name}</p>
                </a>
            `;
            favoritesMenu.appendChild(item);
        });
    } else {
        favoritesContainer.style.display = "none";
    }
};

favoritesToggler.addEventListener("click", (e) => {
    e.stopPropagation();
    favoritesMenu.classList.toggle("active")
});
window.addEventListener("click", () => favoritesMenu.classList.remove("active"));

// --- SETTINGS LOGIC ---
const settingsBtn = document.querySelector("[data-settings-btn]");
const settingsModal = document.querySelector("[data-settings-modal]");
const settingsOverlay = document.querySelector("[data-settings-overlay]");
const settingsCloseBtn = document.querySelector("[data-settings-close]");

const toggleSettingsModal = () => {
    settingsModal.classList.toggle("active");
    settingsOverlay.classList.toggle("active");
}
addEventOnElements([settingsBtn, settingsOverlay, settingsCloseBtn], "click", toggleSettingsModal);

const settingSelects = document.querySelectorAll("select[data-setting]");
settingSelects.forEach(select => {
    select.addEventListener('change', (e) => {
        localStorage.setItem(e.target.dataset.setting, e.target.value);
        window.location.reload();
    });
});

const timeFormatRadios = document.querySelectorAll('input[name="timeFormat"]');
timeFormatRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.checked) {
            localStorage.setItem('timeFormat', e.target.value);
            window.location.reload();
        }
    });
});

const loadPreferences = () => {
    settingSelects.forEach(select => {
        const key = select.dataset.setting;
        const savedValue = localStorage.getItem(key);
        if (savedValue) select.value = savedValue;
    });
    const savedTimeFormat = localStorage.getItem('timeFormat');
    if (savedTimeFormat) {
        const radioToCheck = document.querySelector(`input[name="timeFormat"][value="${savedTimeFormat}"]`);
        if (radioToCheck) radioToCheck.checked = true;
    }
};

window.addEventListener('DOMContentLoaded', loadPreferences);

// --- HELPER FUNCTION FOR LOCATION NAME ---
function updateLocationName(element, { lat, lon, name }) {
    if (name) {
        fetchData(url.reverseGeo(lat, lon), ([{ country, state }]) => {
            element.innerHTML = `${name}, ${state ? `${state}, ` : ''}${country || ''}`;
        });
    } else {
        fetchData(url.reverseGeo(lat, lon), ([{ name: resolvedName, country, state }]) => {
            element.innerHTML = `${resolvedName}, ${state ? `${state}, ` : ''}${country || ''}`;
        });
    }
}
