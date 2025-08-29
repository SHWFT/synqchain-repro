import '../globals.css';
import TopNav from '../../components/TopNav';
import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <main className="h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
