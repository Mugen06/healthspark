/**
 * Storage utilities for managing chat sessions in localStorage
 */
const Storage = {
  // Generate a random sessionId
  generateSessionId: () => {
    return `user-${Math.random().toString(36).substring(2, 8)}`;
  },
  
  // Get current sessionId or create a new one
  getSessionId: () => {
    let sessionId = localStorage.getItem('currentSessionId');
    if (!sessionId) {
      sessionId = Storage.generateSessionId();
      localStorage.setItem('currentSessionId', sessionId);
    }
    return sessionId;
  },
  
  // Create a new session
  createSession: () => {
    const sessionId = Storage.generateSessionId();
    const timestamp = new Date().toISOString();
    
    // Create session object
    const session = {
      id: sessionId,
      title: `Conversation ${new Date().toLocaleDateString('fr-FR')}`,
      timestamp,
      messages: []
    };
    
    // Save to localStorage
    localStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
    localStorage.setItem('currentSessionId', sessionId);
    
    // Update sessions list
    Storage.updateSessionsList(sessionId);
    
    return session;
  },
  
  // Get current session
  getCurrentSession: () => {
    const sessionId = Storage.getSessionId();
    const sessionData = localStorage.getItem(`session_${sessionId}`);
    
    if (sessionData) {
      return JSON.parse(sessionData);
    } else {
      return Storage.createSession();
    }
  },
  
  // Save message to session
  saveMessage: (message) => {
    const sessionId = Storage.getSessionId();
    const session = Storage.getCurrentSession();
    
    // Add message to session
    session.messages.push(message);
    
    // Update session title to first user message if no custom title and this is the first message
    if (session.title === `Conversation ${new Date(session.timestamp).toLocaleDateString('fr-FR')}` && 
        message.type === 'user' && 
        session.messages.filter(m => m.type === 'user').length === 1) {
      session.title = message.content.substring(0, 20) + (message.content.length > 20 ? '...' : '');
    }
    
    // Save updated session
    localStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
    
    // Update sessions list
    Storage.updateSessionsList(sessionId);
    
    return session;
  },
  
  // Get all sessions
  getAllSessions: () => {
    const sessions = [];
    const currentSessionId = localStorage.getItem('currentSessionId');
    
    // Iterate through localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('session_')) {
        const session = JSON.parse(localStorage.getItem(key));
        sessions.push({
          id: session.id,
          title: session.title,
          timestamp: session.timestamp,
          isActive: session.id === currentSessionId
        });
      }
    }
    
    // Sort by most recent
    return sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },
  
  // Update sessions list
  updateSessionsList: (activeSessionId) => {
    // Get all sessions
    const sessions = Storage.getAllSessions();
    
    // Create or update a "sessions" array in localStorage
    localStorage.setItem('sessions', JSON.stringify(sessions));
    
    return sessions;
  },
  
  // Switch to a different session
  switchSession: (sessionId) => {
    localStorage.setItem('currentSessionId', sessionId);
    return Storage.getCurrentSession();
  },
  
  // Delete a session
  deleteSession: (sessionId) => {
    // Remove session from localStorage
    localStorage.removeItem(`session_${sessionId}`);
    
    // If deleting the current session, switch to the most recent session or create a new one
    if (sessionId === localStorage.getItem('currentSessionId')) {
      const sessions = Storage.getAllSessions();
      if (sessions.length > 0) {
        localStorage.setItem('currentSessionId', sessions[0].id);
      } else {
        Storage.createSession();
      }
    }
    
    // Update sessions list
    return Storage.updateSessionsList();
  }
};