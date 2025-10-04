'use client'

import { Play, Share2, Heart } from 'lucide-react'
import Link from 'next/link'

interface AudioCardProps {
  post: {
    duaNumber: number | null
    titleAr: string
    slug: string
    audioDuration: number
    reciterName?: string | null
    viewCount?: number
    category: {
      nameAr: string
      color: string | null
    }
  }
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function AudioCard({ post }: AudioCardProps) {
  const postUrl = `/listen/${post.duaNumber || 0}/${post.slug}`

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // منطق التشغيل - سيتم تطويره لاحقاً
    console.log('Playing:', post.titleAr)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: post.titleAr,
        url: `${window.location.origin}${postUrl}`
      }).catch(() => {})
    }
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // منطق المفضلة - سيتم تطويره لاحقاً
    console.log('Added to favorites:', post.titleAr)
  }

  return (
    <Link href={postUrl} className="block">
      <div className="group flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-primary/20 cursor-pointer">
        {/* Play Button */}
        <button 
          onClick={handlePlay}
          className="shrink-0 w-12 h-12 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white flex items-center justify-center transition-all"
        >
          <Play className="h-5 w-5 mr-0.5" fill="currentColor" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 mb-1">
            {post.titleAr}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            {post.reciterName && (
              <span className="line-clamp-1">{post.reciterName}</span>
            )}
            {post.viewCount !== undefined && post.viewCount > 0 && (
              <>
                <span>•</span>
                <span>{post.viewCount.toLocaleString('ar-SA')} استماع</span>
              </>
            )}
          </div>
        </div>

        {/* Duration & Actions */}
        <div className="shrink-0 flex items-center gap-2">
          <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {formatDuration(post.audioDuration)}
          </div>
          
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
            title="مشاركة"
          >
            <Share2 className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleFavorite}
            className="w-9 h-9 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            title="إضافة للمفضلة"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}
