const express = require('express');
const { db } = require('../firebase-config');
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc } = require("firebase/firestore");

const router = express.Router();

// Add a TicketType (Create)
router.post('/', async (req, res) => {
    const { ticketTypeID, name, cost } = req.body;

    try {
        await setDoc(doc(collection(db, "TicketType"), ticketTypeID), {
            Name: name,
            Cost: cost
        });
        res.status(200).json({ message: "TicketType entry added successfully." });
    } catch (error) {
        console.error("Error adding ticket type entry:", error);
        res.status(500).json({ error: "Error adding ticket type entry: " + error.message });
    }
});

// Get a TicketType (Read)
router.get('/:ticketTypeID', async (req, res) => {
    const { ticketTypeID } = req.params;

    try {
        const ticketTypeDoc = await getDoc(doc(db, "TicketType", ticketTypeID));
        if (ticketTypeDoc.exists()) {
            res.status(200).json(ticketTypeDoc.data());
        } else {
            res.status(404).json({ message: "TicketType not found" });
        }
    } catch (error) {
        console.error("Error getting ticket type entry:", error);
        res.status(500).json({ error: "Error getting ticket type entry: " + error.message });
    }
});

// Update a TicketType (Update)
router.put('/:ticketTypeID', async (req, res) => {
    const { ticketTypeID } = req.params;
    const { name, cost } = req.body;

    try {
        const ticketTypeRef = doc(db, "TicketType", ticketTypeID);
        await updateDoc(ticketTypeRef, {
            Name: name,
            Cost: cost
        });
        res.status(200).json({ message: "TicketType entry updated successfully." });
    } catch (error) {
        console.error("Error updating ticket type entry:", error);
        res.status(500).json({ error: "Error updating ticket type entry: " + error.message });
    }
});

// Delete a TicketType (Delete)
router.delete('/:ticketTypeID', async (req, res) => {
    const { ticketTypeID } = req.params;

    try {
        const ticketTypeRef = doc(db, "TicketType", ticketTypeID);
        await deleteDoc(ticketTypeRef);
        res.status(200).json({ message: "TicketType entry deleted successfully." });
    } catch (error) {
        console.error("Error deleting ticket type entry:", error);
        res.status(500).json({ error: "Error deleting ticket type entry: " + error.message });
    }
});

module.exports = router;