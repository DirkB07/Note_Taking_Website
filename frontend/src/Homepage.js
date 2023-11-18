import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './homepage.css';
import MarkdownEditor from './MarkdownEditor';
import NoteList from './NoteList';
import Login from './Login';


function Homepage() {
  const [allNotes, setAllNotes] = useState([]);
  const token = localStorage.getItem('userToken');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [markdownText, setMarkdownText] = useState('');
  const sidebarRef = React.useRef(null);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharedNotes, setSharedNotes] = useState([]);
  const [isSharedNotesDropdownOpen, setSharedNotesDropdownOpen] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');




  useEffect(() => {
    // Check token validity when the component mounts
    checkTokenValidity();
  }, []);

  const checkTokenValidity = async () => {
    try {
      const response = await fetch('http://localhost:3000/user/validate', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status == 403) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error checking token validity:', error);
    }
  };

  const handleNoteClick = (note) => {
    if (note.shared) { // Assuming that the note object has a 'shared' property to identify shared notes
      fetchSingleNoteFromBackend(note.id);
    } else {
      setSelectedNote(note);
    }
  };

  
  useEffect(() => {
    fetchAvatarFromBackend();
}, []);

  const fetchAvatarFromBackend = () => {
    fetch('http://localhost:3000/user/avatar', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ` + token,
        },
    })
    .then(response => response.json())
    .then(data => {
        // alert('Avatar Data:', data);
        // alert(data.success)
        // alert(data.avatar_url)
        if (data.success && data.avatar) {
            setAvatar(data.avatar_url);
        } else {
            setAvatar('https://www.testhouse.net/wp-content/uploads/2021/11/default-avatar.jpg');  // Point to the default avatar in the public directory
        }
    })
    .catch(error => console.error('Error fetching avatar:', error));
};



  useEffect(() => {
    fetchSharedNotesFromBackend();
}, []);
const handleSharedNotesClick = () => {
  fetchSharedNotesFromBackend();
};

const fetchSharedNotesFromBackend = () => {
  fetch('http://localhost:3000/notes/shared-notes', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ` + token,
      },
  })
  .then(response => {

      if (!response.ok) {
          
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {  // Alert the data received from the server
      if (data.success && data.sharedNotes) {
          setSharedNotes(data.sharedNotes);
      } else {
          alert('Failed to retrieve shared notes. Data.success might be false or sharedNotes may not be present.');
      }
  })
  .catch(error => {
      console.error('Error fetching shared notes:', error);
      alert('Error fetching shared notes: ' + error.message);
  });
};


  const openShareModal = () => {
    if (!selectedNote) {
      alert("Please select a note first!");
      return;
    }
    setShareModalOpen(true);
  };
  
  const handleShareNote = async () => {
    try {
      const response = await fetch(`http://localhost:3000/notes/${selectedNote.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ` + token,
        },
        body: JSON.stringify({ userEmail: shareEmail }),
      });
      const responseText = await response.text();
      if (response.ok) {
        alert('Note shared successfully!');
        setShareModalOpen(false);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to share the note.');
      }
    } catch (error) {
      console.error('Error sharing the note:', error);
      alert(error)
      alert('Failed to share the note. Please try again.');
    }
  };
  
  const navigate = useNavigate();

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowMenu(false);
    }
};
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  const handleProfileUpdate = () => {
    navigate('/update-or-delete-user');
  };


  useEffect(() => {
    // Fetch notes from the backend when the component mounts
    fetchNotesFromBackend();
  }, []);
  const fetchNotesFromBackend = () => {
    fetch('http://localhost:3000/notes/getAll', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ` + token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data.success && data.notes) {
          setAllNotes(data.notes);
          const extractedCategories = [...new Set(data.notes.map(note => note.category_name))];
          setCategories(extractedCategories);
        } else {
          alert('Failed to retrieve notes.');
        }
      })
      .catch((error) => {
        console.error('Error fetching notes:', error);
      });
  };





  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateNoteModalOpen, setCreateNoteModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categories, setCategories] = useState([]); // Assuming you fetch categories from the server

  // Function to open the create note modal
  const openCreateNoteModal = () => {
    setCreateNoteModalOpen(true);
  };

  // Function to close the create note modal
  const closeCreateNoteModal = () => {
    setCreateNoteModalOpen(false);
    // Reset input fields
    setNewNoteTitle('');
    setSelectedCategory('');
    setNewCategoryName('');
  };

  // Function to handle creating a new note
  const handleCreateNewNote = async () => {
    try {
      await createNewNote();
      fetchNotesFromBackend(); // Refetch all notes
      closeCreateNoteModal();
    } catch (error) {
      console.error('Error creating a new note:', error);
    }
  };
  

// Function to handle deleting a note

const handleDeleteNote = async (noteId) => {
  console.log("Received noteId in handleDeleteNote:", noteId);
  try {
    await deleteNote(noteId);  // Your existing delete note logic
    fetchNotesFromBackend();  // To refetch notes after deletion
  } catch (error) {
    console.error("Failed to delete note:", error);
  }
};


  async function createNewNote() {
    try {
      // Retrieve the user's token from local storage
      const userToken = localStorage.getItem('userToken');

      if (!userToken) {
        // Handle the case where the user is not authenticated
        return;
      }

      const categoryToUse =
        selectedCategory === 'new' ? newCategoryName : selectedCategory;

      // Data for the new note (modify this as needed)
      const newNoteData = {
        title: newNoteTitle,
        content: 'Content',
        category: categoryToUse,
      };

      // Make a POST request to create a new note

      const response = await fetch('http://localhost:3000/notes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ` + token,
        },
        body: JSON.stringify(newNoteData),
      });

      if (response.ok) {
        // Handle success, e.g., show a success message or update the UI
        // Optionally, you can fetch the updated list of notes from the backend
        // and set them in your state.
      } else {
        // Handle the case where the request was not successful
        console.error('Error creating a new note:', response.statusText);
        // Handle error, e.g., show an error message to the user
      }
    } catch (error) {
      // Handle other errors (e.g., network errors)
      console.error('Error creating a new note:', error);
      // Handle error, e.g., show an error message to the user
    }
  }

    // Attempting the Delete Note

  async function deleteNote(noteId) {
    console.log("Attempting to delete note in deleteNote function with ID:", noteId);
    try {
        // Retrieve the user's token from local storage
        const userToken = localStorage.getItem('userToken');

        if (!userToken) {
            // Handle the case where the user is not authenticated
            console.error('User is not authenticated.');
            return;
        }

        if (!noteId) {
            // Handle the case where no note is selected
            console.error('No noteId provided to delete.');
            return;
        }

        // Make a DELETE request to remove the selected note

        const response = await fetch(`http://localhost:3000/notes/${noteId}/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ` + userToken,
            },
        });

        if (response.ok) {
            // Handle success, e.g., show a success message or update the UI
            // Optionally, you can fetch the updated list of notes from the backend
            // and set them in your state to reflect the deleted note.
            alert('Note deleted successfully!');
            // Example of updating the note list after deleting a note:
            // fetchNotesFromBackend();
        } else {
            // Handle the case where the request was not successful
            const data = await response.json();
            console.error('Error deleting the note:', response.statusText);
            alert(data.message || 'Failed to delete the note.');
        }
    } catch (error) {
        // Handle other errors (e.g., network errors)
        console.error('Error deleting the note:', error);
        alert('Failed to delete the note. Please try again.');
    }
  }

  async function fetchSingleNoteFromBackend(noteId) {
    try {
      const response = await fetch(`http://localhost:3000/notes/${noteId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ` + token,
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
  
      if (data.success && data.note) {
        setSelectedNote(data.note);
      } else {
        alert('Failed to retrieve the note. Server says: ' + (data.message || 'No additional info'));
      }
      
    } catch (error) {
      console.error('Error fetching the note:', error);
    }
  }

  let sortedNotes = [...allNotes]; // Copy to prevent modifying the original state
  if (sortOrder === 'desc') {
      sortedNotes.sort((a, b) => new Date(b.last_edited) - new Date(a.last_edited)); // Assuming each note has a lastEdited property
  } else if (sortOrder === 'asc') {
      sortedNotes.sort((a, b) => new Date(a.last_edited) - new Date(b.last_edited));
  }
  
  let filteredNotes = sortedNotes.filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()));


  return (
    
    <div className={`homepage ${showMenu ? 'menu-open' : ''}`}>
      <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
        <div className="menu-line"></div>
        <div className="menu-line"></div>
        <div className="menu-line"></div>
      </div>
      {/* Overlay for dimming background */}
      {isCreateNoteModalOpen && (
        <div className="overlay">
          <div className="create-note-modal">
            <div className="modal-content">
              <h2>Create New Note</h2>
              <label htmlFor="noteTitle">Title:</label>
              <input
                type="text"
                id="noteTitle"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
              />
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setNewCategoryName('');
                  }
                  setSelectedCategory(e.target.value);
                }}
              >
                <option value="">Select a category</option>
                {/* Iterate over existing categories and create options */}
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
                {/* Add an option to add a new category */}
                <option value="new">Add New Category</option>
              </select>
              {/* Input field for entering a new category name */}
              {selectedCategory === 'new' && (
                <input
                  type="text"
                  id="newCategoryName"
                  placeholder="Enter new category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              )}
              <div className="modal-buttons">
                <button onClick={handleCreateNewNote}>Save</button>
                <button onClick={closeCreateNoteModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
          {isShareModalOpen && (
      <div className="overlay">
        <div className="share-note-modal">
          <div className="modal-content">
            <h2>Share Note</h2>
            <label htmlFor="shareEmail">Email:</label>
            <input
              type="text"
              id="shareEmail"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleShareNote}>Share</button>
              <button onClick={() => setShareModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    )}
      <div className={`sidebar ${showMenu ? 'show' : ''}`} ref={sidebarRef}>
        <div className='sidebar-content'>
        <h3>Search Notes</h3>
    <input 
        type="text" 
        placeholder="Search by title" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
    />{searchTerm && <button onClick={() => setSearchTerm('')}>Clear</button>}
          <h3>Filter</h3>
        <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="note-filter-dropdown"
        >
            <option value="All">All Categories</option>
            {categories.map((category, index) => (
                <option key={index} value={category}>
                    {category}
                </option>
            ))}
        </select>
        <h3>Sort</h3>
        <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="note-sort-dropdown"
        >
            <option value="desc">Last Edited (Newest First)</option>
            <option value="asc">Last Edited (Oldest First)</option>
        </select>
          <div className="note-list">
          <NoteList 
              notes={filterCategory === 'All' ? filteredNotes : filteredNotes.filter(note => note.category_name === filterCategory)} 
              onNoteClick={handleNoteClick}
              onToggleNotes={fetchNotesFromBackend}
              onDeleteNote={handleDeleteNote}
          />

          </div>
          <button onClick={openCreateNoteModal}>New note</button>
          <button onClick={handleCreateNewNote}>Save note</button>
          <h3 onClick={() => {
              setSharedNotesDropdownOpen(!isSharedNotesDropdownOpen);
              fetchSharedNotesFromBackend();
          }}>
              Shared Notes
              {/* Optional: Add an arrow icon that points down or right depending on the dropdown state */}
          </h3>
        {isSharedNotesDropdownOpen && (
            <div className="shared-notes-dropdown">
                {/* Iterate over sharedNotes and display them */}
                {sharedNotes.map(note => (
                    <div key={note.id} onClick={() => setSelectedNote(note)}>
                        {note.title}
                    </div>
                ))}
            </div>
        )}
        </div>
      </div>

      <div className="top-right-buttons">
        <button onClick={handleProfileUpdate} className="profile-button">
          Edit Profile
        </button>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
        <img src={avatar} alt="User Avatar" className="user-avatar" />

      </div>

      <div className="content">
        <div className="header">
          <h1 className="header-title">NoteBody</h1>
          <h2 className="selected-note-title">{selectedNote && `Current Note: ${selectedNote.title}`}</h2>
          <div className="note-buttons">
          <button className="share-button" onClick={openShareModal}>Share</button>
          </div>
        </div>
        <div className="editor-wrapper">
          <div className="editor-pane">
            <MarkdownEditor selectedNote={selectedNote} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
