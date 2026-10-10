import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import patientReducer from "./patientSlice";
import doctorReducer from "./doctorSlice";
import appointmentReducer from './appointmentSlice'


const store = configureStore({
  reducer: {
    auth: authReducer,
    patient: patientReducer,
    doctor: doctorReducer,
    appointments: appointmentReducer,

  },
});

export default store;
