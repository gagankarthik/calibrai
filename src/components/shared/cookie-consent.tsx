'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { CheckCircle, Cookie } from 'lucide-react';

const STORAGE_KEY = 'cookie-consent';

interface CookiePrefs {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const DEFAULT_PREFS: CookiePrefs = {
  essential: true,
  analytics: false,
  marketing: false,
};

// ── Exported hook — lets any component read consent state ──────────────────
export function useCookieConsent() {
  const [consent, setConsent] = useState<{ analytics: boolean; marketing: boolean } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        // Handle both the legacy 'all' string and the structured JSON format
        if (stored === 'all') {
          setConsent({ analytics: true, marketing: true });
        } else {
          const parsed = JSON.parse(stored) as { analytics?: boolean; marketing?: boolean; accepted?: boolean };
          setConsent({
            analytics: parsed.analytics ?? false,
            marketing: parsed.marketing ?? false,
          });
        }
      } catch {
        setConsent({ analytics: false, marketing: false });
      }
    }
  }, []);

  return consent;
}

// ── CookieConsentScript — conditionally loads analytics ────────────────────
export function CookieConsentScript() {
  const consent = useCookieConsent();

  useEffect(() => {
    if (consent?.analytics) {
      // PostHog initialization placeholder
      // In production: load PostHog SDK here using your project API key
      console.info('[Analytics] Consent granted — analytics enabled');
    }
  }, [consent]);

  return null;
}

// ── Main CookieConsent banner + preferences modal ──────────────────────────
export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>(DEFAULT_PREFS);
  const [savedSummary, setSavedSummary] = useState<{ analytics: boolean; marketing: boolean } | null>(null);

  // Show banner only if consent hasn't been given yet
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setShowBanner(true);
      }
    } catch {
      // localStorage not available (SSR guard)
    }
  }, []);

  // Listen for the custom 'open-cookie-settings' event (fired by footer, privacy page, etc.)
  useEffect(() => {
    const handler = () => {
      // Pre-populate modal with current saved prefs
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && stored !== 'all') {
          const parsed = JSON.parse(stored) as Partial<CookiePrefs>;
          setPrefs({
            essential: true,
            analytics: parsed.analytics ?? false,
            marketing: parsed.marketing ?? false,
          });
        } else if (stored === 'all') {
          setPrefs({ essential: true, analytics: true, marketing: true });
        }
      } catch {
        // use defaults
      }
      setShowModal(true);
    };
    window.addEventListener('open-cookie-settings', handler);
    return () => window.removeEventListener('open-cookie-settings', handler);
  }, []);

  function acceptAll() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics: true, marketing: true }));
    } catch {
      // ignore
    }
    setShowBanner(false);
    setShowModal(false);
    setSavedSummary(null);
    toast.success('All cookies accepted');
  }

  function rejectNonEssential() {
    const minimalPrefs = { essential: true, analytics: false, marketing: false };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalPrefs));
    } catch {
      // ignore
    }
    setShowBanner(false);
    setShowModal(false);
    setSavedSummary(null);
    toast.success('Only essential cookies enabled');
  }

  function savePrefs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
    const summary = { analytics: prefs.analytics, marketing: prefs.marketing };
    setSavedSummary(summary);
    setShowModal(false);
    setShowBanner(false);

    const active = ['Essential (always on)', prefs.analytics && 'Analytics', prefs.marketing && 'Marketing']
      .filter(Boolean)
      .join(', ');
    toast.success(`Preferences saved — Active: ${active}`);
  }

  function openManage() {
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  return (
    <>
      {/* ── Cookie banner ──────────────────────────────────────── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            key="cookie-banner"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none"
          >
            <div className="mx-auto max-w-4xl pointer-events-auto">
              <div className="tl-card rounded-2xl px-6 py-5 shadow-2xl border border-tl-border-default">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                  {/* Icon + Text */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tl-gold/10 mt-0.5">
                      <Cookie className="h-4 w-4 text-tl-gold" />
                    </div>
                    <p className="text-sm leading-relaxed text-tl-text-secondary">
                      We use cookies to deliver and improve the TalentBridge experience. Essential cookies are always active.{' '}
                      <a
                        href="/privacy#cookies"
                        className="text-tl-gold underline underline-offset-2 hover:opacity-80 transition-opacity"
                      >
                        Privacy policy
                      </a>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={rejectNonEssential}
                      className="whitespace-nowrap text-xs"
                    >
                      Reject all
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openManage}
                      className="whitespace-nowrap text-xs"
                    >
                      Manage
                    </Button>
                    <button
                      onClick={acceptAll}
                      className="btn-gold text-xs py-2 px-4 whitespace-nowrap rounded-lg"
                    >
                      Accept all
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Preferences modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Overlay */}
            <motion.div
              key="cookie-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Dialog card */}
            <motion.div
              key="cookie-modal"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="tl-card w-full max-w-md rounded-2xl p-7 shadow-2xl pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tl-gold/10">
                    <Cookie className="h-5 w-5 text-tl-gold" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-tl-text-primary">
                      Cookie Preferences
                    </h2>
                    <p className="mt-1 text-xs text-tl-text-secondary">
                      Control which cookies are active. You can change these at any time.{' '}
                      <a
                        href="/privacy#cookies"
                        className="text-tl-gold underline underline-offset-2 hover:opacity-80 transition-opacity"
                      >
                        Learn more
                      </a>
                    </p>
                  </div>
                </div>

                {/* Saved summary — shown after previous save if modal re-opened */}
                {savedSummary && (
                  <div className="mb-5 flex items-center gap-2 rounded-xl bg-tl-teal/8 border border-tl-teal/20 px-4 py-3">
                    <CheckCircle className="h-4 w-4 text-tl-teal shrink-0" />
                    <p className="text-xs text-tl-text-secondary">
                      Saved — Analytics: <strong>{savedSummary.analytics ? 'on' : 'off'}</strong>,{' '}
                      Marketing: <strong>{savedSummary.marketing ? 'on' : 'off'}</strong>
                    </p>
                  </div>
                )}

                {/* Toggles */}
                <div className="space-y-3">
                  {/* Essential */}
                  <div className="flex items-start gap-4 rounded-xl border border-tl-border-default bg-tl-bg-elevated p-4">
                    <Switch
                      checked={true}
                      disabled
                      className="mt-0.5 shrink-0 opacity-60"
                    />
                    <div>
                      <p className="text-sm font-medium text-tl-text-primary flex items-center gap-2">
                        Essential
                        <span className="rounded-full bg-tl-teal/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-tl-teal">
                          Always on
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-tl-text-secondary">
                        Authentication, security, and session management. Required for the site to function.
                      </p>
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-start gap-4 rounded-xl border border-tl-border-default bg-tl-bg-elevated p-4">
                    <Switch
                      checked={prefs.analytics}
                      onCheckedChange={(checked) =>
                        setPrefs((p) => ({ ...p, analytics: checked }))
                      }
                      className="mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-tl-text-primary">Analytics</p>
                      <p className="mt-0.5 text-xs text-tl-text-secondary">
                        Helps us understand feature usage and improve the platform. Powered by PostHog.
                      </p>
                    </div>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-start gap-4 rounded-xl border border-tl-border-default bg-tl-bg-elevated p-4">
                    <Switch
                      checked={prefs.marketing}
                      onCheckedChange={(checked) =>
                        setPrefs((p) => ({ ...p, marketing: checked }))
                      }
                      className="mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-tl-text-primary">Marketing</p>
                      <p className="mt-0.5 text-xs text-tl-text-secondary">
                        Allows personalised content and relevant ads across the web.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                    onClick={rejectNonEssential}
                  >
                    Reject all
                  </Button>
                  <button
                    className="btn-gold flex-1 text-sm py-2.5 px-4 rounded-lg"
                    onClick={savePrefs}
                  >
                    Save preferences
                  </button>
                </div>

                <button
                  onClick={acceptAll}
                  className="mt-3 w-full text-xs text-tl-text-secondary hover:text-tl-text-primary transition-colors underline underline-offset-2"
                >
                  Accept all cookies
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
