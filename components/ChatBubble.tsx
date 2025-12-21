
import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base ${
            isUser 
              ? 'bg-gradient-to-br from-chocolate to-stone-700 text-white rounded-tr-none' 
              : 'bg-white dark:bg-stone-800 text-chocolate dark:text-yellow-50 rounded-tl-none border border-stone-100 dark:border-stone-700'
          }`}
        >
          {message.text}
          {message.source && (
            <div className="mt-2 pt-2 border-t border-stone-100/20 text-[10px] opacity-70 italic">
              Source: {message.source}
            </div>
          )}
        </div>
        <span className="text-[10px] mt-1 text-stone-400 dark:text-stone-500 font-medium px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};
