'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'

interface CommentFormProps {
  postId: string
  currentUserId: string
}

export default function CommentForm({ postId, currentUserId }: CommentFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const MAX = 280

  const handleSubmit = async () => {
    if (!content.trim() || loading) return
    setLoading(true)
    try {
      const { error } = await supabase.from('posts').insert({
        user_id: currentUserId,
        content: content.trim(),
        reply_to: postId,
      })
      if (error) throw error
      setContent('')
      toast.success('Risposta inviata!')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Errore durante l\'invio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-b border-border-secondary px-4 py-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <textarea
            className="input w-full resize-none bg-transparent border-none outline-none text-[15px] text-text-primary placeholder:text-text-muted min-h-[80px]"
            placeholder="Scrivi una risposta..."
            maxLength={MAX}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${content.length > MAX * 0.9 ? 'text-red-400' : 'text-text-muted'}`}>
              {content.length}/{MAX}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              className="btn-yellow text-sm px-4 py-1.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              {loading ? 'Invio...' : 'Rispondi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
