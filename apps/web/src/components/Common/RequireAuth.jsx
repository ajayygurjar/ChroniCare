import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

// Route guard. Signed-out visitors go to the login page; a signed-in user on a page meant for the other
// role goes to their dashboard. (The API enforces the same rules; this just avoids showing dead pages.)
const RequireAuth = ({ role }) => {
  const { token, role: userRole } = useSelector((state) => state.auth);

  if (!token) return <Navigate to="/auth" replace />;
  if (role && userRole !== role) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default RequireAuth;
