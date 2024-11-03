
import { Container, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FaUser } from 'react-icons/fa';
import styles from './NavHeader.module.css';

function NavHeader() {
  const { loggedIn } = useContext(AuthContext);

  return (
    <Navbar bg='dark' data-bs-theme='dark' style={{ height: '9vh', minHeight: '30px'}}>
      <Container fluid>
        <Link to='/' className='navbar-brand'>Kiruna eXplorer</Link>
        <div>
          {/*loggedIn && 
            <Link to='/profile' className='btn btn-outline-light me-2'>
              <FaUser />
            </Link>
          */}
          {loggedIn ? 
            <LogoutButton/> :
            <Link to='/login' className={`${styles.customLink} btn`} >Are you an Urban Planner?</Link>
          }
        </div>
      </Container>
    </Navbar>
  );
}

export default NavHeader;
