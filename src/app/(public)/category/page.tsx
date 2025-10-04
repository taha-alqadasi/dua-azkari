import { redirect } from 'next/navigation'

export default function CategoryPage() {
  // إعادة توجيه المستخدم إلى صفحة جميع التصنيفات
  redirect('/categories')
}

