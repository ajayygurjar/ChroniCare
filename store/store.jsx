import { configureStore } from "@reduxjs/toolkit";
import authReducer from './authSlice'
import patientReducer from './patientSlice'
const store=configureStore({
    reducer:{
        auth:authReducer,
        patient:patientReducer,
    }
})

export default store;