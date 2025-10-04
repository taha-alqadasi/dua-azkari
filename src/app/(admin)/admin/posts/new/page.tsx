'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import PostForm from '@/components/admin/PostForm'
import { PageLoading } from '@/components/shared/Loading'

export default function NewPostPage() {
  const { hasPermission, isLoading } = useAuth()
  const router = useRouter()
  const canCreate = hasPermission('posts.create')

  useEffect(() => {
    if (!isLoading && !canCreate) {
      router.push('/admin/posts')
    }
  }, [canCreate, isLoading, router])

  if (isLoading) {
    return <PageLoading />
  }

  if (!canCreate) {
    return null
  }

  return <PostForm />
}
