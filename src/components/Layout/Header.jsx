
import { Container, Nav, Dropdown, Navbar } from 'react-bootstrap'
import { logout } from '../../store/authSlice'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
const Header = () => {
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const handleLogout=()=>{
        dispatch(logout());
        navigate('/');
    }
  return (
    <>
      <Navbar bg='primary' variant='dark' expand='lg' collapseOnSelect>
        <Container>
          <Navbar.Brand href='/'>ChroniCare</Navbar.Brand>

          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
              <Dropdown align='end'>
                <Dropdown.Toggle variant='secondary' id='dropdown-user'>
                  User
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to='/dasboard'>Dashboard</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

export default Header
