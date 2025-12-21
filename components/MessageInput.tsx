
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800">
      <div className="max-w-4xl mx-auto relative flex items-end gap-2">
        <div className="flex-1 relative bg-stone-50 dark:bg-stone-800 rounded-2xl border-2 border-transparent focus-within:border-bakingYellow/50 transition-all overflow-hidden">
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={disabled}
            placeholder="Ask about cakes, tools, or delivery..."
            className="w-full bg-transparent px-4 py-3.5 focus:outline-none resize-none text-chocolate dark:text-yellow-50 placeholder-stone-400 dark:placeholder-stone-500 max-h-[120px] scrollbar-hide"
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="h-[52px] w-[52px] bg-gradient-to-br from-chocolate to-stone-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-chocolate/10 disabled:opacity-30 disabled:grayscale transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 rotate-45 -translate-y-0.5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </motion.button>
      </div>
      <p className="text-[10px] text-center text-stone-400 mt-2 font-medium">Supports Bangla, English & Banglish</p>
    </div>
  );
};
