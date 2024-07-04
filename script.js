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

    // Get sunset and end of nautical twilight times
    SunriseSunsetJS.getTimes(new Date(date), lat, lon, (result) => {
        console.log("Sunset:", result.sunset);
        console.log("Nautical Dusk:", result.nauticalDusk);

        const sunsetDate = new Date(result.sunset);
        document.getElementById('sunset').innerText = 'Sunset: ' + sunsetDate.toLocaleTimeString();

        const endNtwDate = new Date(result.nauticalDusk);
        document.getElementById('end_ntw').innerText = 'End of Nautical Twilight: ' + endNtwDate.toLocaleTimeString();

        // Calculate the nearest 15-min increment before the end of nautical twilight
        const roundedEndNtw = new Date(endNtwDate);
        roundedEndNtw.setMinutes(Math.floor(endNtwDate.getMinutes() / 15) * 15);
        roundedEndNtw.setSeconds(0);
        roundedEndNtw.setMilliseconds(0);

        document.getElementById('rounded_end_ntw').innerText = 'Nearest 15-min Increment Before End of Nautical Twilight: ' + roundedEndNtw.toLocaleTimeString();
    });
});

// Set the default date to today
document.addEventListener('DOMContentLoaded', (event) => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    console.log("Default date set to today:", today);
});
