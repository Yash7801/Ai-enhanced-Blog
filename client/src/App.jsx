import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import api from "./api";

const USER_STORAGE_KEY = "inkwell-user";
const CATEGORIES = ["Art", "Culture", "Design", "Food", "Science", "Technology"];

function readStoredUser() {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function readableText(value = "") {
  const withBreaks = String(value).replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li)>/gi, "\n");
  const text = new DOMParser().parseFromString(withBreaks, "text/html").body.textContent || "";
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

function sanitizeRichText(value = "") {
  const parsed = new DOMParser().parseFromString(String(value), "text/html");
  const allowedTags = new Set([
    "A", "BLOCKQUOTE", "BR", "CODE", "EM", "H1", "H2", "H3", "IMG",
    "LI", "OL", "P", "PRE", "S", "STRONG", "U", "UL",
  ]);

  for (const element of [...parsed.body.querySelectorAll("*")]) {
    if (!allowedTags.has(element.tagName)) {
      if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "SVG", "MATH"].includes(element.tagName)) {
        element.remove();
      } else {
        element.replaceWith(...element.childNodes);
      }
      continue;
    }

    const href = element.tagName === "A" ? element.getAttribute("href") : null;
    const src = element.tagName === "IMG" ? element.getAttribute("src") : null;
    for (const attribute of [...element.attributes]) element.removeAttribute(attribute.name);

    if (href) {
      try {
        const safeUrl = new URL(href, window.location.origin);
        if (["http:", "https:", "mailto:"].includes(safeUrl.protocol)) {
          element.setAttribute("href", safeUrl.href);
          element.setAttribute("target", "_blank");
          element.setAttribute("rel", "noopener noreferrer");
        }
      } catch {
        element.removeAttribute("href");
      }
    }
    if (src && element.tagName === "IMG") {
      try {
        const safeUrl = new URL(src, window.location.origin);
        if (["http:", "https:"].includes(safeUrl.protocol)) element.setAttribute("src", safeUrl.href);
      } catch {
        element.removeAttribute("src");
      }
    }
  }

  return parsed.body.innerHTML;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function formatDate(value) {
  if (!value) return "Recently published";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently published";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function AppFrame({ user, setUser, children }) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await api.post("/auth/logout");
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    } catch {
      setLogoutError("Could not sign out right now. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <Link className="wordmark" to="/" aria-label="Margin home">
          <span className="wordmark-mark">m.</span>
          <span>margin</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link to="/">Stories</Link>
          {user ? (
            <>
              <Link className="nav-write" to="/write">Write a story <span aria-hidden="true">↗</span></Link>
              <button className="nav-account" type="button" onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? "Signing out…" : user.username}
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link className="nav-join" to="/register">Join the journal <span aria-hidden="true">↗</span></Link>
            </>
          )}
        </nav>
      </header>
      {logoutError && <div className="notice notice-error" role="alert">{logoutError}</div>}
      <main>{children}</main>
      <footer className="site-footer">
        <Link className="footer-mark" to="/">margin<span>.</span></Link>
        <p>A little more room for the stories that matter.</p>
        <span>Made for curious minds · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

function StoryCard({ story, featured = false }) {
  const summary = readableText(story.description);
  return (
    <article className={`story-card${featured ? " story-card-featured" : ""}`}>
      <Link className="story-image-link" to={`/post/${story.id}`} aria-label={`Read ${story.title}`}>
        {story.img ? (
          <img className="story-image" src={story.img} alt="" loading="lazy" />
        ) : (
          <div className="story-image story-image-empty" aria-hidden="true"><span>m.</span></div>
        )}
      </Link>
      <div className="story-copy">
        <div className="story-kicker">
          <span>{story.cat || "Journal"}</span>
          <span>{formatDate(story.date)}</span>
        </div>
        <h2><Link to={`/post/${story.id}`}>{story.title || "Untitled story"}</Link></h2>
        <p>{summary || "A story is waiting to be read."}</p>
        <div className="story-byline">
          <span className="author-dot" aria-hidden="true">{(story.username || "M").slice(0, 1).toUpperCase()}</span>
          <span>{story.username || "A Margin writer"}</span>
          <Link to={`/post/${story.id}`} className="read-link" aria-label={`Read ${story.title}`}>
            Read story <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("cat") || "All stories";
  const [stories, setStories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api.get("/posts")
      .then(({ data }) => {
        if (active) setStories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setError("We couldn’t load the journal. Check your connection and try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const categoryOptions = [...new Set(stories.map((story) => String(story.cat || "").trim()).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right));
  const visibleStories = stories.filter((story) => {
    if (activeCategory !== "All stories" && String(story.cat || "").toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [story.title, story.username, story.cat, readableText(story.description)]
      .some((field) => String(field || "").toLowerCase().includes(query));
  });

  function chooseCategory(nextCategory) {
    setSearchParams(nextCategory === "All stories" ? {} : { cat: nextCategory });
  }

  return (
    <div className="home-page">
      <section className="masthead">
        <div className="masthead-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> An independent journal for curious people</p>
          <h1>Ideas worth<br /><em>lingering over.</em></h1>
          <p className="masthead-intro">Thoughtful stories, fresh perspectives, and the joy of putting an idea into words.</p>
          <a className="text-cta" href="#the-journal">Explore the journal <span aria-hidden="true">↓</span></a>
        </div>
        <div className="masthead-art" aria-hidden="true">
          <div className="art-orbit art-orbit-one" />
          <div className="art-orbit art-orbit-two" />
          <div className="art-sun" />
          <span className="art-caption">A place for<br />your next thought</span>
          <span className="art-index">VOL. 01 — EST. NOW</span>
        </div>
        <div className="masthead-bottom"><span>Independent voices</span><span>Human ideas, thoughtfully made</span><span>Read at your own pace</span></div>
      </section>

      <section className="journal-section" id="the-journal">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The journal / 001</p>
            <h2>Stories for <em>today.</em></h2>
          </div>
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a story or writer"
              aria-label="Find a story or writer"
            />
          </label>
        </div>
        <div className="category-list" role="group" aria-label="Filter stories by category">
          {["All stories", ...categoryOptions].map((item) => (
            <button
              key={item}
              className={activeCategory === item ? "category-chip active" : "category-chip"}
              type="button"
              aria-pressed={activeCategory === item}
              onClick={() => chooseCategory(item)}
            >{item}</button>
          ))}
        </div>
        {loading ? (
          <div className="loading-state" role="status"><span className="loading-mark">m.</span><p>Gathering the latest stories…</p></div>
        ) : error ? (
          <div className="empty-state" role="alert"><h3>The journal is taking a moment.</h3><p>{error}</p><button className="button button-dark" onClick={() => window.location.reload()}>Try again</button></div>
        ) : visibleStories.length ? (
          <div className="story-grid">
            {visibleStories.map((story, index) => <StoryCard key={story.id} story={story} featured={index === 0} />)}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-ornament" aria-hidden="true">✳</span>
            <h3>{search ? "No stories found." : "A blank page is full of possibility."}</h3>
            <p>{search ? "Try another title, topic, or writer." : "There aren’t any stories in this corner yet. Check back soon."}</p>
            {search && <button className="text-button" onClick={() => setSearch("")}>Clear search</button>}
          </div>
        )}
      </section>
      <section className="invitation">
        <span className="invitation-mark" aria-hidden="true">m.</span>
        <div><p className="eyebrow">For the ones with something to say</p><h2>Your words belong <em>here.</em></h2></div>
        <Link className="button button-light" to="/write">Start a story <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}

function AuthPage({ mode, setUser }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === "register";

  function changeValue(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isRegister) {
        await api.post("/auth/register", {
          username: values.username.trim(),
          email: values.email.trim(),
          password: values.password,
        });
        navigate("/login", { state: { message: "You’re in. Sign in to start writing." } });
      } else {
        const { data } = await api.post("/auth/login", {
          username: values.username.trim(),
          password: values.password,
        });
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
        setUser(data);
        navigate("/");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-aside">
        <Link className="wordmark" to="/"><span className="wordmark-mark">m.</span><span>margin</span></Link>
        <div className="auth-aside-copy"><p className="eyebrow">A journal for curious people</p><h1>Make room<br />for <em>meaning.</em></h1><p>Come for the ideas. Stay for the voices behind them.</p></div>
        <span className="auth-aside-note">READ · WRITE · WONDER</span>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-form-head">
          <p className="eyebrow">{isRegister ? "Your next chapter" : "Welcome back"}</p>
          <h2>{isRegister ? "Join the journal." : "Good to see you."}</h2>
          <p>{isRegister ? "Create your free account and share what you see." : "Pick up where your curiosity left off."}</p>
        </div>
        <form className="form-stack" onSubmit={submit}>
          {isRegister && (
            <label className="field-label">Email address
              <input type="email" name="email" value={values.email} onChange={changeValue} autoComplete="email" required maxLength={254} />
            </label>
          )}
          <label className="field-label">Username
            <input type="text" name="username" value={values.username} onChange={changeValue} autoComplete="username" required maxLength={50} />
          </label>
          <label className="field-label">Password
            <input type="password" name="password" value={values.password} onChange={changeValue} autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 8 : 1} />
          </label>
          {error && <p className="form-error" role="alert">{typeof error === "string" ? error : "Please check your details and try again."}</p>}
          <button className="button button-dark button-wide" type="submit" disabled={submitting}>
            {submitting ? "One moment…" : isRegister ? "Create your account" : "Sign in"} <span aria-hidden="true">↗</span>
          </button>
        </form>
        <p className="auth-switch">
          {isRegister ? "Already have a seat at the table?" : "New to Margin?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link>
        </p>
      </div>
    </section>
  );
}

function StoryPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [relatedStories, setRelatedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([api.get(`/posts/${id}`), api.get("/posts")])
      .then(([storyResponse, listResponse]) => {
        if (!active) return;
        setStory(storyResponse.data);
        setRelatedStories(Array.isArray(listResponse.data) ? listResponse.data.filter((item) => String(item.id) !== String(id)).slice(0, 3) : []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.status === 404 ? "This story may have moved or been taken down." : "We couldn’t load this story. Please try again.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function deleteStory() {
    if (!window.confirm("Delete this story? This can’t be undone.")) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate("/");
    } catch {
      setError("We couldn’t delete the story. Please try again.");
    }
  }

  if (loading) return <div className="page-state" role="status">Opening the story…</div>;
  if (error && !story) return <div className="empty-state page-state"><h2>Story unavailable</h2><p>{error}</p><Link className="text-cta" to="/">Back to the journal <span aria-hidden="true">↗</span></Link></div>;

  return (
    <div className="reader-page">
      <Link className="back-link" to="/">← Back to the journal</Link>
      <article className="reader">
        <header className="reader-header">
          <p className="eyebrow">{story.cat || "Journal"} <span aria-hidden="true">·</span> {formatDate(story.date)}</p>
          <h1>{story.title}</h1>
          <div className="reader-byline">
            <span className="author-dot">{(story.username || "M").slice(0, 1).toUpperCase()}</span>
            <span>Words by <strong>{story.username || "A Margin writer"}</strong></span>
            {user && String(user.id) === String(story.uid) && <span className="reader-actions"><Link to={`/write/${story.id}`}>Edit story</Link><button type="button" onClick={deleteStory}>Delete</button></span>}
          </div>
        </header>
        {story.img && <img className="reader-cover" src={story.img} alt="" />}
        <div className="reader-body" dangerouslySetInnerHTML={{ __html: sanitizeRichText(story.description) }} />
      </article>
      {error && <p className="form-error" role="alert">{error}</p>}
      {!!relatedStories.length && <section className="related-section"><p className="eyebrow">Keep reading</p><h2>More to <em>sit with.</em></h2><div className="related-grid">{relatedStories.map((item) => <StoryCard key={item.id} story={item} />)}</div></section>}
    </div>
  );
}

function StoryEditor({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [fields, setFields] = useState({ title: "", description: "", cat: "Culture", img: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState("");
  const [suggestionNote, setSuggestionNote] = useState("");

  useEffect(() => {
    if (!isEditing) return undefined;
    let active = true;
    api.get(`/posts/${id}`)
      .then(({ data }) => {
        if (!active) return;
        if (!user || String(user.id) !== String(data.uid)) {
          setError("You can only edit stories you wrote.");
          return;
        }
        setFields({ title: data.title || "", description: sanitizeRichText(data.description), cat: data.cat || "Culture", img: data.img || "" });
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.status === 404 ? "This story could not be found." : "We couldn’t open this story for editing.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, isEditing, user]);

  if (!user) return <Navigate to="/login" replace state={{ from: isEditing ? `/write/${id}` : "/write" }} />;

  function updateField(event) {
    setFields((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function continueWithAI() {
    const plainText = readableText(fields.description);
    if (plainText.length < 20) {
      setSuggestionNote("Write a little more first, and I’ll help you find the next line.");
      return;
    }
    setSuggesting(true);
    setSuggestionNote("");
    try {
      const { data } = await api.post("/suggest", { text: plainText.slice(-8000) });
      if (!data?.suggestion) {
        setSuggestionNote("The writing assistant is taking a break. You can keep writing without it.");
      } else {
        setFields((current) => ({ ...current, description: `${current.description}<p>${escapeHtml(data.suggestion)}</p>` }));
      }
    } catch {
      setSuggestionNote("The writing assistant is unavailable right now. Your draft is still safe.");
    } finally {
      setSuggesting(false);
    }
  }

  async function submitStory(event) {
    event.preventDefault();
    setError("");
    if (!readableText(fields.description)) {
      setError("Add a little text to your story before saving.");
      return;
    }
    if (fields.description.length > 50000) {
      setError("This story is too long to save. Please keep it under 50,000 characters.");
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = fields.img;
      if (file) {
        const upload = new FormData();
        upload.append("file", file);
        const { data } = await api.post("/upload", upload);
        imageUrl = data.url;
      }
      const payload = { title: fields.title.trim(), description: fields.description, cat: fields.cat, img: imageUrl };
      if (isEditing) await api.put(`/posts/${id}`, payload);
      else await api.post("/posts", payload);
      navigate(isEditing ? `/post/${id}` : "/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Your story couldn’t be saved. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="page-state" role="status">Opening your draft…</div>;

  return (
    <section className="editor-page">
      <div className="editor-heading">
        <p className="eyebrow">{isEditing ? "Your story / edit" : "A new beginning"}</p>
        <h1>{isEditing ? "Shape the story." : "Start with a thought."}</h1>
        <p>Take your time. Good ideas deserve a little room.</p>
      </div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <form className="story-form" onSubmit={submitStory}>
        <label className="field-label">Story title
          <input className="title-input" name="title" value={fields.title} onChange={updateField} placeholder="Give your idea a name…" required maxLength={200} />
        </label>
        <div className="editor-meta">
          <label className="field-label">A place in the journal
            <select name="cat" value={fields.cat} onChange={updateField}>
              {[...new Set([...CATEGORIES, fields.cat])].map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="field-label cover-label">Cover image <span className="field-optional">optional · JPG, PNG, WEBP</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </label>
        </div>
        {(file || fields.img) && <p className="selected-image">{file ? file.name : "Current cover image is set"}{file && <button type="button" onClick={() => setFile(null)}>Remove</button>}</p>}
        <div className="field-label body-label">
          <span>Your story</span>
          <div className="rich-editor">
            <ReactQuill
              theme="snow"
              value={fields.description}
              onChange={(description) => setFields((current) => ({ ...current, description }))}
              placeholder="Every good story starts somewhere…"
              modules={{ toolbar: [["bold", "italic", "underline"], [{ header: [2, 3, false] }], [{ list: "ordered" }, { list: "bullet" }], ["blockquote", "link"], ["clean"]] }}
              formats={["bold", "italic", "underline", "header", "list", "blockquote", "link"]}
            />
          </div>
        </div>
        <div className="editor-toolbar">
          <div className="assistant-tools"><span className="assistant-spark">✳</span><span>Need a nudge?</span><button className="text-button" type="button" onClick={continueWithAI} disabled={suggesting}>{suggesting ? "Finding a thought…" : "Continue with AI"}</button></div>
          <span className="word-count">{readableText(fields.description).split(/\s+/).filter(Boolean).length} words</span>
        </div>
        {suggestionNote && <p className="editor-note" role="status">{suggestionNote}</p>}
        <div className="editor-actions">
          <Link className="text-button" to={isEditing ? `/post/${id}` : "/"}>Leave for now</Link>
          <button className="button button-dark" type="submit" disabled={submitting}>{submitting ? "Saving…" : isEditing ? "Save changes" : "Publish story"} <span aria-hidden="true">↗</span></button>
        </div>
      </form>
    </section>
  );
}

function RoutedApp({ user, setUser }) {
  return (
    <AppFrame user={user} setUser={setUser}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage mode="login" setUser={setUser} />} />
        <Route path="/register" element={<AuthPage mode="register" setUser={setUser} />} />
        <Route path="/post/:id" element={<StoryPage user={user} />} />
        <Route path="/write" element={<StoryEditor user={user} />} />
        <Route path="/write/:id" element={<StoryEditor user={user} />} />
        <Route path="*" element={<div className="empty-state page-state"><p className="eyebrow">404 / Lost in thought</p><h2>This page wandered off.</h2><Link className="text-cta" to="/">Back to the journal <span aria-hidden="true">↗</span></Link></div>} />
      </Routes>
    </AppFrame>
  );
}

export default function App() {
  const [user, setUser] = useState(readStoredUser);
  return <BrowserRouter><RoutedApp user={user} setUser={setUser} /></BrowserRouter>;
}
