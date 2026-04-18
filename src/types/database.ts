export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          banner_url: string | null
          website: string | null
          location: string | null
          followers_count: number
          following_count: number
          posts_count: number
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'followers_count' | 'following_count' | 'posts_count' | 'verified' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          media_urls: string[] | null
          media_types: string[] | null
          hashtags: string[] | null
          likes_count: number
          reposts_count: number
          comments_count: number
          views_count: number
          is_repost: boolean
          repost_of: string | null
          reply_to: string | null
          engagement_score: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'likes_count' | 'reposts_count' | 'comments_count' | 'views_count' | 'engagement_score' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }
      likes: {
        Row: { id: string; user_id: string; post_id: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['likes']['Row'], 'id' | 'created_at'>
        Update: never
      }
      reposts: {
        Row: { id: string; user_id: string; post_id: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['reposts']['Row'], 'id' | 'created_at'>
        Update: never
      }
      follows: {
        Row: { id: string; follower_id: string; following_id: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['follows']['Row'], 'id' | 'created_at'>
        Update: never
      }
      hashtags: {
        Row: { id: string; tag: string; posts_count: number; updated_at: string }
        Insert: Omit<Database['public']['Tables']['hashtags']['Row'], 'id' | 'posts_count' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['hashtags']['Insert']>
      }
      conversations: {
        Row: { id: string; created_at: string; updated_at: string }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: never
      }
      conversation_participants: {
        Row: { id: string; conversation_id: string; user_id: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['conversation_participants']['Row'], 'id' | 'created_at'>
        Update: never
      }
      messages: {
        Row: { id: string; conversation_id: string; sender_id: string; content: string; read: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'read' | 'created_at'>
        Update: Partial<Pick<Database['public']['Tables']['messages']['Row'], 'read'>>
      }
      notifications: {
        Row: { id: string; user_id: string; actor_id: string; type: 'like' | 'repost' | 'follow' | 'mention' | 'reply'; post_id: string | null; read: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'read' | 'created_at'>
        Update: Partial<Pick<Database['public']['Tables']['notifications']['Row'], 'read'>>
      }
    }
    Views: {}
    Functions: {
      get_for_you_feed: {
        Args: { p_user_id: string; p_limit: number; p_offset: number }
        Returns: Database['public']['Tables']['posts']['Row'][]
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row'] & { profiles?: Profile; liked?: boolean; reposted?: boolean }
export type Like = Database['public']['Tables']['likes']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type Hashtag = Database['public']['Tables']['hashtags']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
