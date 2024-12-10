import { Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavHeader from "../components/NavHeader";
import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import styles from './RootLayout.module.css';

function RootLayout() {
    const { message, setMessage } = useContext(AuthContext);

    useEffect(() => {
        if (message) {
            toast(message.msg, {
                type: message.type
            });

            setMessage('');
        }
    }, [message, setMessage]);

    return (
        <main className={styles.wrap}>
            <NavHeader />
            <Outlet />
        </main>
    );
}

export default RootLayout;
