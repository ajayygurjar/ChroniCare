import { configureStore } from "@reduxjs/toolkit";
import authReducer from './authSlice'
import patientReducer from './patientSlice'
import doctorReducer from './doctorSlice'

const store=configureStore({
    reducer:{
        auth:authReducer,
        patient:patientReducer,
        doctor:doctorReducer,
    }
})

export default store;