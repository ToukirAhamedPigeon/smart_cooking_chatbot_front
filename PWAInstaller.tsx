import React, { useEffect, useState } from 'react';

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
      console.log('beforeinstallprompt fired');
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    console.log('User choice', choiceResult);
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-5 right-5 p-3 rounded-full bg-bakingYellow text-black shadow-lg hover:bg-yellow-400 transition"
      title="Install Smart Cooking Chat"
    >
      Install App
    </button>
  );
};

export default PWAInstaller;
