import React, { useEffect, useState } from 'react';

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    console.log('PWA Installer: Initializing...');
    
    // Check if already installed
    const checkInstallStatus = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const fullscreen = (window.navigator as any).standalone === true;
      const installed = standalone || fullscreen;
      
      console.log('Install status:', { standalone, fullscreen, installed });
      setIsStandalone(installed);
      
      if (installed) {
        setShowInstall(false);
        setShowManualGuide(false);
        return true;
      }
      return false;
    };

    // Real beforeinstallprompt handler
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('🎉 REAL beforeinstallprompt fired!', e);
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
      setShowManualGuide(false);
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      console.log('✅ App installed successfully');
      setDeferredPrompt(null);
      setShowInstall(false);
      setShowManualGuide(false);
      setIsStandalone(true);
    };

    // Check initial status
    const alreadyInstalled = checkInstallStatus();
    
    if (!alreadyInstalled) {
      // Add real event listeners
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.addEventListener('appinstalled', handleAppInstalled);
      
      // Show manual guide after 5 seconds if no prompt appears
      const manualTimer = setTimeout(() => {
        if (!showInstall && !isStandalone) {
          console.log('Showing manual guide - no auto prompt received');
          setShowManualGuide(true);
        }
      }, 5000);

      // Force show install button in development after 3 seconds
      if (window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1' ||
          process.env.NODE_ENV === 'development') {
        
        console.log('Development mode: Will simulate install button');
        
        const forceTimer = setTimeout(() => {
          console.log('🛠️ DEV: Forcing install button to show');
          setForceShow(true);
          setShowInstall(true);
        }, 3000);

        return () => {
          clearTimeout(forceTimer);
          clearTimeout(manualTimer);
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
          window.removeEventListener('appinstalled', handleAppInstalled);
        };
      }

      return () => {
        clearTimeout(manualTimer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  // ALWAYS show in development after a short delay
  useEffect(() => {
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  process.env.NODE_ENV === 'development';
    
    if (isDev && !isStandalone) {
      console.log('DEV: Setting up forced display');
      const timer = setTimeout(() => {
        console.log('DEV: Forcing button display');
        setForceShow(true);
        setShowInstall(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isStandalone]);

  const handleInstallClick = async () => {
    console.log('Install button clicked');
    
    // If we have a real deferred prompt
    if (deferredPrompt) {
      try {
        console.log('Using real deferred prompt');
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User choice: ${outcome}`);
        
        if (outcome === 'accepted') {
          console.log('User accepted installation');
        }
        
        setDeferredPrompt(null);
        setShowInstall(false);
        return;
      } catch (error) {
        console.error('Error with real prompt:', error);
      }
    }
    
    // If force show or no real prompt, show installation guide
    console.log('No real prompt, showing guide');
    showInstallationGuide();
  };

  const showInstallationGuide = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    
    let guideMessage = '';
    
    if (isIOS) {
      guideMessage = `📱 Install on iPhone/iPad:
1. Tap the Share button (📤) at bottom
2. Scroll down, tap "Add to Home Screen"
3. Tap "Add" in top right
4. App will appear on home screen!`;
    } else if (isAndroid && isChrome) {
      guideMessage = `📱 Install on Android:
1. Tap menu (⋮) in top right
2. Tap "Install app" or "Add to Home Screen"
3. Tap "Install" in popup
4. App will install like native app!

💡 Tip: Use app for 30+ seconds for auto-install prompt`;
    } else {
      guideMessage = `📱 Install this app:
1. Look for install icon (📱) in address bar
2. Or check browser menu for "Install"
3. May need to use app for 30+ seconds first

📌 On Chrome Desktop: Click ⋮ → "Install Smart Cooking Chat"`;
    }
    
    alert(guideMessage);
    setShowManualGuide(false);
  };

  const handleManualGuideClick = () => {
    showInstallationGuide();
  };

  // Debug panel for development
  const DebugPanel = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="fixed top-20 left-5 bg-gray-900 text-green-400 p-3 rounded-lg text-xs max-w-xs z-50 border border-gray-700">
        <div className="font-bold mb-2">🔧 PWA Debug Panel</div>
        <div className="space-y-1">
          <div>🔄 Status: {isStandalone ? 'INSTALLED' : 'NOT INSTALLED'}</div>
          <div>🎯 Auto Prompt: {deferredPrompt ? 'AVAILABLE' : 'NOT AVAILABLE'}</div>
          <div>🔄 Show Button: {showInstall ? 'YES' : 'NO'}</div>
          <div>🛠️ Force Show: {forceShow ? 'YES' : 'NO'}</div>
          <div>📱 User Agent: {navigator.userAgent.slice(0, 50)}...</div>
          <div>🔒 HTTPS: {window.location.protocol === 'https:' ? 'YES' : 'NO'}</div>
          <div>⚙️ Service Worker: {'serviceWorker' in navigator ? 'YES' : 'NO'}</div>
        </div>
      </div>
    );
  };

  // Don't show anything if already installed
  if (isStandalone) {
    return <DebugPanel />;
  }

  // Show manual guide button if no auto-prompt
  if (showManualGuide && !showInstall) {
    return (
      <>
        <DebugPanel />
        <button
          onClick={handleManualGuideClick}
          className="fixed bottom-5 right-5 p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 z-50 animate-pulse"
          title="How to install this app"
          aria-label="Show installation instructions"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">How to Install</span>
          </div>
        </button>
      </>
    );
  }

  // Show install button if we have a prompt OR we're forcing it
  if (showInstall || forceShow) {
    return (
      <>
        <DebugPanel />
        <button
          onClick={handleInstallClick}
          className="fixed bottom-5 right-5 p-4 rounded-full bg-gradient-to-r from-yellow-400 via-bakingYellow to-orange-400 text-black shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 z-50 animate-bounce"
          title="Install Smart Cooking Chat App"
          aria-label="Install app to your device"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z" />
                <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <div className="text-left">
              <div className="font-bold text-sm">Install App</div>
              <div className="text-xs opacity-75">Add to Home Screen</div>
            </div>
            <svg className="w-5 h-5 opacity-75" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
      </>
    );
  }

  // Show debug panel only
  return <DebugPanel />;
};

// Type definitions
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default PWAInstaller;