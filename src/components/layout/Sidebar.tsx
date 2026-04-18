'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Zap, Home, Search, Bell, Mail, User, Settings, LogOut, PenSquare, Hash
} from 'lucide-react'
import type { Profile } from '@/types/database'
import Image from 'next/image'
import toast from 'react-hot-toast'

const navLinks = [
  { href: '/feed', icon: Home, label: 'Home' },
  { href: '/explore', icon: Search, label: 'Esplora' },
  { href: '/notifications', icon: Bell, label: 'Notifiche' },
  { href: '/messages', icon: Mail, label: 'Messaggi' },
  { href: '/trending', icon: Hash, label: 'Trending' },
  { href: '/settings', icon: Settings, label: 'Impostazioni' },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Arrivederci!')
    router.push('/auth')
    router.refresh()
  }

  return (
    <nav className="h-full flex flex-col py-4 px-2 xl:px-4">
      {/* Logo */}
      <Link href="/feed" className="flex items-center gap-3 px-2 xl:px-3 py-3 mb-2 group">
        <div className="w-9 h-9 bg-accent-yellow rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          <Zap size={18} className="text-bg-primary" fill="currentColor" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight hidden xl:block">NeW Space</span>
      </Link>

      {/* Nav links */}
      <div className="flex-1 space-y-1 mt-2">
        {navLinks.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/feed' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn('nav-item', active && 'nav-item-active')}
            >
              <Icon size={22} className={cn(active && 'text-accent-yellow')} strokeWidth={active ? 2.5 : 2} />
              <span className="hidden xl:block text-[15px]">{label}</span>
            </Link>
          )
        })}
      </div>

      {/* Compose button */}
      <div className="mb-4">
        <Link
          href="/feed?compose=true"
          className="flex items-center justify-center xl:justify-start gap-3 bg-accent-yellow text-bg-primary font-semibold rounded-full px-3 py-3 xl:px-5 hover:bg-accent-yellow-hover transition-all duration-150"
        >
          <PenSquare size={20} />
          <span className="hidden xl:block text-sm">Scrivi</span>
        </Link>
      </div>

      {/* Profile */}
      {profile && (
        <div className="border-t border-border-secondary pt-4 space-y-1">
          <Link
            href={`/profile/${profile.username}`}
            className="nav-item"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-bg-tertiary flex-shrink-0 ring-2 ring-border-primary">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.display_name || ''} width={36} height={36} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <User size={16} />
                </div>
              )}
            </div>
            <div className="hidden xl:block min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{profile.display_name}</p>
              <p className="text-xs text-text-muted truncate">@{profile.username}</p>
            </div>
          </Link>
          <button onClick={handleLogout} className="nav-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-400/10">
            <LogOut size={20} />
            <span className="hidden xl:block text-sm">Esci</span>
          </button>
        </div>
      )}
    </nav>
  )
}
