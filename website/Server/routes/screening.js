const express = require('express');
const { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  runTransaction,
  query,
  where
} = require("firebase-admin/firestore");
const { db } = require('../firebase-config');

const router = express.Router();

// ✅ Create Screening with auto-generated ID
router.post('/', async (req, res) => {
    const { FilmID, TheatreID, Date, StartTime, SeatsRemaining } = req.body;

    // Validate required fields
    if (!FilmID || !TheatreID || !Date || !StartTime || SeatsRemaining === undefined) {
        return res.status(400).json({ 
            error: "Missing required fields: FilmID, TheatreID, Date, StartTime, SeatsRemaining" 
        });
    }

    // Validate data types
    if (typeof FilmID !== 'string' || typeof TheatreID !== 'string' || typeof Date !== 'string' || 
        typeof StartTime !== 'string' || typeof SeatsRemaining !== 'number') {
        return res.status(400).json({ 
            error: "Invalid data types: FilmID, TheatreID, Date, StartTime must be strings; SeatsRemaining must be a number" 
        });
    }

    try {
        // Check if Film exists
        const filmRef = db.collection("Film").doc(FilmID);
        const filmDoc = await filmRef.get();
        if (!filmDoc.exists) {
            return res.status(404).json({ error: `FilmID ${FilmID} not found` });
        }

        // Check if Theatre exists
        const theatreRef = db.collection("Theatre").doc(TheatreID);
        const theatreDoc = await theatreRef.get();
        if (!theatreDoc.exists) {
            return res.status(404).json({ error: `TheatreID ${TheatreID} not found` });
        }

        // Generate new ScreeningID using a counter (counters collection is assumed to be named 'counters')
        const counterRef = doc(db, 'counters', 'Screening');
        let newCount;

        // Atomic transaction to increment counter
        await db.runTransaction(async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            newCount = (counterDoc.exists ? counterDoc.data().count : 0) + 1;
            transaction.set(counterRef, { count: newCount }, { merge: true });
        });

        const newScreeningID = `Screening${newCount}`;

        // Create the new screening document (store FilmID and TheatreID as references)
        await setDoc(doc(collection(db, "Screening"), newScreeningID), {
            FilmID: filmRef,
            TheatreID: theatreRef,
            Date,
            StartTime,
            SeatsRemaining
        });

        res.status(200).json({ 
            message: "Screening created successfully",
            generatedId: newScreeningID 
        });
    } catch (error) {
        res.status(500).json({ error: "Error creating screening: " + error.message });
    }
});



// ✅ Dedicated Endpoint: Get Screenings by FilmID
router.get('/byFilm/:filmID', async (req, res) => {
    const { filmID } = req.params;
    console.log("Fetching screenings for Film Document ID:", filmID); // ✅ Debugging

    try {
        const filmRef = db.collection("Film").doc(filmID); // ✅ Correct reference
        const screeningsSnapshot = await db.collection("Screening").where("FilmID", "==", filmRef).get();

        if (screeningsSnapshot.empty) {
            console.log("No screenings found for:", filmID);
            return res.status(200).json([]); // ✅ Return empty array if no screenings
        }

        const screenings = screeningsSnapshot.docs.map(doc => ({
            ScreeningID: doc.id,
            ...doc.data()
        }));

        console.log("Returning screenings:", screenings); // ✅ Debugging
        res.status(200).json(screenings);
    } catch (error) {
        console.error("Error fetching screenings:", error);
        res.status(500).json({ error: "Failed to fetch screenings" });
    }
});


// ✅ Get Single Screening by ID
router.get('/:screeningID', async (req, res) => {
    const { screeningID } = req.params;
    if (!screeningID.startsWith("Screening")) {
        return res.status(400).json({ error: "Invalid ScreeningID format" });
    }
    try {
        const screeningRef = db.collection("Screening").doc(screeningID);
        const screeningDoc = await screeningRef.get();
        if (!screeningDoc.exists) {
            return res.status(404).json({ message: "Screening not found" });
        }
        const data = screeningDoc.data();
        res.status(200).json({
            ScreeningID: screeningID,
            FilmID: data.FilmID.id,
            TheatreID: data.TheatreID.id,
            Date: data.Date,
            StartTime: data.StartTime,
            SeatsRemaining: data.SeatsRemaining
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching screening: " + error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const screeningsSnapshot = await db.collection("Screening").get();
        const screenings = screeningsSnapshot.docs.map(doc => {
            const data = doc.data();

            return {
                ScreeningID: doc.id, 
                FilmID: data.FilmID.id,  // ✅ Convert Firestore reference to string
                TheatreID: data.TheatreID.id, // ✅ Convert Firestore reference to string
                Date: data.Date,
                StartTime: data.StartTime,
                SeatsRemaining: data.SeatsRemaining
            };
        });

        res.status(200).json(screenings);
    } catch (error) {
        res.status(500).json({ error: "Error fetching screenings: " + error.message });
    }
});

// ✅ Update Screening
router.put('/:screeningID', async (req, res) => {
    const { screeningID } = req.params;
    const { FilmID, TheatreID, Date, StartTime, SeatsRemaining } = req.body;
    if (!FilmID && !TheatreID && !Date && !StartTime && SeatsRemaining === undefined) {
        return res.status(400).json({ 
            error: "At least one field is required for update: FilmID, TheatreID, Date, StartTime, SeatsRemaining" 
        });
    }
    if (FilmID && typeof FilmID !== 'string') {
        return res.status(400).json({ error: "FilmID must be a string" });
    }
    if (TheatreID && typeof TheatreID !== 'string') {
        return res.status(400).json({ error: "TheatreID must be a string" });
    }
    if (Date && typeof Date !== 'string') {
        return res.status(400).json({ error: "Date must be a string" });
    }
    if (StartTime && typeof StartTime !== 'string') {
        return res.status(400).json({ error: "StartTime must be a string" });
    }
    if (SeatsRemaining !== undefined && typeof SeatsRemaining !== 'number') {
        return res.status(400).json({ error: "SeatsRemaining must be a number" });
    }
    try {
        const screeningRef = db.collection("Screening").doc(screeningID);
        const screeningDoc = await screeningRef.get();
        if (!screeningDoc.exists) {
            return res.status(404).json({ message: "Screening not found" });
        }
        const updateData = {};
        if (FilmID) {
            const filmRef = db.collection("Film").doc(FilmID);
            const filmDoc = await filmRef.get();
            if (!filmDoc.exists) {
                return res.status(404).json({ error: `FilmID ${FilmID} not found` });
            }
            updateData.FilmID = filmRef;
        }
        if (TheatreID) {
            const theatreRef = db.collection("Theatre").doc(TheatreID);
            const theatreDoc = await theatreRef.get();
            if (!theatreDoc.exists) {
                return res.status(404).json({ error: `TheatreID ${TheatreID} not found` });
            }
            updateData.TheatreID = theatreRef;
        }
        if (Date) updateData.Date = Date;
        if (StartTime) updateData.StartTime = StartTime;
        if (SeatsRemaining !== undefined) updateData.SeatsRemaining = SeatsRemaining;
        await screeningRef.update(updateData);
        res.status(200).json({ message: "Screening updated successfully." });
    } catch (error) {
        res.status(500).json({ error: "Error updating screening: " + error.message });
    }
});

// ✅ Delete Screening
router.delete('/:screeningID', async (req, res) => {
    const { screeningID } = req.params;
    if (!screeningID.startsWith("Screening")) {
        return res.status(400).json({ error: "Invalid ScreeningID format" });
    }
    try {
        const screeningRef = db.collection("Screening").doc(screeningID);
        const screeningDoc = await screeningRef.get();
        if (!screeningDoc.exists) {
            return res.status(404).json({ message: "Screening not found" });
        }
        await screeningRef.delete();
        res.status(200).json({ message: "Screening deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Error deleting screening: " + error.message });
    }
});

module.exports = router;
