document.getElementById('entitySelect').addEventListener('change', updateFormFields);

function updateFormFields() {
    const entity = document.getElementById('entitySelect').value;
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = ''; // Clear existing fields

    if (entity === 'film') {
        formFields.innerHTML = `
            <label for="filmID">Film ID:</label>
            <input type="text" id="filmID" name="filmID" required><br>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required><br>
            <label for="category">Category:</label>
            <input type="text" id="category" name="category" required><br>
            <label for="genre">Genre:</label>
            <input type="text" id="genre" name="genre" required><br>
            <label for="duration">Duration:</label>
            <input type="text" id="duration" name="duration" required><br>
        `;
    } else if (entity === 'booking') {
        formFields.innerHTML = `
            <label for="bookingID">Booking ID:</label>
            <input type="text" id="bookingID" name="bookingID" required><br>
            <label for="userID">User ID:</label>
            <input type="text" id="userID" name="userID" required><br>
            <label for="filmID">Film ID:</label>
            <input type="text" id="filmID" name="filmID" required><br>
            <label for="screeningID">Screening ID:</label>
            <input type="text" id="screeningID" name="screeningID" required><br>
            <label for="seats">Seats:</label>
            <input type="text" id="seats" name="seats" required><br>
        `;
    } else if (entity === 'screening') {
        formFields.innerHTML = `
            <label for="screeningID">Screening ID:</label>
            <input type="text" id="screeningID" name="screeningID" required><br>
            <label for="filmID">Film ID:</label>
            <input type="text" id="filmID" name="filmID" required><br>
            <label for="theatreID">Theatre ID:</label>
            <input type="text" id="theatreID" name="theatreID" required><br>
            <label for="startTime">Start Time:</label>
            <input type="text" id="startTime" name="startTime" required><br>
            <label for="date">Date:</label>
            <input type="text" id="date" name="date" required><br>
            <label for="seatsRemaining">Seats Remaining:</label>
            <input type="text" id="seatsRemaining" name="seatsRemaining" required><br>
        `;
    } else if (entity === 'theatre') {
        formFields.innerHTML = `
            <label for="theatreID">Theatre ID:</label>
            <input type="text" id="theatreID" name="theatreID" required><br>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required><br>
            <label for="location">Location:</label>
            <input type="text" id="location" name="location" required><br>
            <label for="capacity">Capacity:</label>
            <input type="text" id="capacity" name="capacity" required><br>
        `;
    } else if (entity === 'ticket') {
        formFields.innerHTML = `
            <label for="ticketID">Ticket ID:</label>
            <input type="text" id="ticketID" name="ticketID" required><br>
            <label for="bookingID">Booking ID:</label>
            <input type="text" id="bookingID" name="bookingID" required><br>
            <label for="screeningID">Screening ID:</label>
            <input type="text" id="screeningID" name="screeningID" required><br>
            <label for="ticketType">Ticket Type:</label>
            <input type="text" id="ticketType" name="ticketType" required><br>
            <label for="cost">Cost:</label>
            <input type="text" id="cost" name="cost" required><br>
        `;
    } else if (entity === 'ticketType') {
        formFields.innerHTML = `
            <label for="ticketTypeID">Ticket Type ID:</label>
            <input type="text" id="ticketTypeID" name="ticketTypeID" required><br>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required><br>
            <label for="cost">Cost:</label>
            <input type="text" id="cost" name="cost" required><br>
        `;
    }
}

document.getElementById('addEntityBtn').addEventListener('click', async () => {
    const entity = document.getElementById('entitySelect').value;
    const formData = new FormData(document.getElementById('addEntityForm'));
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`/api/${entity}s`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert(`${entity.charAt(0).toUpperCase() + entity.slice(1)} added successfully!`);
        } else {
            alert(`Failed to add ${entity}.`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred while adding the ${entity}.`);
    }
});

document.getElementById('updateEntityBtn').addEventListener('click', async () => {
    const entity = document.getElementById('entitySelect').value;
    const formData = new FormData(document.getElementById('addEntityForm'));
    const data = Object.fromEntries(formData.entries());
    const entityID = data[`${entity}ID`];

    try {
        const response = await fetch(`/api/${entity}s/${entityID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert(`${entity.charAt(0).toUpperCase() + entity.slice(1)} updated successfully!`);
        } else {
            alert(`Failed to update ${entity}.`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred while updating the ${entity}.`);
    }
});

document.getElementById('getEntityBtn').addEventListener('click', async () => {
    const entity = document.getElementById('manageEntitySelect').value;
    const entityID = document.getElementById('manageEntityID').value;
    const entityDataDiv = document.getElementById('entityData');

    try {
        const response = await fetch(`/api/${entity}s/${entityID}`);
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            entityDataDiv.innerHTML = formatEntityData(entity, entityID, data);
        } else {
            entityDataDiv.innerHTML = `<p>Failed to get ${entity}.</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
        entityDataDiv.innerHTML = `<p>An error occurred while getting the ${entity}.</p>`;
    }
});

function formatEntityData(entity, entityID, data) {
    let formattedData = `<h3>${entity.charAt(0).toUpperCase() + entity.slice(1)}: ${entityID} Data</h3><ul>`;
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            formattedData +=`<li><strong>${key}:</strong> ${data[key]}</li>`;
        }
    }
    formattedData += '</ul>';
    return formattedData;
}

document.getElementById('deleteEntityBtn').addEventListener('click', async () => {
    const entity = document.getElementById('manageEntitySelect').value;
    const entityID = document.getElementById('manageEntityID').value;

    try {
        const response = await fetch(`/api/${entity}s/${entityID}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert(`${entity.charAt(0).toUpperCase() + entity.slice(1)} deleted successfully!`);
        } else {
            alert(`Failed to delete ${entity}.`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred while deleting the ${entity}.`);
    }
});

// Initialize form fields on page load
document.addEventListener('DOMContentLoaded', updateFormFields);
