
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { LoginModal } from './components/LoginModal';
import { Message, User } from './types';
import { getCookie, setCookie } from './utils/cookies';
import { fetchChatHistory, sendChatMessage } from './utils/api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Check for existing session
  useEffect(() => {
    const savedMobile = getCookie('user_mobile');
    if (savedMobile) {
      handleLogin(savedMobile);
    } else {
      setIsLoginModalOpen(true);
    }
  }, []);

  const handleLogin = useCallback(async (mobile: string) => {
    setCookie('user_mobile', mobile);
    setUser({ mobile });
    setIsLoginModalOpen(false);
    
    const history = await fetchChatHistory(mobile);
    setMessages(history);
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!user) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const result = await sendChatMessage(user.mobile, text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: result.reply,
        timestamp: new Date(),
        source: result.source,
        sentiment: result.sentiment
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "I'm sorry, I'm having trouble connecting to the baking station. Please try again in a moment!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-mildBg dark:bg-darkMildBg transition-colors duration-300">
      <Header />
      
      <main className="flex-1 flex flex-col relative w-full max-w-4xl mx-auto overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-bakingYellow/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-chocolate/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none"></div>

        <ChatWindow messages={messages} isTyping={isTyping} />
        
        <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </main>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onLogin={handleLogin} 
      />
    </div>
  );
};

export default App;
