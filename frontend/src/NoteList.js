import React, { useEffect, useState } from 'react';
import './NoteList.css';


function NoteList({ notes = [], onNoteClick, onToggleNotes, onDeleteNote }) {
  const [showNotes, setShowNotes] = useState(false);

  const toggleNotes = () => {
      setShowNotes((prevShowNotes) => !prevShowNotes);
      
      // Call the fetchNotesFromBackend function when the dropdown is toggled
      if (onToggleNotes) {
          onToggleNotes();
      }
  };

  const handleNoteClick = (note) => {
    onNoteClick(note);     // Call the original onNoteClick function
    setShowNotes(false);  // Collapse the sidebar
  }

  const handleDeleteClick = (noteId) => {
    if (onDeleteNote) {
      onDeleteNote(noteId);
    }
  };

  useEffect(() => {
    const noteTitles = document.querySelector('.note-titles');

    if (showNotes) {
      noteTitles.style.display = 'block'; // Show titles
    } else {
      noteTitles.style.display = 'none'; // Hide titles
    }
  }, [showNotes]);

  return (
    <div className="notes-menu">
      <button className="toggle-button" onClick={toggleNotes}>
        <p className="notes-dropdown-border">Notes Dropdown</p>
      </button>
      <ul className={`note-titles ${showNotes ? 'visible' : ''}`}>
        {notes.map((note) => {
          return (
            <li className="dropdown-li" key={note.id}>
            <div className="note-item" onClick={() => handleNoteClick(note)}>
              <span className="note-title text-color">{note.title}</span>
              <span className="delete-icon" onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering handleNoteClick when delete is clicked
                  console.log("Attempting to delete note with ID:", note.id);
                  handleDeleteClick(note.id)}}>X</span> {/* Delete Icon */}
            </div>
          </li>
          );
        })}
      </ul>
    </div>
  );
}

export default NoteList;
