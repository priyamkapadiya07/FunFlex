import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('funflex_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('funflex_sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const toggleSound = () => setSoundEnabled(prev => !prev);

  return (
    <AppContext.Provider value={{ soundEnabled, toggleSound }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
