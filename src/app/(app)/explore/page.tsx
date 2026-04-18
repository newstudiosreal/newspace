import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/post/PostCard'
import { Search } from 'lucide-react'

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const q = searchParams.q?.trim() || ''

  let posts: any[] = []
  let users: any[] = []

  if (q) {
    const isHashtag = q.startsWith('#')
    const term = isHashtag ? q.slice(1) : q

    const [{ data: postResults }, { data: userResults }] = await Promise.all([
      isHashtag
        ? supabase.from('posts').select('*, profiles(*)').contains('hashtags', [term.toLowerCase()]).order('created_at', { ascending: false }).limit(20)
        : supabase.from('posts').select('*, profiles(*)').ilike('content', `%${term}%`).order('created_at', { ascending: false }).limit(20),
      supabase.from('profiles').select('*').or(`username.ilike.%${term}%,display_name.ilike.%${term}%`).limit(5),
    ])
    posts = postResults || []
    users = userResults || []
  } else {
    // Show trending posts
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(*)')
      .order('likes_count', { ascending: false })
      .limit(20)
    posts = data || []
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-secondary px-4 py-3">
        <h1 className="font-display font-bold text-xl mb-3">{q ? `Risultati per "${q}"` : 'Esplora'}</h1>
        <form method="get">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              name="q"
              defaultValue={q}
              className="input pl-10"
              placeholder="Cerca post, utenti, hashtag..."
            />
          </div>
        </form>
      </div>

      {/* User results */}
      {users.length > 0 && (
        <div className="border-b border-border-secondary">
          <h2 className="px-4 py-3 font-semibold text-sm text-text-muted">Utenti</h2>
          {users.map(u => (
            <a key={u.id} href={`/profile/${u.username}`} className="flex items-center gap-3 px-4 py-3 hover:bg-bg-hover transition-colors">
              <div className="w-10 h-10 rounded-full bg-bg-tertiary overflow-hidden flex-shrink-0">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent-yellow/20 flex items-center justify-center text-accent-yellow text-sm font-bold">
                    {(u.display_name || u.username)[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">{u.display_name}</p>
                <p className="text-text-muted text-sm">@{u.username}</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-semibold text-text-secondary">Nessun risultato</p>
          <p className="text-sm mt-1">Prova a cercare qualcosa di diverso</p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard key={post.id} post={post} currentUserId={user?.id} />
        ))
      )}
    </div>
  )
}
