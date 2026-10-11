import React, { Suspense, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { bootstrapSession } from "../store/authSlice";
import RootLayout from "./components/Layout/RootLayout";
import LoadingSpinner from "./components/Common/LoadingSpinner";
import RequireAuth from "./components/Common/RequireAuth";
import ContactPage from "./Pages/ContactPage";

//lazy loading
const HomePage = React.lazy(() => import("./components/Home/HomePage"));
const AuthPage = React.lazy(() => import("./components/Auth/AuthPage"));
const Dashboard = React.lazy(() => import("./Pages/Dashboard"));
const PatientHistory = React.lazy(() =>
  import("./components/Patient/PatientHistory")
);
const DoctorPatients = React.lazy(() =>
  import("./components/Doctor/DoctorPatients")
);
const SinglePatientView = React.lazy(() =>
  import("./components/Doctor/SinglePatientView")
);
const AppointmentPage = React.lazy(() =>
  import("./components/Appointments/AppointmentPage")
);

// Created once, outside the component: re-creating the router on every render would reset navigation.
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "auth", element: <AuthPage /> },
      { path: "contact", element: <ContactPage /> },

      // Signed-in users only.
      {
        element: <RequireAuth />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "appointments", element: <AppointmentPage /> },
        ],
      },
      {
        element: <RequireAuth role="patient" />,
        children: [{ path: "patient/history", element: <PatientHistory /> }],
      },
      {
        element: <RequireAuth role="doctor" />,
        children: [
          { path: "doctor/patients", element: <DoctorPatients /> },
          { path: "doctor/patient/:id", element: <SinglePatientView /> },
        ],
      },
    ],
  },
]);

const App = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.auth.status);

  // Restore the session from the httpOnly refresh cookie, so a page reload does not sign you out.
  useEffect(() => {
    dispatch(bootstrapSession());
  }, [dispatch]);

  // Wait for the answer before showing any page, so signed-in users are not bounced to the login page.
  if (status === "loading") {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default App;
