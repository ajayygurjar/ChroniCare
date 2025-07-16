
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./SideBar";
import { useSelector } from "react-redux";
const RootLayout = () => {

    const isLoggedIn=useSelector((state)=>state.auth.isLoggedIn)
  return (
    <>
      <Header />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {isLoggedIn && <Sidebar />}
        <main style={{ flex: 1, padding: "2rem", background: "#f9f9f9" }}>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default RootLayout;
