'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { conversations } from '@/lib/data'
import { Conversation, Message } from '@/lib/types'
import { cn, timeAgo, truncate } from '@/lib/utils'
import {
  Search, Send, Paperclip, Smile, Plus, Calendar,
  Eye, XCircle, MessageSquare, CheckCheck, Check,
  Briefcase, ChevronDown, MoreHorizontal,
} from 'lucide-react'

function ConversationItem({
  conv, isActive, onClick,
}: {
  conv: Conversation; isActive: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all duration-200 border-b border-white/[0.04] hover:bg-white/[0.04]',
        isActive && 'bg-white/[0.06] border-l-2 border-l-blue-500 hover:bg-white/[0.06]'
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="w-10 h-10">
          <AvatarImage src={conv.participantAvatar} alt={conv.participantName} />
          <AvatarFallback className="bg-secondary text-sm font-semibold">
            {conv.participantName.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={cn('text-sm font-semibold truncate', isActive ? 'text-foreground' : 'text-foreground/90')}>
            {conv.participantName}
          </span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {timeAgo(conv.lastMessageTime)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mb-0.5">{conv.participantRole}</p>
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs text-muted-foreground/70 truncate">{truncate(conv.lastMessage, 42)}</p>
          {conv.unread > 0 && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
              {conv.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function MessageBubble({ message, isOwnMessage }: { message: Message; isOwnMessage: boolean }) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <span className="text-[11px] text-muted-foreground bg-white/[0.05] border border-white/[0.08] px-4 py-1.5 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-3 max-w-[75%] mb-4', isOwnMessage ? 'ml-auto flex-row-reverse' : '')}>
      {!isOwnMessage && (
        <Avatar className="w-7 h-7 flex-shrink-0 mt-1">
          <AvatarFallback className="bg-secondary text-[10px] font-semibold">C</AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col gap-1', isOwnMessage && 'items-end')}>
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            isOwnMessage
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-tr-sm'
              : 'bg-white/[0.07] border border-white/[0.08] text-foreground rounded-tl-sm'
          )}
        >
          {message.content}
        </div>
        <div className={cn('flex items-center gap-1.5 text-[10px] text-muted-foreground/60', isOwnMessage && 'flex-row-reverse')}>
          <span>{timeAgo(message.timestamp)}</span>
          {isOwnMessage && (
            message.read
              ? <CheckCheck className="w-3 h-3 text-blue-400" />
              : <Check className="w-3 h-3" />
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
      <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
        <MessageSquare className="w-10 h-10 text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No conversation selected</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Select a conversation from the left to start messaging with a candidate.
      </p>
      <button className="mt-6 flex items-center gap-2 btn-primary text-sm">
        <Plus className="w-4 h-4" /> Start New Conversation
      </button>
    </div>
  )
}

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [input, setInput] = useState('')
  const [localMessages, setLocalMessages] = useState<Record<string, Message[]>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selected = conversations.find(c => c.id === selectedId) ?? null

  const filteredConvs = conversations.filter(c =>
    c.participantName.toLowerCase().includes(search.toLowerCase()) ||
    c.participantRole.toLowerCase().includes(search.toLowerCase())
  )

  const messages = selectedId
    ? [...(selected?.messages ?? []), ...(localMessages[selectedId] ?? [])]
    : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, selectedId])

  const handleSend = () => {
    if (!input.trim() || !selectedId) return
    const msg: Message = {
      id: `local-${Date.now()}`,
      senderId: 'company',
      receiverId: selectedId,
      content: input.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
    }
    setLocalMessages(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), msg],
    }))
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left panel — conversation list */}
      <div className="w-80 flex-shrink-0 border-r border-white/[0.06] flex flex-col">
        {/* Panel header */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Messages</h2>
            <button className="flex items-center gap-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-all">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/50 text-sm">
              No conversations found
            </div>
          ) : (
            filteredConvs.map(conv => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={selectedId === conv.id}
                onClick={() => setSelectedId(conv.id)}
              />
            ))
          )}
        </div>

        {/* Panel footer */}
        <div className="p-3 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{conversations.length} conversations</span>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
          </span>
        </div>
      </div>

      {/* Right panel — chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selected ? (
          <EmptyState />
        ) : (
          <>
            {/* Chat header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-white/[0.06] flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-11 h-11 ring-2 ring-white/[0.08]">
                  <AvatarImage src={selected.participantAvatar} alt={selected.participantName} />
                  <AvatarFallback className="bg-secondary font-semibold">{selected.participantName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{selected.participantName}</h3>
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>{selected.participantRole}</span>
                  {selected.jobTitle && (
                    <>
                      <span className="text-white/20">·</span>
                      <Briefcase className="w-3 h-3" />
                      <span>{selected.jobTitle}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
                  <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-muted-foreground hover:text-foreground hover:border-white/[0.2] transition-all">
                  <Eye className="w-3.5 h-3.5" /> View Profile
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
                <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message thread */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Date divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[11px] text-muted-foreground/60">Today</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {messages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwnMessage={msg.senderId === 'company'}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-white/[0.06]">
              <div className="glass rounded-2xl p-1 flex items-end gap-2">
                <button className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all flex-shrink-0">
                  <Paperclip className="w-4 h-4" />
                </button>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a message… (Enter to send, Shift+Enter for newline)"
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 resize-none py-2.5 focus:outline-none min-h-[40px] max-h-[120px]"
                  style={{ lineHeight: '1.5' }}
                />
                <button className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all flex-shrink-0">
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={cn(
                    'p-2.5 rounded-xl flex-shrink-0 transition-all duration-200',
                    input.trim()
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 shadow-lg'
                      : 'text-muted-foreground/40 cursor-not-allowed'
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/40 mt-2 text-center">
                Messages are end-to-end encrypted
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
