import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import RightPanel from '@/components/layout/RightPanel'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-[1280px] mx-auto flex">
        {/* Left sidebar */}
        <aside className="w-[72px] xl:w-[260px] sticky top-0 h-screen flex-shrink-0">
          <Sidebar profile={profile} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 border-x border-border-secondary">
          {children}
        </main>

        {/* Right panel */}
        <aside className="w-[320px] hidden lg:block flex-shrink-0">
          <RightPanel currentUserId={user.id} />
        </aside>
      </div>
    </div>
  )
}
