import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, Heart, Repeat2, UserPlus, AtSign, MessageCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

const iconMap = {
  like: <Heart size={16} className="text-red-400" fill="currentColor" />,
  repost: <Repeat2 size={16} className="text-green-400" />,
  follow: <UserPlus size={16} className="text-accent-yellow" />,
  mention: <AtSign size={16} className="text-blue-400" />,
  reply: <MessageCircle size={16} className="text-blue-400" />,
}

const labelMap = {
  like: 'ha messo like al tuo post',
  repost: 'ha repostato il tuo post',
  follow: 'ha iniziato a seguirti',
  mention: 'ti ha menzionato',
  reply: 'ha risposto al tuo post',
}

export default async function NotificationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, actor:profiles!actor_id(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Mark as read
  const supabaseAny = supabase as any
  await supabaseAny
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-secondary px-4 py-4">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-accent-yellow" />
          <h1 className="font-display font-bold text-xl">Notifiche</h1>
        </div>
      </div>
      {!notifications || notifications.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <Bell size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-semibold text-text-secondary">Nessuna notifica</p>
          <p className="text-sm mt-1">Le interazioni appariranno qui</p>
        </div>
      ) : (
        <div>
          {notifications.map((notif: any) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 px-4 py-4 border-b border-border-secondary hover:bg-bg-hover transition-colors ${!notif.read ? 'bg-accent-yellow/3' : ''}`}
            >
              <div className="flex flex-col items-center gap-2 mt-1">
                {iconMap[notif.type as keyof typeof iconMap]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/profile/${notif.actor?.username}`}>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-bg-tertiary">
                      {notif.actor?.avatar_url ? (
                        <Image src={notif.actor.avatar_url} alt="" width={32} height={32} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-accent-yellow/20 flex items-center justify-center text-accent-yellow text-xs font-bold">
                          {(notif.actor?.display_name || '?')[0]}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/profile/${notif.actor?.username}`} className="font-semibold text-sm hover:underline">
                      {notif.actor?.display_name}
                    </Link>{' '}
                    <span className="text-text-secondary text-sm">
                      {labelMap[notif.type as keyof typeof labelMap]}
                    </span>
                  </div>
                </div>
                <p className="text-text-muted text-xs">{formatDate(notif.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
