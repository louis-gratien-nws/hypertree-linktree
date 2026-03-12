import { login, isAuthenticated } from "./auth.js";

const form = document.querySelector("#login-form");
const userInput = document.querySelector("#login-username");
const passInput = document.querySelector("#login-password");
const errorBox = document.querySelector("#login-error");

if (isAuthenticated()) {
  window.location.href = "dashboard.html";
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = userInput.value.trim();
  const password = passInput.value;

  const ok = login(username, password);
  if (ok) {
    window.location.href = "dashboard.html";
    return;
  }

  errorBox.textContent = "Identifiants invalides.";
  errorBox.classList.remove("hidden");
});
