import { themes } from "../data.js";
import { applyBackground } from "./backgrounds.js";
import { renderWidgets } from "./widgets.js";
import { escapeHtml } from "../utils/dom.js";

function getFallbackAvatarUrl(name) {
  const seed = encodeURIComponent(name || "HyperTree");
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}`;
}

function getProxyAvatarUrl(sourceUrl) {
  if (!sourceUrl) return "";
  return `https://wsrv.nl/?url=${encodeURIComponent(sourceUrl)}&w=256&h=256&fit=cover`;
}

function applyTheme(customization) {
  const themeVars = themes[customization.theme] || themes.dark;
  Object.entries(themeVars).forEach(([name, value]) => {
    document.documentElement.style.setProperty(name, value);
  });

  document.documentElement.style.setProperty("--link-gap", `${customization.spacing}px`);

  const body = document.body;
  body.classList.remove("font-space", "font-sora", "font-mono", "font-display");
  body.classList.add(`font-${customization.font}`);

  const linkContainer = document.querySelector("#links-container");
  linkContainer.classList.remove("link-style-rounded", "link-style-square", "link-style-glass");
  linkContainer.classList.add(`link-style-${customization.buttonStyle}`);

  body.style.transitionDuration = customization.animations ? "350ms" : "1ms";
}

function renderProfile(state) {
  const { profile } = state;
  const nameEl = document.querySelector("#profile-name");
  const bioEl = document.querySelector("#profile-bio");
  const avatarEl = document.querySelector("#profile-avatar");
  const socialEl = document.querySelector("#social-icons");

  nameEl.innerHTML = `${escapeHtml(profile.name)} ${
    profile.verified ? '<i class="ri-verified-badge-fill text-sky-400"></i>' : ""
  }`;
  bioEl.textContent = profile.bio;

  const fallbackAvatar = getFallbackAvatarUrl(profile.name);
  const proxyAvatar = getProxyAvatarUrl(profile.avatar);
  avatarEl.onerror = null;
  avatarEl.onerror = () => {
    if (!avatarEl.dataset.proxyTried && proxyAvatar) {
      avatarEl.dataset.proxyTried = "1";
      avatarEl.src = proxyAvatar;
      return;
    }
    avatarEl.src = fallbackAvatar;
  };
  avatarEl.dataset.proxyTried = "";
  avatarEl.src = profile.avatar;

  socialEl.innerHTML = profile.socials
    .map(
      (social) => `
      <a class="btn-action rounded-full p-2" href="${escapeHtml(social.url)}" target="_blank" rel="noreferrer">
        <i class="${escapeHtml(social.icon)} text-lg"></i>
      </a>
    `
    )
    .join("");
}

function renderLinks(state, onLinkClick) {
  const container = document.querySelector("#links-container");
  container.innerHTML = state.links
    .map(
      (link, index) => `
      <article class="link-item" style="animation-delay:${index * 70}ms" data-link-id="${link.id}">
        <a
          href="${escapeHtml(link.url)}"
          data-id="${link.id}"
          class="link-btn"
          ${link.newTab ? 'target="_blank" rel="noreferrer"' : ""}
        >
          <span class="flex items-center gap-3">
            <i class="${escapeHtml(link.icon || "ri-links-line")}"></i>
            <span>${escapeHtml(link.title)}</span>
          </span>
          <span class="text-xs opacity-75">${link.clicks} clics</span>
        </a>
      </article>
    `
    )
    .join("");

  container.querySelectorAll("a[data-id]").forEach((anchor) => {
    anchor.addEventListener("click", () => {
      onLinkClick(anchor.dataset.id);
    });
  });
}

function renderQrCode() {
  const qr = document.querySelector("#qr-code");
  const url = new URL(window.location.href);
  if (url.pathname.endsWith("/dashboard.html") || url.pathname.endsWith("/login.html")) {
    url.pathname = url.pathname.replace(/\/(dashboard|login)\.html$/, "/index.html");
  }
  const target = encodeURIComponent(url.toString());
  qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${target}`;
}

export function renderApp(state, onLinkClick) {
  applyTheme(state.customization);
  applyBackground(state.customization);
  renderProfile(state);
  renderLinks(state, onLinkClick);
  renderWidgets(document.querySelector("#widgets-container"), state);
  renderQrCode();
}
