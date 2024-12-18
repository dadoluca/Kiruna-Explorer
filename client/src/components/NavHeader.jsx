import { Container, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FaUser } from 'react-icons/fa';
import styles from './NavHeader.module.css';

function NavHeader() {
  const { loggedIn, handleLogout } = useContext(AuthContext); // Extract `loggedIn` and `handleLogout` from context

  return (
    <Navbar bg="transparent" style={{ height: '9vh', minHeight: '28px' }} className={styles.navbar}>
      <Container fluid>
        {/* Brand logo or title */}
        <Link to="/" className={`${styles.brand} navbar-brand`}>
          Kiruna Explorer
        </Link>
        <div>
          {loggedIn ? (
            // Show logout button if logged in
            <Link className={`${styles.customLink} btn`} onClick={handleLogout}>
              Logout
            </Link>
          ) : (
            // Show login prompt if not logged in
            <Link to="/login" className={`${styles.customLink} btn`}>
              Are you an Urban Planner or a Resident?
            </Link>
          )}
        </div>
      </Container>
    </Navbar>
  );
}

export default NavHeader;
