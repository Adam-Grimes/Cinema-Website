// Function to fetch all films
async function fetchAllFilms() {
    const container = document.getElementById('movies-container');
    try {
        console.log("Attempting to fetch films...");
        const response = await fetch('/api/Film'); // Fetch all films
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const films = await response.json();
        console.log("Fetched films response:", films);
        if (!Array.isArray(films)) {
            console.error("Error: Response is not an array", films);
            container.innerHTML = "<p>Error: Unexpected data format.</p>";
            return;
        }
        console.log(films); // Log all films data
 
        if (films.length > 0) {
            films.forEach(film => {
                container.insertAdjacentHTML('beforeend', `
                    <div class="film-card">
                        <img src="${film.Poster}" alt="${film.Name || "Unknown Title"}" class="film-poster">
                        <div class="film-detail-info">
                            <h2>${film.Name || "Unknown Title"}</h2>
                            <p><strong>Genre:</strong> ${film.Genre || "N/A"}</p>
                            <p><strong>Category:</strong> ${film.Category || "N/A"}</p>
                            <p><strong>Duration:</strong> ${film.Duration || "N/A"} minutes</p>
                            <a href="${film.Trailer}" target="_blank" class="trailer-btn">Watch Trailer</a>
                        </div>
                        <div id="screenings-${film.FilmID}" class="screenings-container"></div>
                    </div>
                `);
            });
            await fetchAllScreenings();
        } else {
            container.innerHTML = "<p>No films available.</p>";
        }
    } catch (error) {
        console.error('Error fetching films:', error);
        container.innerHTML = `<p>Failed to load films. Error: ${error.message}</p>`;
    }
}
 
// Function to fetch all screenings
async function fetchAllScreenings() {
    console.log("Fetching all screenings...");
    const container = document.getElementById('movies-container');
    try {
        const response = await fetch('/api/Screening'); // Fetch all screenings
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
 
        const screenings = await response.json();
        console.log("Fetched screenings response:", screenings); // Log screenings data
 
        if (screenings.length > 0) {
            screenings.forEach(screening => {
                const filmContainer = document.getElementById(`screenings-${screening.FilmID}`);
                if (filmContainer) {
                    filmContainer.insertAdjacentHTML('beforeend', `
                        <div class="screening-card">
                            <p><strong>Date:</strong> ${screening.Date || "N/A"}</p>
                            <button class="book-now-btn" data-id="${screening.ScreeningID}">${screening.StartTime || "N/A"}</button>
                            <hr>
                        </div>
                    `);
                }
            });
 
            // Attach event listeners for "Book Now" buttons
            document.querySelectorAll('.book-now-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const screeningId = button.getAttribute('data-id');
                    window.location.href = `booking.html?screeningId=${screeningId}`;
                });
            });
        } else {
            container.insertAdjacentHTML('beforeend', "<p>No screenings available.</p>");
        }
    } catch (error) {
        console.error('Error fetching screenings:', error);
        container.insertAdjacentHTML('beforeend', `<p>Failed to load screenings. Error: ${error.message}</p>`);
    }
}
 
// Replace window.onload with DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('movies-container');
    if (!container) {
        console.error("movies-container element not found.");
    }
    fetchAllFilms();
});