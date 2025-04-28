/**
 * Main application entry point
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI
  UI.init();
  
  // Initialize chat
  Chat.init();
  
  // Auto-resize textarea
  const messageInput = document.getElementById('message-input');
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
  });
  
  // Handle iOS viewport issues
  const viewportHeight = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  // Run on page load
  viewportHeight();
  
  // Run on resize
  window.addEventListener('resize', () => {
    viewportHeight();
  });
});