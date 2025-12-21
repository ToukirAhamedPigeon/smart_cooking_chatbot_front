
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      // We can try to support both, but browsers usually prefer one. 
      // Default to en-US, users can speak Bangla and some engines handle it if configured, 
      // but let's keep it robust.
      recognitionRef.current.lang = 'en-US'; 

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setText(prev => (prev ? prev + ' ' + finalTranscript : finalTranscript));
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition already started or failed:", e);
      }
    }
  };

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
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

  const hasSpeechSupport = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return (
    <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800">
      <div className="max-w-4xl mx-auto relative flex items-end gap-2">
        <div className="flex-1 relative bg-stone-50 dark:bg-stone-800 rounded-2xl border-2 border-transparent focus-within:border-bakingYellow/50 transition-all overflow-hidden flex items-end">
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={disabled}
            placeholder={isListening ? "Listening..." : "Ask about cakes, tools, or delivery..."}
            className="flex-1 bg-transparent px-4 py-3.5 focus:outline-none resize-none text-chocolate dark:text-yellow-50 placeholder-stone-400 dark:placeholder-stone-500 max-h-[120px] scrollbar-hide"
          />
          
          {hasSpeechSupport && (
            <button
              onClick={toggleListening}
              disabled={disabled}
              className={`p-3 mr-1 mb-0.5 rounded-xl transition-all ${
                isListening 
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'text-stone-400 hover:text-chocolate dark:hover:text-yellow-400 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
              title={isListening ? "Stop listening" : "Start voice-to-text"}
            >
              {isListening ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                    <path d="M6 10.5a.75.75 0 01.75.75 5.25 5.25 0 1010.5 0 .75.75 0 011.5 0 6.75 6.75 0 11-13.5 0 .75.75 0 01.75-.75z" />
                    <path d="M12 18.75a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75z" />
                  </svg>
                </motion.div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="h-[52px] w-[52px] bg-gradient-to-br from-chocolate to-stone-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-chocolate/10 disabled:opacity-30 disabled:grayscale transition-all shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 rotate-45 -translate-y-0.5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </motion.button>
      </div>
      <p className="text-[10px] text-center text-stone-400 mt-2 font-medium">Supports Bangla, English & Voice-to-Text</p>
    </div>
  );
};
