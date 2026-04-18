'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Image as ImageIcon, X, Smile } from 'lucide-react'
import { MAX_POST_LENGTH, extractHashtags, cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Profile } from '@/types/database'
import Image from 'next/image'
import TextareaAutosize from 'react-textarea-autosize'

interface ComposePostProps {
  profile: Profile
  onPostCreated?: () => void
}

export default function ComposePost({ profile, onPostCreated }: ComposePostProps) {
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const remaining = MAX_POST_LENGTH - content.length
  const isOverLimit = remaining < 0
  const isEmpty = content.trim().length === 0 && files.length === 0

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 4)
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  const removeFile = (i: number) => {
    setFiles(f => f.filter((_, idx) => idx !== i))
    setPreviews(p => p.filter((_, idx) => idx !== i))
  }

  const uploadFiles = async (): Promise<{ urls: string[], types: string[] }> => {
    const urls: string[] = []
    const types: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('media').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('media').getPublicUrl(path)
        urls.push(data.publicUrl)
        types.push(file.type)
      }
    }
    return { urls, types }
  }

  const handleSubmit = async () => {
    if (isEmpty || isOverLimit || loading) return
    setLoading(true)
    try {
      let mediaUrls: string[] = []
      let mediaTypes: string[] = []
      if (files.length > 0) {
        const uploaded = await uploadFiles()
        mediaUrls = uploaded.urls
        mediaTypes = uploaded.types
      }
      const hashtags = extractHashtags(content)
      const { error } = await supabase.from('posts').insert({
        user_id: profile.id,
        content: content.trim(),
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        media_types: mediaTypes.length > 0 ? mediaTypes : null,
        hashtags: hashtags.length > 0 ? hashtags : null,
        is_repost: false,
      })
      if (error) throw error
      setContent('')
      setFiles([])
      setPreviews([])
      toast.success('Post pubblicato!')
      onPostCreated?.()
    } catch {
      toast.error('Errore nella pubblicazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-b border-border-secondary px-4 pt-4 pb-3">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-tertiary ring-2 ring-border-secondary">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-accent-yellow/20 flex items-center justify-center text-accent-yellow text-sm font-bold">
                {(profile.display_name || profile.username)[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <TextareaAutosize
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Cosa sta succedendo?"
            minRows={2}
            maxRows={10}
            className="w-full bg-transparent text-text-primary placeholder:text-text-muted text-lg resize-none focus:outline-none leading-relaxed"
          />

          {/* Media previews */}
          {previews.length > 0 && (
            <div className={cn('grid gap-2 mt-3 rounded-2xl overflow-hidden', previews.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-video bg-bg-tertiary rounded-xl overflow-hidden">
                  {files[i]?.type.startsWith('video') ? (
                    <video src={src} className="w-full h-full object-cover" />
                  ) : (
                    <Image src={src} alt="" fill className="object-cover" />
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-bg-primary/80 flex items-center justify-center hover:bg-bg-primary transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-secondary">
            <div className="flex items-center gap-1">
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFiles} />
              <button
                onClick={() => fileRef.current?.click()}
                className="p-2 rounded-lg text-accent-yellow hover:bg-accent-yellow-dim transition-colors"
              >
                <ImageIcon size={20} />
              </button>
              <button className="p-2 rounded-lg text-accent-yellow hover:bg-accent-yellow-dim transition-colors">
                <Smile size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <span className={cn('text-sm tabular-nums', remaining < 20 ? 'text-red-400' : 'text-text-muted')}>
                  {remaining}
                </span>
              )}
              <button
                onClick={handleSubmit}
                disabled={isEmpty || isOverLimit || loading}
                className="btn-yellow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Pubblicazione...' : 'Pubblica'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
