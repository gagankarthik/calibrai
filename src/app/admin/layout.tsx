'use client'

import { useState, useEffect } from 'react'
import { SidebarAdmin } from '@/components/shared/sidebar-admin'
import { Shield, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function getCookie(name: string): string {
  if (typeof document === 'undefined') return ''
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? ''
  return ''
}

function AdminLoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Give a tiny delay to feel snappy
    await new Promise((r) => setTimeout(r, 400))

    const adminPassword = 'talentbridge-admin'
    if (password === adminPassword) {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `tb-admin-verified=true; expires=${expires}; path=/; SameSite=Strict`
      onSuccess()
    } else {
      setError('Incorrect admin password. Access denied.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--tl-bg-base)] flex items-center justify-center p-4">
      {/* Subtle mesh background */}
      <div className="fixed inset-0 pointer-events-none bg-mesh-gold opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="tl-card p-8 rounded-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-tl-rose/10 border border-tl-rose/25 flex items-center justify-center">
              <Shield className="w-7 h-7 text-tl-rose" />
            </div>
          </div>

          <h1 className="font-display text-2xl text-[var(--tl-text-primary)] text-center mb-1">
            Admin Access
          </h1>
          <p className="text-sm text-[var(--tl-text-secondary)] text-center mb-8">
            TalentBridge owner portal — restricted access
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wider mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--tl-text-secondary)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="input-field pl-10 pr-10"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tl-text-secondary)] hover:text-[var(--tl-text-primary)] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-tl-rose/8 border border-tl-rose/25 text-tl-rose text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Unlock Admin Panel
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--tl-text-secondary)] mt-6">
            Session valid for 24 hours · Only accessible to platform owner
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null)

  useEffect(() => {
    setVerified(getCookie('tb-admin-verified') === 'true')
  }, [])

  // Hydration guard
  if (verified === null) {
    return (
      <div className="min-h-screen bg-[var(--tl-bg-base)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tl-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!verified) {
    return <AdminLoginGate onSuccess={() => setVerified(true)} />
  }

  return (
    <div className="min-h-screen bg-[var(--tl-bg-base)] flex">
      <SidebarAdmin />

      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 border-b border-[var(--tl-border-subtle)] bg-[var(--tl-bg-surface)]/80 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-tl-rose animate-pulse" />
            <span className="text-sm font-semibold text-[var(--tl-text-primary)]">
              Admin Panel
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-tl-rose/10 text-tl-rose border border-tl-rose/25 uppercase tracking-wider">
              Owner
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--tl-text-secondary)]">
            <Shield className="w-3.5 h-3.5 text-tl-rose" />
            <span className="hidden sm:block">oceanbluesolutions@gmail.com</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
