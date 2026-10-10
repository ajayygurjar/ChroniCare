import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./Header";
import Sidebar from "./SideBar";
import TabBar from "./TabBar";
import { useProfile } from "../../hooks/userProfile";

const RootLayout = () => {
  const { token, role } = useSelector((state) => state.auth);
  const { pathname } = useLocation();
  const { profile } = useProfile(role);

  // The auth screen is a full-page split layout with its own logo.
  if (pathname === "/auth") return <Outlet />;

  const signedIn = !!token;

  return (
    <div className={signedIn ? "cc-has-tabbar" : undefined}>
      <Header profile={profile} />
      <div className={`cc-layout${signedIn ? " has-side" : ""}`}>
        {signedIn && <Sidebar role={role} profile={profile} />}
        <main className={signedIn ? "cc-main" : undefined} style={{ minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
      {signedIn && <TabBar role={role} />}
    </div>
  );
};

export default RootLayout;
