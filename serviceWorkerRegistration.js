// Add this function
function isPWAInstallable() {
  // Check if we're on a compatible browser
  const isChrome = /chrome|crios/i.test(navigator.userAgent);
  const isEdge = /edg/i.test(navigator.userAgent);
  const isFirefox = /firefox/i.test(navigator.userAgent);
  
  // Check if we have HTTPS (except localhost)
  const isSecure = window.location.protocol === 'https:' || 
                   window.location.hostname === 'localhost';
  
  // Check if we have service worker
  const hasServiceWorker = 'serviceWorker' in navigator;
  
  return (isChrome || isEdge || isFirefox) && isSecure && hasServiceWorker;
}

// Then in your register function:
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;
      
      // Only register if PWA is installable
      if (isPWAInstallable()) {
        navigator.serviceWorker
          .register(swUrl)
          .then(registration => {
            console.log('SW registered on compatible browser:', registration);
            
            // Force update check
            registration.update();
          })
          .catch(error => {
            console.log('SW registration failed:', error);
          });
      }
    });
  }
}