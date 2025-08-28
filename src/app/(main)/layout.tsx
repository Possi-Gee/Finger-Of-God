
import { BottomNavbar } from '@/components/bottom-navbar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <main className="flex-1 pb-16">{children}</main>
      <BottomNavbar />
    </div>
  );
}
