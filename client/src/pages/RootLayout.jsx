import { Outlet } from 'react-router-dom';
import { Row, Container } from 'react-bootstrap';
import NavHeader from "../components/NavHeader";
import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Alert } from 'react-bootstrap';
import styles from './RootLayout.module.css';

function RootLayout() {
    const { message, setMessage } = useContext(AuthContext);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    return (
        <main className={styles.wrap}>
            <NavHeader />
            {message && (
                <Row 
                    style={{
                        position: 'fixed',
                        top: '10vh',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Alert 
                        variant={message.type} 
                        onClose={() => setMessage('')} 
                        dismissible
                        style={{
                            width: '400px',
                            height: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                        }}
                    >
                        {message.msg}
                    </Alert>
                </Row>
            )}
                <Outlet />
        </main>
    );
}

export default RootLayout;
