
import { Container, Nav, Dropdown, Navbar } from 'react-bootstrap'

const Header = () => {
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
                  <Dropdown.Item href='/dashboard'>Dashboard</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item href='/logout'>Logout</Dropdown.Item>
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
