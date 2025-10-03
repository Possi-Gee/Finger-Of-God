
import { BottomNavbar } from '@/components/bottom-navbar';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Spacer for bottom navbar on mobile */}
      <div className="pb-16 md:hidden"></div>
      {/* Mobile-only bottom navbar */}
      <BottomNavbar />
    </div>
  );
}
