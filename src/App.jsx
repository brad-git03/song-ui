import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   YouTube Design Tokens — dark mode exact values
───────────────────────────────────────────── */
const C = {
  bg: "#0f0f0f",
  surface: "#272727",
  surfaceHov: "#3d3d3d",
  border: "#3d3d3d",
  borderFaint: "#272727",
  text: "#f1f1f1",
  textMuted: "#aaaaaa",
  textFaint: "#717171",
  red: "#ff0000",
  blue: "#3ea6ff",
  font: `"Roboto","Arial",sans-serif`,
};

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const getVideoId = (url = "") => {
  const m = url.match(/(?:youtu\.be\/|[?&]v=|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : "";
};
const getThumb = (url) => {
  const id = getVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};

function hashInt(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h;
}
const pick = (arr, seed) => arr[hashInt(String(seed)) % arr.length];

const VIEWS = ["1.2M", "843K", "2.4M", "512K", "9.1M", "334K", "4.5M", "1.8M", "260K", "6.3M", "15M", "98K", "720K"];
const AGOS = ["2 days ago", "1 week ago", "3 weeks ago", "2 months ago", "5 months ago", "1 year ago", "8 months ago", "4 weeks ago"];
const LIKES = ["14K", "8.9K", "22K", "5.4K", "31K", "47K", "18K", "3.6K", "11K", "2.7K"];
const AVCOLS = ["#8e24aa", "#1565c0", "#2e7d32", "#c62828", "#f57f17", "#4527a0", "#00695c", "#ad1457", "#0277bd", "#4e342e"];
const avCol = (s) => AVCOLS[hashInt(String(s)) % AVCOLS.length];

/* ─────────────────────────────────────────────
   SVG icon helper
───────────────────────────────────────────── */
const Icon = ({ d, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" focusable="false">
    {[].concat(d).map((path, i) => <path key={i} d={path} />)}
  </svg>
);

/* YouTube wordmark — pixel-accurate */
const YTWordmark = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 2, userSelect: "none" }}>
    {/* Play-button icon */}
    <svg viewBox="0 0 48 34" width="38" height="27">
      <path d="M47.52 5.31A6.01 6.01 0 0 0 43.3 1.07C39.52 0 24 0 24 0S8.48 0 4.7 1.07A6.01 6.01 0 0 0 .48 5.31C0 9.11 0 17 0 17s0 7.89.48 11.69A6.01 6.01 0 0 0 4.7 32.93C8.48 34 24 34 24 34s15.52 0 19.3-1.07a6.01 6.01 0 0 0 4.22-4.24C48 24.89 48 17 48 17s0-7.89-.48-11.69z" fill="#ff0000" />
      <path d="M19 24.5l12.5-7.5L19 9.5v15z" fill="#fff" />
    </svg>
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
      <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px", color: C.text, lineHeight: "20px" }}>SongTube</span>
      <span style={{ fontSize: 10, color: C.textMuted, letterSpacing: ".5px", marginTop: 1, lineHeight: "10px" }}>PH</span>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Atoms
───────────────────────────────────────────── */
const Btn0 = ({ children, style, ...r }) => (
  <button style={{ background: "none", border: "none", cursor: "pointer", color: C.text, padding: 0, fontFamily: C.font, display: "flex", alignItems: "center", justifyContent: "center", ...style }} {...r}>
    {children}
  </button>
);

const IcoBtn = ({ children, label, badge, style, ...r }) => {
  const [h, setH] = useState(false);
  return (
    <Btn0 aria-label={label} style={{ position: "relative", width: 40, height: 40, borderRadius: "50%", background: h ? C.surface : "none", transition: "background .1s", ...style }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} {...r}>
      {children}
      {badge && <span style={{ position: "absolute", top: 1, right: 1, background: C.red, color: "#fff", fontSize: 11, fontWeight: 600, borderRadius: 8, padding: "1px 4px", lineHeight: 1.4, minWidth: 16, textAlign: "center" }}>{badge}</span>}
    </Btn0>
  );
};

const PillBtn = ({ icon, label, active, noBorderRadius, style, ...r }) => {
  const [h, setH] = useState(false);
  return (
    <Btn0 style={{
      height: 36, padding: label ? "0 16px" : "0 12px",
      borderRadius: noBorderRadius ? 0 : 18,
      background: h ? C.surfaceHov : C.surface,
      fontSize: 14, fontWeight: 500, gap: 6, transition: "background .1s",
      ...style
    }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} {...r}>
      <span style={{ color: active ? C.blue : C.text, display: "flex" }}>{icon}</span>
      {label && <span style={{ color: C.text }}>{label}</span>}
    </Btn0>
  );
};

const Avatar = ({ name = "?", size = 40, color }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: color || avCol(name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * .44, fontWeight: 500, color: "#fff", flexShrink: 0, fontFamily: C.font, userSelect: "none" }}>
    {String(name)[0]?.toUpperCase()}
  </div>
);

const Toggle = ({ on, onToggle }) => (
  <div style={{ width: 34, height: 20, borderRadius: 10, background: on ? C.blue : "#666", cursor: "pointer", position: "relative", transition: "background .2s" }} onClick={onToggle}>
    <div style={{ position: "absolute", top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.5)" }} />
  </div>
);

/* ─────────────────────────────────────────────
   Like + Dislike joined pill (exact YouTube)
───────────────────────────────────────────── */
const LDPill = ({ liked, disliked, count, onLike, onDislike }) => {
  const display = liked ? `${parseInt(count) + 1}K` : count;
  return (
    <div style={{ display: "flex", borderRadius: 18, overflow: "hidden", background: C.surface }}>
      <PillBtn icon={<Icon d="M18.77,11h-4.23l1.52-4.94C16.38,5.03,15.54,4,14.38,4c-0.58,0-1.14,0.24-1.52,0.65L7,11H3v10h4h1h9.43c1.06,0,1.98-0.67,2.19-1.61l1.34-6C21.23,12.15,20.18,11,18.77,11z M7,20H4v-8h3V20z M19.98,13.17l-1.34,6C18.54,19.65,18.03,20,17.43,20H8v-8.61l5.6-6.06C13.79,5.12,14.08,5,14.38,5c0.26,0,0.5,0.11,0.63,0.3c0.07,0.1,0.15,0.26,0.09,0.47l-1.52,4.94L13,12h1.77h4c0.5,0,0.83,0.4,0.78,0.86L19.98,13.17z" />}
        label={display} active={liked} noBorderRadius onClick={onLike}
        style={{ borderRadius: "18px 0 0 18px", borderRight: `1px solid ${C.border}` }} />
      <PillBtn icon={<Icon d="M17,4h-1H6.57C5.5,4,4.59,4.67,4.38,5.61l-1.34,6C2.77,12.85,3.82,14,5.23,14h4.23l-1.52,4.94C7.62,19.97,8.46,21,9.62,21c0.58,0,1.14-0.24,1.52-0.65L17,14h4V4H17z M10.4,19.67C10.21,19.88,9.92,20,9.62,20c-0.26,0-0.5-0.11-0.63-0.3c-0.07-0.1-0.15-0.26-0.09-0.47l1.52-4.94L11,13H9.23h-4c-0.51,0-0.83-0.41-0.78-0.85l1.34-6C5.89,5.35,6.41,5,7,5h9v8.61L10.4,19.67z M20,13h-2V5h2V13z" />}
        active={disliked} noBorderRadius onClick={onDislike}
        style={{ borderRadius: "0 18px 18px 0" }} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   Sidebar card — exact YouTube UP NEXT card
───────────────────────────────────────────── */
const SideCard = ({ song, active, onClick }) => {
  const [h, setH] = useState(false);
  const views = pick(VIEWS, song.id + "v");
  const ago = pick(AGOS, song.id + "a");
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", gap: 8, padding: 4, borderRadius: 12, cursor: "pointer", background: (h || active) ? C.surface : "transparent", transition: "background .1s" }}>
      {/* Thumb */}
      <div style={{ position: "relative", width: 168, minWidth: 168, height: 94, borderRadius: 10, overflow: "hidden", background: "#000", flexShrink: 0 }}>
        <img src={getThumb(song.url)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.target.style.display = "none"; }} />
        <div style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,.9)", color: "#fff", fontSize: 12, fontWeight: 700, borderRadius: 4, padding: "1px 4px", letterSpacing: .3 }}>3:45</div>
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, lineHeight: "20px", color: C.text, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 4 }}>{song.title}</p>
        <p style={{ margin: 0, fontSize: 13, color: C.textMuted, lineHeight: "18px", marginBottom: 2 }}>{song.artist}</p>
        <p style={{ margin: 0, fontSize: 13, color: C.textMuted, lineHeight: "18px" }}>{views} views · {ago}</p>
      </div>
      {/* 3-dot menu (hover only) */}
      {h && <IcoBtn label="More" style={{ alignSelf: "flex-start", marginTop: 2, width: 32, height: 32 }}><Icon d="M7.5 12c0 .83-.67 1.5-1.5 1.5S4.5 12.83 4.5 12 5.17 10.5 6 10.5s1.5.67 1.5 1.5zm4.5 0c0 .83-.67 1.5-1.5 1.5S9 12.83 9 12s.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm3 1.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z" /></IcoBtn>}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Comments section
───────────────────────────────────────────── */
const MOCK_COMMENTS = [
  { n: "MusicLover22", t: "Absolute BANGER 🔥🔥 been on repeat for days", l: "2.1K", a: "3 weeks ago" },
  { n: "VibeCheck_PH", t: "This hits so differently at 2am not gonna lie 💀", l: "891", a: "1 month ago" },
  { n: "RetroFan", t: "The drop at 1:24 is genuinely unreal 😤", l: "456", a: "5 months ago" },
  { n: "SoundwaveJunkie", t: "No skips. Ever. Certified classic.", l: "304", a: "2 weeks ago" },
  { n: "Luna_Beats", t: "The way this song makes me feel things 😭❤️", l: "2.8K", a: "8 months ago" },
];

const CommentRow = ({ c }) => (
  <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
    <Avatar name={c.n} size={40} />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4, lineHeight: "18px" }}>
        {c.n} <span style={{ fontWeight: 400, color: C.textMuted }}>{c.a}</span>
      </div>
      <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: "20px", marginBottom: 8 }}>{c.t}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <IcoBtn label="Like" style={{ width: 32, height: 32 }}><Icon d="M18.77,11h-4.23l1.52-4.94C16.38,5.03,15.54,4,14.38,4c-0.58,0-1.14,0.24-1.52,0.65L7,11H3v10h4h1h9.43c1.06,0,1.98-0.67,2.19-1.61l1.34-6C21.23,12.15,20.18,11,18.77,11z M7,20H4v-8h3V20z M19.98,13.17l-1.34,6C18.54,19.65,18.03,20,17.43,20H8v-8.61l5.6-6.06C13.79,5.12,14.08,5,14.38,5c0.26,0,0.5,0.11,0.63,0.3c0.07,0.1,0.15,0.26,0.09,0.47l-1.52,4.94L13,12h1.77h4c0.5,0,0.83,0.4,0.78,0.86L19.98,13.17z" size={18} /></IcoBtn>
        <span style={{ fontSize: 13, color: C.textMuted, marginRight: 4 }}>{c.l}</span>
        <IcoBtn label="Dislike" style={{ width: 32, height: 32 }}><Icon d="M17,4h-1H6.57C5.5,4,4.59,4.67,4.38,5.61l-1.34,6C2.77,12.85,3.82,14,5.23,14h4.23l-1.52,4.94C7.62,19.97,8.46,21,9.62,21c0.58,0,1.14-0.24,1.52-0.65L17,14h4V4H17z M10.4,19.67C10.21,19.88,9.92,20,9.62,20c-0.26,0-0.5-0.11-0.63-0.3c-0.07-0.1-0.15-0.26-0.09-0.47l1.52-4.94L11,13H9.23h-4c-0.51,0-0.83-0.41-0.78-0.85l1.34-6C5.89,5.35,6.41,5,7,5h9v8.61L10.4,19.67z M20,13h-2V5h2V13z" size={18} /></IcoBtn>
        <Btn0 style={{ fontSize: 13, fontWeight: 600, marginLeft: 8, color: C.text }}>Reply</Btn0>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   App
───────────────────────────────────────────── */
export default function App() {
  const [songs, setSongs] = useState([]);
  const [current, setCurrent] = useState(null);
  const [query, setQuery] = useState("");
  const [playKey, setPlayKey] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [mobSearch, setMobSearch] = useState(false);

  const fetchSongs = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "https://song-api-ognj.onrender.com" : "");
      const url = q
        ? `${baseUrl}/manalese/songs/search/${encodeURIComponent(q)}`
        : `${baseUrl}/manalese/songs`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setSongs(data);
      if (!q && data.length) {
        setCurrent(prev => prev || data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch songs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSongs(); }, [fetchSongs]);

  const selectSong = (s) => {
    setCurrent(s); setAutoplay(true); setPlayKey(k => k + 1);
    setLiked(false); setDisliked(false); setDescOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleLike = () => { setLiked(p => !p); if (!liked) setDisliked(false); };
  const handleDislike = () => { setDisliked(p => !p); if (!disliked) setLiked(false); };
  const handleSearch = (e) => { e.preventDefault(); fetchSongs(query); setMobSearch(false); };

  const likeCount = current ? pick(LIKES, current.id) : "0";

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:${C.bg}; color:${C.text}; font-family:${C.font}; font-size:14px; line-height:1.4; }
        ::-webkit-scrollbar { width:8px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:#3d3d3d; border-radius:4px; }
        input::placeholder { color:${C.textFaint}; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
      `}</style>

      {/* ══════════════ NAVBAR ══════════════ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100, height: 56,
        background: C.bg, display: "flex", alignItems: "center",
        padding: "0 16px", gap: 8, borderBottom: `1px solid ${C.borderFaint}`,
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, width: 220, flexShrink: 0 }}>
          <IcoBtn label="Menu">
            <Icon d="M21 6H3V5h18v1zm0 5H3v1h18v-1zm0 6H3v1h18v-1z" />
          </IcoBtn>
          <YTWordmark />
        </div>

        {/* Search — hides on mobile search mode */}
        {!mobSearch && (
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 728, display: "flex", gap: 4, alignItems: "center" }}>
            <div style={{ flex: 1, display: "flex", height: 40 }}>
              <div
                style={{ flex: 1, display: "flex", alignItems: "center", background: "#121212", border: "1px solid #303030", borderRight: "none", borderRadius: "40px 0 0 40px", padding: "0 16px", transition: "border-color .2s, background .2s" }}
                onFocusCapture={e => { e.currentTarget.style.borderColor = "#1c62b9"; e.currentTarget.style.background = "#000"; }}
                onBlurCapture={e => { e.currentTarget.style.borderColor = "#303030"; e.currentTarget.style.background = "#121212"; }}
              >
                <input type="text" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 16, caretColor: "#1c62b9" }} />
              </div>
              <button type="submit" style={{ width: 64, background: "#222", border: "1px solid #303030", borderRadius: "0 40px 40px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.text, transition: "background .1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#3d3d3d"}
                onMouseLeave={e => e.currentTarget.style.background = "#222"}>
                <Icon d="m20.87 20.17-5.59-5.59C16.35 13.35 17 11.75 17 10c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.75 0 3.35-.65 4.58-1.71l5.59 5.59.7-.71zM10 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
              </button>
            </div>
            <IcoBtn label="Microphone" style={{ background: "#222" }}>
              <Icon d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
            </IcoBtn>
          </form>
        )}

        {/* Right icons */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
          {/* Mobile search button */}
          <IcoBtn label="Search" onClick={() => setMobSearch(p => !p)}>
            <Icon d="m20.87 20.17-5.59-5.59C16.35 13.35 17 11.75 17 10c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.75 0 3.35-.65 4.58-1.71l5.59 5.59.7-.71zM10 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
          </IcoBtn>
          <IcoBtn label="Create video">
            <Icon d={["M14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2zm3-7H3v14h14v-9.38l4 3V6.62l-4 3V6M17 4c.55 0 1 .45 1 1v2.62l4-3v11.76l-4-3V19c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1h14z"]} />
          </IcoBtn>
          <IcoBtn label="Notifications" badge="9">
            <Icon d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </IcoBtn>
          <Avatar name="M" size={32} color="#8e24aa" />
        </div>
      </header>

      {/* Mobile search overlay */}
      {mobSearch && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: 56, background: C.bg, display: "flex", alignItems: "center", padding: "0 8px", gap: 8, borderBottom: `1px solid ${C.borderFaint}` }}>
          <IcoBtn label="Back" onClick={() => setMobSearch(false)}>
            <Icon d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </IcoBtn>
          <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", height: 40 }}>
            <div style={{ flex: 1, background: "#121212", border: "1px solid #1c62b9", borderRight: "none", borderRadius: "40px 0 0 40px", padding: "0 16px", display: "flex", alignItems: "center" }}>
              <input autoFocus type="text" placeholder="Search SongTube" value={query} onChange={e => setQuery(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 16, flex: 1 }} />
            </div>
            <button type="submit" style={{ width: 52, background: "#222", border: "1px solid #303030", borderRadius: "0 40px 40px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.text }}>
              <Icon d="m20.87 20.17-5.59-5.59C16.35 13.35 17 11.75 17 10c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.75 0 3.35-.65 4.58-1.71l5.59 5.59.7-.71zM10 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
            </button>
          </form>
        </div>
      )}

      {/* ══════════════ MAIN LAYOUT ══════════════ */}
      <div style={{ display: "flex", justifyContent: "center", maxWidth: 1800, margin: "0 auto", padding: "0 24px" }}>

        {/* ─────── LEFT: Player + info ─────── */}
        <div style={{ flex: 1, minWidth: 640, maxWidth: 1280, padding: "24px 24px 80px 0" }}>

          {/* Player box */}
          <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: 12, overflow: "hidden" }}>
            {loading ? (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid #333`, borderTopColor: C.text, animation: "spin .8s linear infinite" }} />
              </div>
            ) : current ? (
              <iframe key={playKey}
                src={`https://www.youtube.com/embed/${getVideoId(current.url)}?rel=0&modestbranding=1&autoplay=${autoplay ? 1 : 0}`}
                style={{ width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen referrerPolicy="strict-origin-when-cross-origin" title={current?.title} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted, fontSize: 16 }}>No videos found</div>
            )}
          </div>

          {/* Video info — animated in */}
          {current && (
            <div style={{ animation: "fadeIn .25s ease" }}>

              {/* Title */}
              <h1 style={{ fontSize: 20, fontWeight: 600, lineHeight: "28px", color: C.text, marginTop: 16, fontFamily: C.font }}>
                {current.title}
              </h1>

              {/* Channel row + actions */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginTop: 12, gap: 12 }}>

                {/* Channel */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={current.artist || "U"} size={40} color={avCol(current.artist || "U")} />
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: "22px" }}>{current.artist || "Unknown Artist"}</p>
                    <p style={{ fontSize: 13, color: C.textMuted, lineHeight: "18px" }}>1.24M subscribers</p>
                  </div>
                  {/* Subscribe button */}
                  <Btn0
                    onClick={() => setSubscribed(p => !p)}
                    style={{
                      height: 36, padding: "0 16px", borderRadius: 18,
                      background: subscribed ? C.surface : C.text,
                      color: subscribed ? C.text : C.bg,
                      fontSize: 14, fontWeight: 600, gap: 8,
                      transition: "background .15s, color .15s",
                    }}>
                    {subscribed
                      ? <><Icon d="M18.9 12.3h-1.5v3.56-3.56h1.5l-4.88 4.88-2.33-2.33-3.57 3.56-.76-.75 4.33-4.33 2.33 2.33 4.38-4.38.5.5zM18 7l-8 8-4-4" size={20} />Subscribed</>
                      : "Subscribe"
                    }
                  </Btn0>
                </div>

                {/* Action pills */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <LDPill liked={liked} disliked={disliked} count={likeCount} onLike={handleLike} onDislike={handleDislike} />
                  <PillBtn icon={<Icon d="M15 5.63 20.66 12 15 18.37V15h-1c-3.96 0-7.14 1-9.75 3.09 1.84-4.07 5.11-6.65 10.75-7.06V15l5.66-6.37L15 2.26V5h-1C9.2 5 5.12 7.74 3 12.55c1.52-2.83 4.07-4.9 7.98-5.47C11.91 7 12.97 7 14 7h1V5.63z" />} label="Share" />
                  <PillBtn icon={<Icon d="M17 18v1H6v-1h11zm-.5-6.6-.7-.7-3.8 3.7V4h-1v10.4l-3.8-3.8-.7.7 5 5 5-4.9z" />} label="Download" />
                  <PillBtn icon={<Icon d="M7.5 12c0 .83-.67 1.5-1.5 1.5S4.5 12.83 4.5 12 5.17 10.5 6 10.5s1.5.67 1.5 1.5zm4.5 0c0 .83-.67 1.5-1.5 1.5S9 12.83 9 12s.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm3 1.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z" />} />
                </div>
              </div>

              {/* ── Description box ── */}
              <div
                onClick={() => setDescOpen(p => !p)}
                style={{ marginTop: 16, background: C.surface, borderRadius: 12, padding: "12px 16px", cursor: "pointer", transition: "background .1s" }}
                onMouseEnter={e => e.currentTarget.style.background = C.surfaceHov}
                onMouseLeave={e => e.currentTarget.style.background = C.surface}
              >
                {/* Stats row */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0 8px", fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                  <span>{pick(VIEWS, current.id + "V")} views</span>
                  <span>{pick(AGOS, current.id + "A")}</span>
                  {current.genre && <span style={{ color: C.blue }}>#{current.genre.replace(/\s+/g, "")}</span>}
                </div>
                {/* Body */}
                <div style={{ fontSize: 14, color: C.text, lineHeight: "20px", overflow: "hidden", maxHeight: descOpen ? "none" : "44px" }}>
                  {current.album && <><b>Album:</b> {current.album} · </>}
                  <b>Genre:</b> {current.genre || "Various"}<br />
                  Enjoy high-quality music streaming powered by your Spring Boot backend API.
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, marginTop: 8, color: C.text }}>
                  {descOpen ? "Show less" : "...more"}
                </p>
              </div>

              {/* ── Comments ── */}
              <div style={{ marginTop: 24 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
                  <span style={{ fontSize: 18, fontWeight: 600 }}>
                    {124 + (hashInt(String(current.id)) % 200)} Comments
                  </span>
                  <Btn0 style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600 }}>
                    <Icon d="M4 15h8v-1H4v1zm0 4h6v-1H4v1zm0-8h11v-1H4v1zm0-4v1h16V7H4z" size={20} /> Sort by
                  </Btn0>
                </div>

                {/* Input row */}
                <div style={{ display: "flex", gap: 16, marginBottom: 28, alignItems: "flex-start" }}>
                  <Avatar name="M" size={40} color="#8e24aa" />
                  <div style={{ flex: 1, borderBottom: `1px solid ${C.textMuted}`, paddingBottom: 6 }}>
                    <input type="text" placeholder="Add a comment…"
                      style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 14, lineHeight: "22px" }}
                    />
                  </div>
                </div>

                {/* Comment list */}
                {MOCK_COMMENTS.map((c, i) => <CommentRow key={i} c={c} />)}
              </div>
            </div>
          )}
        </div>

        {/* ─────── RIGHT: Sidebar ─────── */}
        <div style={{ width: 402, flexShrink: 0, padding: "24px 0 80px 0", display: "flex", flexDirection: "column", gap: 0 }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid #333`, borderTopColor: C.text, animation: "spin .8s linear infinite" }} />
            </div>
          ) : (
            <>
              {/* Autoplay row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>Autoplay</span>
                <Toggle on={autoplay} onToggle={() => setAutoplay(p => !p)} />
              </div>

              {/* UP NEXT label */}
              {songs.length > 0 && (
                <p style={{ fontSize: 13, fontWeight: 500, color: C.textMuted, marginBottom: 8, paddingLeft: 4 }}>Up next</p>
              )}

              {/* Song cards */}
              {songs.length === 0
                ? <p style={{ color: C.textMuted, fontSize: 14, padding: "16px 4px" }}>No results found.</p>
                : songs.map(s => (
                  <SideCard key={s.id} song={s} active={current?.id === s.id} onClick={() => selectSong(s)} />
                ))
              }
            </>
          )}
        </div>
      </div>
    </>
  );
}