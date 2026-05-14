"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import "./sap-music-player.css";

// ---------- Data ----------
interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  gradient: string;
  initials: string;
  year: number;
}

const TRACKS: Track[] = [
  { id: 1, title: "Strobe", artist: "Deadmau5", album: "For Lack of a Better Name", durationSec: 627, gradient: "linear-gradient(135deg, #2A6FDB 0%, #0070F2 45%, #003D86 100%)", initials: "FL", year: 2009 },
  { id: 2, title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", durationSec: 244, gradient: "linear-gradient(135deg, #FFE17F 0%, #E76500 60%, #AA2608 100%)", initials: "M83", year: 2011 },
  { id: 3, title: "Teardrop", artist: "Massive Attack", album: "Mezzanine", durationSec: 331, gradient: "linear-gradient(135deg, #1D2D3E 0%, #556B82 100%)", initials: "MZ", year: 1998 },
  { id: 4, title: "Weightless", artist: "Marconi Union", album: "Weightless (Ambient Transmissions Vol. 2)", durationSec: 487, gradient: "linear-gradient(135deg, #C0E5FF 0%, #2A6FDB 100%)", initials: "MU", year: 2011 },
  { id: 5, title: "Porcelain", artist: "Moby", album: "Play", durationSec: 240, gradient: "linear-gradient(135deg, #EBF5CB 0%, #256F3A 100%)", initials: "PL", year: 1999 },
  { id: 6, title: "Intro", artist: "The xx", album: "xx", durationSec: 128, gradient: "linear-gradient(135deg, #131E29 0%, #2A6FDB 100%)", initials: "XX", year: 2009 },
  { id: 7, title: "Avril 14th", artist: "Aphex Twin", album: "Drukqs", durationSec: 125, gradient: "linear-gradient(135deg, #FFD6E9 0%, #BC4FE5 100%)", initials: "DK", year: 2001 },
  { id: 8, title: "Svefn-g-englar", artist: "Sigur Rós", album: "Ágætis byrjun", durationSec: 600, gradient: "linear-gradient(135deg, #D1EFFF 0%, #758CA4 100%)", initials: "ÁB", year: 1999 },
  { id: 9, title: "Music Sounds Better With You", artist: "Stardust", album: "Music Sounds Better With You", durationSec: 222, gradient: "linear-gradient(135deg, #BC4FE5 0%, #4F35E6 100%)", initials: "ST", year: 1998 },
  { id: 10, title: "Untitled #3", artist: "Sigur Rós", album: "( )", durationSec: 401, gradient: "linear-gradient(135deg, #F5F6F7 0%, #BCC3CA 100%)", initials: "( )", year: 2002 },
];

const PLAYLISTS = [
  { id: "p1", name: "Focus / Deep Work", count: 84, color: "#0070F2" },
  { id: "p2", name: "Sunday Mornings", count: 32, color: "#E76500" },
  { id: "p3", name: "Late Night Coding", count: 56, color: "#131E29" },
  { id: "p4", name: "Q3 Roadmap Mix", count: 18, color: "#256F3A" },
  { id: "p5", name: "Ambient Reading", count: 41, color: "#BC4FE5" },
];

function fmtTime(s: number): string {
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

// ---------- Inline SVG icons ----------
const PlayIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5.5v13a1 1 0 0 0 1.55.83l10-6.5a1 1 0 0 0 0-1.66l-10-6.5A1 1 0 0 0 8 5.5z" />
  </svg>
);
const PauseIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <rect x="6.5" y="5" width="4" height="14" rx="1" />
    <rect x="13.5" y="5" width="4" height="14" rx="1" />
  </svg>
);
const PrevIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M7 5a1 1 0 0 1 1 1v5.3l8.45-5.49A1 1 0 0 1 18 6.65v10.7a1 1 0 0 1-1.55.84L8 12.7V18a1 1 0 0 1-2 0V6a1 1 0 0 1 1-1z" />
  </svg>
);
const NextIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17 5a1 1 0 0 0-1 1v5.3L7.55 5.81A1 1 0 0 0 6 6.65v10.7a1 1 0 0 0 1.55.84L16 12.7V18a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" />
  </svg>
);
const ShuffleIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);
const RepeatIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
const VolumeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);
const QueueIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="3" y1="6" x2="14" y2="6" />
    <line x1="3" y1="12" x2="14" y2="12" />
    <line x1="3" y1="18" x2="9" y2="18" />
    <polygon points="16 13 16 21 22 17 16 13" fill="currentColor" stroke="none" />
  </svg>
);
const HeartIcon = ({ size = 18, filled = false }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const CastIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2 16v2a2 2 0 0 0 2 2h2" />
    <path d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-8" />
    <line x1="2" y1="20" x2="2.01" y2="20" />
    <path d="M2 12a8 8 0 0 1 8 8" />
    <path d="M2 16a4 4 0 0 1 4 4" />
  </svg>
);
const AddIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const MoreIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </svg>
);

// SAP mask-based icon
function SapIcon({ name, size = 16 }: { name: string; size?: number }) {
  return (
    <span
      className="sap-icon-mask"
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(/sap-icons/${name}.svg)`,
        maskImage: `url(/sap-icons/${name}.svg)`,
      }}
    />
  );
}

// ---------- Slider ----------
function Slider({ value, max, onChange, ariaLabel }: {
  value: number;
  max: number;
  onChange?: (v: number) => void;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const pct = max ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  const updateFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const newPct = Math.min(1, Math.max(0, x / r.width));
    onChange?.(newPct * max);
  }, [max, onChange]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => updateFromEvent(e);
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [dragging, updateFromEvent]);

  return (
    <div
      className="sap-slider"
      ref={ref}
      role="slider"
      aria-label={ariaLabel}
      aria-valuenow={Math.round(value)}
      aria-valuemax={Math.round(max)}
      onMouseDown={(e) => { setDragging(true); updateFromEvent(e); }}
    >
      <div className="sap-slider__track">
        <div className="sap-slider__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="sap-slider__thumb" style={{ left: `${pct}%` }} />
    </div>
  );
}

// ---------- Shell Bar ----------
function ShellBar() {
  return (
    <header className="sap-shell">
      <button className="sap-shell-btn" aria-label="Menu">
        <SapIcon name="menu" size={18} />
      </button>
      <a className="sap-shell__branding" href="#">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sap-logo.svg" alt="SAP" />
        <span className="sap-shell__branding-text">Music Player</span>
      </a>
      <div className="sap-shell__separator" />
      <span className="sap-shell__module">My Library</span>
      <div className="sap-shell__search">
        <span className="sap-shell__search-icon">
          <SapIcon name="search" size={14} />
        </span>
        <input placeholder="Search songs, artists, albums…" />
      </div>
      <div className="sap-shell__spacer" />
      <div className="sap-shell__actions">
        <button className="sap-shell-btn" aria-label="Notifications">
          <SapIcon name="bell" size={18} />
          <span className="sap-shell-btn__badge">2</span>
        </button>
        <button className="sap-shell-btn" aria-label="Help">
          <SapIcon name="hint" size={18} />
        </button>
        <button className="sap-shell-btn" aria-label="Settings">
          <SapIcon name="settings" size={18} />
        </button>
        <button className="sap-shell__avatar" aria-label="Account">AK</button>
      </div>
    </header>
  );
}

// ---------- Side Navigation ----------
function SideNav({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const navItem = (id: string, icon: string, label: string, count?: number) => (
    <a
      key={id}
      className={`sap-sidenav-item${activeId === id ? " sap-sidenav-item--active" : ""}`}
      href="#"
      onClick={(e) => { e.preventDefault(); onSelect(id); }}
    >
      <SapIcon name={icon} size={18} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
      {count != null && <span className="sap-sidenav-item__count">{count}</span>}
    </a>
  );

  return (
    <nav className="sap-sidenav">
      {navItem("home", "home", "Home")}
      {navItem("browse", "list", "Browse")}
      {navItem("inbox", "inbox", "New Releases")}

      <div className="sap-sidenav__divider" />
      <div className="sap-sidenav__section-label">Library</div>

      {navItem("liked", "favorite", "Liked Songs", 312)}
      {navItem("saved", "bookmark", "Saved Albums", 47)}
      {navItem("artists", "group", "Followed Artists", 28)}

      <div className="sap-sidenav__divider" />
      <div className="sap-sidenav__section-label">Playlists</div>

      {PLAYLISTS.map((p) => (
        <a
          key={p.id}
          className={`sap-sidenav-item${activeId === p.id ? " sap-sidenav-item--active" : ""}`}
          href="#"
          onClick={(e) => { e.preventDefault(); onSelect(p.id); }}
        >
          <span className="sap-playlist-thumb" style={{ background: p.color }}>{p.name[0]}</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
          <span className="sap-sidenav-item__count">{p.count}</span>
        </a>
      ))}
    </nav>
  );
}

// ---------- Album Art ----------
function AlbumArt({ track }: { track: Track }) {
  return (
    <div className="sap-album-art" style={{ background: track.gradient }}>
      <div className="sap-album-art__noise" />
      <div className="sap-album-art__title">{track.initials}</div>
    </div>
  );
}

function MiniArt({ track, size = 36 }: { track: Track; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: track.gradient,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.32,
        fontFamily: "var(--sap-font-family-brand)",
        flexShrink: 0,
      }}
    >
      {track.initials}
    </div>
  );
}

// ---------- Now Playing ----------
function NowPlaying({ track, liked, onToggleLike }: {
  track: Track;
  liked: boolean;
  onToggleLike: () => void;
}) {
  return (
    <section className="sap-np">
      <div className="sap-np__header">
        <div className="sap-np__header-title">Now Playing</div>
        <span className="sap-tag sap-tag--info">Listening</span>
        <div className="sap-np__header-spacer" />
        <button className="sap-btn sap-btn--tertiary sap-btn--icon" aria-label="More options">
          <MoreIcon size={16} />
        </button>
      </div>
      <div className="sap-np__body">
        <AlbumArt track={track} />
        <div className="sap-np__info">
          <div className="sap-np__eyebrow">Track · From {track.album}</div>
          <h2 className="sap-np__track-title">{track.title}</h2>
          <div className="sap-np__artist">
            by <a href="#">{track.artist}</a>
          </div>
          <div className="sap-np__album">{track.album} · {track.year}</div>

          <div className="sap-np__meta">
            <div className="sap-np__meta-item">
              <span className="sap-np__meta-label">Duration</span>
              <span className="sap-np__meta-value">{fmtTime(track.durationSec)}</span>
            </div>
            <div className="sap-np__meta-item">
              <span className="sap-np__meta-label">Quality</span>
              <span className="sap-np__meta-value">Lossless · 24-bit</span>
            </div>
            <div className="sap-np__meta-item">
              <span className="sap-np__meta-label">Source</span>
              <span className="sap-np__meta-value">Stream</span>
            </div>
          </div>

          <div className="sap-np__actions">
            <button className="sap-btn sap-btn--secondary" onClick={onToggleLike}>
              <HeartIcon size={16} filled={liked} />
              {liked ? "Liked" : "Like"}
            </button>
            <button className="sap-btn sap-btn--tertiary">
              <AddIcon size={14} />Add to Playlist
            </button>
            <button className="sap-btn sap-btn--tertiary">
              <CastIcon size={14} />Devices
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Queue ----------
function QueuePanel({ tracks, currentId, onPlay, isPlaying }: {
  tracks: Track[];
  currentId: number;
  onPlay: (id: number) => void;
  isPlaying: boolean;
}) {
  return (
    <section className="sap-queue">
      <div className="sap-queue__header">
        <span className="sap-queue__title">Up Next</span>
        <span className="sap-queue__count">({tracks.length})</span>
        <div className="sap-queue__spacer" />
        <button className="sap-btn sap-btn--tertiary sap-btn--icon" aria-label="Shuffle">
          <ShuffleIcon size={14} />
        </button>
        <button className="sap-btn sap-btn--tertiary sap-btn--icon" aria-label="More options">
          <MoreIcon size={16} />
        </button>
      </div>
      <div className="sap-queue__list">
        {tracks.map((t, i) => {
          const playing = t.id === currentId;
          return (
            <div
              key={t.id}
              className={`sap-queue-row${playing ? " sap-queue-row--playing" : ""}`}
              onClick={() => onPlay(t.id)}
            >
              <div className="sap-queue-row__index">
                {playing && isPlaying ? (
                  <span className="sap-eq" aria-label="Playing">
                    <span /><span /><span /><span />
                  </span>
                ) : (
                  (i + 1).toString().padStart(2, "0")
                )}
              </div>
              <MiniArt track={t} />
              <div className="sap-queue-row__title-col">
                <div className="sap-queue-row__title">{t.title}</div>
                <div className="sap-queue-row__artist">{t.artist} · {t.album}</div>
              </div>
              <div className="sap-queue-row__duration">{fmtTime(t.durationSec)}</div>
              <button
                className="sap-queue-row__menu"
                aria-label="Track options"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreIcon size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------- Player Bar ----------
function PlayerBar({
  track, isPlaying, onTogglePlay, onPrev, onNext,
  position, onSeek, shuffle, onShuffle, repeat, onRepeat,
  volume, onVolume, liked, onToggleLike,
}: {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  position: number;
  onSeek: (v: number) => void;
  shuffle: boolean;
  onShuffle: () => void;
  repeat: boolean;
  onRepeat: () => void;
  volume: number;
  onVolume: (v: number) => void;
  liked: boolean;
  onToggleLike: () => void;
}) {
  return (
    <footer className="sap-player">
      <div className="sap-player__nowplaying">
        <MiniArt track={track} size={56} />
        <div className="sap-player__nowplaying-info">
          <div className="sap-player__nowplaying-title">{track.title}</div>
          <div className="sap-player__nowplaying-artist">{track.artist}</div>
        </div>
        <button
          className={`sap-player__like${liked ? " sap-player__like--liked" : ""}`}
          onClick={onToggleLike}
          aria-label="Like"
        >
          <HeartIcon size={18} filled={liked} />
        </button>
      </div>

      <div className="sap-player__center">
        <div className="sap-player__controls">
          <button
            className={`sap-ctrl-btn${shuffle ? " sap-ctrl-btn--active" : ""}`}
            onClick={onShuffle}
            aria-label="Shuffle"
          >
            <ShuffleIcon size={16} />
          </button>
          <button className="sap-ctrl-btn" onClick={onPrev} aria-label="Previous">
            <PrevIcon size={18} />
          </button>
          <button className="sap-play-btn" onClick={onTogglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
          </button>
          <button className="sap-ctrl-btn" onClick={onNext} aria-label="Next">
            <NextIcon size={18} />
          </button>
          <button
            className={`sap-ctrl-btn${repeat ? " sap-ctrl-btn--active" : ""}`}
            onClick={onRepeat}
            aria-label="Repeat"
          >
            <RepeatIcon size={16} />
          </button>
        </div>
        <div className="sap-player__progress">
          <span className="sap-player__time">{fmtTime(position)}</span>
          <Slider value={position} max={track.durationSec} onChange={onSeek} ariaLabel="Seek" />
          <span className="sap-player__time">{fmtTime(track.durationSec)}</span>
        </div>
      </div>

      <div className="sap-player__right">
        <button className="sap-ctrl-btn" aria-label="Queue"><QueueIcon size={16} /></button>
        <button className="sap-ctrl-btn" aria-label="Cast"><CastIcon size={16} /></button>
        <div className="sap-player__volume">
          <VolumeIcon size={16} />
          <Slider value={volume} max={100} onChange={onVolume} ariaLabel="Volume" />
        </div>
      </div>
    </footer>
  );
}

// ---------- App ----------
export default function SapMusicPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [position, setPosition] = useState(96);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [volume, setVolume] = useState(72);
  const [liked, setLiked] = useState<Record<number, boolean>>({ 1: true, 3: true });
  const [activeNav, setActiveNav] = useState("liked");

  const track = TRACKS[currentIndex];

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      setPosition((p) => {
        if (p + 1 >= track.durationSec) {
          setCurrentIndex((i) => (i + 1) % TRACKS.length);
          return 0;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isPlaying, track.durationSec]);

  const playId = (id: number) => {
    const i = TRACKS.findIndex((t) => t.id === id);
    if (i >= 0) { setCurrentIndex(i); setPosition(0); setIsPlaying(true); }
  };
  const prev = () => {
    if (position > 3) { setPosition(0); return; }
    setCurrentIndex((i) => (i - 1 + TRACKS.length) % TRACKS.length);
    setPosition(0);
  };
  const next = () => {
    setCurrentIndex((i) => (i + 1) % TRACKS.length);
    setPosition(0);
  };
  const toggleLike = () => setLiked((m) => ({ ...m, [track.id]: !m[track.id] }));

  return (
    <div className="sap-root">
      <ShellBar />
      <div className="sap-body">
        <SideNav activeId={activeNav} onSelect={setActiveNav} />
        <main className="sap-main">
          <div className="sap-page-header">
            <div className="sap-page-header__breadcrumb">
              <a href="#">Library</a><span>›</span>
              <a href="#">Liked Songs</a><span>›</span>
              <span>Now Playing</span>
            </div>
            <h1 className="sap-page-header__title">Liked Songs</h1>
            <div className="sap-page-header__sub">
              {TRACKS.length} tracks · 53 min · Last updated May 8, 2026
            </div>
          </div>
          <div className="sap-content">
            <NowPlaying
              track={track}
              liked={!!liked[track.id]}
              onToggleLike={toggleLike}
            />
            <QueuePanel
              tracks={TRACKS}
              currentId={track.id}
              onPlay={playId}
              isPlaying={isPlaying}
            />
          </div>
        </main>
      </div>
      <PlayerBar
        track={track}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onPrev={prev}
        onNext={next}
        position={position}
        onSeek={setPosition}
        shuffle={shuffle}
        onShuffle={() => setShuffle((v) => !v)}
        repeat={repeat}
        onRepeat={() => setRepeat((v) => !v)}
        volume={volume}
        onVolume={setVolume}
        liked={!!liked[track.id]}
        onToggleLike={toggleLike}
      />
    </div>
  );
}
