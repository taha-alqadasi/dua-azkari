'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import PostForm from '@/components/admin/PostForm'
import { PageLoading } from '@/components/shared/Loading'
import { Loader2 } from 'lucide-react'

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const { hasPermission, isLoading: authLoading } = useAuth()
  const postId = params.id as string

  const [postData, setPostData] = useState<any>(null)
  const [postTags, setPostTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const canEdit = hasPermission('posts.update')

  useEffect(() => {
    if (!authLoading && !canEdit) {
      router.push('/admin/posts')
      return
    }

    if (!authLoading && canEdit) {
      fetchPost()
    }
  }, [authLoading, canEdit, postId, router])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const post = result.data
          
          // تحويل البيانات للصيغة المطلوبة
          setPostData({
            titleAr: post.titleAr || '',
            titleEn: post.titleEn || '',
            slug: post.slug || '',
            duaNumber: post.duaNumber,
            description: post.description || '',
            content: post.content || '',
            audioUrl: post.audioUrl || '',
            audioDuration: post.audioDuration || 0,
            audioFileSize: parseInt(post.audioFileSize) || 0,
            thumbnailUrl: post.thumbnailUrl || '',
            reciterName: post.reciterName || '',
            status: post.status || 'DRAFT',
            isFeatured: post.isFeatured || false,
            categoryId: post.categoryId || '',
            seoTitle: post.seoTitle || '',
            seoDescription: post.seoDescription || '',
            seoKeywords: post.seoKeywords || '',
          })

          // جمع IDs الوسوم
          const tagIds = post.tags?.map((pt: any) => pt.tag.id) || []
          setPostTags(tagIds)
        } else {
          setError('فشل في جلب بيانات المنشور')
        }
      } else {
        setError('المنشور غير موجود')
      }
    } catch (err) {
      console.error('خطأ في جلب المنشور:', err)
      setError('حدث خطأ أثناء جلب البيانات')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return <PageLoading />
  }

  if (!canEdit) {
    return null
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/posts')}
            className="text-blue-600 hover:underline"
          >
            العودة للمنشورات
          </button>
        </div>
      </div>
    )
  }

  if (!postData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <PostForm
      postId={postId}
      initialData={postData}
      initialTags={postTags}
    />
  )
}
