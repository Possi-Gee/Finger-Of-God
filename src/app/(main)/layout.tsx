
import { BottomNavbar } from '@/components/bottom-navbar';
import { Footer } from '@/components/footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <main className="flex-1">{children}</main>
      <Footer />
      <div className="pb-16"></div>
      <BottomNavbar />
    </div>
  );
}
