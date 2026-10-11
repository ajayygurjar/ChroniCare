import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { apiErrorMessage } from '../utils/axiosInstance';
import { appointmentFromApi, scheduledAtFor } from '../utils/format';
import { logout } from './authSlice';

// The API returns only the signed-in user's own appointments, as patient or as doctor.
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get('/appointments');
      return data.appointments.map(appointmentFromApi);
    } catch (error) {
      return thunkAPI.rejectWithValue(apiErrorMessage(error));
    }
  }
);

// `appointmentData` is { doctorId, date: "YYYY-MM-DD", time: "HH:MM", reason } on the patient's clock.
// The server knows who the patient is from the access token, and rejects a taken slot with 409.
export const bookAppointment = createAsyncThunk(
  'appointments/bookAppointment',
  async ({ appointmentData }, thunkAPI) => {
    try {
      const { data } = await api.post('/appointments', {
        doctorId: appointmentData.doctorId,
        scheduledAt: scheduledAtFor(appointmentData.date, appointmentData.time),
        reason: appointmentData.reason,
      });
      return appointmentFromApi(data.appointment);
    } catch (error) {
      return thunkAPI.rejectWithValue(apiErrorMessage(error, 'Could not book the appointment.'));
    }
  }
);

// Doctors only: confirmed, cancelled or completed.
export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateAppointmentStatus',
  async ({ appointmentId, newStatus }, thunkAPI) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      return { appointmentId, newStatus };
    } catch (error) {
      return thunkAPI.rejectWithValue(apiErrorMessage(error, 'Could not update the appointment.'));
    }
  }
);

const initialState = {
  appointments: [],
  loading: false,
  error: null,
  successMessage: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Another person signing in on this browser must not see the previous person's appointments.
      .addCase(logout, () => initialState)

      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Book appointment
      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.unshift(action.payload);
        state.successMessage = 'Appointment requested. You will see it here once the doctor confirms.';
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update status
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { appointmentId, newStatus } = action.payload;
        const appointment = state.appointments.find(app => app.id === appointmentId);
        if (appointment) {
          appointment.status = newStatus;
        }
        state.successMessage = `Appointment ${newStatus} successfully!`;
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMessages } = appointmentSlice.actions;
export default appointmentSlice.reducer;
