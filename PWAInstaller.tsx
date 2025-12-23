import React, { useEffect, useState } from 'react';

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to show the install button
      setShowInstall(true);
      
      console.log('✅ beforeinstallprompt fired', e);
      console.log('Can show install prompt:', true);
    };

    // Check if app is already installed
    const checkIfInstalled = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
      
      console.log('App already installed?', isInstalled);
      if (isInstalled) {
        setShowInstall(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);
    window.addEventListener('appinstalled', () => {
      console.log('✅ App was installed');
      setDeferredPrompt(null);
      setShowInstall(false);
    });

    // Check on mount
    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    console.log('Triggering install prompt...');
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  // Don't show button if app is already installed or can't be installed
  if (!showInstall) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-5 right-5 p-3 rounded-full bg-bakingYellow text-black shadow-lg hover:bg-yellow-400 transition z-50 animate-bounce"
      title="Install Smart Cooking Chat"
      aria-label="Install app to your device"
    >
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
        </svg>
        <span className="font-semibold">Install App</span>
      </div>
    </button>
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