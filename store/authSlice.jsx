import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { FIREBASE_API_KEY, FIREBASE_DB_URL } from "../src/firebase/firebaseConfig";

export const loginWithRole = createAsyncThunk(
  "auth/loginWithRole",
  async ({ email, password, expectedRole }, thunkAPI) => {
    try {
      const res = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
        {
          email,
          password,
          returnSecureToken: true,
        }
      );
      const userId = res.data.localId;

      const collection = expectedRole === 'doctor' ? 'doctors' : 'patients';
      const userRes = await axios.get(`${FIREBASE_DB_URL}/${collection}/${userId}.json`);
      
      if (!userRes.data || userRes.data.role !== expectedRole) {
        return thunkAPI.rejectWithValue(`Not authorized as ${expectedRole}`);
      }

      const authPayload = {
        user: email,
        userId,
        token: res.data.idToken,
        role:expectedRole,
      };

      localStorage.setItem("auth", JSON.stringify(authPayload));
      return authPayload;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || "Login Failed"
      );
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async ({ email, password, role = "patient", profile = {} }, thunkAPI) => {
    try {
      const res = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
        {
          email,
          password,
          returnSecureToken: true,
        }
      );

      const userId = res.data.localId;

       const path = role === "doctor" ? "doctors" : "patients";

      await axios.put(`${FIREBASE_DB_URL}/${path}/${userId}.json`, {
        email,
        role,
        ...profile,
      });

      const authPayload = {
        user: email,
        userId,
        token: res.data.idToken,
        role,
      };

      localStorage.setItem("auth", JSON.stringify(authPayload));

      return authPayload;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || "Signup failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    userId: null,
    token: null,
    role: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.userId = null;
      state.token = null;
      state.role = null;
      localStorage.removeItem("auth");
    },
    rehydrateUser(state, action) {
      const { user, userId, token, role } = action.payload;
      state.user = user;
      state.userId = userId;
      state.token = token;
      state.role = role;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(loginWithRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithRole.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.userId = action.payload.userId;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.isLoading = false;
      })
      .addCase(loginWithRole.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.userId = action.payload.userId;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.isLoading = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

export const { rehydrateUser, logout } = authSlice.actions;
export default authSlice.reducer;
