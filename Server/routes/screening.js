const express = require('express');
const { db } = require('../firebase-config');
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc } = require("firebase/firestore");

const router = express.Router();

// Add a Screening (Create)
router.post('/', async (req, res) => {
    const { screeningID, filmID, theatreID, startTime, date, seatsRemaining } = req.body;

    try {
        await setDoc(doc(collection(db, "Screening"), screeningID), {
            FilmID: filmID,
            TheatreID: theatreID,
            StartTime: startTime,
            Date: date,
            SeatsRemaining: seatsRemaining
        });
        res.status(200).json({ message: "Screening entry added successfully." });
    } catch (error) {
        console.error("Error adding screening entry:", error);
        res.status(500).json({ error: "Error adding screening entry: " + error.message });
    }
});

// Get a Screening (Read)
router.get('/:screeningID', async (req, res) => {
    const { screeningID } = req.params;

    try {
        const screeningDoc = await getDoc(doc(db, "Screening", screeningID));
        if (screeningDoc.exists()) {
            res.status(200).json(screeningDoc.data());
        } else {
            res.status(404).json({ message: "Screening not found" });
        }
    } catch (error) {
        console.error("Error getting screening entry:", error);
        res.status(500).json({ error: "Error getting screening entry: " + error.message });
    }
});

// Update a Screening (Update)
router.put('/:screeningID', async (req, res) => {
    const { screeningID } = req.params;
    const { filmID, theatreID, startTime, date, seatsRemaining } = req.body;

    try {
        const screeningRef = doc(db, "Screening", screeningID);
        await updateDoc(screeningRef, {
            FilmID: filmID,
            TheatreID: theatreID,
            StartTime: startTime,
            Date: date,
            SeatsRemaining: seatsRemaining
        });
        res.status(200).json({ message: "Screening entry updated successfully." });
    } catch (error) {
        console.error("Error updating screening entry:", error);
        res.status(500).json({ error: "Error updating screening entry: " + error.message });
    }
});

// Delete a Screening (Delete)
router.delete('/:screeningID', async (req, res) => {
    const { screeningID } = req.params;

    try {
        const screeningRef = doc(db, "Screening", screeningID);
        await deleteDoc(screeningRef);
        res.status(200).json({ message: "Screening entry deleted successfully." });
    } catch (error) {
        console.error("Error deleting screening entry:", error);
        res.status(500).json({ error: "Error deleting screening entry: " + error.message });
    }
});

module.exports = router;