import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeedClient from './FeedClient'
import type { Post } from '@/types/database'

export default async function FeedPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: postsRaw } = await supabase
    .from('posts')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false })
    .limit(30)

  const { data: likedRows } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', user.id)

  const { data: repostedRows } = await supabase
    .from('reposts')
    .select('post_id')
    .eq('user_id', user.id)

  const likedIds = new Set(
    ((likedRows ?? []) as { post_id: string }[]).map((r) => r.post_id)
  )
  const repostedIds = new Set(
    ((repostedRows ?? []) as { post_id: string }[]).map((r) => r.post_id)
  )

  const posts = (postsRaw ?? []) as Post[]

  const enrichedPosts = posts.map((p) => ({
    ...p,
    liked: likedIds.has(p.id),
    reposted: repostedIds.has(p.id),
  }))

  return (
    <FeedClient
      initialPosts={enrichedPosts}
      profile={profile}
      currentUserId={user.id}
    />
  )
}
