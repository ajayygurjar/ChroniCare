import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../utils/axiosInstance'


export const fetchPatientData=createAsyncThunk(
    'patient/fetchPatientData',
    async (uid,thunkAPI)=>{
        try {
            
            const [profileRes,historyRes,]=await Promise.all([
                
                axiosInstance.get(`/patients/${uid}.json`),
                axiosInstance.get(`/history/${uid}.json`),
            ])

            const history = historyRes.data
        ? Object.entries(historyRes.data).map(([id, val]) => ({ id, ...val }))
        : [];
        return {
            profile:profileRes.data,
            history,
            prescriptions:[],
        }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message)
            
        }
    }
)

const patientSlice=createSlice({
    name:'patient',
    initialState:{
        profile:null,
        history:[],
        prescriptions:[],
        loading:false,
        error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(fetchPatientData.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(fetchPatientData.fulfilled,(state,action)=>{
            state.profile=action.payload.profile
            state.history=action.payload.history
            state.prescriptions=action.payload.prescriptions
            state.loading=false
        })
        .addCase(fetchPatientData.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })
    }
})
export default patientSlice.reducer;
