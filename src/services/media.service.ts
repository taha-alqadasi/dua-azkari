import { prisma } from '@/lib/prisma'
import { MediaLibrary, MediaType } from '@prisma/client'
import { PaginatedResponse, PaginationParams } from '@/types'
import fs from 'fs/promises'
import path from 'path'

export interface MediaFilters {
  fileType?: MediaType
  uploadedBy?: string
  search?: string
}

export interface UploadedFile {
  fileName: string
  fileType: MediaType
  mimeType: string
  fileSize: number
  fileUrl: string
  altText?: string
  caption?: string
  width?: number
  height?: number
  duration?: number
}

export class MediaService {
  /**
   * Get paginated media files with filters
   */
  static async getMediaFiles(
    params: PaginationParams & MediaFilters
  ): Promise<PaginatedResponse<MediaLibrary>> {
    const {
      page = 1,
      limit = 20,
      search,
      fileType,
      uploadedBy,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params

    const skip = (page - 1) * limit

    // Build where clause
    const where: {
      OR?: Array<{ [key: string]: { contains: string; mode: string } }>
      fileType?: MediaType
      uploadedBy?: string
    } = {}
    
    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (fileType) where.fileType = fileType
    if (uploadedBy) where.uploadedBy = uploadedBy

    // Get media files
    const [mediaFiles, total] = await Promise.all([
      prisma.mediaLibrary.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.mediaLibrary.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      data: mediaFiles,
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

  /**
   * Get single media file by ID
   */
  static async getMediaFile(id: string): Promise<MediaLibrary | null> {
    return await prisma.mediaLibrary.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  /**
   * Create media file record
   */
  static async createMediaFile(
    data: UploadedFile,
    uploadedBy: string
  ): Promise<MediaLibrary> {
    return await prisma.mediaLibrary.create({
      data: {
        ...data,
        uploadedBy
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  /**
   * Update media file metadata
   */
  static async updateMediaFile(
    id: string,
    data: Partial<Pick<MediaLibrary, 'altText' | 'caption' | 'fileName'>>
  ): Promise<MediaLibrary> {
    return await prisma.mediaLibrary.update({
      where: { id },
      data,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  /**
   * Delete media file
   */
  static async deleteMediaFile(id: string): Promise<void> {
    const mediaFile = await prisma.mediaLibrary.findUnique({
      where: { id }
    })

    if (!mediaFile) {
      throw new Error('Media file not found')
    }

    // Delete physical file
    try {
      const filePath = path.join(process.cwd(), 'public', mediaFile.fileUrl)
      await fs.unlink(filePath)
    } catch (error) {
      console.warn('Failed to delete physical file:', error)
    }

    // Delete database record
    await prisma.mediaLibrary.delete({
      where: { id }
    })
  }

  /**
   * Get media statistics
   */
  static async getMediaStats() {
    const [
      totalFiles,
      totalSize,
      fileTypeStats,
      recentUploads
    ] = await Promise.all([
      prisma.mediaLibrary.count(),
      prisma.mediaLibrary.aggregate({
        _sum: {
          fileSize: true
        }
      }),
      prisma.mediaLibrary.groupBy({
        by: ['fileType'],
        _count: {
          fileType: true
        },
        _sum: {
          fileSize: true
        }
      }),
      prisma.mediaLibrary.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: {
            select: {
              name: true
            }
          }
        }
      })
    ])

    return {
      totalFiles,
      totalSize: totalSize._sum.fileSize || 0,
      fileTypeStats: fileTypeStats.map(stat => ({
        type: stat.fileType,
        count: stat._count.fileType,
        size: stat._sum.fileSize || 0
      })),
      recentUploads
    }
  }

  /**
   * Validate file type
   */
  static validateFileType(mimeType: string): MediaType | null {
    const audioTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/m4a'
    ]

    const imageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ]

    const videoTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm'
    ]

    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]

    if (audioTypes.includes(mimeType)) return MediaType.AUDIO
    if (imageTypes.includes(mimeType)) return MediaType.IMAGE
    if (videoTypes.includes(mimeType)) return MediaType.VIDEO
    if (documentTypes.includes(mimeType)) return MediaType.DOCUMENT

    return null
  }

  /**
   * Generate unique filename
   */
  static generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = path.extname(originalName)
    const baseName = path.basename(originalName, extension)
    
    return `${baseName}-${timestamp}-${random}${extension}`
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Format duration (seconds to mm:ss)
   */
  static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}
