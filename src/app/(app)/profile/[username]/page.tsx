'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { notFound, useParams } from 'next/navigation'
import Image from 'next/image'
import { formatCount } from '@/lib/utils'
import { MapPin, Link as LinkIcon, Calendar, BadgeCheck } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import PostCard from '@/components/post/PostCard'
import FollowButton from '@/components/ui/FollowButton'
import EditProfileModal from '@/components/ui/EditProfileModal'
import type { Post, Profile } from '@/types/database'

function avatarSrc(profile: Profile) {
  return profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.display_name || profile.username)}&backgroundColor=f5c518&textColor=0a0a0a`
}

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (!profileData) { setLoading(false); return }
      setProfile(profileData as unknown as Profile)

      const { data: postsData } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setPosts((postsData as unknown as Post[]) || [])
      setLoading(false)
    }
    load()
  }, [username])

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-text-muted text-sm">
      Caricamento...
    </div>
  )

  if (!profile) return notFound()

  const isOwn = user?.id === profile.id

  return (
    <div>
      {/* Modal */}
      {showModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowModal(false)}
          onSave={(updated) => setProfile(p => p ? { ...p, ...updated } : p)}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-secondary px-4 py-3">
        <h1 className="font-display font-bold text-lg flex items-center gap-1.5">
          {profile.display_name}
          {profile.verified && <BadgeCheck size={18} className="text-accent-yellow" fill="currentColor" />}
        </h1>
        <p className="text-text-muted text-sm">{formatCount(profile.posts_count)} post</p>
      </div>

      {/* Banner */}
      <div className="relative h-36 bg-gradient-to-br from-accent-yellow/20 to-bg-tertiary">
        {profile.banner_url && (
          <Image src={profile.banner_url} alt="" fill className="object-cover" />
        )}
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-8 mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-bg-tertiary ring-4 ring-bg-primary">
            <Image src={avatarSrc(profile)} alt="" width={80} height={80} className="w-full h-full object-cover" />
          </div>
          {isOwn ? (
            <button onClick={() => setShowModal(true)} className="btn-outline">
              Modifica profilo
            </button>
          ) : user ? (
            <FollowButton targetUserId={profile.id} currentUserId={user.id} />
          ) : null}
        </div>

        <h2 className="font-display font-bold text-xl flex items-center gap-1.5">
          {profile.display_name}
          {profile.verified && <BadgeCheck size={20} className="text-accent-yellow" fill="currentColor" />}
        </h2>
        <p className="text-text-muted text-sm">@{profile.username}</p>

        {profile.bio && (
          <p className="mt-3 text-[15px] text-text-primary leading-relaxed">{profile.bio}</p>
        )}

        <div className="flex flex-wrap gap-4 mt-3 text-text-muted text-sm">
          {profile.location && (
            <span className="flex items-center gap-1"><MapPin size={14} />{profile.location}</span>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent-yellow hover:underline">
              <LinkIcon size={14} />{profile.website.replace(/https?:\/\//, '')}
            </a>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            Iscritto il {format(new Date(profile.created_at), 'MMMM yyyy', { locale: it })}
          </span>
        </div>

        <div className="flex gap-6 mt-4 text-sm">
          <span><strong className="text-text-primary">{formatCount(profile.following_count)}</strong> <span className="text-text-muted">seguiti</span></span>
          <span><strong className="text-text-primary">{formatCount(profile.followers_count)}</strong> <span className="text-text-muted">follower</span></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-secondary">
        <div className="flex">
          <button className="flex-1 py-3 text-sm font-medium border-b-2 border-accent-yellow text-accent-yellow">Post</button>
          <button className="flex-1 py-3 text-sm font-medium text-text-muted hover:text-text-secondary">Risposte</button>
          <button className="flex-1 py-3 text-sm font-medium text-text-muted hover:text-text-secondary">Mi piace</button>
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="font-semibold text-text-secondary">Nessun post ancora</p>
          <p className="text-sm mt-1">I post appariranno qui</p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard key={post.id} post={post} currentUserId={user?.id} />
        ))
      )}
    </div>
  )
}
