import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

// Helper function
const cleanEmail = (email) => email.replace(/[@.]/g, '');

// Fetch appointments
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async ({ userEmail, role }, thunkAPI) => {
    try {
      const cleanedEmail = cleanEmail(userEmail);
      const endpoint = role === 'doctor' 
        ? `/appointments/doctor/${cleanedEmail}.json`
        : `/appointments/patient/${cleanedEmail}.json`;
      
      const response = await axiosInstance.get(endpoint);
      
      if (response.data) {
        return Object.entries(response.data).map(([id, appointment]) => ({
          id,
          ...appointment
        }));
      }
      return [];
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Book appointment
export const bookAppointment = createAsyncThunk(
  'appointments/bookAppointment',
  async ({ appointmentData, patientEmail, doctorEmail }, thunkAPI) => {
    try {
      const appointmentId = Date.now().toString();
      const cleanedPatientEmail = cleanEmail(patientEmail);
      const cleanedDoctorEmail = cleanEmail(doctorEmail);
      
      const newAppointment = {
        ...appointmentData,
        id: appointmentId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Save to both patient and doctor
      await Promise.all([
        axiosInstance.put(`/appointments/patient/${cleanedPatientEmail}/${appointmentId}.json`, newAppointment),
        axiosInstance.put(`/appointments/doctor/${cleanedDoctorEmail}/${appointmentId}.json`, newAppointment)
      ]);

      return newAppointment;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Update appointment status
export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateAppointmentStatus',
  async ({ appointmentId, newStatus, appointment, userEmail }, thunkAPI) => {
    try {
      const cleanedPatientEmail = cleanEmail(appointment.patientEmail);
      const cleanedDoctorEmail = cleanEmail(appointment.doctorEmail || userEmail);

      await Promise.all([
        axiosInstance.patch(`/appointments/patient/${cleanedPatientEmail}/${appointmentId}.json`, 
          { status: newStatus }),
        axiosInstance.patch(`/appointments/doctor/${cleanedDoctorEmail}/${appointmentId}.json`, 
          { status: newStatus })
      ]);

      return { appointmentId, newStatus };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: {
    appointments: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.successMessage = 'Appointment booked successfully!';
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