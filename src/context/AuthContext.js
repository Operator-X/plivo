import React, { createContext, useState, useContext } from 'react';

// Create AuthContext
const AuthContext = createContext();

// Provider component to wrap around the app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Fake login function
  const login = (username) => {
    setUser({ name: username });
  };

  // Fake logout function
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}
