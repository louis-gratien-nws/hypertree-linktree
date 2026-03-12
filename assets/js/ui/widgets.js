import { escapeHtml, formatNumber } from "../utils/dom.js";

function spotifyWidget() {
  return `
    <article class="widget-card">
      <p class="text-xs uppercase tracking-widest opacity-70">Spotify</p>
      <iframe
        class="mt-2 h-[80px] w-full rounded-lg"
        src="https://open.spotify.com/embed/track/2takcwOaAZWiXQijPHIx7B"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      ></iframe>
    </article>
  `;
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
