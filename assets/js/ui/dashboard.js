import { $ } from "../utils/dom.js";

export function initDashboard(api) {
  const refs = {
    panel: $("#editor-panel"),
    openBtn: $("#open-editor"),
    closeBtn: $("#close-editor"),
    mobileToggleBtn: $("#toggle-mobile-panel"),

    name: $("#input-name"),
    bio: $("#input-bio"),
    avatar: $("#input-avatar"),
    verified: $("#input-verified"),

    linkForm: $("#link-form"),
    linkId: $("#link-id"),
    linkTitle: $("#link-title"),
    linkUrl: $("#link-url"),
    linkIcon: $("#link-icon"),
    linkNewTab: $("#link-new-tab"),
    linkAdminList: $("#link-admin-list"),

    theme: $("#select-theme"),
    font: $("#select-font"),
    buttonStyle: $("#select-button-style"),
    spacing: $("#input-spacing"),
    animations: $("#input-animations"),
    background: $("#select-background"),
    bgImage: $("#input-bg-image"),
    bgVideo: $("#input-bg-video"),
    bgYouTube: $("#input-bg-youtube"),
    bgOverlay: $("#input-bg-overlay"),
    adaptiveColors: $("#input-adaptive-colors"),

    widgetSpotify: $("#widget-spotify"),
    widgetFollowers: $("#widget-followers"),
    widgetDiscord: $("#widget-discord"),
    widgetClock: $("#widget-clock"),
    widgetVisits: $("#widget-visits"),

    exportBtn: $("#btn-export"),
    resetBtn: $("#btn-reset"),
    importFile: $("#import-file")
  };

  function syncFormWithState() {
    const state = api.getState();
    refs.name.value = state.profile.name;
    refs.bio.value = state.profile.bio;
    refs.avatar.value = state.profile.avatar;
    refs.verified.checked = state.profile.verified;

    refs.theme.value = state.customization.theme;
    refs.font.value = state.customization.font;
    refs.buttonStyle.value = state.customization.buttonStyle;
    refs.spacing.value = String(state.customization.spacing);
    refs.animations.checked = state.customization.animations;
    refs.background.value = state.customization.background;
    refs.bgImage.value = state.customization.bgImage;
    refs.bgVideo.value = state.customization.bgVideo;
    refs.bgYouTube.value = state.customization.bgYouTube || "";
    refs.bgOverlay.value = String(state.customization.overlayOpacity ?? 45);
    refs.adaptiveColors.checked = Boolean(state.customization.adaptiveColors);

    refs.widgetSpotify.checked = state.widgets.spotify;
    refs.widgetFollowers.checked = state.widgets.followers;
    refs.widgetDiscord.checked = state.widgets.discord;
    refs.widgetClock.checked = state.widgets.clock;
    refs.widgetVisits.checked = state.widgets.visits;

    renderAdminLinks(state.links);
  }

  function renderAdminLinks(links) {
    refs.linkAdminList.innerHTML = links
      .map(
        (link, index) => `
        <li
          class="rounded-xl border border-white/15 bg-black/20 p-2"
          draggable="true"
          data-index="${index}"
          data-id="${link.id}"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium">${link.title}</p>
              <p class="truncate text-xs opacity-70">${link.url}</p>
            </div>
            <div class="flex items-center gap-1">
              <button class="btn-action rounded-md px-2 py-1 text-xs" data-action="edit" data-id="${link.id}" type="button">Edit</button>
              <button class="rounded-md bg-red-500/70 px-2 py-1 text-xs" data-action="delete" data-id="${link.id}" type="button">Del</button>
            </div>
          </div>
        </li>
      `
      )
      .join("");

    let dragIndex = null;

    refs.linkAdminList.querySelectorAll("li").forEach((item) => {
      item.addEventListener("dragstart", () => {
        dragIndex = Number(item.dataset.index);
      });
      item.addEventListener("dragover", (event) => {
        event.preventDefault();
      });
      item.addEventListener("drop", () => {
        const toIndex = Number(item.dataset.index);
        if (dragIndex === null || dragIndex === toIndex) {
          return;
        }
        api.reorderLinks(dragIndex, toIndex);
        dragIndex = null;
      });
    });
  }

  function bindPanelToggle() {
    const showPanel = () => {
      refs.panel.classList.remove("hidden");
    };
    const hidePanel = () => {
      if (window.innerWidth < 768) {
        refs.panel.classList.add("hidden");
      }
    };

    refs.openBtn.addEventListener("click", showPanel);
    refs.mobileToggleBtn.addEventListener("click", showPanel);
    refs.closeBtn?.addEventListener("click", hidePanel);

    if (window.innerWidth < 768) {
      refs.panel.classList.add("hidden");
    }
  }

  function bindProfileEvents() {
    refs.name.addEventListener("input", () => api.updateProfile({ name: refs.name.value }));
    refs.bio.addEventListener("input", () => api.updateProfile({ bio: refs.bio.value }));
    refs.avatar.addEventListener("input", () => api.updateProfile({ avatar: refs.avatar.value }));
    refs.verified.addEventListener("change", () => api.updateProfile({ verified: refs.verified.checked }));
  }

  function bindLinkEvents() {
    refs.linkForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const payload = {
        id: refs.linkId.value || crypto.randomUUID(),
        title: refs.linkTitle.value.trim(),
        url: refs.linkUrl.value.trim(),
        icon: refs.linkIcon.value.trim() || "ri-links-line",
        newTab: refs.linkNewTab.checked
      };

      api.upsertLink(payload);

      refs.linkForm.reset();
      refs.linkId.value = "";
      refs.linkNewTab.checked = true;
    });

    refs.linkAdminList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) {
        return;
      }
      const id = button.dataset.id;
      const action = button.dataset.action;
      const state = api.getState();
      const link = state.links.find((item) => item.id === id);
      if (!link) {
        return;
      }

      if (action === "delete") {
        api.deleteLink(id);
        return;
      }

      refs.linkId.value = link.id;
      refs.linkTitle.value = link.title;
      refs.linkUrl.value = link.url;
      refs.linkIcon.value = link.icon;
      refs.linkNewTab.checked = link.newTab;
      refs.linkTitle.focus();
    });
  }

  function bindCustomizationEvents() {
    refs.theme.addEventListener("change", () => api.updateCustomization({ theme: refs.theme.value }));
    refs.font.addEventListener("change", () => api.updateCustomization({ font: refs.font.value }));
    refs.buttonStyle.addEventListener("change", () =>
      api.updateCustomization({ buttonStyle: refs.buttonStyle.value })
    );
    refs.spacing.addEventListener("input", () => api.updateCustomization({ spacing: Number(refs.spacing.value) }));
    refs.animations.addEventListener("change", () =>
      api.updateCustomization({ animations: refs.animations.checked })
    );
    refs.background.addEventListener("change", () =>
      api.updateCustomization({ background: refs.background.value })
    );
    refs.bgImage.addEventListener("input", () => api.updateCustomization({ bgImage: refs.bgImage.value }));
    refs.bgVideo.addEventListener("input", () => api.updateCustomization({ bgVideo: refs.bgVideo.value }));
    refs.bgYouTube.addEventListener("input", () =>
      api.updateCustomization({ bgYouTube: refs.bgYouTube.value })
    );
    refs.bgOverlay.addEventListener("input", () =>
      api.updateCustomization({ overlayOpacity: Number(refs.bgOverlay.value) })
    );
    refs.adaptiveColors.addEventListener("change", () =>
      api.updateCustomization({ adaptiveColors: refs.adaptiveColors.checked })
    );
  }

  function bindWidgetEvents() {
    refs.widgetSpotify.addEventListener("change", () => api.updateWidget("spotify", refs.widgetSpotify.checked));
    refs.widgetFollowers.addEventListener("change", () =>
      api.updateWidget("followers", refs.widgetFollowers.checked)
    );
    refs.widgetDiscord.addEventListener("change", () => api.updateWidget("discord", refs.widgetDiscord.checked));
    refs.widgetClock.addEventListener("change", () => api.updateWidget("clock", refs.widgetClock.checked));
    refs.widgetVisits.addEventListener("change", () => api.updateWidget("visits", refs.widgetVisits.checked));
  }

  function bindConfigEvents() {
    refs.exportBtn.addEventListener("click", () => api.exportConfig());
    refs.resetBtn.addEventListener("click", () => api.resetAll());
    refs.importFile.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (file) {
        api.importConfig(file);
      }
      refs.importFile.value = "";
    });
  }

  bindPanelToggle();
  bindProfileEvents();
  bindLinkEvents();
  bindCustomizationEvents();
  bindWidgetEvents();
  bindConfigEvents();
  syncFormWithState();

  return {
    refresh: syncFormWithState
  };
}
