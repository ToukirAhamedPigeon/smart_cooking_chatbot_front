export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  source?: string;
  sentiment?: string;
}

export interface ChatResponse {
  reply: string;
  source: string;
  sentiment: string;
}

export interface ChatHistoryAPIResponse {
  user_id: string;
  messages: {
    message: string;
    reply: string;
    sentiment?: string;
    created_at: string; // 🔥 ISO string from backend
  }[];
  source: string;
}

export interface User {
  mobile: string;
}
