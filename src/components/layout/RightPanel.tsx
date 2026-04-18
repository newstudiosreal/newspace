import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TrendingUp, Hash } from 'lucide-react'
import { formatCount } from '@/lib/utils'
import FollowButton from '@/components/ui/FollowButton'
import Image from 'next/image'

export default async function RightPanel({ currentUserId }: { currentUserId: string }) {
  const supabase = createClient()

  const [{ data: trending }, { data: suggested }] = await Promise.all([
    supabase
      .from('hashtags')
      .select('*')
      .order('posts_count', { ascending: false })
      .limit(6),
    supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUserId)
      .order('followers_count', { ascending: false })
      .limit(4),
  ])

  return (
    <div className="sticky top-0 h-screen overflow-y-auto py-4 px-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          className="input pl-10 w-full"
          placeholder="Cerca su NeW Space"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
      </div>

      {/* Trending */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-accent-yellow" />
          <h3 className="font-display font-bold text-sm">Trending</h3>
        </div>
        <div className="space-y-3">
          {trending?.map((tag, i) => (
            <Link
              key={tag.id}
              href={`/explore?q=%23${tag.tag}`}
              className="flex items-center justify-between group hover:bg-bg-hover -mx-2 px-2 py-1.5 rounded-xl transition-colors"
            >
              <div>
                <p className="text-xs text-text-muted">#{i + 1} Trend</p>
                <p className="text-sm font-semibold group-hover:text-accent-yellow transition-colors">
                  <Hash size={12} className="inline mr-0.5" />{tag.tag}
                </p>
                <p className="text-xs text-text-muted">{formatCount(tag.posts_count)} post</p>
              </div>
              <TrendingUp size={14} className="text-text-muted group-hover:text-accent-yellow transition-colors" />
            </Link>
          ))}
          {(!trending || trending.length === 0) && (
            <p className="text-text-muted text-sm text-center py-2">Nessun trend ancora</p>
          )}
        </div>
        <Link href="/trending" className="text-accent-yellow text-sm hover:underline mt-3 block">
          Mostra tutto
        </Link>
      </div>

      {/* Suggested users */}
      <div className="card p-4">
        <h3 className="font-display font-bold text-sm mb-4">Chi seguire</h3>
        <div className="space-y-3">
          {suggested?.map(user => (
            <div key={user.id} className="flex items-center gap-3">
              <Link href={`/profile/${user.username}`}>
                <div className="w-9 h-9 rounded-full overflow-hidden bg-bg-tertiary ring-1 ring-border-primary flex-shrink-0">
                  {user.avatar_url ? (
                    <Image src={user.avatar_url} alt={user.display_name || ''} width={36} height={36} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-accent-yellow/20 flex items-center justify-center text-accent-yellow text-xs font-bold">
                      {(user.display_name || user.username)[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${user.username}`}>
                  <p className="text-sm font-semibold hover:underline truncate">{user.display_name}</p>
                  <p className="text-xs text-text-muted truncate">@{user.username}</p>
                </Link>
              </div>
              <FollowButton targetUserId={user.id} currentUserId={currentUserId} compact />
            </div>
          ))}
        </div>
        <Link href="/explore" className="text-accent-yellow text-sm hover:underline mt-3 block">
          Mostra di più
        </Link>
      </div>

      {/* Footer */}
      <p className="text-text-muted text-xs px-1 pb-4">
        © 2025 NeW Space · Privacy · Termini
      </p>
    </div>
  )
}
