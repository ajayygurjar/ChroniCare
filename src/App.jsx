import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/Layout/RootLayout";
import HomePage from "./components/Home/HomePage";
import AuthPage from "./components/Auth/AuthPage";
import Dashboard from "./components/Pages/Dashboard";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { rehydrateUser } from "../store/authSlice";
import PatientHistory from "./components/Patient/PatientHistory";


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
          path:'/patient/history',
          element:<PatientHistory/>
        },
      ],
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
