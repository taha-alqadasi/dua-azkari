import { redirect } from 'next/navigation'

export default function ListenPage() {
  // إعادة توجيه المستخدم إلى صفحة جميع المقاطع
  redirect('/listen-all')
}

