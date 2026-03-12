import { defaultState, STORAGE_KEY } from "./data.js";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return deepClone(defaultState);
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      ...deepClone(defaultState),
      ...parsed,
      profile: { ...deepClone(defaultState.profile), ...(parsed.profile || {}) },
      customization: {
        ...deepClone(defaultState.customization),
        ...(parsed.customization || {})
      },
      widgets: { ...deepClone(defaultState.widgets), ...(parsed.widgets || {}) },
      stats: { ...deepClone(defaultState.stats), ...(parsed.stats || {}) }
    };
  } catch {
    return deepClone(defaultState);
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return deepClone(defaultState);
}

export function exportState(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "hypertree-config.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function importState(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        resolve(imported);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function incrementVisitCounter(state) {
  const key = "hypertree-visited-session";
  if (sessionStorage.getItem(key)) {
    return state;
  }
  sessionStorage.setItem(key, "1");
  state.stats.visits += 1;
  return state;
}
