const express = require('express');
const { db } = require('../firebase-config');
const { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs } = require("firebase/firestore");


const router = express.Router();

// Add a Film (Create)
router.post('/', async (req, res) => {
    const { filmID, name, category, genre, duration } = req.body;

    try {
        await setDoc(doc(collection(db, "Film"), filmID), {
            Name: name,
            Category: category,
            Genre: genre,
            Duration: duration
        });
        res.status(200).json({ message: "Film added successfully." });
    } catch (error) {
        res.status(500).json({ error: "Error adding film: " + error.message });
    }
});

// Get a Film (Read)
router.get('/:filmID', async (req, res) => {
    const { filmID } = req.params;

    try {
        const filmDoc = await getDoc(doc(db, "Film", filmID));
        if (filmDoc.exists()) {
            res.status(200).json(filmDoc.data());
        } else {
            res.status(404).json({ message: "Film not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error retrieving film: " + error.message });
    }
});

// Update a Film (Update)
router.put('/:filmID', async (req, res) => {
    const { filmID } = req.params;
    const { name, category, genre, duration } = req.body;

    try {
        const filmRef = doc(db, "Film", filmID);
        await updateDoc(filmRef, {
            Name: name,
            Category: category,
            Genre: genre,
            Duration: duration
        });
        res.status(200).json({ message: "Film updated successfully." });
    } catch (error) {
        res.status(500).json({ error: "Error updating film: " + error.message });
    }
});

// Delete a Film (Delete)
router.delete('/:filmID', async (req, res) => {
    const { filmID } = req.params;

    try {
        const filmRef = doc(db, "Film", filmID);
        await deleteDoc(filmRef);
        res.status(200).json({ message: "Film deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Error deleting film: " + error.message });
    }
});

// Get all Film IDs
router.get('/', async (req, res) => {
    try {
        const filmsSnapshot = await getDocs(collection(db, "Film"));
        const films = filmsSnapshot.docs.map(doc => ({ id: doc.id }));
        res.status(200).json(films);
    } catch (error) {
        res.status(500).json({ error: "Error fetching films: " + error.message });
    }
});

module.exports = router;
