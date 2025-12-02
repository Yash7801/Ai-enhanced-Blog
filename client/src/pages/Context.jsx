import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axiosInstance from '../api';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';

const Context = () => {
  const state = useLocation().state;
  const navigate = useNavigate();

  const [value, setValue] = useState(state?.description || "");
  const [title, setTitle] = useState(state?.title || "");
  const [file, setFile] = useState(null);
  const [suggestion, setSuggestion] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [cat, setCat] = useState(state?.cat || "");
  const [showFullSuggestion, setShowFullSuggestion] = useState(false);

  // NEW STATES
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ⭐ NEW STATE FOR SUCCESS MESSAGE
  const [successMsg, setSuccessMsg] = useState("");

  // --------------------------------------------------
  // AI Suggestion
  // --------------------------------------------------
  useEffect(() => {
    if (value.trim().length < 30) {
      setSuggestion("");
      return;
    }

    if (value.endsWith(" ")) return;

    clearTimeout(typingTimeout);

    const timeout = setTimeout(async () => {
      try {
        if (suggestion && value.includes(suggestion.slice(0, 20))) return;

        const res = await axiosInstance.post("/api/suggest", { text: value });

        if (!res.data.suggestion) return;

        setSuggestion(
          res.data.suggestion
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim()
        );
      } catch (err) {
        console.log("AI suggest error:", err);
      }
    }, 2500);

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

  // --------------------------------------------------
  // Image Upload
  // --------------------------------------------------
  const upload = async () => {
    if (!file) return "";

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      return res.data.url;
    } catch (err) {
      console.log("Upload error:", err);
      setErrorMsg("Image upload failed. Try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // --------------------------------------------------
  // Publish / Update Post
  // --------------------------------------------------
  const handleClick = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // VALIDATION
    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }
    if (!value.trim()) {
      setErrorMsg("Description is required.");
      return;
    }
    if (!cat.trim()) {
      setErrorMsg("Category is required.");
      return;
    }

    setPublishing(true);

    const imgUrl = await upload();
    if (imgUrl === null && file) {
      setPublishing(false);
      return;
    }

    try {
      if (state) {
        await axiosInstance.put(
          `/api/posts/${state.id}`,
          {
            title,
            description: value,
            img: file ? imgUrl : state.img,
            cat,
          },
          { withCredentials: true }
        );
      } else {
        await axiosInstance.post(
          "/api/posts",
          {
            title,
            description: value,
            img: file ? imgUrl : "",
            date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            cat,
          },
          { withCredentials: true }
        );
      }

      // ⭐ SUCCESS — Show message then redirect
      setSuccessMsg("🎉 Your post has been published!");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      console.log(err);
      setErrorMsg("Failed to publish post. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="context">

      {/* SUCCESS POPUP */}
      {successMsg && (
        <div style={{
          backgroundColor: "#d4edda",
          padding: "10px",
          color: "#155724",
          borderRadius: "6px",
          marginBottom: "10px",
          fontWeight: "bold"
        }}>
          {successMsg}
        </div>
      )}

      {/* ERROR POPUP */}
      {errorMsg && (
        <div style={{
          backgroundColor: "#ffcccc",
          padding: "10px",
          color: "#900",
          borderRadius: "6px",
          marginBottom: "10px",
          fontWeight: "bold"
        }}>
          {errorMsg}
        </div>
      )}

      <div className="content">
        <label>
          Title <span style={{ color: "red" }}>*</span>
        </label>
        <input
          type="text"
          value={title}
          placeholder="Title"
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>
          Description <span style={{ color: "red" }}>*</span>
        </label>

        <div className="editorContainer" onKeyDown={handleKeyDown}>
          <ReactQuill
            className="editor"
            theme="snow"
            value={value}
            onChange={setValue}
          />
        </div>

        {/* AI Suggestion */}
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
              : suggestion.split(" ").slice(0, 40).join(" ") + "..."}

            {suggestion.split(" ").length > 40 && (
              <span
                onClick={() => setShowFullSuggestion(!showFullSuggestion)}
                style={{ color: "teal", cursor: "pointer", marginLeft: "5px" }}
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
          <span><b>Status:</b> Draft</span>
          <span><b>Visibility:</b> Public</span>

          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label className="file" htmlFor="file">
            Upload Image
          </label>

          {uploading && (
            <p style={{ color: "teal", marginTop: "10px" }}>
              ⏳ Uploading image...
            </p>
          )}

          <div className="buttons">
            <button>Save as draft</button>

            <button
              onClick={handleClick}
              disabled={uploading || publishing}
              style={{
                opacity: (uploading || publishing) ? 0.6 : 1,
                cursor: (uploading || publishing) ? "not-allowed" : "pointer"
              }}
            >
              {publishing ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        <div className="item">
          <h1>
            Category <span style={{ color: "red" }}>*</span>
          </h1>

          {["art", "science", "technology", "Cinema", "design", "food"].map(
            (c) => (
              <div className="cat" key={c}>
                <input
                  type="radio"
                  checked={cat === c}
                  name="cat"
                  value={c}
                  id={c}
                  onChange={(e) => setCat(e.target.value)}
                />
                <label htmlFor={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </label>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Context;
