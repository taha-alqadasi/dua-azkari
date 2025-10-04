import { redirect } from 'next/navigation'

export default function TagPage() {
  // إعادة توجيه المستخدم إلى صفحة جميع الوسوم
  redirect('/tags')
}

