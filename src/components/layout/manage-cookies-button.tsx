"use client";

export function ManageCookiesButton() {
  const handleManagePreferences = () => {
    localStorage.removeItem("cookieConsent");
    // Dispatch a custom event to tell the CookieConsent component to reappear
    window.dispatchEvent(new Event("manageCookieConsent"));
  };

  return (
    <button
      type="button"
      onClick={handleManagePreferences}
      className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-transparent border-none p-0"
    >
      Manage Cookie Preferences
    </button>
  );
}
