// frontend/src/context/UserContext.js
import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      return storedUserInfo ? JSON.parse(storedUserInfo) : null;
    } catch (error) {
      console.error("Failed to parse userInfo from localStorage", error);
      return null;
    }
  });

  const login = (data) => {
    setUserInfo(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  const contextValue = {
    userInfo,
    login,
    logout,
    isLoggedIn: !!userInfo,
    isAdmin: userInfo && userInfo.role === 'admin',
    isSeller: userInfo && userInfo.role === 'seller',
    // UPDATED: Handle both 'customer' and 'buyer' roles correctly
    isCustomer: (userInfo && (userInfo.role === 'customer' || userInfo.role === 'buyer')) || !userInfo 
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};