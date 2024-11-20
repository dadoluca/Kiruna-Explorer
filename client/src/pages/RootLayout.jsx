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
                setMessage(''); // Chiudi il messaggio dopo 4 secondi
            }, 4000); // 4000ms = 4 secondi

            // Pulisce il timer se il messaggio viene rimosso prima dei 4 secondi
            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    return (
        <main>
            <NavHeader />
            <div className={styles.prova}>
                {message && (
                    <Row 
                        style={{
                            position: 'fixed',
                            top: '10vh', // Distanza dal bordo superiore
                            left: '50%', // Centrato orizzontalmente
                            transform: 'translateX(-50%)', // Per un perfetto centramento
                            zIndex: 1000, // Per tenere il messaggio sopra altri contenuti
                            marginTop: '20px', // Distanza dal bordo superiore
                            width: '100%', // La larghezza del container è al 100% della finestra
                            display: 'flex',
                            justifyContent: 'center', // Centra il messaggio orizzontalmente
                        }}
                    >
                        <Alert 
                            variant={message.type} 
                            onClose={() => setMessage('')} 
                            dismissible
                            style={{
                                width: '400px', // Impostazione di larghezza fissa per il messaggio
                                height: '100px', // Impostazione di altezza fissa
                                display: 'flex',
                                alignItems: 'center', // Centra il contenuto verticalmente
                                justifyContent: 'center', // Centra il contenuto orizzontalmente
                                textAlign: 'center', // Centra il testo
                            }}
                        >
                            {message.msg}
                        </Alert>
                    </Row>
                )}
                <Outlet />
            </div>
        </main>
    );
}

export default RootLayout;
