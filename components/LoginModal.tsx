
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CakeIcon, WhiskIcon } from './BakingIllustration';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (mobile: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLogin }) => {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length < 10) {
      setError('Please enter a valid mobile number.');
      return;
    }
    onLogin(mobile);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-mildBg dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-bakingYellow/30"
        >
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-bakingYellow rounded-full flex items-center justify-center mb-6 shadow-lg shadow-bakingYellow/20">
              <span className="text-3xl font-bold text-chocolate italic">SC</span>
            </div>
            
            <h2 className="text-2xl font-bold text-chocolate dark:text-yellow-50 mb-2">Welcome to Smart Cooking!</h2>
            <p className="text-stone-500 dark:text-stone-400 mb-8">Please register with your mobile number to start chatting with our baking expert.</p>
            
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Enter Mobile Number"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  className="w-full px-5 py-4 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-2xl focus:border-bakingYellow focus:ring-4 focus:ring-bakingYellow/10 outline-none transition-all text-lg font-medium tracking-wider"
                />
              </div>
              
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-chocolate to-stone-700 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-chocolate/20 transition-all active:scale-[0.98]"
              >
                Start Baking Support
              </button>
            </form>
            
            <div className="mt-8 flex gap-4 text-stone-400">
              <WhiskIcon />
              <CakeIcon />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
