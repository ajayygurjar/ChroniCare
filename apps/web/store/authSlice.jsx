import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { apiErrorMessage } from "../utils/axiosInstance";

// The session lives in memory only. The access token is never written to localStorage (any script
// on the page could read it); a page reload restores the session through the httpOnly refresh cookie.
const sessionFrom = ({ accessToken, user }) => ({
  token: accessToken,
  userId: user.id,
  user: user.email,
  role: user.role,
  profile: user,
});

// The refresh cookie is httpOnly, so scripts cannot tell whether one exists. This harmless flag (it holds
// no token) records "this browser was signed in", so signed-out visitors do not send a pointless
// refresh request on every page load.
const SESSION_HINT = "chronicare_signed_in";
export const rememberSession = (signedIn) => {
  try {
    if (signedIn) localStorage.setItem(SESSION_HINT, "1");
    else localStorage.removeItem(SESSION_HINT);
  } catch {
    // storage unavailable (private mode): the app just asks the server every time
  }
};
const mayHaveSession = () => {
  try {
    return localStorage.getItem(SESSION_HINT) === "1";
  } catch {
    return true;
  }
};

// Restores the session after a page load. Shared between callers so React StrictMode's double
// effect in development does not send two refreshes at once.
let bootstrapRequest = null;
export const bootstrapSession = createAsyncThunk("auth/bootstrapSession", async () => {
  if (!mayHaveSession()) return null;
  bootstrapRequest ??= api
    .post("/auth/refresh")
    .then((response) => {
      rememberSession(true);
      return sessionFrom(response.data);
    })
    .catch(() => {
      rememberSession(false); // no cookie or an expired one: simply not signed in
      return null;
    })
    .finally(() => {
      bootstrapRequest = null;
    });
  return bootstrapRequest;
});

export const loginWithRole = createAsyncThunk(
  "auth/loginWithRole",
  async ({ email, password, expectedRole }, thunkAPI) => {
    try {
      const { data } = await api.post("/auth/login", { email, password, expectedRole });
      rememberSession(true);
      return sessionFrom(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(apiErrorMessage(error, "Login failed"));
    }
  }
);

// `details` is the flat signup form: role, email, password, firstName, lastName, gender,
// dateOfBirth, phone, address and, for doctors, speciality and experience.
export const signupUser = createAsyncThunk("auth/signupUser", async (details, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/signup", details);
    rememberSession(true);
    return sessionFrom(data);
  } catch (error) {
    return thunkAPI.rejectWithValue(apiErrorMessage(error, "Signup failed"));
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, thunkAPI) => {
  try {
    await api.post("/auth/logout");
  } catch {
    // Even if the server is unreachable, this browser is signed out below.
  }
  rememberSession(false);
  thunkAPI.dispatch(logout());
});

const signedOut = {
  user: null,
  userId: null,
  token: null,
  role: null,
  profile: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    ...signedOut,
    // "loading" until the first attempt to restore a session has finished.
    status: "loading",
    isLoading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      Object.assign(state, signedOut);
      state.error = null;
    },
    // The API client got a fresh access token for the same user (see utils/axiosInstance.jsx).
    sessionRefreshed(state, action) {
      Object.assign(state, sessionFrom(action.payload));
    },
  },
  extraReducers: (builder) => {
    const signedIn = (state, action) => {
      Object.assign(state, action.payload);
      state.isLoading = false;
    };
    const pending = (state) => {
      state.isLoading = true;
      state.error = null;
    };
    const failed = (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    };

    builder
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        if (action.payload) Object.assign(state, action.payload);
        state.status = "ready";
      })
      .addCase(bootstrapSession.rejected, (state) => {
        state.status = "ready";
      })

      .addCase(loginWithRole.pending, pending)
      .addCase(loginWithRole.fulfilled, signedIn)
      .addCase(loginWithRole.rejected, failed)

      .addCase(signupUser.pending, pending)
      .addCase(signupUser.fulfilled, signedIn)
      .addCase(signupUser.rejected, failed);
  },
});

export const { logout, sessionRefreshed } = authSlice.actions;
export default authSlice.reducer;
