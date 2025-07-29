import { Container, Nav, Dropdown, Navbar, Image } from "react-bootstrap";
import { logout } from "../../../store/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
const Header = () => {
  const { user, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${
    user || "U"
  }&background=0D8ABC&color=fff`;

  return (
    <>
      <Navbar
        bg="info"
        variant="light"
        expand="lg"
        fixed="top"
        style={{
          zIndex: 1030,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
        collapseOnSelect
      >
        <Container>
          <Navbar.Brand as={Link} to="/">
            ChroniCare
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {user ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="light" id="dropdown-user">
                    <Image
                      src={avatarUrl}
                      roundCircle
                      height="30"
                      width="30"
                      className="me-2"
                    />
                    {role}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/dashboard">
                      Dashboard
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Nav.Link as={Link} to="/auth">
                  Login
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div style={{ height: "56px" }}></div>
    </>
  );
};

export default Header;
