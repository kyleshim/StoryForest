import { ReactNode } from 'react';
import { Header } from './header';
import { MobileNavigation } from './mobile-navigation';
import { ChildWithStats } from '@shared/schema';

interface MainLayoutProps {
  children: ReactNode;
  childId?: number;
}

export function MainLayout({ children, childId }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 to-emerald-50">
      <Header />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      <MobileNavigation childId={childId} />
    </div>
  );
}
