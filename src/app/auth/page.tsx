'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Zap, Mail } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [form, setForm] = useState({ email: '', password: '', username: '', display_name: '' })
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
        if (error) throw error
        window.location.href = '/feed'
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        })
        if (error) throw error
        if (data.user) {
          const supabaseAny = supabase as any
          await supabaseAny.from('profiles').insert({
            id: data.user.id,
            username: form.username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
            display_name: form.display_name || form.username,
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.display_name || form.username)}&backgroundColor=f5c518&textColor=0a0a0a`,
          })
          setSentTo(form.email)
          setEmailSent(true)
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Errore durante l\'accesso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-yellow/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-yellow/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-accent-yellow rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-bg-primary" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">NeW Space</span>
          </div>
          <p className="text-text-secondary text-sm">
            {emailSent ? 'Quasi fatto!' : mode === 'login' ? 'Bentornato nello spazio' : 'Entra nello spazio'}
          </p>
        </div>

        {emailSent ? (
          /* Email sent screen */
          <div className="card p-8 glow-yellow text-center">
            <div className="w-16 h-16 bg-accent-yellow/10 border border-accent-yellow/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <Mail size={28} className="text-accent-yellow" />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Controlla la tua email</h2>
            <p className="text-text-muted text-sm leading-relaxed mb-1">
              Abbiamo inviato un link di conferma a
            </p>
            <p className="text-accent-yellow font-semibold text-sm mb-5">{sentTo}</p>
            <p className="text-text-muted text-xs leading-relaxed">
              Clicca il link nell'email per attivare il tuo account ed entrare nello spazio.
            </p>
            <button
              onClick={() => { setEmailSent(false); setMode('login') }}
              className="mt-6 text-xs text-text-muted hover:text-text-secondary underline transition-colors"
            >
              Torna al login
            </button>
          </div>
        ) : (
          /* Auth form */
          <div className="card p-6 glow-yellow">
            <div className="flex bg-bg-tertiary rounded-xl p-1 mb-6">
              {(['login', 'register'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    mode === m ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {m === 'login' ? 'Accedi' : 'Registrati'}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuth} className="space-y-3">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="text-xs text-text-muted mb-1.5 block">Username</label>
                    <input
                      className="input"
                      placeholder="il_tuo_username"
                      value={form.username}
                      onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                      required
                      minLength={3}
                      maxLength={30}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-1.5 block">Nome visualizzato</label>
                    <input
                      className="input"
                      placeholder="Il tuo nome"
                      value={form.display_name}
                      onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="email@esempio.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-yellow w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Caricamento...' : mode === 'login' ? 'Accedi' : 'Crea account'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-text-muted text-xs mt-6">
          Continuando accetti i Termini di Servizio e la Privacy Policy
        </p>
      </div>
    </div>
  )
}
