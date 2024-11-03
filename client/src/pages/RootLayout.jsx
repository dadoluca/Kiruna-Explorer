import { Outlet } from 'react-router-dom';
import { Row, Container} from 'react-bootstrap';
import NavHeader from "../components/NavHeader";
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Alert } from 'react-bootstrap';


function RootLayout(){
    const { message, setMessage } = useContext(AuthContext);
    return (    
        <main>
            <NavHeader/>
            <Container fluid className='mt-3'>
                {message && <Row style={{ position: 'absolute', top: '10vh', width: '100%', zIndex: 1000 }}>
                    <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
                </Row> }
                <Outlet/>
            </Container>  
        </main>
    );
}

export default RootLayout;