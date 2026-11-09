// Auth helpers for AOM Online Madrasa (client side).
// Token is persisted in localStorage under the key 'token'.
// The user profile is cached under 'user' so the role is known immediately on
// reload — without it the app can't tell which dashboard to link to and would
// route to the wrong one until GET /user/me resolves.

const TOKEN_KEY = "token";
const USER_KEY = "user";

// Read the stored access token (returns null on the server or when absent).
export const getToken = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

// Persist the access token.
export const setToken = (token) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage unavailable (private mode / quota) — fail silently.
  }
};

// Remove the stored token.
export const clearToken = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Fail silently.
  }
};

// Read the cached user profile (returns null on the server or when absent).
export const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Absent or corrupted JSON — treat as no cached user.
    return null;
  }
};

// Cache the user profile.
export const setStoredUser = (user) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Storage unavailable (private mode / quota) — fail silently.
  }
};

// Remove the cached user profile.
export const clearStoredUser = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // Fail silently.
  }
};

// Build the Authorization header for authenticated requests.
export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Map a user role to its dashboard home route.
// An unknown/absent role resolves to /dashboard, which redirects once the role
// is known. Defaulting to a concrete dashboard here would send e.g. a superAdmin
// to the guardian page first and bounce them afterwards.
export const getRoleHome = (role) => {
  switch (role) {
    case "admin":
    case "superAdmin":
      return "/dashboard/admin";
    case "teacher":
      return "/dashboard/teacher";
    case "parent":
      return "/dashboard/guardian";
    case "student":
      return "/dashboard/student";
    default:
      return "/dashboard";
  }
};
