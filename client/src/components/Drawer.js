import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
 

const Drawer = () => {
  return (
    <Navbar expand="md" className="bg-body-tertiary mb-3">
      <Container fluid>
        <Navbar.Brand href="#">🛍️ DjameArt</Navbar.Brand>
        <Navbar.Toggle aria-controls="offcanvasNavbar-expand-md" />
        <Navbar.Offcanvas
          id="offcanvasNavbar-expand-md"
          aria-labelledby="offcanvasNavbarLabel-expand-md"
          placement="start" // 👈 se abre desde la izquierda
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasNavbarLabel-expand-md">
              Menú
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#products">Productos</Nav.Link>
              <NavDropdown title="Más" id="offcanvasNavbarDropdown-expand-md">
                <NavDropdown.Item href="#about">Acerca de</NavDropdown.Item>
                <NavDropdown.Item href="#contact">Contacto</NavDropdown.Item>
              </NavDropdown>
              
            </Nav>
            <Form className="d-flex mt-3">
              <Form.Control
                type="search"
                placeholder="Buscar"
                className="me-2"
                aria-label="Buscar"
              />
              <Button variant="outline-success">Buscar</Button>
            </Form>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default Drawer;
