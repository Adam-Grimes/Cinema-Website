document.addEventListener("DOMContentLoaded", () => {
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  const screeningId = getQueryParam('screeningId');
  console.log("Extracted screeningId:", screeningId);
  let theatreId = null;
  let theatreConfig = null;
  let bookedSeats = [];

  // Fetch screening details to get TheatreID
  fetch(`/api/Screening/${screeningId}`)
    .then(res => res.json())
    .then(screening => {
      console.log("Fetched screening details:", screening);
      if (screening) {
        theatreId = screening.TheatreID;
        return fetch(`/api/Theatre/${theatreId}`);
      }
    })
    .then(res => res.json())
    .then(theatre => {
      console.log("Fetched theatre details:", theatre);
      if (theatre) {
        theatreConfig = theatre;
        renderSeatingChart(theatre.Rows, theatre.Columns);
      }
    })
    .catch(err => console.error("Error fetching screening/theatre:", err));

  // Function to fetch booked seats and update the seating chart
  const fetchBookedSeats = () => {
    // Expecting the Ticket endpoint to filter by ScreeningID via query string
    fetch(`/api/Ticket?ScreeningID=${screeningId}`)
      .then(res => res.json())
      .then(tickets => {
        console.log("Fetched tickets:", tickets);
        bookedSeats = tickets.map(ticket => ({
          row: ticket.SeatRow,
          col: ticket.SeatColumn
        }));
        if (theatreConfig) {
          renderSeatingChart(theatreConfig.Rows, theatreConfig.Columns);
        }
      })
      .catch(err => console.error("Error fetching tickets:", err));
  };

  // Initial fetch for booked seats
  fetchBookedSeats();

  function renderSeatingChart(rows, cols) {
    const chartDiv = document.getElementById('seating-chart');
    if (!rows || !cols) return;
    chartDiv.innerHTML = '';
    for (let r = 1; r <= rows; r++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'seat-row';
      for (let c = 1; c <= cols; c++) {
        const seatBtn = document.createElement('button');
        seatBtn.className = 'seat';
        seatBtn.textContent = `${r}-${c}`;
        const isBooked = bookedSeats.some(seat => seat.row === r && seat.col === c);
        if (isBooked) {
          seatBtn.disabled = true;
          seatBtn.classList.add('booked');
        } else {
          seatBtn.addEventListener('click', () => {
            seatBtn.classList.toggle('selected');
          });
        }
        rowDiv.appendChild(seatBtn);
      }
      chartDiv.appendChild(rowDiv);
    }
  }

  // Handle booking confirmation
  document.getElementById('confirm-booking').addEventListener('click', () => {
    const selectedSeats = [];
    document.querySelectorAll('.seat.selected').forEach(btn => {
      const [row, col] = btn.textContent.split('-').map(Number);
      selectedSeats.push({ row, col });
    });
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }
    const email = prompt("Please enter your email address:");
    if (!email) return;
    // Create booking
    fetch(`/api/Booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ EmailAddress: email, NoOfSeats: selectedSeats.length, Cost: 0 })
    })
      .then(res => res.json())
      .then(bookingRes => {
        const bookingId = bookingRes.generatedId;
        const ticketPromises = selectedSeats.map(seat => {
          return fetch(`/api/Ticket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              BookingID: bookingId,
              ScreeningID: screeningId,
              TicketType: "Default",
              SeatRow: seat.row,
              SeatColumn: seat.col
            })
          }).then(res => res.json());
        });
        return Promise.all(ticketPromises);
      })
      .then(() => {
        alert("Booking confirmed!");
        // Refresh booked seats after booking
        fetchBookedSeats();
      })
      .catch(err => {
        console.error("Error creating booking/tickets:", err);
        alert("Booking failed. Please try again.");
      });
  });
});
