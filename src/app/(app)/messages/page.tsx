import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MessagesClient from './MessagesClient'

export default async function MessagesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: participations } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id)

  const convIds = ((participations ?? []) as { conversation_id: string }[]).map(
    (p) => p.conversation_id
  )

  let conversations: any[] = []
  if (convIds.length > 0) {
    const { data } = await supabase
      .from('conversations')
      .select(`
        id,
        updated_at,
        conversation_participants(user_id, profiles(*)),
        messages(content, created_at, sender_id, read)
      `)
      .in('id', convIds)
      .order('updated_at', { ascending: false })
    conversations = (data as any[]) || []
  }

  return <MessagesClient conversations={conversations} currentUserId={user.id} />
}
