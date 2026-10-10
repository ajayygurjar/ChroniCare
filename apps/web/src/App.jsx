import React, { Suspense, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import { rehydrateUser } from "../store/authSlice";
import RootLayout from "./components/Layout/RootLayout";
import LoadingSpinner from "./components/Common/LoadingSpinner";
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

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedAuth = localStorage.getItem("auth");
    if (savedAuth) {
      dispatch(rehydrateUser(JSON.parse(savedAuth)));
    }
  }, [dispatch]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: "auth",
          element: <AuthPage />,
        },
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "/patient/history",
          element: <PatientHistory />,
        },
        {
          path: "doctor/patients",
          element: <DoctorPatients />,
        },
        {
          path: "doctor/patient/:id",
          element: <SinglePatientView />,
        },
        {
          path: "/appointments",
          element: <AppointmentPage />,
        },
        {
          path:'/contact',
          element:<ContactPage/>
        },
      ],
    },
  ]);
  return (
    <>
      <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
};

export default App;
