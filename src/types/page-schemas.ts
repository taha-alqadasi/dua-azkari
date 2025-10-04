// أنواع الصفحات المتاحة
export type PageTemplate =
  | 'default'          // صفحة عادية
  | 'faq'              // أسئلة وأجوبة
  | 'contact'          // صفحة اتصل بنا
  | 'about'            // من نحن
  | 'terms'            // شروط وأحكام
  | 'privacy'          // سياسة الخصوصية

// Schema للأسئلة الشائعة (FAQ)
export interface FAQItem {
  id: string
  question: string
  answer: string
  category?: string
  order: number
}

export interface FAQSchema {
  faqs: FAQItem[]
  introduction?: string
  contactCTA?: string
}

// Schema لصفحة اتصل بنا
export interface ContactInfo {
  phone?: string
  email?: string
  address?: string
  socialMedia?: {
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
  }
}

export interface ContactSchema {
  introduction: string
  contactInfo: ContactInfo
  showContactForm: boolean
  mapEmbedUrl?: string
  workingHours?: string
}

// Schema لصفحة من نحن
export interface AboutSection {
  id: string
  title: string
  content: string
  icon?: string
  order: number
}

export interface AboutSchema {
  introduction: string
  vision?: string
  mission?: string
  values?: AboutSection[]
  team?: {
    name: string
    role: string
    image?: string
    bio?: string
  }[]
}

// Schema للشروط والأحكام / سياسة الخصوصية
export interface LegalSection {
  id: string
  title: string
  content: string
  subsections?: {
    title: string
    content: string
  }[]
  order: number
}

export interface LegalSchema {
  introduction: string
  lastUpdated: string
  sections: LegalSection[]
  contactInfo?: string
}

// الـ Schema الموحد
export type PageSchema = 
  | { type: 'default'; content: string }
  | { type: 'faq'; data: FAQSchema }
  | { type: 'contact'; data: ContactSchema }
  | { type: 'about'; data: AboutSchema }
  | { type: 'legal'; data: LegalSchema }

// Schema.org Structured Data
export interface StructuredDataFAQ {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: {
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }[]
}

export interface StructuredDataOrganization {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  url: string
  logo: string
  contactPoint?: {
    '@type': 'ContactPoint'
    telephone: string
    contactType: string
    email: string
  }
}

