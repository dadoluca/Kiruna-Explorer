import { Container, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FaUser } from 'react-icons/fa';
import styles from './NavHeader.module.css';

function NavHeader() {
  const { loggedIn } = useContext(AuthContext);
  const { handleLogout } = useContext(AuthContext);

  return (
    <Navbar bg="transparent" style={{ height: '6vh', minHeight: '30px' }} className={styles.navbar}>
      <Container fluid>
        <Link to="/" className={`${styles.brand} navbar-brand`}>Kiruna Explorer</Link>
        <div>
          {/*loggedIn && 
            <Link to='/profile' className='btn btn-outline-light me-2'>
              <FaUser />
            </Link>
          */}
          {loggedIn ? (
            <Link className={`${styles.customLink} btn`} onClick={handleLogout} >Logout</Link>
          ) : (
            <Link to="/login" className={`${styles.customLink} btn`}>
              Are you an Urban Planner?
            </Link>
          )}
        </div>
      </Container>
    </Navbar>
  );
}

export default NavHeader;
