'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { X, Camera } from 'lucide-react'
import Image from 'next/image'
import type { Profile } from '@/types/database'

interface EditProfileModalProps {
  profile: Profile
  onClose: () => void
  onSave: (updated: Partial<Profile>) => void
}

export default function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      let newAvatarUrl = avatarUrl

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${profile.id}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true })
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(path)
        newAvatarUrl = publicUrl
      }

      const updates = { ...form, avatar_url: newAvatarUrl }
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
      if (error) throw error

      toast.success('Profilo aggiornato!')
      onSave(updates)
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Errore durante il salvataggio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-bg-card border border-border-primary rounded-2xl shadow-xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-secondary">
          <h2 className="font-display font-bold text-lg">Modifica profilo</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-yellow text-sm px-4 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvataggio...' : 'Salva'}
            </button>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="px-5 py-5 space-y-4">

          {/* Avatar */}
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-bg-tertiary ring-4 ring-bg-primary">
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="" width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent-yellow/20 flex items-center justify-center text-accent-yellow text-2xl font-bold">
                    {(profile.display_name || profile.username)[0].toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-accent-yellow rounded-full flex items-center justify-center shadow-lg hover:bg-accent-yellow/80 transition-colors"
              >
                <Camera size={14} className="text-bg-primary" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Nome visualizzato</label>
            <input
              className="input w-full"
              placeholder="Il tuo nome"
              value={form.display_name}
              onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Bio</label>
            <textarea
              className="input w-full resize-none"
              placeholder="Raccontati in poche parole..."
              rows={3}
              maxLength={160}
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            />
            <p className="text-xs text-text-muted mt-1 text-right">{form.bio.length}/160</p>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Posizione</label>
            <input
              className="input w-full"
              placeholder="Città, Paese"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Sito web</label>
            <input
              className="input w-full"
              placeholder="https://tuosito.com"
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
