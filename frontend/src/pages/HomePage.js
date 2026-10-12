import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function HomePage() {
    const [links, setLinks] = useState([]);
    const [error, setError] = useState("");
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editText, setEditText] = useState("");
    const [noteError, setNoteError] = useState("");

    useEffect(() => {
        const getHomePage = async () => {
            try {
                const token = localStorage.getItem("token");

                // Ask the backend Facade for all home page data in one request
                const response = await axios.get("/api/home", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setLinks(response.data.links);
                setNotes(response.data.notes);
            } catch (error) {
                setError("Unable to load home page");
            }
        };

        getHomePage();
    }, []);

    // Save a new note when the user clicks Confirm
    const handleAddNote = async () => {
        setNoteError("");

        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(
                "/api/notes",
                { text: newNote },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            // Add the saved note to the list and clear the text box
            setNotes([...notes, response.data]);
            setNewNote("");
        } catch (error) {
            // Show the message from the backend (e.g. "Note cannot be empty")
            if (error.response?.data?.message) {
                setNoteError(error.response.data.message);
            } else {
                setNoteError("Unable to add note");
            }
        }
    };

    // Open the edit box for one note
    const startEditing = (note) => {
        setEditingNoteId(note._id);
        setEditText(note.text);
    };

    // Close the edit box without saving
    const cancelEditing = () => {
        setEditingNoteId(null);
        setEditText("");
        setNoteError("");
    };

    // Save the edited note when the user clicks Confirm
    const handleUpdateNote = async (noteId) => {
        setNoteError("");

        try {
            const token = localStorage.getItem("token");

            const response = await axios.put(
                `/api/notes/${noteId}`,
                { text: editText },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            // Replace the old note with the updated one
            setNotes(
                notes.map((note) =>
                    note._id === noteId ? response.data : note,
                ),
            );
            cancelEditing();
        } catch (error) {
            // Show the message from the backend (e.g. "Note cannot be empty")
            if (error.response?.data?.message) {
                setNoteError(error.response.data.message);
            } else {
                setNoteError("Unable to update note");
            }
        }
    };

    // Delete a note after the user confirms
    const handleDeleteNote = async (noteId) => {
        if (!window.confirm("Delete this note?")) {
            return;
        }

        setNoteError("");

        try {
            const token = localStorage.getItem("token");

            await axios.delete(`/api/notes/${noteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Remove the deleted note from the list
            setNotes(notes.filter((note) => note._id !== noteId));
        } catch (error) {
            // Show the message from the backend (e.g. "Note cannot be empty")
            if (error.response?.data?.message) {
                setNoteError(error.response.data.message);
            } else {
                setNoteError("Unable to delete note");
            }
        }
    };

    return (
        <>
            <Navbar />

            <main className="page-container">
                <h1>Home</h1>

                {error && <p className="error-message">{error}</p>}

                {/* Navigation links at the top of the page */}
                <div className="home-links">
                    {links.map((link) => (
                        <Link
                            className="home-link"
                            key={link.path}
                            to={link.path}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* On-call, news and notes will be added in later stories */}
                <section>
                    <h2>On-call</h2>
                </section>

                <section>
                    <h2>News</h2>
                </section>

                <section>
                    <h2>Notes</h2>

                    {noteError && (
                        <p className="error-message">{noteError}</p>
                    )}

                    {/* Add a new note */}
                    <div className="note-form">
                        <textarea
                            value={newNote}
                            onChange={(event) => setNewNote(event.target.value)}
                            placeholder="Write a note..."
                        />
                        <button onClick={handleAddNote}>Confirm</button>
                    </div>

                    {/* List of my notes */}
                    <div className="note-list">
                        {notes.map((note) => (
                            <div className="note-item" key={note._id}>
                                {editingNoteId === note._id ? (
                                    // Edit mode: text box + Confirm / Cancel
                                    <div className="note-form">
                                        <textarea
                                            value={editText}
                                            onChange={(event) =>
                                                setEditText(event.target.value)
                                            }
                                        />
                                        <button
                                            onClick={() =>
                                                handleUpdateNote(note._id)
                                            }
                                        >
                                            Confirm
                                        </button>
                                        <button onClick={cancelEditing}>
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    // Normal mode: text + Edit / Delete
                                    <>
                                        <p>{note.text}</p>
                                        <div className="note-actions">
                                            <button
                                                onClick={() => startEditing(note)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteNote(note._id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}

export default HomePage;
