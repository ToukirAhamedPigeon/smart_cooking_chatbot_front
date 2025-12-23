import React, { useEffect, useState } from 'react';

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(true); // Start with true
  const [isStandalone, setIsStandalone] = useState(false);
  const [browserSupportsPWA, setBrowserSupportsPWA] = useState(false);

  useEffect(() => {
    console.log('🔧 PWA Installer Initialized');
    
    // Check if already installed
    const checkInstallStatus = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const fullscreen = (window.navigator as any).standalone === true;
      const installed = standalone || fullscreen;
      
      console.log('📱 Installation Status:', { 
        installed, 
        displayMode: standalone ? 'standalone' : 'browser',
        isIOSPWA: fullscreen
      });
      
      setIsStandalone(installed);
      return installed;
    };

    // Check browser capabilities
    const checkBrowserSupport = () => {
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      const isEdge = /Edg/.test(navigator.userAgent);
      const isSamsung = /SamsungBrowser/.test(navigator.userAgent);
      const supportsPWA = isChrome || isEdge || isSamsung;
      
      console.log('🌐 Browser Support:', {
        isChrome, isEdge, isSamsung, supportsPWA
      });
      
      setBrowserSupportsPWA(supportsPWA);
      return supportsPWA;
    };

    // Real beforeinstallprompt handler
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('🎉 REAL beforeinstallprompt fired by browser!');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    // Handle app installed
    const handleAppInstalled = () => {
      console.log('✅ App installed!');
      setIsStandalone(true);
      setShowInstall(false);
    };

    // Run initial checks
    const alreadyInstalled = checkInstallStatus();
    const supportsPWA = checkBrowserSupport();
    
    // Only add event listeners if not installed and browser supports PWA
    if (!alreadyInstalled && supportsPWA) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.addEventListener('appinstalled', handleAppInstalled);
      
      // FOR DEVELOPMENT/TESTING: Always show button after delay
      const isDev = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
      
      if (isDev) {
        console.log('🛠️ Development mode detected');
        // Show button immediately in dev
        setShowInstall(true);
      } else {
        // In production, show button if PWA criteria are met
        const hasServiceWorker = 'serviceWorker' in navigator;
        const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
        const isHTTPS = window.location.protocol === 'https:';
        
        if (hasServiceWorker && hasManifest && isHTTPS) {
          console.log('✅ PWA criteria met, showing install button');
          setShowInstall(true);
        }
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    } else if (alreadyInstalled) {
      setShowInstall(false);
    }
  }, []);

  const handleInstallClick = async () => {
    console.log('🖱️ Install button clicked');
    
    // If we have a real deferred prompt from browser
    if (deferredPrompt) {
      try {
        console.log('📱 Using browser install prompt');
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`📝 User choice: ${outcome}`);
        
        if (outcome === 'accepted') {
          console.log('🎊 User accepted installation!');
          setIsStandalone(true);
        }
        
        setDeferredPrompt(null);
        setShowInstall(false);
        return;
      } catch (error) {
        console.error('❌ Error with browser prompt:', error);
      }
    }
    
    // Fallback: Show manual installation guide
    showManualInstallGuide();
  };

  const showManualInstallGuide = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    const isDesktop = !isIOS && !isAndroid;
    
    let guide = '';
    
    if (isIOS) {
      guide = `📱 Install on iOS Safari:
1. Tap the Share button (📤) at bottom
2. Scroll down → "Add to Home Screen"
3. Tap "Add" in top right
4. App will appear on home screen!`;
    } else if (isAndroid) {
      guide = `📱 Install on Android:
1. Tap ⋮ menu in top right
2. Look for "Install app" or "Add to Home Screen"
3. Tap "Install" to add to home screen

💡 Tip: Use the app for 30+ seconds to see auto-install prompt`;
    } else if (isDesktop) {
      guide = `💻 Install on Desktop:
1. Look for install icon (📱) in address bar
2. OR Click ⋮ menu → "Install Smart Cooking Chat"
3. OR Press Ctrl+Shift+B to show install button

🔧 For Chrome Desktop:
• Click the puzzle piece icon in address bar
• Look for "Install" button`;
    }
    
    alert(guide);
    
    // Also show in console for easy copying
    console.log('📋 Installation Guide:\n' + guide);
  };

  // Debug info component
  const DebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="fixed top-5 left-5 bg-black/90 text-green-400 p-3 rounded-lg text-xs max-w-md z-50 border border-green-800 shadow-2xl">
        <div className="font-bold mb-2 flex items-center">
          <span className="mr-2">🔧 PWA DEBUG</span>
          <button 
            onClick={() => navigator.clipboard.writeText(JSON.stringify({
              url: window.location.href,
              userAgent: navigator.userAgent,
              pwaReady: browserSupportsPWA && !isStandalone
            }, null, 2))}
            className="text-xs bg-gray-800 px-2 py-1 rounded"
          >
            Copy Info
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div>Status: {isStandalone ? '📱 INSTALLED' : '🌐 BROWSER'}</div>
          <div>Show Button: {showInstall ? '✅ YES' : '❌ NO'}</div>
          <div>Browser PWA: {browserSupportsPWA ? '✅ YES' : '❌ NO'}</div>
          <div>Deferred Prompt: {deferredPrompt ? '✅ YES' : '❌ NO'}</div>
          <div>HTTPS: {window.location.protocol === 'https:' ? '✅ YES' : '❌ NO'}</div>
          <div>Service Worker: {'serviceWorker' in navigator ? '✅ YES' : '❌ NO'}</div>
          <div>Manifest: {document.querySelector('link[rel="manifest"]') ? '✅ YES' : '❌ NO'}</div>
          <div>Display Mode: {window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'}</div>
        </div>
        <div className="mt-2 text-gray-400 text-[10px]">
          {navigator.userAgent}
        </div>
      </div>
    );
  };

  // Don't show anything if already installed
  if (isStandalone) {
    return <DebugInfo />;
  }

  // Show install button if conditions are met
  if (showInstall && browserSupportsPWA) {
    return (
      <>
        <DebugInfo />
        <button
          onClick={handleInstallClick}
          className="fixed bottom-6 right-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500 via-bakingYellow to-orange-500 text-black shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 transition-all duration-300 z-50 animate-bounce border-2 border-white/30"
          title="Install Smart Cooking Chat App - Click for instructions"
          aria-label="Install application to your device"
          style={{
            boxShadow: '0 10px 25px rgba(0,0,0,0.3), 0 0 20px rgba(253, 224, 71, 0.5)'
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
              <svg className="w-8 h-8 relative" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="font-extrabold text-lg leading-tight">INSTALL APP</div>
              <div className="text-xs font-medium opacity-90">Add to Home Screen</div>
            </div>
            <svg className="w-6 h-6 opacity-80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        </button>
      </>
    );
  }

  // Fallback: Show manual install button for unsupported browsers
  if (!browserSupportsPWA && !isStandalone) {
    return (
      <>
        <DebugInfo />
        <button
          onClick={showManualInstallGuide}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 z-50"
          title="PWA Installation Guide"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Install Guide</span>
          </div>
        </button>
      </>
    );
  }

  return <DebugInfo />;
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