import { configureStore } from "@reduxjs/toolkit";
import authReducer, { logout, rememberSession, sessionRefreshed } from "./authSlice";
import doctorReducer from "./doctorSlice";
import appointmentReducer from './appointmentSlice'
import { bindAuth } from "../utils/axiosInstance";


const store = configureStore({
  reducer: {
    auth: authReducer,
    doctor: doctorReducer,
    appointments: appointmentReducer,

  },
});

// Lets the API client read the access token and report refreshes and expiry, without importing the store.
bindAuth({
  getToken: () => store.getState().auth.token,
  onSessionRefreshed: (data) => store.dispatch(sessionRefreshed(data)),
  onSessionExpired: () => {
    rememberSession(false);
    store.dispatch(logout());
  },
});

export default store;
