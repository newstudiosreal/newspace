'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface FollowButtonProps {
  targetUserId: string
  currentUserId: string
  compact?: boolean
}

export default function FollowButton({ targetUserId, currentUserId, compact }: FollowButtonProps) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('follows')
      .select('id')
      .match({ follower_id: currentUserId, following_id: targetUserId })
      .single()
      .then(({ data }: { data: { id: string } | null }) => setFollowing(!!data))
  }, [currentUserId, targetUserId])

  const toggle = async () => {
    if (loading) return
    setLoading(true)
    const newFollowing = !following
    setFollowing(newFollowing)
    if (newFollowing) {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: targetUserId })
      toast.success('Ora lo segui!')
    } else {
      await supabase.from('follows').delete().match({ follower_id: currentUserId, following_id: targetUserId })
    }
    setLoading(false)
  }

  if (compact) {
    return (
      <button
        onClick={toggle}
        className={cn(
          'text-xs font-semibold px-3 py-1.5 rounded-full transition-all',
          following
            ? 'border border-border-primary text-text-secondary hover:text-red-400 hover:border-red-400'
            : 'bg-text-primary text-bg-primary hover:bg-text-primary/80'
        )}
      >
        {following ? 'Segui già' : 'Segui'}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        'font-semibold px-5 py-2 rounded-full text-sm transition-all',
        following
          ? 'border border-border-primary text-text-secondary hover:text-red-400 hover:border-red-400'
          : 'bg-text-primary text-bg-primary hover:bg-text-primary/80'
      )}
    >
      {following ? 'Segui già' : 'Segui'}
    </button>
  )
}
