import React, { useState, useEffect } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css';
import axiosInstance from '../api';
import { useLocation } from 'react-router-dom';
import moment from 'moment';

const Context = () => {
  const state = useLocation().state;
  const [value, setValue] = useState(state?.description || "");
  const [title, setTitle] = useState(state?.title || "");
  const [file, setFile] = useState(null);
  const [suggestion, setSuggestion] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [cat, setCat] = useState(state?.cat || "");
  const [showFullSuggestion, setShowFullSuggestion] = useState(false); // ✅ added toggle state

  useEffect(() => {
    if (value.trim().length < 10) return;

    clearTimeout(typingTimeout);

    const timeout = setTimeout(async () => {
      try {
        const res = await axiosInstance.post("/api/suggest", { text: value });

        if (!res.data.suggestion || res.data.suggestion.trim() === suggestion.trim()) return;

        setSuggestion(
          res.data.suggestion
            ?.replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim()
        );
      } catch (err) {
        console.log("AI suggest error:", err);
      }
    }, 1200);

    setTypingTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Tab" && suggestion) {
      e.preventDefault();
      setValue((prev) => prev + " " + suggestion);
      setSuggestion("");
    }
  };

const upload = async () => {
  if (!file) return "";

  try {
    const formData = new FormData();
    formData.append("file", file);  // MUST BE "file"

    const res = await axiosInstance.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    return res.data.url;
  } catch (err) {
    console.log("Upload error:", err);
  }
};




  const handleClick = async e => {
    e.preventDefault();
    const imgUrl = await upload();

    try {
      state
        ? await axiosInstance.put(`/api/posts/${state.id}`, {
            title,
            description: value,
            img: file ? imgUrl : "",
            cat,
          }, { withCredentials: true })
        : await axiosInstance.post("/api/posts", {
            title,
            description: value,
            img: file ? imgUrl : "",
            date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            cat
          }, { withCredentials: true });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className='context'>
      <div className="content">
        <input type='text' value={title} placeholder='Title' onChange={e => setTitle(e.target.value)} />

        {/* ✅ Editor */}
        <div className="editorContainer" onKeyDown={handleKeyDown}>
          <ReactQuill
            className='editor'
            theme="snow"
            value={value}
            onChange={setValue}
          />
        </div>

        {/* ✅ AI Suggestion (trimmed + toggle) */}
        {suggestion && (
          <div
            style={{
              marginTop: "6px",
              backgroundColor: "#f8f9fa",
              borderLeft: "3px solid #ffc107",
              borderRadius: "6px",
              padding: "8px 10px",
              color: "#555",
              fontStyle: "italic",
              lineHeight: "1.4",
              whiteSpace: "pre-line",
              fontSize: "14px",
            }}
          >
            ✨ <b>AI Suggestion:</b>{" "}
            {showFullSuggestion
              ? suggestion
              : suggestion.split(" ").slice(0, 40).join(" ") + "..."}{" "}
            {suggestion.split(" ").length > 40 && (
              <span
                onClick={() => setShowFullSuggestion(!showFullSuggestion)}
                style={{
                  color: "teal",
                  fontStyle: "normal",
                  cursor: "pointer",
                  marginLeft: "5px",
                }}
              >
                {showFullSuggestion ? "Show less ▲" : "Show more ▼"}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="menu">
        <div className="item">
          <h1>Publish</h1>
          <span>
            <b>Status:</b> Draft
          </span>
          <span>
            <b>Visibility: </b> Public
          </span>
          <input
            style={{ display: 'none' }}
            type='file'
            id="file"
            onChange={e => setFile(e.target.files[0])}
          />
          <label className='file' htmlFor='file'>Upload Image</label>
          <div className="buttons">
            <button>Save as a draft</button>
            <button onClick={handleClick}>Publish</button>
          </div>
        </div>

        <div className="item">
          <h1>Category</h1>
          {["art", "science", "technology", "Cinema", "design", "food"].map((c) => (
            <div className="cat" key={c}>
              <input
                type='radio'
                checked={cat === c}
                name='cat'
                value={c}
                id={c}
                onChange={e => setCat(e.target.value)}
              />
              <label htmlFor={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Context
