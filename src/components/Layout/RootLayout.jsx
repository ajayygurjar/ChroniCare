
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./SideBar";

const RootLayout = () => {
  return (
    <>
      <Header />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "2rem", background: "#f9f9f9" }}>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default RootLayout;
