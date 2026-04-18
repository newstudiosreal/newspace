'use client'

import { useState } from 'react'
import PostCard from '@/components/post/PostCard'
import ComposePost from '@/components/post/ComposePost'
import type { Post, Profile } from '@/types/database'
import { Zap, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface FeedClientProps {
  initialPosts: Post[]
  profile: Profile | null
  currentUserId: string
}

type TabType = 'foryou' | 'following'

export default function FeedClient({
  initialPosts,
  profile,
  currentUserId,
}: FeedClientProps) {
  const [tab, setTab] = useState<TabType>('foryou')
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loadingFollowing, setLoadingFollowing] = useState(false)
  const [followingPosts, setFollowingPosts] = useState<Post[]>([])

  const supabase = createClient()

  const loadFollowingFeed = async () => {
    if (followingPosts.length > 0) return

    setLoadingFollowing(true)

    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUserId)
      .returns<{ following_id: string }[]>()

    const followingIds = follows?.map((f) => f.following_id) || []

    if (followingIds.length > 0) {
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(30)

      setFollowingPosts((data as Post[]) || [])
    }

    setLoadingFollowing(false)
  }

  const handleTabChange = (t: TabType) => {
    setTab(t)
    if (t === 'following') loadFollowingFeed()
  }

  const displayPosts = tab === 'foryou' ? posts : followingPosts

  const tabs: {
    key: TabType
    label: string
    icon: any
  }[] = [
    { key: 'foryou', label: 'Per te', icon: Zap },
    { key: 'following', label: 'Seguiti', icon: Users },
  ]

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-secondary">
        <div className="px-4 pt-4 pb-0">
          <h1 className="font-display font-bold text-xl mb-3">Home</h1>

          <div className="flex">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-all',
                  tab === key
                    ? 'border-accent-yellow text-accent-yellow'
                    : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-bg-hover'
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compose */}
      {profile && (
        <ComposePost
          profile={profile}
          onPostCreated={async () => {
            const { data } = await supabase
              .from('posts')
              .select('*, profiles(*)')
              .order('created_at', { ascending: false })
              .limit(30)

            setPosts((data as Post[]) || [])
          }}
        />
      )}

      {/* Posts */}
      {loadingFollowing ? (
        <div className="flex flex-col gap-4 p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : displayPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          {tab === 'following' ? (
            <>
              <Users size={48} className="mb-4 opacity-30" />
              <p className="font-semibold text-text-secondary">
                Nessun post ancora
              </p>
              <p className="text-sm mt-1">
                Segui altri utenti per vedere i loro post qui
              </p>
            </>
          ) : (
            <>
              <Zap size={48} className="mb-4 opacity-30 text-accent-yellow" />
              <p className="font-semibold text-text-secondary">
                Il feed è vuoto
              </p>
              <p className="text-sm mt-1">
                Sii il primo a pubblicare qualcosa!
              </p>
            </>
          )}
        </div>
      ) : (
        <div>
          {displayPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
