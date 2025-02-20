const express = require('express');
const { db } = require('../firebase-config');
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc } = require("firebase/firestore");

const router = express.Router();

// Add a Theatre (Create)
router.post('/', async (req, res) => {
    const { theatreID, name, capacity } = req.body;

    try {
        await setDoc(doc(collection(db, "Theatre"), theatreID), {
            Name: name,
            Capacity: capacity
        });
        res.status(200).json({ message: "Theatre entry added successfully." });
    } catch (error) {
        console.error("Error adding theatre entry:", error);
        res.status(500).json({ error: "Error adding theatre entry: " + error.message });
    }
});

// Get a Theatre (Read)
router.get('/:theatreID', async (req, res) => {
    const { theatreID } = req.params;

    try {
        const theatreDoc = await getDoc(doc(db, "Theatre", theatreID));
        if (theatreDoc.exists()) {
            res.status(200).json(theatreDoc.data());
        } else {
            res.status(404).json({ message: "Theatre not found" });
        }
    } catch (error) {
        console.error("Error getting theatre entry:", error);
        res.status(500).json({ error: "Error getting theatre entry: " + error.message });
    }
});

// Update a Theatre (Update)
router.put('/:theatreID', async (req, res) => {
    const { theatreID } = req.params;
    const { name, capacity } = req.body;

    try {
        const theatreRef = doc(db, "Theatre", theatreID);
        await updateDoc(theatreRef, {
            Name: name,
            Capacity: capacity
        });
        res.status(200).json({ message: "Theatre entry updated successfully." });
    } catch (error) {
        console.error("Error updating theatre entry:", error);
        res.status(500).json({ error: "Error updating theatre entry: " + error.message });
    }
});

// Delete a Theatre (Delete)
router.delete('/:theatreID', async (req, res) => {
    const { theatreID } = req.params;

    try {
        const theatreRef = doc(db, "Theatre", theatreID);
        await deleteDoc(theatreRef);
        res.status(200).json({ message: "Theatre entry deleted successfully." });
    } catch (error) {
        console.error("Error deleting theatre entry:", error);
        res.status(500).json({ error: "Error deleting theatre entry: " + error.message });
    }
});

module.exports = router;