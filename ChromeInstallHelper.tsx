import React from 'react';

export const ChromeInstallHelper: React.FC = () => {
  const openChromeFlags = () => {
    // Instructions to enable #bypass-app-banner-engagement-checks flag
    const instructions = `📋 To force PWA install button in Chrome:

1. Open Chrome and type in address bar: chrome://flags/
2. Search for: "bypass-app-banner-engagement-checks"
3. Set it to: "Enabled"
4. Click "Relaunch" button at bottom
5. Reload this page

This will force Chrome to show the install button immediately!`;

    alert(instructions);
    
    // Try to open chrome://flags automatically (won't work due to security, but worth trying)
    try {
      window.open('chrome://flags/#bypass-app-banner-engagement-checks', '_blank');
    } catch (e) {
      console.log('Cannot open chrome://flags due to security restrictions');
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <button
      onClick={openChromeFlags}
      className="fixed bottom-6 left-6 p-2 rounded-lg bg-purple-600 text-white text-xs font-bold shadow-lg hover:bg-purple-700 transition z-50"
      title="Force Chrome PWA Install"
    >
      🔧 Force PWA
    </button>
  );
};