'use client'

import Link from 'next/link'
import { Play } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { 
  FolderOpen, 
  Star, 
  Heart, 
  Bookmark, 
  Sparkles 
} from 'lucide-react'
import type { RelatedPostsCardSettings } from '@/types/post-settings.types'

interface RelatedPost {
  id: string
  duaNumber: number
  titleAr: string
  slug: string
  audioDuration: number
  reciterName: string | null
}

interface RelatedPostsCardProps {
  relatedPosts: RelatedPost[]
  settings: RelatedPostsCardSettings
}

const iconComponents = {
  folder: FolderOpen,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  sparkles: Sparkles,
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function RelatedPostsCard({ relatedPosts, settings }: RelatedPostsCardProps) {
  if (!settings.enabled || relatedPosts.length === 0) {
    return null
  }

  const IconComponent = iconComponents[settings.icon]
  const displayedPosts = relatedPosts.slice(0, settings.maxPosts)

  // وظيفة لعرض نمط العرض المدمج (Compact)
  const renderCompactStyle = (relatedPost: RelatedPost) => (
    <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
      <button className="shrink-0 w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-all">
        <Play className="h-4 w-4 mr-0.5" fill="currentColor" />
      </button>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-0.5">
          {relatedPost.titleAr}
        </h3>
        {settings.showReciterName && relatedPost.reciterName && (
          <p className="text-xs text-gray-600 line-clamp-1">
            {relatedPost.reciterName}
          </p>
        )}
      </div>
      {settings.showDuration && (
        <div className="shrink-0 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
          {formatDuration(relatedPost.audioDuration)}
        </div>
      )}
    </div>
  )

  // وظيفة لعرض نمط البطاقات (Card)
  const renderCardStyle = (relatedPost: RelatedPost) => (
    <div className="group p-4 rounded-xl border-2 border-gray-100 hover:border-primary hover:shadow-md transition-all cursor-pointer bg-white">
      <div className="flex items-start gap-3">
        <button className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary group-hover:to-primary/90 text-primary group-hover:text-white flex items-center justify-center transition-all">
          <Play className="h-5 w-5 mr-0.5" fill="currentColor" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {relatedPost.titleAr}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {settings.showReciterName && relatedPost.reciterName && (
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                {relatedPost.reciterName}
              </span>
            )}
            {settings.showDuration && (
              <span className="text-xs text-gray-600 bg-primary/10 px-2 py-1 rounded-full">
                ⏱️ {formatDuration(relatedPost.audioDuration)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // وظيفة لعرض النمط التفصيلي (Detailed)
  const renderDetailedStyle = (relatedPost: RelatedPost) => (
    <div className="group p-5 rounded-2xl border-2 border-gray-100 hover:border-primary hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <button className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Play className="h-6 w-6 mr-0.5" fill="currentColor" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-1">
              {relatedPost.titleAr}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                رقم {relatedPost.duaNumber}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          {settings.showReciterName && relatedPost.reciterName && (
            <span className="flex-1 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
              🎙️ {relatedPost.reciterName}
            </span>
          )}
          {settings.showDuration && (
            <span className="text-sm text-gray-700 bg-primary/10 px-3 py-1.5 rounded-lg font-medium">
              ⏱️ {formatDuration(relatedPost.audioDuration)}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Card className="bg-white shadow-lg rounded-2xl overflow-hidden">
      <div className={`bg-gradient-to-r ${settings.backgroundColor} text-white p-4`}>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <IconComponent className="h-5 w-5" />
          {settings.title}
        </h2>
      </div>
      <div className={`p-${settings.displayStyle === 'detailed' ? '4' : '2'} ${settings.columnsLayout === 'double' ? 'grid grid-cols-1 md:grid-cols-2' : 'grid grid-cols-1'} gap-${settings.displayStyle === 'detailed' ? '4' : '2'}`}>
        {displayedPosts.map((relatedPost) => (
          <Link 
            key={relatedPost.id} 
            href={`/listen/${relatedPost.duaNumber}/${relatedPost.slug}`}
            className="block"
          >
            {settings.displayStyle === 'compact' && renderCompactStyle(relatedPost)}
            {settings.displayStyle === 'card' && renderCardStyle(relatedPost)}
            {settings.displayStyle === 'detailed' && renderDetailedStyle(relatedPost)}
          </Link>
        ))}
      </div>
    </Card>
  )
}

