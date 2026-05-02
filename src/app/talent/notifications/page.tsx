'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, Trash2, Zap, Calendar, Briefcase, Star } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  body: string
  type: 'job_match' | 'application_viewed' | 'interview_scheduled' | 'offer' | 'general'
  createdAt: string
  readAt?: string
  userId: string
}

const TYPE_CONFIG: Record<Notification['type'], { icon: React.ElementType; iconClass: string; iconBg: string }> = {
  job_match:           { icon: Zap,      iconClass: 'text-tl-gold',   iconBg: 'bg-tl-gold/10 border-tl-gold/20' },
  application_viewed:  { icon: Briefcase, iconClass: 'text-tl-blue',  iconBg: 'bg-tl-blue/10 border-tl-blue/20' },
  interview_scheduled: { icon: Calendar,  iconClass: 'text-violet-400', iconBg: 'bg-violet-500/10 border-violet-500/20' },
  offer:               { icon: Star,      iconClass: 'text-tl-teal',   iconBg: 'bg-tl-teal/10 border-tl-teal/20' },
  general:             { icon: Bell,      iconClass: 'text-tl-text-secondary', iconBg: 'bg-tl-bg-elevated border-tl-border-default' },
}

function NotifSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-40 rounded-xl bg-tl-bg-elevated animate-pulse" />
        <div className="h-8 w-28 rounded-xl bg-tl-bg-elevated animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="tl-card p-4 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-tl-bg-elevated animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-48 rounded bg-tl-bg-elevated animate-pulse" />
              <div className="h-3 w-64 rounded bg-tl-bg-elevated animate-pulse" />
              <div className="h-2.5 w-16 rounded bg-tl-bg-elevated animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    fetch('/api/talent/notifications')
      .then(r => r.ok ? r.json() : { notifications: [] })
      .then(data => { setNotifications(data.notifications ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const unreadCount = notifications.filter(n => !n.readAt).length

  async function markAllRead() {
    setMarkingAll(true)
    await fetch('/api/talent/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })))
    setMarkingAll(false)
  }

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n))
  }

  if (loading) return <NotifSkeleton />

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5"
      >
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-display font-bold text-tl-text-primary">Notifications</h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 rounded-full bg-tl-gold text-tl-bg-base text-[11px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-xs font-medium text-tl-gold hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {notifications.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="tl-card p-14 flex flex-col items-center text-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-tl-bg-elevated flex items-center justify-center">
              <Bell className="w-7 h-7 text-tl-text-secondary/30" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-tl-text-primary mb-1">No notifications yet</h3>
              <p className="text-sm text-tl-text-secondary max-w-xs">
                You&apos;ll see job matches, application updates, and interview reminders here.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {notifications.map((notif, i) => {
              const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.general
              const isUnread = !notif.readAt
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => markRead(notif.id)}
                  className={cn(
                    'tl-card p-4 flex gap-3 cursor-pointer transition-all duration-200',
                    isUnread
                      ? 'bg-tl-bg-overlay border-tl-gold/15 hover:border-tl-gold/30'
                      : 'hover:border-tl-border-default opacity-80 hover:opacity-100'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border shrink-0', cfg.iconBg)}>
                    <cfg.icon className={cn('w-4 h-4', cfg.iconClass)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm font-medium leading-snug', isUnread ? 'text-tl-text-primary' : 'text-tl-text-secondary')}>
                        {notif.title}
                      </p>
                      {isUnread && <span className="w-2 h-2 rounded-full bg-tl-gold mt-1 shrink-0" />}
                    </div>
                    <p className="text-xs text-tl-text-secondary mt-0.5 leading-snug line-clamp-2">{notif.body}</p>
                    <p className="text-[10px] text-tl-text-secondary mt-1.5 font-mono">{timeAgo(notif.createdAt)}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
