// src/App.js
import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Importa el CSS de Quill
import axios from "axios";
import "./App.css";

function App() {
  const [editorContent, setEditorContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [npcNumber, setNpcNumber] = useState("");
  const [command, setCommand] = useState("");
  const [books, setBooks] = useState([]);
  const [showHtml, setShowHtml] = useState(false);
  const urlBase = process.env.REACT_APP_API_URL;
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSave = async () => {
    try {
      const response = await axios.post(`${urlBase}/save`, {
        htmlContent: editorContent,
        n: parseInt(npcNumber, 10),
        command: command,
      });
      console.log(response.data);
      fetchBooks(); // Actualiza la lista después de guardar
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  const handleToggleHtml = () => {
    setShowHtml(!showHtml);
    if (showHtml) {
      setHtmlContent(""); // Limpia el contenido HTML si se oculta
    } else {
      setHtmlContent(editorContent); // Muestra el contenido HTML
    }
  };

  const handleDelete = async (npcId) => {
    try {
      await axios.post(`${urlBase}/delete`, { npcId });
      fetchBooks(); // Actualiza la lista después de eliminar
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${urlBase}/getAll`);
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const handleDownload = () => {
    window.open(`${urlBase}/downloadBooks`);
  };
  const sortBooks = (books, order) => {
    return books.sort((a, b) => {
      if (order === "asc") {
        return a.npcId - b.npcId;
      } else {
        return b.npcId - a.npcId;
      }
    });
  };

  useEffect(() => {
    fetchBooks();
  }, []);
  const sortedBooks = sortBooks(books, sortOrder);
  return (
    <div className="App">
      <h1>Book Generator 2.0</h1>
      <div className="editor-container">
        <ReactQuill
          value={editorContent}
          onChange={setEditorContent}
          modules={App.modules}
          formats={App.formats}
          style={{ flex: 1, height: "400px" }}
        />
        <div className="editor-controls">
          <div>
            <label>
              NPC Id:
              <input
                type="number"
                value={npcNumber}
                onChange={(e) => setNpcNumber(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Command:
              <input type="text" value={command} onChange={(e) => setCommand(e.target.value)} />
            </label>
          </div>
          <button onClick={handleSave}>Save Book</button>
          <button onClick={handleToggleHtml}>{showHtml ? "Hide HTML" : "Show HTML"}</button>
          <button onClick={handleDownload}>Download Books</button>
          <button onClick={fetchBooks}>Refresh current books </button>
          <div>
            <label>
              Ordered by:
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="asc">Ascendent</option>
                <option value="desc">Descendent</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      <div className="books-container">
        <div className="books-list">
          <h2>Current Books</h2>
          <ul>
            {sortedBooks.map((book) => (
              <li key={book.npcId}>
                <strong>NPC Id: </strong> {book.npcId}
                <br />
                <div
                  className="book-content"
                  dangerouslySetInnerHTML={{ __html: book.htmlContent }}
                />
                <p>
                  <strong>Command:</strong> {book.command}
                </p>
                <button onClick={() => handleDelete(book.npcId)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
        {showHtml && (
          <div className="html-preview">
            <h2>Vista en HTML</h2>
            <code>{htmlContent}</code>
          </div>
        )}
      </div>
    </div>
  );
}

App.modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link", "image"],
  ],
};

App.formats = [
  "header",
  "list",
  "bullet",
  "bold",
  "italic",
  "underline",
  "color",
  "background",
  "align",
  "link",
  "image",
];

export default App;
