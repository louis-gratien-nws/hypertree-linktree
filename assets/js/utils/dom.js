export const $ = (selector) => document.querySelector(selector);

export const $$ = (selector) => [...document.querySelectorAll(selector)];

export function escapeHtml(input) {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function debounce(fn, delay = 120) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
