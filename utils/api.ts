
import { ChatResponse, Message } from '../types';

// Mock API base URL - in a real app, this would be an environment variable
const API_BASE_URL = '/api'; 

export const fetchChatHistory = async (userId: string): Promise<Message[]> => {
  try {
    // In a real implementation: const res = await fetch(`${API_BASE_URL}/history/${userId}`);
    // Simulated history for demonstration:
    return [
      {
        id: 'hist-1',
        sender: 'bot',
        text: 'Welcome back! How can I help with your baking today?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60)
      }
    ];
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
};

export const sendChatMessage = async (userId: string, message: string): Promise<ChatResponse> => {
  try {
    // Real call:
    // const response = await fetch(`${API_BASE_URL}/chat`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ user_id: userId, message })
    // });
    // return await response.json();

    // Mock response for the UI demonstration
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network lag
    
    return {
      reply: `Thank you for your message! I'm here to help you with anything related to smart cooking. You asked about: "${message}". Is there anything specific about our baking tools or recipes you'd like to know?`,
      source: 'Internal Knowledge Base',
      sentiment: 'helpful'
    };
  } catch (error) {
    throw new Error('Failed to connect to the baking server.');
  }
};
