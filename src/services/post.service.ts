import { prisma } from '@/lib/prisma'
import { Post, PostStatus, Prisma } from '@prisma/client'
import { PaginatedResponse, PaginationParams } from '@/types'

export interface CreatePostData {
  titleAr: string
  titleEn?: string
  slug: string
  description?: string
  content?: string
  audioUrl: string
  audioDuration?: number
  audioFileSize?: bigint
  thumbnailUrl?: string
  reciterName?: string
  status?: PostStatus
  categoryId: string
  tagIds?: string[]
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string
  publishedAt?: Date | null
}

export interface PostFilters extends PaginationParams {
  status?: PostStatus
  categoryId?: string
  authorId?: string
  isFeatured?: boolean
}

export class PostService {
  static async getPosts(filters: PostFilters): Promise<PaginatedResponse<Post>> {
    const {
      page = 1,
      limit = 12,
      search,
      status,
      categoryId,
      authorId,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters

    const skip = (page - 1) * limit
    
    // Build where clause
    const where: Prisma.PostWhereInput = {}

    if (search) {
      where.OR = [
        { titleAr: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (authorId) {
      where.authorId = authorId
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured
    }

    // Build orderBy clause
    const orderBy: Prisma.PostOrderByWithRelationInput = {}
    if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'publishedAt') {
      orderBy[sortBy] = sortOrder
    } else if (sortBy === 'viewCount' || sortBy === 'downloadCount') {
      orderBy[sortBy] = sortOrder
    } else {
      orderBy.createdAt = 'desc'
    }

    // Execute queries
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          category: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true
            }
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  nameAr: true,
                  nameEn: true
                }
              }
            }
          }
        }
      }),
      prisma.post.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }

  static async getPost(id: string): Promise<Post | null> {
    return prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            slug: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                slug: true
              }
            }
          }
        }
      }
    })
  }

  static async getPostBySlug(slug: string): Promise<Post | null> {
    return prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            slug: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                slug: true
              }
            }
          }
        }
      }
    })
  }

  static async createPost(data: CreatePostData, authorId: string): Promise<Post> {
    const { tagIds, ...postData } = data

    return prisma.post.create({
      data: {
        ...postData,
        authorId,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        tags: tagIds && tagIds.length > 0 ? {
          create: tagIds.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true
              }
            }
          }
        }
      }
    })
  }

  static async updatePost(data: UpdatePostData): Promise<Post> {
    const { id, tagIds, ...updateData } = data

    // Handle status change to published
    if (updateData.status === 'PUBLISHED') {
      const existingPost = await prisma.post.findUnique({
        where: { id },
        select: { status: true, publishedAt: true }
      })

      if (existingPost?.status !== 'PUBLISHED' && !existingPost?.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    return prisma.post.update({
      where: { id },
      data: {
        ...updateData,
        tags: tagIds ? {
          deleteMany: {},
          create: tagIds.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true
              }
            }
          }
        }
      }
    })
  }

  static async deletePost(id: string): Promise<void> {
    await prisma.post.delete({
      where: { id }
    })
  }

  static async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!existingPost) return true
    if (excludeId && existingPost.id === excludeId) return true
    
    return false
  }

  static async generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug
    let counter = 1

    while (!(await this.isSlugAvailable(slug, excludeId))) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  static async incrementViewCount(id: string): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })
  }

  static async incrementDownloadCount(id: string): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    })
  }

  static async getRelatedPosts(postId: string, limit: number = 5): Promise<Post[]> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { categoryId: true }
    })

    if (!post) return []

    return prisma.post.findMany({
      where: {
        categoryId: post.categoryId,
        id: { not: postId },
        status: 'PUBLISHED'
      },
      take: limit,
      orderBy: {
        viewCount: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true
          }
        }
      }
    })
  }

  static async getFeaturedPosts(limit: number = 6): Promise<Post[]> {
    return prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        isFeatured: true
      },
      take: limit,
      orderBy: {
        publishedAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true
          }
        }
      }
    })
  }

  static async getPopularPosts(limit: number = 6): Promise<Post[]> {
    return prisma.post.findMany({
      where: {
        status: 'PUBLISHED'
      },
      take: limit,
      orderBy: [
        { viewCount: 'desc' },
        { downloadCount: 'desc' }
      ],
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true
          }
        }
      }
    })
  }

  static async getRecentPosts(limit: number = 6): Promise<Post[]> {
    return prisma.post.findMany({
      where: {
        status: 'PUBLISHED'
      },
      take: limit,
      orderBy: {
        publishedAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true
          }
        }
      }
    })
  }
}