import React, { createContext, useState, useEffect, useMemo } from 'react';
import API from '../services/api.jsx';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [isResident, setIsResident] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        if (err.error === "Not authenticated") {
          console.log("User not logged in");
        }
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage({ msg: `Welcome, ${user.user.name}!`, type: 'success' });
      if (user.user.role === 'Resident') {
        setIsResident(true);
      }
      setUser(user);
    } catch (err) {
      const jsonErr = JSON.parse(err);
      setMessage({ msg: jsonErr.message, type: 'danger' });
    }
  };

  const handleRegistration = async (newUser) => {
    try {
      const user = await API.register(newUser);
      setLoggedIn(true);
      setMessage({ msg: `Welcome, ${user.user.name}!`, type: 'success' });
      if (user.user.role === 'Resident') {
        setIsResident(true);
      }
      setUser(user);
    } catch (err) {
      const jsonErr = JSON.parse(err);
      setMessage({ msg: jsonErr.message, type: 'danger' });
    }
  };

  const handleLogout = async () => {
    try {
      await API.logOut();
      setLoggedIn(false);
      setMessage({ msg: `Logged out`, type: 'success' });
      setIsResident(false);
      setUser(null);
    } catch (err) {
      setMessage({ msg: err, type: 'danger' });
    }
  };

  const contextValue = useMemo(() => ({
    loggedIn,
    user,
    message,
    isResident,
    setMessage,
    handleLogin,
    handleRegistration,
    handleLogout
  }), [loggedIn, user, message, isResident]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
