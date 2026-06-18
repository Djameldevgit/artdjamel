export const setActiveChat = (receiverUser) => ({
    type: 'SET_ACTIVE_CHAT',
    payload: receiverUser
  });
  export const setMessages = (messages) => ({
    type: 'SET_MESSAGES',
    payload: messages,
  });
  
  export const addMessage = (message) => ({
    type: 'ADD_MESSAGE',
    payload: message,
  });
  
  export const setTyping = (userId, isTyping) => ({
    type: 'SET_TYPING',
    payload: { userId, isTyping },
  });
  