import { defaultState, STORAGE_KEY } from "./data.js";
import { getState, setState } from "./state.js";
import {
  exportState,
  importState,
  incrementVisitCounter,
  resetState,
  saveState
} from "./storage.js";
import { renderApp } from "./ui/render.js";
import { initDashboard } from "./ui/dashboard.js";
import { updateClockWidget, startSpotifyPoller } from "./ui/widgets.js";
import { isAuthenticated, logout, requireAuth } from "./auth.js";

let state = getState();
let dashboard = null;
const appMode = document.body.dataset.appMode || "public";

function normalizeState(input) {
  return {
    ...structuredClone(defaultState),
    ...input,
    profile: { ...structuredClone(defaultState.profile), ...(input.profile || {}) },
    customization: {
      ...structuredClone(defaultState.customization),
      ...(input.customization || {})
    },
    widgets: { ...structuredClone(defaultState.widgets), ...(input.widgets || {}) },
    stats: { ...structuredClone(defaultState.stats), ...(input.stats || {}) },
    links: Array.isArray(input.links)
      ? input.links.map((link) => ({
          id: link.id || crypto.randomUUID(),
          title: link.title || "Sans titre",
          url: link.url || "#",
          icon: link.icon || "ri-links-line",
          newTab: Boolean(link.newTab),
          clicks: Number(link.clicks) || 0
        }))
      : structuredClone(defaultState.links)
  };
}

function persistAndRender() {
  setState(state);
  renderApp(state, handleLinkClick);
  dashboard?.refresh();
}

function updateState(mutator) {
  const draft = structuredClone(state);
  mutator(draft);
  state = draft;
  persistAndRender();
}

function handleLinkClick(linkId) {
  updateState((draft) => {
    const target = draft.links.find((link) => link.id === linkId);
    if (target) {
      target.clicks += 1;
    }
  });
}

function applyTiltEffect() {
  const card = document.querySelector("#profile-card");
  if (!card) {
    return;
  }

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${px * 8}deg) rotateX(${py * -8}deg)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
}

function startClockTicker() {
  setInterval(() => {
    if (!state.widgets.clock) {
      return;
    }
    updateClockWidget(document.querySelector("#widgets-container"));
  }, 1000);
}

function applyAutoDarkModeOnFirstVisit() {
  if (localStorage.getItem(STORAGE_KEY)) {
    return;
  }
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (!isDark) {
    state.customization.theme = "light";
  }
  saveState(state);
}

function initPublicModeUI() {
  const panel = document.querySelector("#editor-panel");
  if (panel) {
    panel.classList.add("hidden");
  }

  const loginButton = document.querySelector("#go-login");
  if (!loginButton) {
    return;
  }

  if (isAuthenticated()) {
    loginButton.innerHTML = '<i class="ri-dashboard-line mr-1"></i> Ouvrir Dashboard';
    loginButton.addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });
    return;
  }

  loginButton.addEventListener("click", () => {
    window.location.href = "login.html";
  });
}

function initDashboardModeUI() {
  if (!requireAuth("index.html")) {
    return false;
  }

  const logoutBtn = document.querySelector("#logout-btn");
  logoutBtn?.addEventListener("click", () => {
    logout();
    window.location.href = "index.html";
  });

  return true;
}

function init() {
  if (appMode === "dashboard") {
    const canContinue = initDashboardModeUI();
    if (!canContinue) {
      return;
    }
  } else {
    initPublicModeUI();
  }

  applyAutoDarkModeOnFirstVisit();
  state = incrementVisitCounter(state);

  if (appMode === "dashboard") {
    dashboard = initDashboard({
      getState: () => state,
      updateProfile: (patch) =>
        updateState((draft) => {
          draft.profile = { ...draft.profile, ...patch };
        }),
      upsertLink: (payload) =>
        updateState((draft) => {
          const index = draft.links.findIndex((item) => item.id === payload.id);
          if (index === -1) {
            draft.links.push({ ...payload, clicks: 0 });
            return;
          }
          draft.links[index] = {
            ...draft.links[index],
            ...payload
          };
        }),
      deleteLink: (id) =>
        updateState((draft) => {
          draft.links = draft.links.filter((item) => item.id !== id);
        }),
      reorderLinks: (from, to) =>
        updateState((draft) => {
          const [moved] = draft.links.splice(from, 1);
          draft.links.splice(to, 0, moved);
        }),
      updateCustomization: (patch) =>
        updateState((draft) => {
          draft.customization = { ...draft.customization, ...patch };
        }),
      updateWidget: (name, value) =>
        updateState((draft) => {
          draft.widgets[name] = value;
        }),
      exportConfig: () => exportState(state),
      importConfig: async (file) => {
        try {
          const imported = await importState(file);
          state = normalizeState(imported);
          persistAndRender();
        } catch {
          alert("Import invalide: le JSON est incorrect.");
        }
      },
      resetAll: () => {
        state = resetState();
        persistAndRender();
      }
    });
  }

  persistAndRender();
  applyTiltEffect();
  startClockTicker();
  startSpotifyPoller(state.widgets.spotify);
}

init();
