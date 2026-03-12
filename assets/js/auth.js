const SESSION_KEY = "hypertree-auth-session";
const USERS_KEY = "hypertree-auth-users";

const defaultUsers = [
  {
    username: "admin",
    password: "admin123"
  }
];

function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  try {
    const users = JSON.parse(raw);
    if (!Array.isArray(users) || users.length === 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return users;
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
}

export function login(username, password) {
  const users = loadUsers();
  const found = users.find((user) => user.username === username && user.password === password);

  if (!found) {
    return false;
  }

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      username: found.username,
      loggedAt: Date.now()
    })
  );
  return true;
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getSession());
}

export function requireAuth(redirectTo = "login.html") {
  if (!isAuthenticated()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}
