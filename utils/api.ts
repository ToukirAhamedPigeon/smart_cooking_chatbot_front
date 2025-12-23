import { ChatResponse, Message, ChatHistoryAPIResponse } from '../types';

// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = 'https://smart-cooking-chatbot-backend.onrender.com';

/**
 * Register a user (call once on app load or first visit)
 */
export const registerUser = async (
  mobile: string,
  name: string
): Promise<string> => {
  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile, name }),
    });

    if (!res.ok) {
      throw new Error('User registration failed');
    }

    return await res.json(); // returns user_id (string)
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

/**
 * Fetch chat history (backend does not support yet)
 * Returning empty array for now
 */
export const fetchChatHistory = async (
  userId: string
): Promise<Message[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/history/${userId}`);

    if (!res.ok) {
      throw new Error('Failed to load chat history');
    }

    const data: ChatHistoryAPIResponse = await res.json();

    const messages: Message[] = [];

    data.messages.forEach((m, index) => {
      const ts = m.created_at ? new Date(m.created_at) : new Date();

      // user message
      messages.push({
        id: `${index}-user`,
        sender: 'user',
        text: m.message,
        timestamp: ts,
      });

      // bot reply
      messages.push({
        id: `${index}-bot`,
        sender: 'bot',
        text: m.reply,
        sentiment: m.sentiment || undefined,
        timestamp: ts,
      });
    });

    return messages;
  } catch (error) {
    console.error('History load error:', error);
    return [];
  }
};


/**
 * Send message to FastAPI backend
 */
export const sendChatMessage = async (
  userId: string,
  message: string
): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        message,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.detail?.[0]?.msg || 'Chat request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
};
