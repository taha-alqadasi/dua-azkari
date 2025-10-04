'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Play,
  Share2,
  Heart,
  Clock,
  User,
  Eye,
  Volume2,
  Download,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Post {
  id: string
  duaNumber: number
  titleAr: string
  slug: string
  description: string | null
  thumbnailUrl: string | null
  audioDuration: number
  reciterName: string | null
  viewCount: number
  downloadCount: number
  publishedAt: Date
  category: {
    nameAr: string
    slug: string
    color: string
  }
}

interface PostsClientProps {
  initialPosts: Post[]
  settings: any
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function PostsClient({ initialPosts, settings }: PostsClientProps) {
  const { audioPage } = settings
  const [displayCount, setDisplayCount] = useState(audioPage.postsPerPage || 12)
  const [loadingMore, setLoadingMore] = useState(false)

  const displayedPosts = initialPosts.slice(0, displayCount)

  const handleLoadMore = () => {
    setLoadingMore(true)
    setTimeout(() => {
      const increment = audioPage.postsPerPage || 12
      setDisplayCount(prev => Math.min(prev + increment, initialPosts.length))
      setLoadingMore(false)
    }, 300)
  }

  // تحديد عدد الأعمدة بناءً على التخطيط
  const gridColsClassMap: Record<string, string> = {
    'single-column': 'grid-cols-1',
    'two-columns': 'grid-cols-1 md:grid-cols-2',
    'three-columns': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    'four-columns': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    'masonry': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    'grid-auto': 'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]',
    'grid-layout': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
    'list-view': 'grid-cols-1',
    'timeline': 'grid-cols-1 max-w-4xl mx-auto',
    'carousel': 'grid-cols-1'
  }
  
  const gridColsClass = gridColsClassMap[audioPage?.pageLayout] || 'grid-cols-1 md:grid-cols-2'

  return (
    <>
      {/* Header Ad */}
      {audioPage.ads?.enabled && audioPage.ads.headerAd?.enabled && audioPage.ads.headerAd.code && (
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center">
            <div dangerouslySetInnerHTML={{ __html: audioPage.ads.headerAd.code || '' }} />
          </div>
        </div>
      )}

      {/* Page Title */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-teal-600 rounded-2xl mb-3 shadow-lg">
              <Volume2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{audioPage.pageTitle}</h1>
            <p className="text-gray-600">
              {audioPage.pageDescription || `استمع إلى ${initialPosts.length} مقطع صوتي من الأدعية والأذكار`}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              <span className="font-bold text-2xl text-gray-900">{initialPosts.length}</span>
              <span className="text-gray-600">مقطع صوتي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {initialPosts.length === 0 ? (
          <Card className="p-16 text-center bg-white/90 backdrop-blur-sm shadow-xl">
            <Volume2 className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              لا توجد مقاطع صوتية
            </h3>
            <p className="text-gray-600 mb-6">
              سيتم إضافة المقاطع الصوتية قريباً
            </p>
            <Link href="/">
              <Button size="lg" className="shadow-lg">
                العودة للرئيسية
              </Button>
            </Link>
          </Card>
        ) : (
          <div className={`grid ${gridColsClass} gap-6`}>
            {displayedPosts.map((post, index) => {
              // عرض الإعلان بين المقاطع
              const showAdAfter = audioPage.ads?.enabled && 
                                 audioPage.ads.betweenPostsAd?.enabled && 
                                 audioPage.ads.betweenPostsAd.code &&
                                 (index + 1) % (audioPage.ads.betweenPostsAd.showAfterItems || 6) === 0

              return (
                <React.Fragment key={post.id}>
                  <Card 
                    className={`group bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary/30 hover:-translate-y-1 ${
                      audioPage.displayStyle === 'compact' ? 'h-auto' : 
                      audioPage.displayStyle === 'detailed' ? 'h-full' : 
                      audioPage.displayStyle === 'minimal' ? 'shadow-sm hover:shadow-md' :
                      audioPage.displayStyle === 'elegant' ? 'border border-gray-200' : ''
                    }`}
                  >
                    <Link href={`/listen/${post.duaNumber}/${post.slug}`}>
                      {/* Thumbnail - فقط في نمط البطاقات والتفصيلي والأنيق */}
                      {!['compact', 'minimal'].includes(audioPage.displayStyle) && (
                        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-teal-50 overflow-hidden">
                          {post.thumbnailUrl ? (
                            <img 
                              src={post.thumbnailUrl}
                              alt={post.titleAr}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary/30 text-6xl">
                              🕌
                            </div>
                          )}
                          
                          {/* Play Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                              <Play className="h-8 w-8 mr-1" fill="currentColor" />
                            </div>
                          </div>

                          {/* Category Badge */}
                          {audioPage.showCategory && (
                            <div className="absolute top-3 right-3">
                              <span 
                                className="inline-flex items-center px-3 py-1 text-white rounded-full text-xs font-bold shadow-lg backdrop-blur-sm"
                                style={{ backgroundColor: post.category.color || '#1e9e94' }}
                              >
                                {post.category.nameAr}
                              </span>
                            </div>
                          )}

                          {/* Prayer Number Badge */}
                          <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center px-2.5 py-1 bg-white/90 backdrop-blur-sm text-primary rounded-full text-xs font-bold shadow-lg">
                              #{post.duaNumber}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className={`p-4 ${['compact', 'minimal'].includes(audioPage.displayStyle) ? 'flex items-center gap-4' : ''}`}>
                        {/* Compact/Minimal: Play button على اليسار */}
                        {['compact', 'minimal'].includes(audioPage.displayStyle) && (
                          <div className="shrink-0">
                            {audioPage.displayStyle === 'minimal' ? (
                              post.thumbnailUrl ? (
                                <img 
                                  src={post.thumbnailUrl}
                                  alt={post.titleAr}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-teal-50 flex items-center justify-center">
                                  <Volume2 className="h-8 w-8 text-primary/40" />
                                </div>
                              )
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-all shadow-lg">
                                <Play className="h-6 w-6 mr-1" fill="currentColor" />
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className={`font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 ${
                            audioPage.displayStyle === 'compact' ? 'text-base line-clamp-1' : 
                            audioPage.displayStyle === 'minimal' ? 'text-sm line-clamp-1' :
                            audioPage.displayStyle === 'detailed' ? 'text-xl leading-relaxed' : 
                            audioPage.displayStyle === 'elegant' ? 'text-lg font-serif' :
                            'text-lg line-clamp-2 leading-relaxed min-h-[3.5rem]'
                          }`}>
                            {post.titleAr}
                          </h3>

                          {audioPage.displayStyle === 'detailed' && post.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                              {post.description}
                            </p>
                          )}

                          {/* Meta Info */}
                          <div className="space-y-2 mb-3">
                            {audioPage.showReciterName && post.reciterName && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="h-4 w-4 shrink-0" />
                                <span className="line-clamp-1">{post.reciterName}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                              {audioPage.showDuration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDuration(post.audioDuration)}</span>
                                </div>
                              )}

                              {audioPage.showViewCount && post.viewCount > 0 && (
                                <>
                                  {audioPage.showDuration && <span>•</span>}
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    <span>{post.viewCount.toLocaleString('ar-SA')}</span>
                                  </div>
                                </>
                              )}

                              {audioPage.showDownloadCount && post.downloadCount > 0 && (
                                <>
                                  {(audioPage.showDuration || audioPage.showViewCount) && <span>•</span>}
                                  <div className="flex items-center gap-1">
                                    <Download className="h-4 w-4" />
                                    <span>{post.downloadCount.toLocaleString('ar-SA')}</span>
                                  </div>
                                </>
                              )}

                              {audioPage.showDate && post.publishedAt && (
                                <>
                                  {(audioPage.showDuration || audioPage.showViewCount || audioPage.showDownloadCount) && <span>•</span>}
                                  <span className="text-xs">{formatDate(post.publishedAt)}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Category في النمط المدمج */}
                          {audioPage.displayStyle === 'compact' && audioPage.showCategory && (
                            <div className="mb-2">
                              <span 
                                className="inline-flex items-center px-2 py-1 text-white rounded-full text-xs font-bold"
                                style={{ backgroundColor: post.category.color || '#1e9e94' }}
                              >
                                {post.category.nameAr}
                              </span>
                            </div>
                          )}

                          {/* Meta Actions - في النمط التفصيلي فقط */}
                          {audioPage.displayStyle === 'detailed' && (
                            <div className="flex items-center gap-3 pt-3 border-t text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Play className="h-4 w-4" />
                                <span>استماع</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Share2 className="h-4 w-4" />
                                <span>مشاركة</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                <span>حفظ</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </Card>

                  {/* Between Posts Ad */}
                  {showAdAfter && (
                    <div className="col-span-full flex justify-center py-4">
                      <div dangerouslySetInnerHTML={{ __html: audioPage.ads.betweenPostsAd.code || '' }} />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}

        {/* Load More Button */}
        {audioPage.enableLoadMore && displayCount < initialPosts.length && (
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="shadow-lg min-w-[200px]"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  جاري التحميل...
                </>
              ) : (
                <>
                  {audioPage.loadMoreButtonText || 'عرض المزيد'}
                  <span className="mr-2 text-sm text-gray-500">
                    ({initialPosts.length - displayCount} متبقي)
                  </span>
                </>
              )}
            </Button>
          </div>
        )}
      </main>

      {/* Footer Ad */}
      {audioPage.ads?.enabled && audioPage.ads.footerAd?.enabled && audioPage.ads.footerAd.code && (
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center">
            <div dangerouslySetInnerHTML={{ __html: audioPage.ads.footerAd.code || '' }} />
          </div>
        </div>
      )}
    </>
  )
}

