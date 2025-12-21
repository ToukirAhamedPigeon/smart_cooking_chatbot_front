
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubble } from './ChatBubble';
import { Message } from '../types';
import { CookieIcon } from './BakingIllustration';

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isTyping }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 chat-scrollbar space-y-2 scroll-smooth"
    >
      <AnimatePresence initial={false}>
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40 grayscale pointer-events-none"
          >
            <CookieIcon />
            <p className="mt-4 text-chocolate dark:text-yellow-50 font-medium">No messages yet. Ask me anything about baking!</p>
          </motion.div>
        )}
        
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-1.5 h-1.5 bg-chocolate dark:bg-yellow-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-chocolate dark:bg-yellow-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-chocolate dark:bg-yellow-400 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
