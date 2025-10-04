import { Post, Category, Tag, User, PostStatus } from '@prisma/client'

// Extended Post types with relations
export interface PostWithRelations extends Post {
  author: User
  category: Category
  tags: (PostTag & { tag: Tag })[]
}

export interface PostTag {
  postId: string
  tagId: string
  tag: Tag
}

// Post form data
export interface CreatePostData {
  titleAr: string
  titleEn?: string
  slug: string
  description?: string
  content?: string
  audioUrl: string
  audioDuration: number
  audioFileSize: number
  thumbnailUrl?: string
  reciterName?: string
  status: PostStatus
  categoryId: string
  tagIds: string[]
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string
}

// Post filters
export interface PostFilters {
  status?: PostStatus
  categoryId?: string
  tagIds?: string[]
  authorId?: string
  isFeatured?: boolean
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

// Post statistics
export interface PostStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  archivedPosts: number
  totalViews: number
  totalDownloads: number
  avgDuration: number
  topCategories: Array<{
    category: Category
    count: number
  }>
  topTags: Array<{
    tag: Tag
    count: number
  }>
}

// Audio player types
export interface AudioPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playbackRate: number
}

export interface PlaylistItem {
  id: string
  title: string
  audioUrl: string
  duration: number
  thumbnailUrl?: string
  reciterName?: string
}
