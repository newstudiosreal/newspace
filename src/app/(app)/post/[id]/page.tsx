import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PostCard from '@/components/post/PostCard'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: post } = await supabase
    .from('posts')
    .select('*, profiles(*)')
    .eq('id', params.id)
    .single()

  if (!post) notFound()

  const { data: comments } = await supabase
    .from('posts')
    .select('*, profiles(*)')
    .eq('reply_to', params.id)
    .order('created_at', { ascending: true })

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-secondary px-4 py-3 flex items-center gap-4">
        <Link href="/feed" className="p-2 rounded-xl hover:bg-bg-hover transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display font-bold text-xl">Post</h1>
      </div>

      <PostCard post={post} currentUserId={user?.id} />

      {comments && comments.length > 0 && (
        <div className="border-t border-border-secondary">
          <h2 className="px-4 py-3 text-sm font-semibold text-text-muted">
            {comments.length} {comments.length === 1 ? 'risposta' : 'risposte'}
          </h2>
          {comments.map(comment => (
            <PostCard key={comment.id} post={comment} currentUserId={user?.id} />
          ))}
        </div>
      )}
    </div>
  )
}
