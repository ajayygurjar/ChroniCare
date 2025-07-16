import { createBrowserRouter ,RouterProvider } from "react-router-dom"
import RootLayout from "./components/Layout/RootLayout"
import HomePage from "./components/Home/HomePage"
import AuthPage from "./components/Auth/AuthPage"
import Dashboard from "./components/Pages/Dashboard"


const App = () => {

  



  const router=createBrowserRouter([
    {
       path: "/",
    element: <RootLayout />, 
    children:[
      {
        index: true,           
        element: <HomePage />,
      },
      {
        path: "auth",          
        element: <AuthPage />,
      },
      {
        path:'dashboard',
        element:<Dashboard/>
      }

    ]
  }
  ])
  return (
    <>

  <RouterProvider router={router}/>  
    </>
  )
}

export default App;