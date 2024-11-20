import { Button } from 'react-bootstrap';   
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';


function LogoutButton() {
      const { handleLogout } = useContext(AuthContext);
      return(
        <Link className='btn btn-outline-light' onClick={handleLogout} to={'/'}>Logout</Link>
      );
    }
    
export default LogoutButton;