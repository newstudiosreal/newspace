import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: it })
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u00C0-\u017F]+/g) || []
  return matches.map(tag => tag.slice(1).toLowerCase())
}

export function highlightHashtags(text: string): string {
  return text.replace(/#([\w\u00C0-\u017F]+)/g, '<span class="text-accent-yellow hover:underline cursor-pointer">#$1</span>')
}

export function highlightMentions(text: string): string {
  return text.replace(/@([\w]+)/g, '<span class="text-accent-yellow hover:underline cursor-pointer">@$1</span>')
}

export function renderPostContent(text: string): string {
  return highlightMentions(highlightHashtags(text))
}

export const MAX_POST_LENGTH = 280
