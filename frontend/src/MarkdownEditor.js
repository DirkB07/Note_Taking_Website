import React, { useState, useEffect, useRef } from 'react';
import './MarkdownEditor.css';
import io from 'socket.io-client';
import { marked } from 'marked';

function MarkdownEditor({ selectedNote }) {
    const [markdownText, setMarkdownText] = useState(selectedNote ? selectedNote.content : '');
    const [socket, setSocket] = useState(null);
    const [socketTriggered, setSocketTriggered] = useState(false);
    const [lastSavedContent, setLastSavedContent] = useState(markdownText);
    const previousNoteIdRef = useRef();

    const saveCurrentNoteContent = async () => {
        if (markdownText !== lastSavedContent) {
            const token = localStorage.getItem('userToken');
            try {
                const response = await fetch(`http://localhost:3000/notes/${selectedNote.id}/update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ content: markdownText }),
                });

                if (response.ok) {
                    setLastSavedContent(markdownText);
                } else {
                    throw new Error('Failed to save the note');
                }
            } catch (error) {
                console.error('There was an error saving the note:', error);
            }
        }
    };

    const debouncedSave = debounce(saveCurrentNoteContent, 1000);

    useEffect(() => {
        setMarkdownText(selectedNote ? selectedNote.content : "");
    }, [selectedNote]);

    useEffect(() => {
        if (selectedNote) {
            previousNoteIdRef.current = selectedNote.id; // Store the current note ID for future reference
        }

        if (socket) {
            if (previousNoteIdRef.current) {
                socket.emit('leaveRoom', { roomId: previousNoteIdRef.current }); // Use the ref to get the previous note ID
            }
            socket.disconnect();
            setSocket(null);
        }

        if (selectedNote && selectedNote.category_id === 10) {
            const newSocket = io('http://localhost:3000');
            setSocket(newSocket);

            newSocket.on('error', (error) => {
                alert("An error occurred: " + error.message);
            });

            newSocket.on('connect', () => {
                alert("Successfully connected to the WebSocket server note!");
                newSocket.emit('joinRoom', { roomId: selectedNote.id });
            });

            newSocket.on('noteContentChanged', (data) => {
                // Check if the note IDs match
                if (selectedNote.id !== data.roomId) {
                    return;
                }
                
                if (data.senderId === newSocket.id) {
                    alert("I'm returning!")
                    return;
                }

                setSocketTriggered(true);
                setMarkdownText(data.updatedContent);
            });
        }

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [selectedNote]);
    

    useEffect(() => {
        const previewElement = document.getElementById('preview');
        previewElement.innerHTML = marked(markdownText);
    }, [markdownText]);

    const handleInputChange = (e) => {
        setMarkdownText(e.target.value);

        if (!socketTriggered) {
            debouncedSave();
            socket && socket.emit('noteContentChanged', { 
              roomId: selectedNote.id, 
              updatedContent: e.target.value,
              senderId: socket.id
            });
        } else {
            setSocketTriggered(false);
        }
    };

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    return (
        <div className="markdown-editor-container">
            <div className="editor-pane">
                <textarea value={markdownText} onChange={handleInputChange} placeholder="Write your markdown here" />
            </div>
            <div className="preview-pane">
                <div id="preview" className="pane"></div>
            </div>
            <button className="save-button" onClick={saveCurrentNoteContent}>
                Save
            </button>
        </div>
    );
}

export default MarkdownEditor;