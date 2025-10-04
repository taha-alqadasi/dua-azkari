// أنواع الإعلانات
export interface AdsSettings {
  // تفعيل/تعطيل
  enabled: boolean
  
  // معرفات الناشر
  googleAdSenseId: string // ca-pub-xxxxxxxxxxxxxxxx
  
  // إعدادات Lazy Loading
  lazyLoad: boolean
  lazyLoadThreshold: number // بالبكسل (مثلاً 200px قبل الظهور)
  
  // إعدادات الصفحات
  pages: {
    home: AdsPageSettings
    post: AdsPageSettings
    category: AdsPageSettings
    tag: AdsPageSettings
    search: AdsPageSettings
  }
}

export interface AdsPageSettings {
  enabled: boolean
  slots: AdsSlot[]
}

export interface AdsSlot {
  id: string
  position: 'header' | 'sidebar' | 'in-content' | 'footer' | 'between-posts' | 'custom'
  customPosition?: string // للمواقع المخصصة
  adUnitId: string // ca-pub-xxx/xxxxxxx
  format: 'auto' | 'rectangle' | 'vertical' | 'horizontal' | 'fluid'
  width?: number
  height?: number
  responsive: boolean
  enabled: boolean
  // Index للترتيب
  orderIndex: number
  // عرض بعد كل X عنصر (للـ between-posts)
  afterEvery?: number
}

// القيم الافتراضية
export const defaultAdsSettings: AdsSettings = {
  enabled: false,
  googleAdSenseId: '',
  lazyLoad: true,
  lazyLoadThreshold: 200,
  pages: {
    home: {
      enabled: false,
      slots: []
    },
    post: {
      enabled: false,
      slots: []
    },
    category: {
      enabled: false,
      slots: []
    },
    tag: {
      enabled: false,
      slots: []
    },
    search: {
      enabled: false,
      slots: []
    }
  }
}

