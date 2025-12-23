import React, { useEffect, useState } from 'react';

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const updateDebugInfo = () => {
      const info = `
        HTTPS: ${window.location.protocol === 'https:'}
        Localhost: ${window.location.hostname === 'localhost'}
        Service Worker: ${'serviceWorker' in navigator}
        Standalone: ${window.matchMedia('(display-mode: standalone)').matches}
        iOS: ${/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream}
        Android: ${/Android/.test(navigator.userAgent)}
        Chrome: ${/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)}
      `;
      setDebugInfo(info);
    };

    const handler = (e: BeforeInstallPromptEvent) => {
      console.log('✅ beforeinstallprompt fired', e);
      updateDebugInfo();
      
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to show the install button
      setShowInstall(true);
      setShowManualGuide(false);
    };

    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = (window.navigator as any).standalone === true;
      const isInstalled = isStandalone || isFullscreen;
      
      console.log('App already installed?', isInstalled);
      console.log('Display mode:', isStandalone ? 'standalone' : 'browser');
      console.log('Fullscreen mode:', isFullscreen);
      
      if (isInstalled) {
        setShowInstall(false);
        setShowManualGuide(false);
      }
    };

    // Check if we should show manual installation guide
    const checkManualInstallGuide = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isAndroid = /Android/.test(navigator.userAgent);
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Show manual guide for iOS Safari or if PWA criteria are met but no prompt
      if (!isStandalone && !showInstall) {
        // For iOS, always show the share guide
        if (isIOS) {
          setShowManualGuide(true);
        }
        // For Android/Chrome, show guide after some time if no prompt appears
        else if (isAndroid && isChrome) {
          setTimeout(() => {
            if (!showInstall) {
              setShowManualGuide(true);
            }
          }, 10000); // Show after 10 seconds
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    window.addEventListener('appinstalled', (evt) => {
      console.log('✅ App was installed', evt);
      setDeferredPrompt(null);
      setShowInstall(false);
      setShowManualGuide(false);
    });

    // Initialize checks
    updateDebugInfo();
    checkIfInstalled();
    checkManualInstallGuide();

    // Periodic check for manual guide
    const manualGuideInterval = setInterval(checkManualInstallGuide, 30000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
      window.removeEventListener('appinstalled', () => {});
      clearInterval(manualGuideInterval);
    };
  }, [showInstall]);

  // Development/testing simulation - ALWAYS ENABLED FOR TESTING
  useEffect(() => {
    // Always simulate for testing - you can remove this in production
    const simulateForTesting = () => {
      console.log('🔧 TESTING: Simulating beforeinstallprompt for testing');
      
      // Create a more realistic mock event
      const simulatedEvent = new Event('beforeinstallprompt') as any;
      
      // Add required properties
      simulatedEvent.platforms = ['web', 'android', 'chromeos', 'windows'];
      simulatedEvent.prompt = () => {
        console.log('TEST: Install prompt shown');
        return Promise.resolve();
      };
      simulatedEvent.userChoice = Promise.resolve({ 
        outcome: 'accepted' as 'accepted' | 'dismissed', 
        platform: 'web' 
      });
      
      // Trigger the event after a short delay
      setTimeout(() => {
        window.dispatchEvent(simulatedEvent);
      }, 2000);
    };

    // Always simulate for testing purposes
    // You can conditionally enable this based on environment
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (isLocalhost || process.env.NODE_ENV === 'development') {
      simulateForTesting();
    }
    
    // Alternative: Always simulate for now to ensure button appears
    // simulateForTesting();
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.warn('No deferred prompt available');
      showInstallationGuide();
      return;
    }
    
    console.log('Triggering install prompt...');
    
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response to the install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        // Show manual guide if dismissed
        setShowManualGuide(true);
      }
      
      // We've used the prompt, and can't use it again, discard it
      setDeferredPrompt(null);
      setShowInstall(false);
      
    } catch (error) {
      console.error('Error during installation:', error);
      showInstallationGuide();
    }
  };

  const showInstallationGuide = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    
    let guideMessage = '';
    
    if (isIOS) {
      guideMessage = `To install this app on iOS:
1. Tap the Share button (📤) at the bottom
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" in the top right
4. The app will appear on your home screen!`;
    } else if (isAndroid && isChrome) {
      guideMessage = `To install this app on Android/Chrome:
1. Tap the three dots menu (⋮) in the top right
2. Select "Install app" or "Add to Home Screen"
3. Tap "Install" in the popup
4. The app will be installed like a native app!`;
    } else {
      guideMessage = `To install this app:
1. Look for the install icon (📱) in your browser's address bar
2. Or check the browser menu for "Install" option
3. Some browsers may require you to use the app for 30+ seconds first`;
    }
    
    alert(guideMessage);
    setShowManualGuide(false);
  };

  const handleManualGuideClick = () => {
    showInstallationGuide();
  };

  // Debug view (only in development)
  const DebugView = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="fixed top-20 left-5 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
        <div className="font-bold mb-1">PWA Debug:</div>
        <div>Install Button: {showInstall ? 'SHOWING' : 'HIDDEN'}</div>
        <div>Deferred Prompt: {deferredPrompt ? 'YES' : 'NO'}</div>
        <div>Manual Guide: {showManualGuide ? 'SHOWING' : 'HIDDEN'}</div>
        <div className="mt-1 text-gray-300">{debugInfo}</div>
      </div>
    );
  };

  // Return manual guide button if no auto-prompt but user might want to install
  if (showManualGuide && !showInstall) {
    return (
      <>
        <DebugView />
        <button
          onClick={handleManualGuideClick}
          className="fixed bottom-5 right-5 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition z-50 animate-pulse"
          title="How to install this app"
          aria-label="Show installation instructions"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Install Guide</span>
          </div>
        </button>
      </>
    );
  }

  // Don't show button if app is already installed or can't be installed
  if (!showInstall) {
    return <DebugView />;
  }

  return (
    <>
      <DebugView />
      <button
        onClick={handleInstallClick}
        className="fixed bottom-5 right-5 p-4 rounded-full bg-gradient-to-r from-bakingYellow to-orange-400 text-black shadow-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 z-50 animate-bounce"
        title="Install Smart Cooking Chat"
        aria-label="Install app to your device"
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
          </div>
          <span className="font-bold">Install App</span>
        </div>
      </button>
    </>
  );
};

// Type definition for beforeinstallprompt event
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