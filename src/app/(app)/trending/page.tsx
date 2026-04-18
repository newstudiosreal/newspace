import { createClient } from '@/lib/supabase/server'
import { TrendingUp, Hash } from 'lucide-react'
import { formatCount } from '@/lib/utils'
import Link from 'next/link'
import PostCard from '@/components/post/PostCard'

export default async function TrendingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: hashtags }, { data: viralPosts }] = await Promise.all([
    supabase.from('hashtags').select('*').order('posts_count', { ascending: false }).limit(20),
    supabase.from('posts').select('*, profiles(*)').order('likes_count', { ascending: false }).limit(10),
  ])

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-secondary px-4 py-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-accent-yellow" />
          <h1 className="font-display font-bold text-xl">Trending</h1>
        </div>
      </div>

      {/* Trending hashtags */}
      <div className="border-b border-border-secondary">
        <h2 className="px-4 py-3 font-semibold text-text-secondary text-sm">Hashtag del momento</h2>
        <div className="grid grid-cols-2 gap-px bg-border-secondary">
          {hashtags?.map((tag, i) => (
            <Link
              key={tag.id}
              href={`/explore?q=%23${tag.tag}`}
              className="bg-bg-primary px-4 py-4 hover:bg-bg-hover transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className="text-accent-yellow font-bold text-lg tabular-nums">#{i + 1}</span>
                <div>
                  <div className="flex items-center gap-1">
                    <Hash size={14} className="text-text-muted" />
                    <span className="font-semibold text-sm">{tag.tag}</span>
                  </div>
                  <p className="text-text-muted text-xs mt-0.5">{formatCount(tag.posts_count)} post</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Viral posts */}
      <div>
        <h2 className="px-4 py-3 font-semibold text-text-secondary text-sm">Post virali</h2>
        {viralPosts?.map(post => (
          <PostCard key={post.id} post={post} currentUserId={user?.id} />
        ))}
      </div>
    </div>
  )
}
