const express = require('express');
const { db } = require('../firebase-config');
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc } = require("firebase/firestore");

const router = express.Router();

// Add a Ticket (Create)
router.post('/', async (req, res) => {
    const { ticketID, bookingID, screeningID, ticketType, cost } = req.body;

    try {
        await setDoc(doc(collection(db, "Ticket"), ticketID), {
            BookingID: bookingID,
            ScreeningID: screeningID,
            TicketType: ticketType,
            Cost: cost
        });
        res.status(200).json({ message: "Ticket entry added successfully." });
    } catch (error) {
        console.error("Error adding ticket entry:", error);
        res.status(500).json({ error: "Error adding ticket entry: " + error.message });
    }
});

// Get a Ticket (Read)
router.get('/:ticketID', async (req, res) => {
    const { ticketID } = req.params;

    try {
        const ticketDoc = await getDoc(doc(db, "Ticket", ticketID));
        if (ticketDoc.exists()) {
            res.status(200).json(ticketDoc.data());
        } else {
            res.status(404).json({ message: "Ticket not found" });
        }
    } catch (error) {
        console.error("Error getting ticket entry:", error);
        res.status(500).json({ error: "Error getting ticket entry: " + error.message });
    }
});

// Update a Ticket (Update)
router.put('/:ticketID', async (req, res) => {
    const { ticketID } = req.params;
    const updatedData = req.body;

    try {
        const ticketRef = doc(db, "Ticket", ticketID);
        await updateDoc(ticketRef, updatedData);
        res.status(200).json({ message: "Ticket entry updated successfully." });
    } catch (error) {
        console.error("Error updating ticket entry:", error);
        res.status(500).json({ error: "Error updating ticket entry: " + error.message });
    }
});

// Delete a Ticket (Delete)
router.delete('/:ticketID', async (req, res) => {
    const { ticketID } = req.params;

    try {
        const ticketRef = doc(db, "Ticket", ticketID);
        await deleteDoc(ticketRef);
        res.status(200).json({ message: "Ticket entry deleted successfully." });
    } catch (error) {
        console.error("Error deleting ticket entry:", error);
        res.status(500).json({ error: "Error deleting ticket entry: " + error.message });
    }
});

module.exports = router;