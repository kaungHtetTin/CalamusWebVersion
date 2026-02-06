import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DrawerContext = createContext();

export const DrawerProvider = ({ children }) => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Close drawer when entering watch page
  useEffect(() => {
    if (location.pathname.startsWith('/watch')) {
      setDrawerOpen(false);
    }
  }, [location.pathname]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <DrawerContext.Provider value={{ drawerOpen, setDrawerOpen, toggleDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};

export default DrawerContext;
