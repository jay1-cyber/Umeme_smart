import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed (running in standalone mode)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(isInStandaloneMode);

    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Only show if not installed, not dismissed recently, and on mobile
    const isMobile = window.innerWidth <= 768;

    if (!isInStandaloneMode && isMobile && daysSinceDismissed > 7) {
      // For Android/Chrome
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // For iOS, show manual instructions after a delay
      if (isIOSDevice && !isInStandaloneMode) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000); // Show after 3 seconds

        return () => {
          clearTimeout(timer);
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl flex-shrink-0">
            <img
              src="/ioticon.png"
              alt="App Icon"
              className="h-8 w-8 object-contain"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Install Umeme Smart Meter
            </h3>

            {isIOS ? (
              // iOS Instructions
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Add to your home screen for quick access
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-blue-900 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Installation Steps:
                  </p>
                  <ol className="text-xs text-blue-800 space-y-1 ml-6 list-decimal">
                    <li>Tap the Share button (square with arrow)</li>
                    <li>Scroll and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                  </ol>
                </div>
              </div>
            ) : (
              // Android/Chrome
              <p className="text-sm text-gray-600 mb-3">
                Install the app for a better experience with offline access
              </p>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-2 mt-3">
              {!isIOS && deferredPrompt && (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Install
                </Button>
              )}
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-gray-600 hover:text-gray-900"
              >
                {isIOS ? 'Got it' : 'Not now'}
              </Button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
