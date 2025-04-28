/**
 * Chat functionality for sending and receiving messages
 */
const Chat = {
  // Initialize chat
  init: () => {
    // Load current session
    const session = Storage.getCurrentSession();
    
    // Display existing messages
    if (session.messages && session.messages.length > 0) {
      session.messages.forEach(message => {
        UI.addMessageToChat(message.content, message.type);
      });
      
      // Scroll to bottom
      UI.scrollToBottom();
    } else {
      // Show welcome message if no messages
      UI.showWelcomeMessage();
    }
    
    // Setup event listeners
    Chat.setupEventListeners();
  },
  
  // Set up event listeners
  setupEventListeners: () => {
    // Send button click
    document.getElementById('send-button').addEventListener('click', Chat.sendMessage);
    
    // Input keypress (Enter to send)
    const messageInput = document.getElementById('message-input');
    messageInput.addEventListener('keydown', (e) => {
      // Send on Enter (but not with Shift+Enter for line break)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        Chat.sendMessage();
      }
      
      // Auto-resize textarea
      setTimeout(() => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
      }, 0);
    });
    
    // Input focus
    messageInput.addEventListener('focus', () => {
      // Remove welcome message if visible
      const welcomeContainer = document.querySelector('.welcome-container');
      if (welcomeContainer) {
        welcomeContainer.classList.add('fade-out');
        setTimeout(() => {
          welcomeContainer.remove();
        }, 300);
      }
    });
    
    // New chat button
    document.getElementById('new-chat-btn').addEventListener('click', Chat.startNewChat);
  },
  
  // Send message
  sendMessage: async () => {
    // Get message text
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();
    
    // Don't send if empty
    if (!messageText) return;
    
    // Reset input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Get session ID
    const sessionId = Storage.getSessionId();
    
    // Add message to UI
    UI.addMessageToChat(messageText, 'user');
    
    // Save user message to storage
    Storage.saveMessage({
      type: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    });
    
    // Send to API
    const response = await API.sendMessage(messageText, sessionId);
    
    // Handle API response
    if (response.error) {
      // Show error message
      UI.addMessageToChat(response.message || "Erreur lors de l'envoi.", 'bot');
    } else {
      // Determine the bot message
      const botMessage = response.message || response.output || response.reply || response.response || "Erreur : aucune réponse reçue.";
      
      // Show bot response
      UI.addMessageToChat(botMessage, 'bot');
      
      // Save bot message to storage
      Storage.saveMessage({
        type: 'bot',
        content: botMessage,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update UI
    UI.scrollToBottom();
  },
  
  // Start a new chat
  startNewChat: () => {
    // Create new session
    const newSession = Storage.createSession();
    
    // Clear chat
    UI.clearChat();
    
    // Show welcome message
    UI.showWelcomeMessage();
    
    // Update sessions list
    UI.updateSessionsList();
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      UI.toggleSidebar();
    }
  },
  
  // Load a specific chat session
  loadSession: (sessionId) => {
    // Switch to session
    const session = Storage.switchSession(sessionId);
    
    // Clear chat
    UI.clearChat();
    
    // Display session messages
    if (session.messages && session.messages.length > 0) {
      session.messages.forEach(message => {
        UI.addMessageToChat(message.content, message.type);
      });
    } else {
      // Show welcome message if no messages
      UI.showWelcomeMessage();
    }
    
    // Update sessions list
    UI.updateSessionsList();
    
    // Scroll to bottom
    UI.scrollToBottom();
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      UI.toggleSidebar();
    }
  },
  
  // Delete a chat session
  deleteSession: (event, sessionId) => {
    // Prevent event bubbling
    event.stopPropagation();
    
    // Confirm deletion
    if (confirm("Êtes-vous sûr de vouloir supprimer cette conversation?")) {
      // Delete session
      Storage.deleteSession(sessionId);
      
      // Update UI
      UI.updateSessionsList();
      
      // Load current session
      const currentSession = Storage.getCurrentSession();
      Chat.loadSession(currentSession.id);
    }
  }
};
