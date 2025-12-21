
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WhiskIcon } from './BakingIllustration';

export const Header: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isSystemDark) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-800 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <motion.div 
          whileHover={{ rotate: 10 }}
          className="w-10 h-10 bg-bakingYellow rounded-full flex items-center justify-center shadow-inner"
        >
          <span className="text-lg font-bold text-chocolate italic">SC</span>
        </motion.div>
        <div>
          <h1 className="text-lg font-bold text-chocolate dark:text-yellow-50 leading-tight">Smart Cooking</h1>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Online Assistant</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-chocolate dark:text-yellow-100 hover:bg-bakingYellow dark:hover:bg-bakingYellow/20 transition-all"
          title="Toggle Dark Mode"
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        <div className="hidden sm:block text-stone-300 dark:text-stone-700 mx-1">|</div>
        <div className="hidden sm:flex text-chocolate dark:text-yellow-50">
          <WhiskIcon />
        </div>
      </div>
    </header>
  );
};
