/**
 * API utilities for sending and receiving chat messages
 */
const API = {
  // API endpoint - ensure HTTPS
  endpoint: 'https://mathune.app.n8n.cloud/webhook/10152199-904f-4807-8a0a-9e38c4a14cb2',
  
  // Authorization token
  token: 'RAGSANTE123456',
  
  /**
   * Send a message to the API
   * @param {string} message - User message
   * @param {string} sessionId - Current session ID
   * @returns {Promise} - Response from API
   */
  sendMessage: async (message, sessionId) => {
    try {
      // Show typing indicator
      UI.showTypingIndicator();
      
      // Request body
      const requestBody = {
        chatInput: message,
        sessionId: sessionId
      };
      
      // Request headers with proper CORS configuration
      const headers = {
        'Authorization': `Bearer ${API.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Make API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout
      
      const response = await fetch(API.endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
        mode: 'cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Check for specific error types
      if (!response.ok) {
        let errorMessage = 'An error occurred while sending the message';
        
        switch (response.status) {
          case 401:
            errorMessage = 'Authentication failed. Please check your credentials.';
            break;
          case 403:
            errorMessage = 'Access forbidden. You may not have permission to perform this action.';
            break;
          case 404:
            errorMessage = 'The API endpoint could not be found. Please check the URL.';
            break;
          case 429:
            errorMessage = 'Too many requests. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse response
      const data = await response.json();
      
      // Hide typing indicator
      UI.hideTypingIndicator();
      
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Hide typing indicator
      UI.hideTypingIndicator();
      
      // Handle specific error types
      let errorMessage;
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else {
        errorMessage = error.message || "Sorry, an error occurred while sending the message. Please check your internet connection and try again.";
      }
      
      // Return detailed error message
      return {
        error: true,
        message: errorMessage
      };
    }
  }
};