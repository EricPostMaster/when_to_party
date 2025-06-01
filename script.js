document.getElementById('coordinates-form').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log("Form submitted");

    const lat = parseFloat(document.getElementById('latitude').value);
    const lon = parseFloat(document.getElementById('longitude').value);
    const date = document.getElementById('date').value;

    if (!date) {
        alert("Please enter a valid date.");
        return;
    }

    const baseDate = new Date(date);
    const resultsBody = document.getElementById('results-body');
    resultsBody.innerHTML = ''; // Clear previous results

    const fetchTimesForDate = (currentDate) => {
        const dateStr = currentDate.toISOString().split('T')[0];
        const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${dateStr}&formatted=0`;

        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'OK' && data.results.sunset && data.results.nautical_twilight_end) {
                    const sunsetDate = new Date(data.results.sunset);
                    const endNtwDate = new Date(data.results.nautical_twilight_end);

                    const roundedEndNtw = new Date(endNtwDate);
                    roundedEndNtw.setMinutes(Math.floor(endNtwDate.getMinutes() / 15) * 15);
                    roundedEndNtw.setSeconds(0);
                    roundedEndNtw.setMilliseconds(0);

                    const timeZoneAbbr = getTimeZoneAbbreviation(roundedEndNtw);
                    const recommendedTime = `${roundedEndNtw.toLocaleTimeString()} ${timeZoneAbbr}`;

                    // Moon phase
                    const moonIllum = SunCalc.getMoonIllumination(currentDate);
                    const moonPercent = Math.round(moonIllum.fraction * 100);
                    const moonStatus = moonIllum.phase < 0.5 ? "Waxing" : "Waning";
                    const moonEmoji = getMoonPhaseEmoji(moonPercent, moonStatus);

                    // Moonrise/set
                    const moonTimes = SunCalc.getMoonTimes(currentDate, lat, lon);
                    const moonrise = moonTimes.rise ? moonTimes.rise.toLocaleTimeString() : "N/A";
                    const moonset = moonTimes.set ? moonTimes.set.toLocaleTimeString() : "N/A";

                    return {
                        date: dateStr,
                        sunset: sunsetDate.toLocaleTimeString(),
                        endNtw: endNtwDate.toLocaleTimeString(),
                        recommendedTime,
                        moonEmoji,
                        moonPercent,
                        moonrise,
                        moonset
                    };
                } else {
                    console.error("Missing expected data fields in API response for date:", dateStr);
                    return null;
                }
            });
    };

    const datesToFetch = [];
    for (let i = -3; i <= 7; i++) {
        const currentDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + i);
        currentDate.setDate(baseDate.getDate() + i);
        datesToFetch.push(currentDate);
    }

    Promise.all(datesToFetch.map(fetchTimesForDate))
        .then(results => {
            results.forEach(result => {
                if (result) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${result.date}</td>
                        <td>${result.sunset}</td>
                        <td>${result.endNtw}</td>
                        <td>${result.recommendedTime}</td>
                        <td>${result.moonEmoji} ${result.moonPercent}%</td>
                        <td>${result.moonrise} / ${result.moonset}</td>
                    `;
                    resultsBody.appendChild(row);
                }
            });
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to fetch data. Please check the console for more details.");
        });
});

// Get local time zone abbreviation
function getTimeZoneAbbreviation(date = new Date()) {
    const parts = date.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ');
    const abbr = parts[parts.length - 1];
    return abbr.startsWith('GMT') ? 'Local' : abbr;
}

// Convert illumination % and waxing/waning to moon emoji
function getMoonPhaseEmoji(percent, status) {
    const rounded = Math.round(percent / 25) * 25;
    const isWaxing = status === "Waxing";

    if (rounded === 0) return "🌑"; // New Moon
    if (rounded === 25) return isWaxing ? "🌒" : "🌘";
    if (rounded === 50) return isWaxing ? "🌓" : "🌗";
    if (rounded === 75) return isWaxing ? "🌔" : "🌖";
    if (rounded === 100) return "🌕"; // Full Moon

    return "🌕"; // fallback
}


// Set today's date by default
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
});
