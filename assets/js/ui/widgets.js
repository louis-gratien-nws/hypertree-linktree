import { escapeHtml, formatNumber } from "../utils/dom.js";

const SPOTIFY_API_URLS = [
  "https://hypertree-linktree.vercel.app/api/spotify",
  "https://hypertree-linktree-ptb06vqj3-louis-gratien-nws-projects.vercel.app/api/spotify",
  "https://hypertree-linktree-da6m6yn4z-louis-gratien-nws-projects.vercel.app/api/spotify"
];

let _spotifyCache = null;
let _spotifyProgressTimer = null;

function renderSpotifyContent(data) {
  if (!data || !data.isPlaying) {
    return `<p class="text-xs opacity-50">Rien en cours de lecture</p>`;
  }
  const pct = Math.round((data.progress / data.duration) * 100);
  return `
    <a href="${escapeHtml(data.songUrl)}" target="_blank" rel="noreferrer"
       class="flex items-center gap-3">
      <img src="${escapeHtml(data.albumArt || '')}" alt=""
           class="w-12 h-12 rounded object-cover shrink-0" />
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-sm truncate">${escapeHtml(data.title)}</p>
        <p class="text-xs opacity-70 truncate">${escapeHtml(data.artist)}</p>
        <div class="mt-1 h-1 rounded-full bg-white/20 overflow-hidden">
          <div class="h-full rounded-full bg-[#1DB954]" style="width:${pct}%"></div>
        </div>
      </div>
      <i class="ri-spotify-fill text-[#1DB954] text-xl shrink-0"></i>
    </a>
  `;
}

function spotifyWidget() {
  return `
    <article class="widget-card" data-widget="spotify">
      <p class="text-xs uppercase tracking-widest opacity-70">Spotify</p>
      <div class="mt-2" data-spotify-content>
        ${_spotifyCache
          ? renderSpotifyContent(_spotifyCache)
          : '<p class="text-xs opacity-50 animate-pulse">Chargement...</p>'}
      </div>
    </article>
  `;
}

function setSpotifyStatus(message) {
  const el = document.querySelector("[data-spotify-content]");
  if (!el) return;
  el.innerHTML = `<p class="text-xs opacity-70">${escapeHtml(message)}</p>`;
}

export async function startSpotifyPoller(isEnabled) {
  if (!isEnabled) return;

  if (!_spotifyProgressTimer) {
    _spotifyProgressTimer = setInterval(() => {
      if (!_spotifyCache?.isPlaying || !_spotifyCache?.duration) {
        return;
      }

      _spotifyCache.progress = Math.min(
        (_spotifyCache.progress || 0) + 1000,
        _spotifyCache.duration
      );

      const el = document.querySelector("[data-spotify-content]");
      if (el) el.innerHTML = renderSpotifyContent(_spotifyCache);
    }, 1000);
  }

  async function poll() {
    let lastError = "";

    for (const apiUrl of SPOTIFY_API_URLS) {
      try {
        const noCacheUrl = `${apiUrl}?t=${Date.now()}`;
        const response = await fetch(noCacheUrl, { cache: "no-store" });
        if (!response.ok) {
          lastError = `API indisponible (${response.status})`;
          continue;
        }

        const data = await response.json();
        _spotifyCache = data;
        const el = document.querySelector("[data-spotify-content]");
        if (el) el.innerHTML = renderSpotifyContent(data);
        return;
      } catch {
        lastError = "Connexion API impossible";
      }
    }

    setSpotifyStatus(lastError || "Spotify indisponible");
  }

  await poll();
  return setInterval(poll, 3_000);
}

function followersWidget(stats) {
  return `
    <article class="widget-card">
      <p class="text-xs uppercase tracking-widest opacity-70">Followers</p>
      <p class="mt-2 text-2xl font-bold">${formatNumber(stats.followers)}</p>
      <p class="text-xs opacity-70">+2.8% cette semaine</p>
    </article>
  `;
}

function discordWidget(stats) {
  return `
    <article class="widget-card">
      <p class="text-xs uppercase tracking-widest opacity-70">Discord</p>
      <p class="mt-2 text-lg font-semibold">${formatNumber(stats.discordOnline)} en ligne</p>
      <a class="mt-2 inline-block text-sm underline" href="https://discord.com" target="_blank" rel="noreferrer">Rejoindre le serveur</a>
    </article>
  `;
}

function clockWidget(now) {
  return `
    <article class="widget-card" data-widget="clock">
      <p class="text-xs uppercase tracking-widest opacity-70">Horloge</p>
      <p class="mt-2 text-2xl font-bold" data-clock-time>${escapeHtml(now.toLocaleTimeString("fr-FR"))}</p>
      <p class="text-xs opacity-70" data-clock-date>${escapeHtml(now.toLocaleDateString("fr-FR"))}</p>
    </article>
  `;
}

function visitsWidget(stats) {
  return `
    <article class="widget-card">
      <p class="text-xs uppercase tracking-widest opacity-70">Visites</p>
      <p class="mt-2 text-2xl font-bold">${formatNumber(stats.visits)}</p>
      <p class="text-xs opacity-70">compteur local</p>
    </article>
  `;
}

export function renderWidgets(container, state) {
  const { widgets, stats } = state;
  const now = new Date();
  const blocks = [];

  if (widgets.spotify) blocks.push(spotifyWidget());
  if (widgets.followers) blocks.push(followersWidget(stats));
  if (widgets.discord) blocks.push(discordWidget(stats));
  if (widgets.clock) blocks.push(clockWidget(now));
  if (widgets.visits) blocks.push(visitsWidget(stats));

  container.innerHTML = blocks.join("") || '<p class="opacity-70 text-sm">Aucun widget actif.</p>';
}

export function updateClockWidget(container) {
  const timeEl = container.querySelector("[data-clock-time]");
  const dateEl = container.querySelector("[data-clock-date]");

  if (!timeEl || !dateEl) {
    return;
  }

  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString("fr-FR");
  dateEl.textContent = now.toLocaleDateString("fr-FR");
}
