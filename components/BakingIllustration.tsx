
import React from 'react';
import { motion } from 'framer-motion';

export const WhiskIcon = () => (
  <motion.svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    className="w-6 h-6"
    animate={{ rotate: [0, 15, -15, 0] }}
    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
  >
    <path d="M6 16c1.5 1.5 4 1.5 5.5 0M9 13v3M15 9l-4 4M12 6c1.5 1.5 4 1.5 5.5 0M15 3v3M21 9c-1.5-1.5-4-1.5-5.5 0M18 12v-3" strokeLinecap="round" />
    <path d="M3 21l3-3" strokeLinecap="round" />
  </motion.svg>
);

export const CakeIcon = () => (
  <motion.svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    className="w-8 h-8"
    whileHover={{ scale: 1.1 }}
  >
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" strokeLinecap="round" />
    <path d="M4 17h16" strokeLinecap="round" />
    <path d="M7 11V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" strokeLinecap="round" />
    <path d="M12 5V3" strokeLinecap="round" />
  </motion.svg>
);

export const CookieIcon = () => (
  <motion.svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="w-5 h-5 text-amber-700"
    animate={{ y: [0, -2, 0] }}
    transition={{ repeat: Infinity, duration: 1.5 }}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="8" cy="8" r="1.5" fill="white" />
    <circle cx="15" cy="10" r="1.5" fill="white" />
    <circle cx="10" cy="15" r="1.5" fill="white" />
    <circle cx="16" cy="16" r="1.5" fill="white" />
  </motion.svg>
);
