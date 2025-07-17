'use strict';

export const weekDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const getDate = (dateUnix, timezone) => {
    const date = new Date((dateUnix + timezone) * 1000);
    const weekDayName = weekDayNames[date.getUTCDay()];
    const monthName = monthNames[date.getUTCMonth()];
    return `${weekDayName}, ${monthName} ${date.getUTCDate()}`;
};

export const getTime = (timeUnix, timezone, timeFormat = '12h') => {
    const date = new Date((timeUnix + timezone) * 1000);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');

    if (timeFormat === '12h') {
        const period = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${period}`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

export const aqiText = {
    1: { level: "Good", message: "Air quality is considered satisfactory, and air pollution poses little or no risk." },
    2: { level: "Fair", message: "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution." },
    3: { level: "Moderate", message: "Members of sensitive groups may experience health effects. The general public is not likely to be affected." },
    4: { level: "Poor", message: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects." },
    5: { level: "Very Poor", message: "Health warnings of emergency conditions. The entire population is more likely to be affected." }
};

/**
 * **NEW:** Maps weather condition codes to CSS classes for dynamic backgrounds.
 * @param {number} id - Weather condition code from OpenWeatherMap API.
 * @param {string} icon - Weather icon code (e.g., "01d" for day, "01n" for night).
 * @returns {string} The corresponding CSS class name.
 */
export const getBackgroundClass = (id, icon) => {
    if (id >= 200 && id <= 232) return 'bg-thunderstorm';
    if (id >= 300 && id <= 321) return 'bg-drizzle';
    if (id >= 500 && id <= 531) return 'bg-rain';
    if (id >= 600 && id <= 622) return 'bg-snow';
    if (id >= 701 && id <= 781) return 'bg-mist';
    if (id === 800) {
        // Check if it's day or night for clear sky
        return icon.includes('n') ? 'bg-clear-night' : 'bg-clear-day';
    }
    if (id >= 801 && id <= 804) return 'bg-clouds';

    return 'bg-default'; // Fallback background
};


export const formatTemp = (temp, unit) => {
    if (unit === 'fahrenheit') {
        const fahrenheit = (temp * 9/5) + 32;
        return `${parseInt(fahrenheit)}&deg;F`;
    }
    return `${parseInt(temp)}&deg;C`;
};

export const formatWind = (speedInMs, unit) => {
    switch (unit) {
        case 'kmh': return `${(speedInMs * 3.6).toFixed(1)} km/h`;
        case 'mph': return `${(speedInMs * 2.237).toFixed(1)} mph`;
        case 'kn': return `${(speedInMs * 1.944).toFixed(1)} kn`;
        case 'bft':
            if (speedInMs < 0.3) return '0 bft'; if (speedInMs < 1.6) return '1 bft';
            if (speedInMs < 3.4) return '2 bft'; if (speedInMs < 5.5) return '3 bft';
            if (speedInMs < 8.0) return '4 bft'; if (speedInMs < 10.8) return '5 bft';
            if (speedInMs < 13.9) return '6 bft'; if (speedInMs < 17.2) return '7 bft';
            if (speedInMs < 20.8) return '8 bft'; if (speedInMs < 24.5) return '9 bft';
            if (speedInMs < 28.5) return '10 bft'; if (speedInMs < 32.7) return '11 bft';
            return '12 bft';
        default: return `${speedInMs.toFixed(1)} m/s`;
    }
};

export const formatPressure = (pressureInHpa, unit) => {
    switch (unit) {
        case 'mbar': return `${parseInt(pressureInHpa)} mbar`;
        case 'inHg': return `${(pressureInHpa * 0.02953).toFixed(2)} inHg`;
        case 'mmHg': return `${(pressureInHpa * 0.750062).toFixed(0)} mmHg`;
        case 'kPa': return `${(pressureInHpa / 10).toFixed(1)} kPa`;
        default: return `${parseInt(pressureInHpa)} hPa`;
    }
};

export const formatDistance = (visibilityInMeters, unit) => {
    if (unit === 'mi') {
        return `${(visibilityInMeters / 1609.34).toFixed(1)} mi`;
    }
    return `${(visibilityInMeters / 1000).toFixed(1)} km`;
};
