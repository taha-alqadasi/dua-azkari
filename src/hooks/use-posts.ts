import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PostService } from '@/services/post.service'
import { 
  PostWithRelations, 
  CreatePostData, 
  UpdatePostData, 
  PostFilters,
  PaginationParams 
} from '@/types'

// Query keys
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: PostFilters & PaginationParams) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  featured: () => [...postKeys.all, 'featured'] as const,
  related: (id: string) => [...postKeys.all, 'related', id] as const,
}

// Get posts with pagination and filters
export function usePosts(params: PostFilters & PaginationParams) {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => PostService.getPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single post
export function usePost(identifier: string) {
  return useQuery({
    queryKey: postKeys.detail(identifier),
    queryFn: () => PostService.getPost(identifier),
    enabled: !!identifier,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Get featured posts
export function useFeaturedPosts(limit = 6) {
  return useQuery({
    queryKey: postKeys.featured(),
    queryFn: () => PostService.getFeaturedPosts(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Get related posts
export function useRelatedPosts(postId: string, limit = 4) {
  return useQuery({
    queryKey: postKeys.related(postId),
    queryFn: () => PostService.getRelatedPosts(postId, limit),
    enabled: !!postId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Create post mutation
export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, authorId }: { data: CreatePostData; authorId: string }) =>
      PostService.createPost(data, authorId),
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
      queryClient.invalidateQueries({ queryKey: postKeys.featured() })
    },
  })
}

// Update post mutation
export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdatePostData) => PostService.updatePost(data),
    onSuccess: (updatedPost) => {
      // Update the specific post in cache
      queryClient.setQueryData(
        postKeys.detail(updatedPost.id),
        updatedPost
      )
      
      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
      queryClient.invalidateQueries({ queryKey: postKeys.featured() })
    },
  })
}

// Delete post mutation
export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => PostService.deletePost(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: postKeys.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
      queryClient.invalidateQueries({ queryKey: postKeys.featured() })
    },
  })
}

// Increment view count mutation
export function useIncrementViewCount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => PostService.incrementViewCount(id),
    onSuccess: (_, postId) => {
      // Update view count in cache
      queryClient.setQueryData(
        postKeys.detail(postId),
        (oldData: PostWithRelations | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              viewCount: oldData.viewCount + 1
            }
          }
          return oldData
        }
      )
    },
  })
}

// Increment download count mutation
export function useIncrementDownloadCount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => PostService.incrementDownloadCount(id),
    onSuccess: (_, postId) => {
      // Update download count in cache
      queryClient.setQueryData(
        postKeys.detail(postId),
        (oldData: PostWithRelations | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              downloadCount: oldData.downloadCount + 1
            }
          }
          return oldData
        }
      )
    },
  })
}

// Check slug availability
export function useCheckSlugAvailability() {
  return useMutation({
    mutationFn: ({ slug, excludeId }: { slug: string; excludeId?: string }) =>
      PostService.isSlugAvailable(slug, excludeId),
  })
}

// Generate unique slug
export function useGenerateUniqueSlug() {
  return useMutation({
    mutationFn: ({ baseSlug, excludeId }: { baseSlug: string; excludeId?: string }) =>
      PostService.generateUniqueSlug(baseSlug, excludeId),
  })
}
