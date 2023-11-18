const db = require('../database/db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const jwtSecret = '7Fyv!9kT#Qw$4Zp@2Xs&5vR8yB*E(P'; // Replace with a strong secret key

function getUserIdFromToken(token) {
  try {
      // Decode the token using the secret
      const decoded = jwt.verify(token, jwtSecret);
      
      // Return the user ID from the decoded payload
      return decoded.id;
  } catch (error) {
      console.error("Error decoding the token:", error);
      return null; // Return null if there's any error (e.g., invalid token)
  }
}

async function createNote(req, res) {
  try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
          return res.status(401).json({ success: false, message: "No authorization header provided." });
      }
      const token = authHeader.split(' ')[1];
      if (!token) {
          return res.status(401).json({ success: false, message: "No token provided in authorization header." });
      }
      
      const userId = getUserIdFromToken(token);

      const { title, content, category } = req.body;

      // Fetch category_id based on the category name provided
      const fetchCategoryIdQuery = 'SELECT id FROM categories WHERE name = $1';
      const categoryResult = await db.query(fetchCategoryIdQuery, [category]);
      
      let categoryId = categoryResult.rows[0]?.id;
      
      // If category doesn't exist, insert it
      if (!categoryId) {
          const insertCategoryQuery = 'INSERT INTO categories (name) VALUES ($1) RETURNING id';
          const newCategoryResult = await db.query(insertCategoryQuery, [category]);
          categoryId = newCategoryResult.rows[0].id;
      }

      // Insert the new note into the notes table
      const createNoteQuery = `
          INSERT INTO notes (title, content, category_id) 
          VALUES ($1, $2, $3) 
          RETURNING id, content, last_edited as updatedAt
      `;
      const noteValues = [title, content, categoryId];
      const newNoteResult = await db.query(createNoteQuery, noteValues);
      const newNote = newNoteResult.rows[0];

      // Associate the note with the user in the user_notes table
      const createUserNoteQuery = 'INSERT INTO user_notes (user_id, note_id) VALUES ($1, $2)';
      const userNoteValues = [userId, newNote.id];
      await db.query(createUserNoteQuery, userNoteValues);

      res.status(201).json({
          success: true,
          statusCode: 201,
          message: 'Note created successfully',
          note: {
              id: newNote.id,
              title: title,
              content: newNote.content,
              category: category,
              userId: userId,
              createdAt: newNote.updatedAt,  // Assuming note creation and update happen simultaneously
              updatedAt: newNote.updatedAt
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          success: false,
          statusCode: 500,
          message: 'Internal server error',
          errors: {
              system: 'A system error occurred.'
          }
      });
  }
}

async function shareNoteWithUser(req, res) {
    try {
        const { id } = req.params; // This is the note ID
        const { userEmail } = req.body; // This is the email of the user with whom the note is to be shared
        // First, fetch the user ID based on the provided email
        const userQuery = 'SELECT id FROM users WHERE email = $1';
        const userResult = await db.query(userQuery, [userEmail]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found for the provided email.' });
        }

        const userIdToShareWith = userResult.rows[0].id;

        // Now, insert into the shares table
        const shareQuery = 'INSERT INTO shares (note_id, user_id) VALUES ($1, $2) ON CONFLICT (note_id, user_id) DO NOTHING';
        await db.query(shareQuery, [id, userIdToShareWith]);

        res.status(200).json({ message: `Note shared successfully with user ${userEmail}` });

    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ error: 'Failed to share the note', details: error.message });
    }
}




async function getAllNotes(req, res) {
  try {
      // Extract user ID from JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader) {
          return res.status(401).json({ success: false, message: "No authorization header provided." });
      }
      const token = authHeader.split(' ')[1];
      if (!token) {
          return res.status(401).json({ success: false, message: "No token provided in authorization header." });
      }
      const userId = getUserIdFromToken(token);
      
      // Join the notes table with the user_notes table to get all notes for the specific user
      const query = `
        SELECT notes.*, categories.name AS category_name
        FROM notes 
        JOIN user_notes ON notes.id = user_notes.note_id 
        JOIN categories ON notes.category_id = categories.id
        WHERE user_notes.user_id = $1
    `;
     const userNotes = await db.query(query, [userId]);
    res.status(200).json({ success: true, notes: userNotes.rows });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to retrieve notes' });
  }
}

  
async function getNoteById(req, res) {
  try {
      const { id } = req.params;
      const foundNoteQuery = 'SELECT * FROM notes WHERE id = $1';
      const result = await db.query(foundNoteQuery, [id]);
      const foundNote = result.rows[0];

      if (!foundNote) {
          return res.status(404).json({ error: 'Note not found' });
      }

      res.status(200).json(foundNote);
  } catch (error) {
      console.error(error.stack);
      res.status(500).json({ error: 'Failed to retrieve the note', details: error.message });
  }
}
  
async function updateNote(req, res, io) {
    try {
        const { id } = req.params;
        const { content } = req.body;
        
        const updateNoteQuery = 'UPDATE notes SET content = $1 WHERE id = $2 RETURNING *';
        console.log(`Updating note with ID: ${id} with content: ${content}`);  // Logging before the update
        const result = await db.query(updateNoteQuery, [content, id]);
        const updatedNote = result.rows[0];

        if (!updatedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }

        console.log('Updated note result:', updatedNote);  // Logging the result of the update

        // Emit a WebSocket message to notify clients of the updated note content
        // Broadcast to everyone in the room except the sender
        const roomId = id; // This should be the ID of the note that was updated
        io.to(roomId).emit('noteContentChanged', { updatedContent: content });

        res.status(200).json({ message: 'Note updated successfully', note: updatedNote });
    } catch (error) {
        console.error('Error while updating the note:', error.stack);
        res.status(500).json({ error: 'Failed to update the note', details: error.message });
    }
}



  
async function deleteNote(req, res) {
    console.log("Printing something random");

    console.log("Received DELETE request for noteId:", req.params);
    try {
        const { id } = req.params;

        // Begin a transaction to ensure atomicity
        await db.query('BEGIN');

        // Delete associations from user_notes table
        const deleteUserNoteQuery = 'DELETE FROM user_notes WHERE note_id = $1';
        await db.query(deleteUserNoteQuery, [id]);

        // Delete associations from shares table
        const deleteSharesQuery = 'DELETE FROM shares WHERE note_id = $1';
        await db.query(deleteSharesQuery, [id]);

        // Delete the note from notes table
        const deleteNoteQuery = 'DELETE FROM notes WHERE id = $1 RETURNING *';
        const result = await db.query(deleteNoteQuery, [id]);
        const deletedNote = result.rows[0];

        // Commit the transaction if everything is successful
        await db.query('COMMIT');

        if (!deletedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error(error.stack);

        // Rollback the transaction in case of an error
        await db.query('ROLLBACK');

        res.status(500).json({ error: 'Failed to delete the note', details: error.message });
    }
}

async function setNoteCategory(req, res) {
  try {
      const { id } = req.params;
      const { categoryId } = req.body;
      
      const updateCategoryQuery = 'UPDATE notes SET category_id = $1 WHERE id = $2 RETURNING *';
      const result = await db.query(updateCategoryQuery, [categoryId, id]);
      const updatedNote = result.rows[0];

      if (!updatedNote) {
          return res.status(404).json({ error: 'Note not found' });
      }

      res.status(200).json({ message: 'Note category updated successfully', note: updatedNote });
  } catch (error) {
      console.error(error.stack);
      res.status(500).json({ error: 'Failed to update the note category', details: error.message });
  }
}
async function getSharedNotesForUser(req, res) {
    try {
        // Extract token from the authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, message: "No authorization header provided." });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided in authorization header." });
        }
        
        // Decode the user ID from the JWT token
        const userId = getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Invalid token." });
        }

        // Construct the SQL query to fetch notes shared with the user
        const query = `
            SELECT notes.* 
            FROM notes 
            JOIN shares ON notes.id = shares.note_id 
            WHERE shares.user_id = $1;
        `;

        // Execute the query
        const sharedNotesResult = await db.query(query, [userId]);

        // Return the shared notes
        res.status(200).json({ success: true, sharedNotes: sharedNotesResult.rows });
    } catch (error) {
        console.error("Error retrieving shared notes:", error);
        res.status(500).json({ success: false, message: 'Failed to retrieve shared notes' });
    }
}


module.exports = {
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote,
    setNoteCategory,
    shareNoteWithUser,
    getSharedNotesForUser
};
