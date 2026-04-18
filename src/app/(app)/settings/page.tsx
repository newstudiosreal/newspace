'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Settings, User, Lock, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profile } from '@/types/database'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ display_name: '', bio: '', location: '', website: '' })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async (result: any) => {
      const user = result?.data?.user
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        const p = data as Profile
        setProfile(p)
        setForm({
          display_name: p.display_name || '',
          bio: p.bio || '',
          location: p.location || '',
          website: p.website || '',
        })
      }
    })
  }, [])

  const save = async () => {
    if (!profile) return
    setLoading(true)
    const { error } = await supabase.from('profiles').update(form).eq('id', profile.id)
    if (error) toast.error('Errore nel salvataggio')
    else toast.success('Profilo aggiornato!')
    setLoading(false)
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-secondary px-4 py-4">
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-accent-yellow" />
          <h1 className="font-display font-bold text-xl">Impostazioni</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile section */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-accent-yellow" />
            <h2 className="font-semibold">Informazioni profilo</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Nome visualizzato</label>
              <input
                className="input"
                value={form.display_name}
                onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                placeholder="Il tuo nome"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Bio</label>
              <textarea
                className="input resize-none"
                rows={3}
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Raccontati in poche parole..."
                maxLength={160}
              />
              <p className="text-xs text-text-muted mt-1">{form.bio.length}/160</p>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Posizione</label>
              <input
                className="input"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Città, Paese"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Sito web</label>
              <input
                className="input"
                value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://tuosito.com"
              />
            </div>
            <button onClick={save} disabled={loading} className="btn-yellow w-full mt-2">
              {loading ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
          </div>
        </div>

        {/* Account section */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={16} className="text-accent-yellow" />
            <h2 className="font-semibold">Account</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Username</p>
                <p className="text-xs text-text-muted">@{profile?.username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-accent-yellow" />
            <h2 className="font-semibold">Notifiche</h2>
          </div>
          {[
            { label: 'Like ai tuoi post', key: 'likes' },
            { label: 'Nuovi follower', key: 'follows' },
            { label: 'Risposte ai tuoi post', key: 'replies' },
            { label: 'Menzioni', key: 'mentions' },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between py-2.5 border-b border-border-secondary last:border-0">
              <span className="text-sm">{label}</span>
              <button className="w-10 h-6 bg-accent-yellow rounded-full relative">
                <div className="w-4 h-4 bg-bg-primary rounded-full absolute right-1 top-1" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
