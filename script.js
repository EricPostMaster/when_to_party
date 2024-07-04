document.getElementById('coordinates-form').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log("Form submitted");

    const lat = parseFloat(document.getElementById('latitude').value);
    const lon = parseFloat(document.getElementById('longitude').value);
    const date = document.getElementById('date').value;

    console.log("Latitude:", lat);
    console.log("Longitude:", lon);
    console.log("Date:", date);

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

                    // Calculate the nearest 15-min increment before the end of nautical twilight
                    const roundedEndNtw = new Date(endNtwDate);
                    roundedEndNtw.setMinutes(Math.floor(endNtwDate.getMinutes() / 15) * 15);
                    roundedEndNtw.setSeconds(0);
                    roundedEndNtw.setMilliseconds(0);

                    return {
                        date: dateStr,
                        sunset: sunsetDate.toLocaleTimeString(),
                        endNtw: endNtwDate.toLocaleTimeString(),
                        roundedEndNtw: roundedEndNtw.toLocaleTimeString()
                    };
                } else {
                    console.error("Missing expected data fields in API response for date:", dateStr);
                    return null; // Return null if data is missing
                }
            });
    };

    const datesToFetch = [];
    for (let i = -3; i <= 14; i++) {
        const currentDate = new Date(baseDate);
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
                        <td>${result.roundedEndNtw}</td>
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

// Set the default date to today
document.addEventListener('DOMContentLoaded', (event) => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    console.log("Default date set to today:", today);
});
