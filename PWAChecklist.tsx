import React, { useEffect, useState } from 'react';

const PWAChecklist: React.FC = () => {
  const [checks, setChecks] = useState({
    https: false,
    serviceWorker: false,
    manifest: false,
    icons: false,
    engagement: false,
    installable: false
  });

  useEffect(() => {
    const checkPWARequirements = async () => {
      const newChecks = {
        https: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
        serviceWorker: 'serviceWorker' in navigator,
        manifest: false,
        icons: false,
        engagement: false, // This takes time
        installable: false
      };

      // Check manifest
      try {
        const response = await fetch('/manifest.json');
        if (response.ok) {
          const manifest = await response.json();
          newChecks.manifest = true;
          newChecks.icons = manifest.icons && manifest.icons.length >= 2;
        }
      } catch (error) {
        console.error('Manifest check failed:', error);
      }

      // Simulate engagement (for testing only)
      const engagementTime = parseInt(localStorage.getItem('pwa_engagement') || '0');
      const lastVisit = parseInt(localStorage.getItem('pwa_last_visit') || '0');
      const now = Date.now();
      
      // Store visit info
      localStorage.setItem('pwa_last_visit', now.toString());
      localStorage.setItem('pwa_engagement', (engagementTime + 1).toString());

      // Check if we meet criteria
      newChecks.engagement = engagementTime > 30 && (now - lastVisit) > 5 * 60 * 1000;
      
      // Is installable?
      newChecks.installable = newChecks.https && 
                              newChecks.serviceWorker && 
                              newChecks.manifest && 
                              newChecks.icons;

      setChecks(newChecks);
      console.log('PWA Checklist:', newChecks);
    };

    checkPWARequirements();
  }, []);

  // Show checklist in development
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed top-20 left-5 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 max-w-xs">
      <h3 className="font-bold mb-2">PWA Checklist</h3>
      <ul className="space-y-1 text-sm">
        <li className={`flex items-center ${checks.https ? 'text-green-600' : 'text-red-600'}`}>
          {checks.https ? '✓' : '✗'} HTTPS/Localhost
        </li>
        <li className={`flex items-center ${checks.serviceWorker ? 'text-green-600' : 'text-red-600'}`}>
          {checks.serviceWorker ? '✓' : '✗'} Service Worker
        </li>
        <li className={`flex items-center ${checks.manifest ? 'text-green-600' : 'text-red-600'}`}>
          {checks.manifest ? '✓' : '✗'} Manifest
        </li>
        <li className={`flex items-center ${checks.icons ? 'text-green-600' : 'text-red-600'}`}>
          {checks.icons ? '✓' : '✗'} Icons (192+512)
        </li>
        <li className={`flex items-center ${checks.engagement ? 'text-green-600' : 'text-yellow-600'}`}>
          {checks.engagement ? '✓' : '⚠'} Engagement Heuristic
        </li>
        <li className={`flex items-center ${checks.installable ? 'text-green-600' : 'text-red-600'}`}>
          {checks.installable ? '✓' : '✗'} Ready to Install
        </li>
      </ul>
      <p className="text-xs mt-2 text-gray-500">
        Note: Engagement requires 30+ seconds interaction and 2 visits 5+ minutes apart
      </p>
    </div>
  );
};

export default PWAChecklist;