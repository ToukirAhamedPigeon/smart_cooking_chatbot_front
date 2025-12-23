import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { LoginModal } from './components/LoginModal';
import { Message, User } from './types';
import { getCookie, setCookie } from './utils/cookies';
import { fetchChatHistory, sendChatMessage } from './utils/api';
import PWAInstaller from './PWAInstaller';
import PWAChecklist from './PWAChecklist';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Check for existing session
  useEffect(() => {
    const savedMobile = getCookie('user_mobile');
    if (savedMobile) {
      handleLogin(savedMobile);
    } else {
      setIsLoginModalOpen(true);
    }
  }, []);

  useEffect(() => {
    // Debug PWA features
    console.log('PWA Debug Info:');
    console.log('Service Worker support:', 'serviceWorker' in navigator);
    console.log('BeforeInstallPrompt support:', 'beforeinstallprompt' in window);
    console.log('Is installed?', window.matchMedia('(display-mode: standalone)').matches);
    
    // Check if HTTPS
    console.log('Is HTTPS?', window.location.protocol === 'https:');
  }, []);

  const handleLogin = useCallback(async (mobile: string) => {
    setCookie('user_mobile', mobile);
    setUser({ mobile });
    setIsLoginModalOpen(false);
    setIsLoadingHistory(true);

    try {
      const history = await fetchChatHistory(mobile);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const handleLogout = () => {
    setCookie('user_mobile', '', -1); // expire cookie
    setUser(null);
    setMessages([]);
    setIsLoginModalOpen(true);
  };

  const handleSendMessage = async (text: string) => {
    if (!user) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
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
        sentiment: result.sentiment,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "I'm sorry, I'm having trouble connecting. Please try again in a moment!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-mildBg dark:bg-darkMildBg transition-colors duration-300">
      <PWAChecklist />
      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col relative w-full max-w-4xl mx-auto overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-bakingYellow/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-chocolate/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none"></div>

        <ChatWindow 
          messages={messages} 
          isTyping={isTyping} 
          isLoading={isLoadingHistory} 
        />
        <MessageInput onSendMessage={handleSendMessage} disabled={isTyping || isLoadingHistory} />
      </main>

      <LoginModal
        isOpen={isLoginModalOpen}
        onLogin={handleLogin}
      />
      <PWAInstaller />
    </div>
  );
};

export default App;
