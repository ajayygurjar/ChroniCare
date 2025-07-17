import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

export const fetchAllPatients = createAsyncThunk(
  'doctor/fetchAllPatients',
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get('/users.json');
      const users = res.data || {};

      const filtered = Object.entries(users)
        // eslint-disable-next-line no-unused-vars
        .filter(([_, user]) => user.role === 'patient')
        .map(([id, user]) => ({ id, ...user }));

      return filtered;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchSinglePatientDetails = createAsyncThunk(
  'doctor/fetchSinglePatientDetails',
  async (uid, thunkAPI) => {
    try {
      const [historyRes, presRes] = await Promise.all([
        axiosInstance.get(`/history/${uid}.json`),
        axiosInstance.get(`/patients/${uid}/prescriptions.json`)
      ]);

      const history = historyRes.data
        ? Object.entries(historyRes.data).map(([id, val]) => ({ id, ...val }))
        : [];

      const prescriptions = presRes.data
        ? Object.entries(presRes.data).map(([id, val]) => ({ id, ...val }))
        : [];

      return { uid, history, prescriptions };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addPrescription = createAsyncThunk(
  'doctor/addPrescription',
  async ({ uid, prescription }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/patients/${uid}/prescriptions.json`, prescription);
      return { uid, data: res.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const doctorSlice = createSlice({
  name: 'doctor',
  initialState: {
    patients: [],
    patientDetails: {}, 
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchAllPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPatients.fulfilled, (state, action) => {
        state.patients = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //fetch
      .addCase(fetchSinglePatientDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSinglePatientDetails.fulfilled, (state, action) => {
        const { uid, history, prescriptions } = action.payload;
        state.patientDetails[uid] = { history, prescriptions };
        state.loading = false;
      })
      .addCase(fetchSinglePatientDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addPrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPrescription.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addPrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default doctorSlice.reducer;
