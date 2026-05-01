'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { conversations, candidates } from '@/lib/data'
import { Conversation, Message } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Plus,
  Calendar,
  FileText,
  MessageSquare,
  CheckCheck,
  Check,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  X,
  StickyNote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STAGE_LABELS, STAGE_COLORS } from '@/lib/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const AVATAR_COLORS = [
  'bg-blue-500/20 text-blue-400',
  'bg-purple-500/20 text-purple-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-rose-500/20 text-rose-400',
  'bg-cyan-500/20 text-cyan-400',
]

function avatarColor(id: string): string {
  const idx = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

// ─── Conversation Item ────────────────────────────────────────────────────────

function ConversationItem({
  conv,
  isActive,
  onClick,
}: {
  conv: Conversation
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left transition-all duration-200',
        'hover:bg-muted/50 border-b border-border/50',
        isActive && 'bg-primary/5 border-r-2 border-r-primary'
      )}
    >
      <div className="relative shrink-0">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
            avatarColor(conv.id)
          )}
        >
          {getInitials(conv.participantName)}
        </div>
        {conv.unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className={cn(
              'text-sm font-medium truncate',
              isActive ? 'text-primary' : 'text-foreground'
            )}
          >
            {conv.participantName}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {timeAgo(conv.lastMessageTime)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mb-0.5">{conv.participantRole}</p>
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs text-muted-foreground/60 truncate">
            {truncate(conv.lastMessage, 36)}
          </p>
          {conv.unread > 0 && (
            <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {conv.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-3">
        <span className="text-[11px] text-muted-foreground bg-muted border border-border px-4 py-1.5 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-3 max-w-[80%] mb-4', isOwn ? 'ml-auto flex-row-reverse' : '')}>
      {!isOwn && (
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 mt-1">
          C
        </div>
      )}
      <div className={cn('flex flex-col gap-1', isOwn && 'items-end')}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-tr-sm max-w-xs'
              : 'bg-muted text-foreground rounded-tl-sm max-w-xs'
          )}
        >
          {message.content}
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 text-[10px] text-muted-foreground',
            isOwn && 'flex-row-reverse'
          )}
        >
          <span>{timeAgo(message.timestamp)}</span>
          {isOwn &&
            (message.read ? (
              <CheckCheck className="w-3 h-3 text-primary" />
            ) : (
              <Check className="w-3 h-3" />
            ))}
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
        <MessageSquare className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Select a conversation</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Choose a conversation from the list to start messaging with a candidate.
      </p>
    </div>
  )
}

// ─── Candidate CRM Panel ──────────────────────────────────────────────────────

interface CandidatePanelProps {
  conv: Conversation
  onClose: () => void
}

function CandidatePanel({ conv, onClose }: CandidatePanelProps) {
  const candidate = candidates.find((c) => c.id === conv.participantId)
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState<Array<{ text: string; date: string }>>([
    { text: 'Strong technical background. Great communication.', date: '2025-04-27' },
  ])
  const [stage, setStage] = useState<string>('technical')

  const addNote = () => {
    if (!note.trim()) return
    setNotes((prev) => [...prev, { text: note.trim(), date: new Date().toISOString().slice(0, 10) }])
    setNote('')
  }

  const stageBadge = STAGE_COLORS[stage as keyof typeof STAGE_COLORS] ?? ''
  const stageLabel = STAGE_LABELS[stage as keyof typeof STAGE_LABELS] ?? stage

  return (
    <div className="w-72 border-l border-border flex flex-col flex-shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
        <span className="text-sm font-semibold text-foreground">Candidate Info</span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Avatar + name */}
        <div className="text-center">
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3',
              avatarColor(conv.id)
            )}
          >
            {getInitials(conv.participantName)}
          </div>
          <div className="font-semibold text-foreground">{conv.participantName}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{conv.participantRole}</div>
          {candidate && (
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-[10px] font-semibold text-primary">
                {candidate.matchScore}% match
              </span>
            </div>
          )}
        </div>

        {/* Stage */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Stage</p>
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full border',
                stageBadge
              )}
            >
              {stageLabel}
            </span>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="text-xs bg-muted border border-border rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {Object.entries(STAGE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Applied for */}
        {conv.jobTitle && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Applied For</p>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span>{conv.jobTitle}</span>
            </div>
          </div>
        )}

        {/* Contact */}
        {candidate && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact</p>
            <a
              href={`mailto:${candidate.email}`}
              className="block text-xs text-primary hover:underline truncate"
            >
              {candidate.email}
            </a>
            <a
              href={`tel:${candidate.phone}`}
              className="block text-xs text-primary hover:underline"
            >
              {candidate.phone}
            </a>
          </div>
        )}

        {/* Quick actions */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Actions</p>
          <Button className="w-full gap-2 text-xs h-8" size="sm">
            <Calendar className="w-3.5 h-3.5" /> Schedule Interview
          </Button>
          <Button variant="outline" className="w-full gap-2 text-xs h-8" size="sm">
            <FileText className="w-3.5 h-3.5" /> Send Offer
          </Button>
          <Button
            variant="ghost"
            className="w-full gap-2 text-xs h-8 text-rose-400 hover:text-rose-400 hover:bg-rose-400/10"
            size="sm"
          >
            <X className="w-3.5 h-3.5" /> Reject
          </Button>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StickyNote className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</p>
          </div>
          <div className="space-y-2">
            {notes.map((n, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-foreground leading-relaxed">{n.text}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{n.date}</p>
              </div>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note…"
            rows={2}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button
            onClick={addNote}
            disabled={!note.trim()}
            className="w-full text-xs h-7"
            size="sm"
          >
            + Add Note
          </Button>
        </div>

        {/* Activity timeline */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Activity</p>
          <div className="space-y-2">
            {[
              { event: 'Application received', time: '2025-04-21', color: 'bg-blue-400' },
              { event: 'Moved to Screening', time: '2025-04-22', color: 'bg-purple-400' },
              { event: 'Interview scheduled', time: '2025-04-24', color: 'bg-amber-400' },
              { event: 'Message sent', time: '2025-04-27', color: 'bg-cyan-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.color}`} />
                <div>
                  <p className="text-xs text-foreground">{item.event}</p>
                  <p className="text-[10px] text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [showCandidatePanel, setShowCandidatePanel] = useState(true)
  const [localMessages, setLocalMessages] = useState<Record<string, Message[]>>({})
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null

  const filteredConvs = conversations.filter((c) => {
    const matchesSearch =
      c.participantName.toLowerCase().includes(search.toLowerCase()) ||
      c.participantRole.toLowerCase().includes(search.toLowerCase())
    if (filter === 'unread') return matchesSearch && c.unread > 0
    return matchesSearch
  })

  const msgs = activeConvId
    ? [...(activeConv?.messages ?? []), ...(localMessages[activeConvId] ?? [])]
    : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length, activeConvId])

  const handleSend = () => {
    if (!message.trim() || !activeConvId) return
    const msg: Message = {
      id: `local-${Date.now()}`,
      senderId: 'company',
      receiverId: activeConvId,
      content: message.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
    }
    setLocalMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] ?? []), msg],
    }))
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* ── COLUMN 1: Conversation list ─────────────────────────────────────── */}
      <div className="w-80 border-r border-border flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-foreground">Messages</span>
            <Button size="sm" className="h-7 px-2.5 text-xs gap-1">
              <Plus className="w-3.5 h-3.5" /> New
            </Button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full bg-muted rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 border border-transparent focus:border-primary/30"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-4 py-2 flex gap-1.5 border-b border-border">
          {(['all', 'unread', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all',
                filter === f
                  ? 'bg-primary/15 text-primary border border-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-sm text-muted-foreground/50">
              No conversations found
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={activeConvId === conv.id}
                onClick={() => setActiveConvId(conv.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── COLUMN 2: Chat view ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <AnimatePresence mode="wait">
          {!activeConv ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex"
            >
              <EmptyState />
            </motion.div>
          ) : (
            <motion.div
              key={activeConv.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Chat header */}
              <div className="px-6 py-4 border-b border-border flex items-center gap-4 shrink-0">
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      'w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold',
                      avatarColor(activeConv.id)
                    )}
                  >
                    {getInitials(activeConv.participantName)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{activeConv.participantName}</h3>
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Online
                    </span>
                  </div>
                  {activeConv.jobTitle && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Briefcase className="w-3 h-3" />
                      <span>Interviewing for {activeConv.jobTitle}</span>
                    </div>
                  )}
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs hidden sm:flex">
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs hidden md:flex">
                    <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                  </Button>
                  {/* Toggle candidate panel */}
                  <button
                    onClick={() => setShowCandidatePanel((v) => !v)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title={showCandidatePanel ? 'Hide panel' : 'Show panel'}
                  >
                    {showCandidatePanel ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronLeft className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                {/* Date divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] text-muted-foreground">Today</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {msgs.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderId === 'company'}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="px-6 py-4 border-t border-border shrink-0">
                <div className="flex items-end gap-2">
                  <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors shrink-0">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors shrink-0">
                    <Smile className="w-4 h-4" />
                  </button>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a message…"
                    rows={1}
                    className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px] max-h-[120px]"
                    style={{ lineHeight: '1.5' }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    size="sm"
                    className="shrink-0 h-10 w-10 p-0 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── COLUMN 3: Candidate CRM panel ───────────────────────────────────── */}
      <AnimatePresence>
        {showCandidatePanel && activeConv && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden flex-shrink-0"
          >
            <CandidatePanel
              conv={activeConv}
              onClose={() => setShowCandidatePanel(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
