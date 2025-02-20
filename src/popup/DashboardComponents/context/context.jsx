import React, { createContext, useState } from 'react';

// Named export for UserContext
export const UserContext = createContext();

// Default export for UserProvider
// eslint-disable-next-line react/prop-types
const UserProvider = ({ children }) => {
  const [contextProjectId, setContextProjectId] = useState("");

  return (
    <UserContext.Provider value={{ contextProjectId, setContextProjectId }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
