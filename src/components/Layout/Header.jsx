import { Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LuActivity, LuLogOut } from "react-icons/lu";
import { logout } from "../../../store/authSlice";
import Avatar from "../Common/Avatar";
import { displayName } from "../../../utils/format";

const Header = ({ profile }) => {
  const { user, role, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const name = displayName(profile, role) || user || "Account";

  return (
    <header className="cc-top">
      <Link to={token ? "/dashboard" : "/"} className="cc-logo">
        <span className="cc-mark" aria-hidden="true">
          <LuActivity />
        </span>
        ChroniCare
      </Link>

      {token ? (
        <Dropdown align="end">
          <Dropdown.Toggle as="button" className="cc-user-toggle" id="dropdown-user">
            <Avatar name={name} size="sm" />
            <span className="d-none d-md-inline">{name}</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header style={{ textTransform: "capitalize" }}>
              Signed in as {role}
            </Dropdown.Header>
            <Dropdown.Item as="button" onClick={handleLogout}>
              <LuLogOut className="me-2" aria-hidden="true" />
              Log out
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <nav className="cc-top-right" aria-label="Site">
          <Link to="/#features" className="cc-toplink d-none d-md-inline">
            Features
          </Link>
          <Link to="/contact" className="cc-toplink d-none d-md-inline">
            Contact
          </Link>
          <Link to="/auth" className="btn btn-ghost btn-sm">
            Log in
          </Link>
          <Link to="/auth" state={{ mode: "signup" }} className="btn btn-primary btn-sm">
            Create account
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
