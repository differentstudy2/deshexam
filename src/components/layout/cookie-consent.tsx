"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CookiePreferences = {
  strictlyNecessary: boolean;
  analytical: boolean;
  functional: boolean;
  targeting: boolean;
};

const defaultPreferences: CookiePreferences = {
  strictlyNecessary: true,
  analytical: false,
  functional: false,
  targeting: false,
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if the user has already consented or declined
    const consentStr = localStorage.getItem("cookieConsentPreferences");
    if (!consentStr) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      try {
        setPreferences(JSON.parse(consentStr));
      } catch (e) {
        // Ignore parse error
      }
    }

    const handleManageEvent = () => {
      setShowModal(true);
    };

    window.addEventListener("manageCookieConsent", handleManageEvent);
    return () => window.removeEventListener("manageCookieConsent", handleManageEvent);
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookieConsentPreferences", JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      strictlyNecessary: true,
      analytical: true,
      functional: true,
      targeting: true,
    });
  };

  const handleRejectNonEssential = () => {
    savePreferences({
      strictlyNecessary: true,
      analytical: false,
      functional: false,
      targeting: false,
    });
  };

  const handleSaveModal = () => {
    savePreferences(preferences);
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* Bottom Banner */}
      {showBanner && !showModal && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl w-full px-4 md:px-0">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-t-2xl md:rounded-2xl overflow-hidden p-6">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div className="flex-1">
                <h3 className="font-bold text-xl text-slate-900 mb-2">Cookie Settings</h3>
                <p className="text-[14px] text-slate-600 leading-relaxed max-w-3xl">
                  We use cookies to enhance your experience, analyze traffic, and personalize content. By clicking "Accept All", 
                  you consent to our use of all cookies. You can manage your preferences below.
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto shrink-0">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button 
                    variant="outline" 
                    className="text-[#0f3460] border-[#0f3460] hover:bg-slate-50 w-full sm:w-auto font-semibold px-6"
                    onClick={() => setShowModal(true)}
                  >
                    Manage Preferences
                  </Button>
                  <Button 
                    className="bg-[#0f3460] hover:bg-[#0a2542] text-white w-full sm:w-auto font-semibold px-8"
                    onClick={handleAcceptAll}
                  >
                    Accept All
                  </Button>
                </div>
                <button 
                  onClick={handleRejectNonEssential}
                  className="text-[13px] text-slate-500 hover:text-slate-800 underline underline-offset-4 decoration-slate-300 transition-colors w-full sm:w-auto sm:text-center md:text-right"
                >
                  Reject Non-Essential
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      <Dialog open={showModal} onOpenChange={(open) => !open && !showBanner && setShowModal(false)}>
        <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden rounded-2xl gap-0">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100">
            <DialogTitle className="text-2xl font-bold text-slate-900">Customize Your Cookie Choices</DialogTitle>
            <DialogDescription className="sr-only">Manage your cookie preferences</DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto">
            {/* 1. Strictly Necessary */}
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  1. Strictly Necessary <span className="text-sm font-normal text-slate-500">(Always Active)</span>
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  These cookies are essential for the website to function and cannot be switched off.
                </p>
              </div>
              <Switch checked={true} disabled className="mt-1" />
            </div>

            {/* 2. Analytical Cookies */}
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">2. Analytical Cookies</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Help us understand how visitors interact with the website (e.g., pages visited).
                </p>
              </div>
              <Switch 
                checked={preferences.analytical} 
                onCheckedChange={(checked) => setPreferences({ ...preferences, analytical: checked })} 
                className="mt-1 data-[state=checked]:bg-[#0f3460]"
              />
            </div>

            {/* 3. Functional Cookies */}
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">3. Functional Cookies</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Enable advanced functionality and personalization (e.g., region settings).
                </p>
              </div>
              <Switch 
                checked={preferences.functional} 
                onCheckedChange={(checked) => setPreferences({ ...preferences, functional: checked })} 
                className="mt-1 data-[state=checked]:bg-[#0f3460]"
              />
            </div>

            {/* 4. Targeting/Marketing */}
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">4. Targeting/Marketing</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Set by advertising partners to show relevant ads based on your interests.
                </p>
              </div>
              <Switch 
                checked={preferences.targeting} 
                onCheckedChange={(checked) => setPreferences({ ...preferences, targeting: checked })} 
                className="mt-1 data-[state=checked]:bg-[#0f3460]"
              />
            </div>
          </div>

          <DialogFooter className="p-6 border-t border-slate-100 flex-col sm:flex-col gap-4">
            <Button 
              className="w-full bg-[#0f3460] hover:bg-[#0a2542] text-white text-lg py-6 rounded-xl font-bold"
              onClick={handleSaveModal}
            >
              Save & Close
            </Button>
            <div className="text-center">
              <Link 
                href="/cookie-policy" 
                className="text-sm text-slate-500 hover:text-slate-900 underline underline-offset-4 decoration-slate-300"
                onClick={() => {
                  if (showBanner) {
                    setShowModal(false);
                  }
                }}
              >
                View Cookie Policy
              </Link>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
