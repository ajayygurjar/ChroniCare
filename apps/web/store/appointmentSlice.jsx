import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';


const getUserData = async (userId, role) => {
  const collection = role === 'doctor' ? 'doctors' : 'patients';
  const response = await axiosInstance.get(`/${collection}/${userId}.json`);
  return response.data;
};

// Fetch appointments
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async ({ userId, role }, thunkAPI) => {
    try {
      
      const endpoint = role === 'doctor' 
        ? `/appointments/doctor/${userId}.json`
        : `/appointments/patient/${userId}.json`;
      
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
  async ({ appointmentData,patientId }, thunkAPI) => {
    try {
      const appointmentId = Date.now().toString();
      
       const doctorData = await getUserData(appointmentData.doctorId, 'doctor');
      if (!doctorData) {
        return thunkAPI.rejectWithValue('Doctor not found');
      }
      
      // Get patient data from patients collection
      const patientData = await getUserData(patientId, 'patient');
      if (!patientData) {
        return thunkAPI.rejectWithValue('Patient not found');
      }

      const newAppointment = {
        ...appointmentData,
        id: appointmentId,
        patientId,
        patientEmail: patientData.email,
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        doctorId: appointmentData.doctorId,
        doctorEmail: doctorData.email,
        doctorName: `${doctorData.firstName} ${doctorData.lastName}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };


      // Save to both patient and doctor
      await Promise.all([
        axiosInstance.put(`/appointments/patient/${patientId}/${appointmentId}.json`, newAppointment),
        axiosInstance.put(`/appointments/doctor/${appointmentData.doctorId}/${appointmentId}.json`, newAppointment)
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
  async ({ appointmentId, newStatus, appointment}, thunkAPI) => {
    try {
       await Promise.all([
        axiosInstance.patch(`/appointments/patient/${appointment.patientId}/${appointmentId}.json`, 
          { status: newStatus }),
        axiosInstance.patch(`/appointments/doctor/${appointment.doctorId}/${appointmentId}.json`, 
          { status: newStatus })      ]);

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