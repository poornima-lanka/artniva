// frontend/src/context/UserContext.js
import React, { createContext, useState, useContext } from 'react'; // Removed useEffect

// 1. Create the Context
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};

// 2. Create the Provider Component
export const UserProvider = ({ children }) => {
  // Initialize user state from localStorage on component mount
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      return storedUserInfo ? JSON.parse(storedUserInfo) : null;
    } catch (error) {
      console.error("Failed to parse userInfo from localStorage", error);
      return null;
    }
  });

  // Function to handle user login
  const login = (data) => {
    setUserInfo(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  // Function to handle user logout
  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  // The value that will be supplied to any component that consumes this context
  const contextValue = {
    userInfo,
    login,
    logout,
    // Add helper booleans for roles for easier access
    isLoggedIn: !!userInfo,
    isAdmin: userInfo && userInfo.role === 'admin',
    isSeller: userInfo && userInfo.role === 'seller',
    isCustomer: (userInfo && userInfo.role === 'customer') || !userInfo // Added parentheses for clarity
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};