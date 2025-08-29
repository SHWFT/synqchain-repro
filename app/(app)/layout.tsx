"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/state/auth.store";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-400 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AppShell>
        {children}
      </AppShell>
      <Toaster position="top-right" richColors />
    </ErrorBoundary>
  );
}