import React, { useEffect, useState } from 'react';

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    console.log('🔧 PWA Installer: Initializing...');
    
    // Detect device type
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobile = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);
      const desktop = !mobile;
      
      console.log('📱 Device Detection:', { mobile, desktop, userAgent });
      setIsMobile(mobile);
      setIsDesktop(desktop);
      
      return { mobile, desktop };
    };

    // Check if app is already installed (running as PWA)
    const checkIfInstalled = () => {
      // Method 1: Check display mode
      const displayMode = window.matchMedia('(display-mode: standalone)').matches;
      
      // Method 2: Check for iOS standalone mode
      const iosStandalone = (window.navigator as any).standalone === true;
      
      // Method 3: Check for standalone query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const hasStandaloneParam = urlParams.get('standalone') === 'true';
      
      const installed = displayMode || iosStandalone || hasStandaloneParam;
      
      console.log('📊 Installation Check:', {
        displayMode,
        iosStandalone,
        hasStandaloneParam,
        installed
      });
      
      setIsStandalone(installed);
      return installed;
    };

    // Real beforeinstallprompt event handler
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('🎉 BROWSER: beforeinstallprompt event fired!');
      console.log('Platforms:', e.platforms);
      
      // Prevent Chrome's mini-infobar
      e.preventDefault();
      
      // Save the event for later use
      setDeferredPrompt(e);
      
      // Show our install button
      setShowInstall(true);
    };

    // Check when app is installed
    const handleAppInstalled = () => {
      console.log('✅ App was installed successfully!');
      setIsStandalone(true);
      setShowInstall(false);
      setDeferredPrompt(null);
    };

    // Run initial checks
    detectDevice();
    const alreadyInstalled = checkIfInstalled();
    
    console.log('📋 Initial State:', {
      alreadyInstalled,
      shouldShowButton: !alreadyInstalled,
      isDesktop,
      isMobile
    });

    // Only set up event listeners if NOT already installed
    if (!alreadyInstalled) {
      console.log('📝 Setting up PWA event listeners...');
      
      // Listen for beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      
      // Listen for app installed event
      window.addEventListener('appinstalled', handleAppInstalled);
      
      // For DEVELOPMENT: Always show button after delay for testing
      const isDevelopment = 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        console.log('🛠️ DEVELOPMENT MODE: Forcing install button to appear');
        
        // Show button immediately in dev
        setTimeout(() => {
          if (!showInstall) {
            console.log('🛠️ DEV: Showing install button (simulated)');
            setShowInstall(true);
          }
        }, 2000);
      }
      
      // For PRODUCTION: Show button if user is on a compatible browser
      // even if beforeinstallprompt hasn't fired yet
      if (!isDevelopment) {
        const isChrome = /chrome|crios/i.test(navigator.userAgent);
        const isEdge = /edg/i.test(navigator.userAgent);
        const isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
        const isFirefox = /firefox|fxios/i.test(navigator.userAgent);
        
        const supportsPWA = isChrome || isEdge || isSafari || isFirefox;
        
        if (supportsPWA) {
          console.log('✅ Browser supports PWA, showing install button');
          setShowInstall(true);
        }
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    } else {
      console.log('📱 App already installed, hiding install button');
      setShowInstall(false);
    }
  }, []);

  const handleInstallClick = async () => {
    console.log('🖱️ Install button clicked');
    
    if (deferredPrompt) {
      try {
        console.log('📱 Using browser install prompt...');
        
        // Show the native install prompt
        deferredPrompt.prompt();
        
        // Wait for user choice
        const choiceResult = await deferredPrompt.userChoice;
        console.log('📝 User choice result:', choiceResult);
        
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ User accepted installation');
          setIsStandalone(true);
        } else {
          console.log('❌ User declined installation');
        }
        
        // Clear the deferred prompt
        setDeferredPrompt(null);
        setShowInstall(false);
        
      } catch (error) {
        console.error('❌ Error showing install prompt:', error);
        showManualInstallGuide();
      }
    } else {
      console.log('⚠️ No deferred prompt, showing manual guide');
      showManualInstallGuide();
    }
  };

  const showManualInstallGuide = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = /chrome|crios/.test(userAgent);
    const isFirefox = /firefox|fxios/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isEdge = /edg/.test(userAgent);
    const isOpera = /opr/.test(userAgent);
    
    let guide = '';
    let browserName = 'your browser';
    
    if (isChrome) {
      browserName = 'Chrome';
      guide = `To install this app in Chrome ${isDesktop ? 'Desktop' : 'Mobile'}:

${isDesktop ? `
🔧 Chrome Desktop:
1. Look for the install icon (📱) in the address bar
   OR
2. Click the three dots menu (⋮) → "Install Smart Cooking Chat"
   OR
3. Press Ctrl+Shift+B to show the install button

💡 Tip: Sometimes you need to:
• Use the app for 30+ seconds
• Refresh the page
• Check Chrome menu for "Create shortcut"` : `
📱 Chrome Mobile:
1. Tap the three dots menu (⋮) in top right
2. Select "Add to Home screen" or "Install app"
3. Tap "Add" or "Install"

💡 If you don't see the option:
• Use the app for a minute
• Close and reopen Chrome
• Check address bar for install icon`}`;
    } else if (isFirefox) {
      browserName = 'Firefox';
      guide = `To install in Firefox:
1. Tap the menu (≡) in top right
2. Select "Install" or "Add to Home Screen"`;
    } else if (isSafari) {
      browserName = 'Safari';
      guide = `To install in Safari (iOS/Mac):
1. Tap the Share button (📤)
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add"`;
    } else if (isEdge) {
      browserName = 'Edge';
      guide = `To install in Microsoft Edge:
1. Tap the menu (...) in bottom center
2. Select "Add to Home screen"`;
    } else {
      guide = `To install this app:
1. Look for an install icon (📱) in your browser's address bar
2. Or check the browser menu for "Install" or "Add to Home Screen"
3. Some browsers require using the app for 30+ seconds first`;
    }
    
    const message = `📱 Install Smart Cooking Chat in ${browserName}:\n\n${guide}`;
    alert(message);
    
    // Also log to console for reference
    console.log('📋 Installation Guide:\n', message);
  };

  // Debug panel - only in development
  const DebugPanel = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="fixed top-4 left-4 bg-gray-900 text-green-400 p-3 rounded-lg text-xs max-w-md z-50 border border-gray-700 shadow-2xl">
        <div className="font-bold mb-2 flex items-center justify-between">
          <span>🔧 PWA DEBUG PANEL</span>
          <button 
            onClick={() => {
              const debugInfo = {
                url: window.location.href,
                showInstall,
                isStandalone,
                isMobile,
                isDesktop,
                deferredPrompt: !!deferredPrompt,
                userAgent: navigator.userAgent,
                displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
              };
              navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
              alert('Debug info copied to clipboard!');
            }}
            className="text-xs bg-gray-800 px-2 py-1 rounded hover:bg-gray-700"
          >
            Copy Debug
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className={`font-bold ${showInstall ? 'text-green-400' : 'text-red-400'}`}>
            Button: {showInstall ? '✅ SHOWING' : '❌ HIDDEN'}
          </div>
          <div className={isStandalone ? 'text-yellow-400' : 'text-blue-400'}>
            Mode: {isStandalone ? '📱 INSTALLED' : '🌐 BROWSER'}
          </div>
          <div className={isDesktop ? 'text-purple-400' : ''}>
            Device: {isDesktop ? '💻 DESKTOP' : '📱 MOBILE'}
          </div>
          <div>
            Prompt: {deferredPrompt ? '✅ READY' : '❌ NONE'}
          </div>
          <div>
            HTTPS: {window.location.protocol === 'https:' ? '✅' : '❌'}
          </div>
          <div>
            SW: {'serviceWorker' in navigator ? '✅' : '❌'}
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="text-gray-400">User Agent:</div>
          <div className="text-[10px] truncate">{navigator.userAgent}</div>
        </div>
      </div>
    );
  };

  // ========== MAIN LOGIC ==========
  // If app is already installed as PWA, don't show button
  if (isStandalone) {
    console.log('📱 App is installed, not showing install button');
    return <DebugPanel />;
  }

  // If we should show the install button (running in browser)
  if (showInstall) {
    console.log('🌐 Showing install button in browser mode');
    
    return (
      <>
        <DebugPanel />
        <button
          onClick={handleInstallClick}
          className="fixed bottom-6 right-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500 via-bakingYellow to-orange-500 text-black font-bold shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 transition-all duration-300 z-50 border-2 border-white/50"
          title="Install Smart Cooking Chat App"
          aria-label="Install app to your device"
          style={{
            animation: 'bounce 2s infinite',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4), 0 0 25px rgba(253, 224, 71, 0.6)'
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
              <svg className="w-8 h-8 relative" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="font-extrabold text-lg leading-tight">INSTALL APP</div>
              <div className="text-xs font-medium opacity-90">
                {isDesktop ? 'Install to Desktop' : 'Add to Home Screen'}
              </div>
            </div>
            <svg className="w-6 h-6 opacity-80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </div>
          
          {/* Red notification dot */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
        </button>
      </>
    );
  }

  // Fallback: If PWA is not supported but we're in browser
  if (!isStandalone) {
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    
    // For iOS Safari, always show install guide since beforeinstallprompt doesn't work
    if (isIOS) {
      return (
        <>
          <DebugPanel />
          <button
            onClick={showManualInstallGuide}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 z-50"
            title="How to install on iOS"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Add to Home Screen</span>
            </div>
          </button>
        </>
      );
    }
  }

  // Default: Just show debug panel
  return <DebugPanel />;
};

// Add bounce animation to your global CSS
const styles = `
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default PWAInstaller;