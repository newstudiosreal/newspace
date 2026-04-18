'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Send, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Message } from '@/types/database'

interface MessagesClientProps {
  conversations: any[]
  currentUserId: string
}

export default function MessagesClient({ conversations, currentUserId }: MessagesClientProps) {
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const getOtherParticipant = (conv: any) => {
    const participants = conv.conversation_participants || []
    return participants.find((p: any) => p.user_id !== currentUserId)?.profiles
  }

  const getLastMessage = (conv: any) => {
    const msgs = conv.messages || []
    return msgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  }

  useEffect(() => {
    if (!selected) return

    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', selected.id)
      .order('created_at', { ascending: true })
      .then((result: any) => setMessages((result.data as Message[]) || []))

    const channel = supabase
      .channel(`messages:${selected.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selected.id}`,
      }, (payload: any) => {
        setMessages((prev: Message[]) => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selected?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selected || sending) return
    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')
    await supabase.from('messages').insert({
      conversation_id: selected.id,
      sender_id: currentUserId,
      content,
    })
    setSending(false)
  }

  return (
    <div className="flex h-screen">
      {/* Conversation list */}
      <div className="w-72 border-r border-border-secondary flex flex-col flex-shrink-0">
        <div className="sticky top-0 bg-bg-primary/80 backdrop-blur-md border-b border-border-secondary px-4 py-3">
          <h1 className="font-display font-bold text-xl">Messaggi</h1>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-text-muted px-4">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nessuna conversazione</p>
            </div>
          ) : (
            conversations.map(conv => {
              const other = getOtherParticipant(conv)
              const last = getLastMessage(conv)
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-hover transition-colors text-left ${selected?.id === conv.id ? 'bg-bg-hover' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-tertiary flex-shrink-0">
                    {other?.avatar_url ? (
                      <Image src={other.avatar_url} alt="" width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-accent-yellow/20 flex items-center justify-center text-accent-yellow text-sm font-bold">
                        {(other?.display_name || '?')[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{other?.display_name}</p>
                    <p className="text-xs text-text-muted truncate">{last?.content || 'Inizia la conversazione'}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      {selected ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-bg-primary/80 backdrop-blur-md border-b border-border-secondary px-4 py-3 flex items-center gap-3">
            {(() => {
              const other = getOtherParticipant(selected)
              return (
                <>
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-bg-tertiary flex-shrink-0">
                    {other?.avatar_url && <Image src={other.avatar_url} alt="" width={36} height={36} className="object-cover w-full h-full" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{other?.display_name}</p>
                    <p className="text-xs text-text-muted">@{other?.username}</p>
                  </div>
                </>
              )
            })()}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map(msg => {
              const isOwn = msg.sender_id === currentUserId
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-accent-yellow text-bg-primary rounded-br-sm'
                      : 'bg-bg-tertiary text-text-primary rounded-bl-sm'
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-bg-primary/60' : 'text-text-muted'}`}>
                      {formatDate(msg.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border-secondary px-4 py-3 flex gap-3">
            <input
              className="input flex-1"
              placeholder="Scrivi un messaggio..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="btn-yellow px-4 disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-text-muted">
          <div className="text-center">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-text-secondary">Seleziona una conversazione</p>
          </div>
        </div>
      )}
    </div>
  )
}
