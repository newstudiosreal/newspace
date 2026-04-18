'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
import type { Profile } from '@/types/database'

interface EditProfileModalProps {
  profile: Profile
  onClose: () => void
  onSave: (updated: Partial<Profile>) => void
}

export default function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update(form)
        .eq('id', profile.id)
      if (error) throw error
      toast.success('Profilo aggiornato!')
      onSave(form)
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
