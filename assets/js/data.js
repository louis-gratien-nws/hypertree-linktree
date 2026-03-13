export const STORAGE_KEY = "hypertree-config-v2";

export const defaultState = {
  profile: {
    name: "Louis Studio",
    bio: "Design, code et vibes visuelles. Bienvenue dans mon hub.",
    avatar:
      "https://i.scdn.co/image/ab6775700000ee8571b30e0567812487d823e94e",
    verified: true,
    socials: [
      { icon: "ri-instagram-line", url: "https://instagram.com" },
      { icon: "ri-youtube-line", url: "https://youtube.com" },
      { icon: "ri-github-line", url: "https://github.com" },
      { icon: "ri-tiktok-line", url: "https://tiktok.com" }
    ]
  },
  links: [
    {
      id: crypto.randomUUID(),
      title: "Portfolio 2026",
      url: "https://example.com/portfolio",
      icon: "ri-window-line",
      newTab: true,
      clicks: 0
    },
    {
      id: crypto.randomUUID(),
      title: "Mon Shop",
      url: "https://example.com/shop",
      icon: "ri-shopping-bag-4-line",
      newTab: true,
      clicks: 0
    },
    {
      id: crypto.randomUUID(),
      title: "Prendre rendez-vous",
      url: "https://cal.com",
      icon: "ri-calendar-line",
      newTab: true,
      clicks: 0
    }
  ],
  customization: {
    theme: "dark",
    font: "space",
    buttonStyle: "rounded",
    spacing: 14,
    animations: true,
    background: "youtube",
    bgImage:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1920&q=80",
    bgVideo: "https://cdn.coverr.co/videos/coverr-clouds-over-mountains-1579/1080p.mp4",
    bgYouTube: "https://www.youtube.com/watch?v=zhDwjnYZiCo&t=1218s",
    overlayOpacity: 45,
    adaptiveColors: true
  },
  widgets: {
    spotify: true,
    followers: true,
    discord: false,
    clock: true,
    visits: true
  },
  stats: {
    followers: 18432,
    discordOnline: 128,
    visits: 0
  }
};

export const themes = {
  dark: {
    "--bg-primary": "#020617",
    "--bg-secondary": "#0f172a",
    "--text-primary": "#f8fafc",
    "--text-secondary": "#cbd5e1",
    "--accent": "#38bdf8",
    "--accent-strong": "#0ea5e9",
    "--card": "rgba(15, 23, 42, 0.55)"
  },
  light: {
    "--bg-primary": "#f8fafc",
    "--bg-secondary": "#e2e8f0",
    "--text-primary": "#0f172a",
    "--text-secondary": "#334155",
    "--accent": "#2563eb",
    "--accent-strong": "#1d4ed8",
    "--card": "rgba(255, 255, 255, 0.75)"
  },
  neon: {
    "--bg-primary": "#07121f",
    "--bg-secondary": "#081b31",
    "--text-primary": "#dbf8ff",
    "--text-secondary": "#95d5e8",
    "--accent": "#00ffcc",
    "--accent-strong": "#00d3ff",
    "--card": "rgba(0, 31, 39, 0.55)"
  },
  cyberpunk: {
    "--bg-primary": "#1a0933",
    "--bg-secondary": "#300a59",
    "--text-primary": "#ffe8ff",
    "--text-secondary": "#ffc2eb",
    "--accent": "#ffea00",
    "--accent-strong": "#ff3ef2",
    "--card": "rgba(49, 10, 89, 0.58)"
  },
  minimal: {
    "--bg-primary": "#fafaf9",
    "--bg-secondary": "#f5f5f4",
    "--text-primary": "#111827",
    "--text-secondary": "#4b5563",
    "--accent": "#111827",
    "--accent-strong": "#1f2937",
    "--card": "rgba(255, 255, 255, 0.85)"
  },
  glass: {
    "--bg-primary": "#0d1321",
    "--bg-secondary": "#1d2d44",
    "--text-primary": "#edf6f9",
    "--text-secondary": "#c7d2fe",
    "--accent": "#7dd3fc",
    "--accent-strong": "#38bdf8",
    "--card": "rgba(224, 242, 254, 0.12)"
  }
};
