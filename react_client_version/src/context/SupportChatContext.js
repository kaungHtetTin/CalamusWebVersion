import React, { createContext, useContext, useState } from 'react';

const SupportChatContext = createContext();

export const useSupportChat = () => {
  const context = useContext(SupportChatContext);
  if (!context) {
    throw new Error('useSupportChat must be used within SupportChatProvider');
  }
  return context;
};

export const SupportChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [major, setMajor] = useState('english'); // 'english' or 'korea'

  const openChat = (chatMajor = 'english') => {
    setMajor(chatMajor);
    setIsOpen(true);
    setIsMinimized(false);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const maximizeChat = () => {
    setIsMinimized(false);
  };

  const toggleChat = (chatMajor = 'english') => {
    if (isOpen && !isMinimized) {
      minimizeChat();
    } else if (isOpen && isMinimized) {
      maximizeChat();
    } else {
      openChat(chatMajor);
    }
  };

  return (
    <SupportChatContext.Provider
      value={{
        isOpen,
        isMinimized,
        major,
        openChat,
        closeChat,
        minimizeChat,
        maximizeChat,
        toggleChat,
      }}
    >
      {children}
    </SupportChatContext.Provider>
  );
};
