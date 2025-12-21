
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

export interface User {
  mobile: string;
}
