import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { apiErrorMessage } from '../utils/axiosInstance';
import { logout } from './authSlice';

// A doctor's patients: those who have an appointment with them (the API enforces this).
export const fetchAllPatients = createAsyncThunk(
  'doctor/fetchAllPatients',
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get('/patients');
      return data.patients;
    } catch (error) {
      return thunkAPI.rejectWithValue(apiErrorMessage(error));
    }
  }
);

const initialState = {
  patients: [],
  loading: false,
  error: null,
};

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)

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
      });
  },
});

export default doctorSlice.reducer;
