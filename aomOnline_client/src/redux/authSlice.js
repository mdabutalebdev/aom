import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API_BASE_URL from "@/config/api";
import {
  getToken,
  setToken,
  clearToken,
  authHeaders,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
} from "@/config/auth";

// Shared JSON POST helper. Throws a Bangla error message on failure.
const postJson = async (path, body) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON response — leave data empty.
  }

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "An error occurred. Please try again.");
  }
  return data;
};

// POST /auth/register → { data: { accessToken, user } }
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await postJson("/auth/register", payload);
      const { accessToken, user } = data.data || {};
      setToken(accessToken);
      setStoredUser(user);
      return { token: accessToken, user };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// POST /auth/login → { data: { accessToken, user } }
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await postJson("/auth/login", payload);
      const { accessToken, user } = data.data || {};
      setToken(accessToken);
      setStoredUser(user);
      return { token: accessToken, user };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// GET /user/me (Bearer) → { data: user }
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/me`, {
        headers: { ...authHeaders() },
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Session could not be verified.");
      }
      // Refresh the cache so a role change on the server lands on next reload.
      setStoredUser(data.data);
      return { user: data.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // `user` MUST start null so the server and the client's first render agree —
  // seeding it from localStorage here makes every component that renders a
  // user field (name, role) mismatch during hydration. It is restored right
  // after mount via the hydrate reducer below; fetchMe then revalidates it.
  user: null,
  token: getToken(),
  isAuthenticated: Boolean(getToken()),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Restore the cached profile once, on the client, after hydration. Keeps
    // the role available for role-based links without a network round-trip.
    hydrateAuth: (state) => {
      if (state.user) return;
      const cached = getStoredUser();
      if (cached) {
        state.user = cached;
        state.isAuthenticated = Boolean(getToken());
      }
    },
    logout: (state) => {
      clearToken();
      clearStoredUser();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- registerUser ----
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed.";
      })
      // ---- loginUser ----
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login  ।";
      })
      // ---- fetchMe ----
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        // Token invalid/expired — clear auth state, token and cached profile.
        clearToken();
        clearStoredUser();
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload || "Session could not be verified.";
      });
  },
});

export const { hydrateAuth, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
