'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Repeat2, MessageCircle, Share, MoreHorizontal, Trash2, Flag, Link2, BadgeCheck } from 'lucide-react'
import { formatDate, formatCount, renderPostContent, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/types/database'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface PostCardProps {
  post: Post
  currentUserId?: string
}

function avatarSrc(profile: Post['profiles']) {
  if (!profile) return ''
  return profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.display_name || profile.username)}&backgroundColor=f5c518&textColor=0a0a0a`
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked || false)
  const [reposted, setReposted] = useState(post.reposted || false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [repostsCount, setRepostsCount] = useState(post.reposts_count)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()
  const profile = post.profiles
  const isOwn = currentUserId === post.user_id

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLike = async () => {
    if (!currentUserId) { toast.error('Accedi per mettere like'); return }
    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount(c => c + (newLiked ? 1 : -1))
    if (newLiked) {
      await supabase.from('likes').insert({ user_id: currentUserId, post_id: post.id })
    } else {
      await supabase.from('likes').delete().match({ user_id: currentUserId, post_id: post.id })
    }
  }

  const handleRepost = async () => {
    if (!currentUserId) { toast.error('Accedi per repostare'); return }
    const newReposted = !reposted
    setReposted(newReposted)
    setRepostsCount(c => c + (newReposted ? 1 : -1))
    if (newReposted) {
      await supabase.from('reposts').insert({ user_id: currentUserId, post_id: post.id })
      toast.success('Repostato!')
    } else {
      await supabase.from('reposts').delete().match({ user_id: currentUserId, post_id: post.id })
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`
    await navigator.clipboard.writeText(url)
    toast.success('Link copiato!')
    setMenuOpen(false)
  }

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) { toast.error('Errore durante l\'eliminazione'); return }
    toast.success('Post eliminato')
    setDeleted(true)
    setMenuOpen(false)
    router.refresh()
  }

  const handleReport = () => {
    toast.success('Post segnalato')
    setMenuOpen(false)
  }

  if (deleted) return null

  return (
    <article className="border-b border-border-secondary hover:bg-bg-hover/30 transition-colors duration-150 px-4 py-4 animate-fade-in">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/profile/${profile?.username}`} className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-tertiary ring-2 ring-border-secondary hover:ring-accent-yellow/40 transition-all">
            <Image src={avatarSrc(profile)} alt={profile?.display_name || ''} width={40} height={40} className="w-full h-full object-cover" />
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/profile/${profile?.username}`} className="font-semibold text-sm hover:underline truncate flex items-center gap-1">
              {profile?.display_name}
              {profile?.verified && <BadgeCheck size={14} className="text-accent-yellow flex-shrink-0" fill="currentColor" />}
            </Link>
            <span className="text-text-muted text-sm truncate">@{profile?.username}</span>
            <span className="text-text-muted text-sm">·</span>
            <span className="text-text-muted text-sm flex-shrink-0">{formatDate(post.created_at)}</span>

            {/* Three dots menu */}
            <div className="ml-auto relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="text-text-muted hover:text-text-secondary p-1 rounded-lg hover:bg-bg-hover transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-7 w-48 bg-bg-card border border-border-primary rounded-xl shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-bg-hover transition-colors"
                  >
                    <Link2 size={15} className="text-text-muted" />
                    Copia link
                  </button>
                  {isOwn ? (
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-bg-hover transition-colors"
                    >
                      <Trash2 size={15} />
                      Elimina post
                    </button>
                  ) : (
                    <button
                      onClick={handleReport}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-bg-hover transition-colors"
                    >
                      <Flag size={15} className="text-text-muted" />
                      Segnala
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Repost label */}
          {post.is_repost && (
            <div className="flex items-center gap-1 text-text-muted text-xs mb-1">
              <Repeat2 size={12} /> <span>Repostato</span>
            </div>
          )}

          {/* Content */}
          <div
            className="text-[15px] text-text-primary leading-relaxed mb-3 post-content"
            dangerouslySetInnerHTML={{ __html: renderPostContent(post.content) }}
          />

          {/* Media */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className={cn(
              'grid gap-1.5 mb-3 rounded-2xl overflow-hidden',
              post.media_urls.length === 1 ? 'grid-cols-1' :
              post.media_urls.length === 2 ? 'grid-cols-2' :
              post.media_urls.length >= 3 ? 'grid-cols-2' : ''
            )}>
              {post.media_urls.map((url, i) => (
                <div key={i} className={cn('relative bg-bg-tertiary', post.media_urls!.length === 1 ? 'aspect-video' : 'aspect-square')}>
                  {post.media_types?.[i]?.startsWith('video') ? (
                    <video src={url} controls className="w-full h-full object-cover" />
                  ) : (
                    <Image src={url} alt="" fill className="object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 -ml-2">
            <Link href={`/post/${post.id}`} className="post-action-btn">
              <MessageCircle size={17} className="group-hover:text-blue-400 transition-colors" />
              <span>{formatCount(post.comments_count)}</span>
            </Link>

            <button onClick={handleRepost} className={cn('post-action-btn', reposted && 'text-green-400')}>
              <Repeat2 size={17} className={cn('transition-colors', reposted ? 'text-green-400' : 'group-hover:text-green-400')} />
              <span>{formatCount(repostsCount)}</span>
            </button>

            <button onClick={handleLike} className={cn('post-action-btn', liked && 'text-red-400')}>
              <Heart
                size={17}
                className={cn('transition-all duration-200', liked ? 'text-red-400 fill-red-400 scale-110' : 'group-hover:text-red-400')}
              />
              <span>{formatCount(likesCount)}</span>
            </button>

            <button onClick={handleShare} className="post-action-btn ml-auto">
              <Share size={17} className="group-hover:text-accent-yellow transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
