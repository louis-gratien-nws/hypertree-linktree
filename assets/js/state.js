import { loadState, saveState } from "./storage.js";

let state = loadState();

export function getState() {
  return state;
}

export function setState(nextState) {
  state = nextState;
  saveState(state);
}

export function updateState(mutator) {
  const draft = structuredClone(state);
  mutator(draft);
  state = draft;
  saveState(state);
  return state;
}
