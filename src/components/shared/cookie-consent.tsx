'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

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

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setShowBanner(true);
      }
    } catch {
      // localStorage not available (SSR guard — should never reach here with 'use client')
    }
  }, []);

  function acceptAll() {
    try {
      localStorage.setItem(STORAGE_KEY, 'all');
    } catch {
      // ignore
    }
    setShowBanner(false);
    setShowModal(false);
    toast.success('Cookie preferences saved');
  }

  function savePrefs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
    setShowModal(false);
    setShowBanner(false);
    toast.success('Cookie preferences saved');
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
              <div className="glass-card rounded-2xl border border-[var(--border)] px-6 py-5 shadow-2xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      We use cookies to enhance your experience. Essential
                      cookies are always active. You can manage your preferences
                      below.{' '}
                      <a
                        href="/privacy"
                        className="text-[var(--accent-primary)] underline underline-offset-2 hover:opacity-80 transition-opacity"
                      >
                        Privacy policy
                      </a>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openManage}
                      className="whitespace-nowrap"
                    >
                      Manage Preferences
                    </Button>
                    <Button
                      size="sm"
                      onClick={acceptAll}
                      className="btn-primary whitespace-nowrap"
                    >
                      Accept All
                    </Button>
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
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
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
                className="glass-card w-full max-w-md rounded-2xl border border-[var(--border)] p-7 shadow-2xl pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Cookie Preferences
                  </h2>
                  <p className="mt-1.5 text-sm text-[var(--text-muted)]">
                    We use cookies to enhance your experience. Essential cookies
                    are always active. You can manage your preferences below.{' '}
                    <a
                      href="/privacy"
                      className="text-[var(--accent-primary)] underline underline-offset-2 hover:opacity-80 transition-opacity"
                    >
                      Learn more
                    </a>
                  </p>
                </div>

                {/* Toggles */}
                <div className="space-y-5">
                  {/* Essential */}
                  <div className="flex items-start gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <Switch
                      checked={true}
                      disabled
                      className="mt-0.5 shrink-0 opacity-60"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Essential{' '}
                        <span className="ml-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                          Always on
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        Required for the site to function. Cannot be disabled.
                      </p>
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-start gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <Switch
                      checked={prefs.analytics}
                      onCheckedChange={(checked) =>
                        setPrefs((p) => ({ ...p, analytics: checked }))
                      }
                      className="mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Analytics
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        Help us understand how visitors interact with the site
                        so we can improve it.
                      </p>
                    </div>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-start gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <Switch
                      checked={prefs.marketing}
                      onCheckedChange={(checked) =>
                        setPrefs((p) => ({ ...p, marketing: checked }))
                      }
                      className="mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Marketing
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        Allow us to show you relevant ads and personalised
                        content across the web.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="btn-primary flex-1"
                    onClick={savePrefs}
                  >
                    Save preferences
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
