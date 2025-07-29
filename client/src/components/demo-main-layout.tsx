import { ReactNode } from 'react';
import { DemoHeader } from './demo-header';
import { MobileNavigation } from './mobile-navigation';

interface DemoMainLayoutProps {
  children: ReactNode;
}

export function DemoMainLayout({ children }: DemoMainLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DemoHeader />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      <MobileNavigation />
    </div>
  );
}