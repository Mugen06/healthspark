/**
 * UI utilities for managing the interface
 */
const UI = {
  // Initialize UI
  init: () => {
    // Setup sidebar toggle
    UI.setupSidebarToggle();
    
    // Update sessions list
    UI.updateSessionsList();
  },
  
  // Setup sidebar toggle
  setupSidebarToggle: () => {
    // Sidebar toggle button
    document.getElementById('sidebar-toggle-btn').addEventListener('click', UI.toggleSidebar);
    
    // Sidebar open button (hamburger)
    document.getElementById('sidebar-open-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      UI.toggleSidebar();
    });
    
    // Close sidebar when clicking outside on mobile
    document.querySelector('.main-content').addEventListener('click', (e) => {
      const sidebar = document.querySelector('.sidebar');
      if (window.innerWidth < 1024 && sidebar.classList.contains('open')) {
        UI.toggleSidebar();
      }
    });
  },
  
  // Toggle sidebar visibility
  toggleSidebar: () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('open');
    
    // Add transition class to main content
    mainContent.classList.toggle('sidebar-visible');
  },
  
  // Add message to chat container
  addMessageToChat: (content, type) => {
    // Remove welcome message if present
    const welcomeContainer = document.querySelector('.welcome-container');
    if (welcomeContainer) {
      welcomeContainer.remove();
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}-message`;
    messageElement.innerHTML = UI.formatMessageContent(content);
    
    // Add timestamp
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    messageElement.appendChild(timestamp);
    
    // Add to chat container
    document.getElementById('chat-container').appendChild(messageElement);
    
    // Scroll to bottom
    UI.scrollToBottom();
    
    return messageElement;
  },
  
  // Format message content (handle markdown, emojis, etc)
  formatMessageContent: (content) => {
    // Basic formatting
    let formattedContent = content
      // Handle line breaks
      .replace(/\n/g, '<br>')
      // Handle bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Handle lists
      .replace(/- (.*?)(?:\n|$)/g, '<li>$1</li>')
      // Handle links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Wrap with paragraph if not containing HTML elements
    if (!formattedContent.includes('<')) {
      formattedContent = `<p>${formattedContent}</p>`;
    }
    
    // Wrap lists
    if (formattedContent.includes('<li>')) {
      formattedContent = formattedContent.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
    }
    
    return formattedContent;
  },
  
  // Show welcome message
  showWelcomeMessage: () => {
    const chatContainer = document.getElementById('chat-container');
    
    // Create welcome container
    const welcomeContainer = document.createElement('div');
    welcomeContainer.className = 'welcome-container';
    
    // Create welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'welcome-message';
    welcomeMessage.innerHTML = `
      <h2>💫 HealthSpark à ton service</h2>
      <p>→ Comment puis-je t'aider ?</p>
    `;
    
    // Add to container
    welcomeContainer.appendChild(welcomeMessage);
    chatContainer.appendChild(welcomeContainer);
  },
  
  // Show typing indicator
  showTypingIndicator: () => {
    // Create typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.id = 'typing-indicator';
    
    // Add animation dots
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      typingIndicator.appendChild(dot);
    }
    
    // Add to chat container
    document.getElementById('chat-container').appendChild(typingIndicator);
    
    // Scroll to bottom
    UI.scrollToBottom();
  },
  
  // Hide typing indicator
  hideTypingIndicator: () => {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  },
  
  // Scroll chat to bottom
  scrollToBottom: () => {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
  },
  
  // Clear chat
  clearChat: () => {
    document.getElementById('chat-container').innerHTML = '';
  },
  
  // Update sessions list
  updateSessionsList: () => {
    // Get all sessions
    const sessions = Storage.getAllSessions();
    
    // Get sessions list element
    const sessionsListElement = document.getElementById('sessions-list');
    sessionsListElement.innerHTML = '';
    
    // Add sessions to list
    if (sessions.length > 0) {
      sessions.forEach(session => {
        const sessionItem = document.createElement('div');
        sessionItem.className = `session-item ${session.isActive ? 'active' : ''}`;
        sessionItem.setAttribute('data-id', session.id);
        sessionItem.innerHTML = `
          <div class="session-title">${session.title}</div>
          <div class="session-delete" title="Supprimer"><span></span></div>
        `;
        
        // Add click event
        sessionItem.addEventListener('click', () => Chat.loadSession(session.id));
        
        // Add delete event
        sessionItem.querySelector('.session-delete').addEventListener('click', (e) => Chat.deleteSession(e, session.id));
        
        sessionsListElement.appendChild(sessionItem);
      });
    } else {
      // Show empty state
      sessionsListElement.innerHTML = `
        <div class="empty-sessions">
          <p>Aucune conversation</p>
        </div>
      `;
    }
  }
};