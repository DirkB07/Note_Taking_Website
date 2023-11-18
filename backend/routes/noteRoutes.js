module.exports = (io) => {
    const express = require('express');
    const router = express.Router();
    const noteController = require('../controllers/noteController');
    const jsonParser = express.json();

    router.get('/shared-notes', jsonParser, noteController.getSharedNotesForUser);
    router.post('/create', jsonParser, noteController.createNote);
    router.get('/getAll', jsonParser, noteController.getAllNotes);
    router.get('/:id', jsonParser, noteController.getNoteById);
    
    // Replace the existing update route with the modified one that passes io
    router.put('/:id/update', jsonParser, (req, res) => noteController.updateNote(req, res, io));
    
    router.delete('/:id/delete', jsonParser, noteController.deleteNote);
    router.put('/:id/setCategory', jsonParser, noteController.setNoteCategory);
    router.post('/:id/share', jsonParser, noteController.shareNoteWithUser);

    return router;
};



