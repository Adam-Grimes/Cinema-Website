const express = require('express');
const { db } = require('../firebase-config');
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc } = require("firebase/firestore");

const router = express.Router();

// Add a Booking (Create)
router.post('/', async (req, res) => {
    const { bookingID, screeningID, noOfSeats, cost, emailAddress } = req.body;

    try {
        await setDoc(doc(collection(db, "Booking"), bookingID), {
            ScreeningID: screeningID,
            NoOfSeats: noOfSeats,
            Cost: cost,
            EmailAddress: emailAddress
        });
        res.status(200).json({ message: "Booking added successfully." });
    } catch (error) {
        res.status(500).json({ error: "Error adding booking: " + error.message });
    }
});

// Get a Booking (Read)
router.get('/:bookingID', async (req, res) => {
    const { bookingID } = req.params;

    try {
        const bookingDoc = await getDoc(doc(db, "Booking", bookingID));
        if (bookingDoc.exists()) {
            res.status(200).json(bookingDoc.data());
        } else {
            res.status(404).json({ message: "Booking not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error retrieving booking: " + error.message });
    }
});

// Update a Booking (Update)
router.put('/:bookingID', async (req, res) => {
    const { bookingID } = req.params;
    const { screeningID, noOfSeats, cost, emailAddress } = req.body;

    try {
        const bookingRef = doc(db, "Booking", bookingID);
        await updateDoc(bookingRef, {
            ScreeningID: screeningID,
            NoOfSeats: noOfSeats,
            Cost: cost,
            EmailAddress: emailAddress
        });
        res.status(200).json({ message: "Booking updated successfully." });
    } catch (error) {
        res.status(500).json({ error: "Error updating booking: " + error.message });
    }
});

// Delete a Booking (Delete)
router.delete('/:bookingID', async (req, res) => {
    const { bookingID } = req.params;

    try {
        const bookingRef = doc(db, "Booking", bookingID);
        await deleteDoc(bookingRef);
        res.status(200).json({ message: "Booking deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Error deleting booking: " + error.message });
    }
});

module.exports = router;