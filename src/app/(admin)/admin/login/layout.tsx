import type { Metadata } from "next";
import { SessionProvider } from '@/components/providers/SessionProvider'

export const metadata: Metadata = {
  title: "تسجيل الدخول - دعاء أذكاري",
  description: "تسجيل الدخول إلى لوحة تحكم دعاء أذكاري",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </SessionProvider>
  );
}