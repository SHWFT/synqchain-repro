'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

export default function LoginPage() {
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // fake auth for demo
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center saas-gradient-bg">
      <div className="max-w-lg w-full space-y-8 p-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-white via-gray-50 to-gray-200 rounded-2xl flex items-center justify-center mb-8 shadow-lg border border-gray-200">
            <img
              src="/brand/synqchain-new-logo.png"
              alt="Syncd"
              width={48}
              height={48}
            />
          </div>
          <p className="text-lg mb-2 saas-tagline">
            Supply Chain. Perfected. Syncd.
          </p>
          <p className="text-sm saas-subtitle">
            Next-generation procurement intelligence platform
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  defaultValue="demo@demo.com"
                  type="email"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  defaultValue="demo"
                  type="password"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-slate-900 hover:bg-slate-800 text-white py-3 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Access Platform
            </button>

            <div className="mt-6 text-center">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">Demo Access</p>
                <p className="text-xs text-blue-600">demo@demo.com / demo</p>
              </div>
            </div>
          </div>
        </form>

        <div className="grid grid-cols-3 gap-4 mt-8 text-center">
          <div className="text-gray-600">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-xs">Analytics</div>
          </div>
          <div className="text-gray-600">
            <div className="text-2xl mb-1">🤖</div>
            <div className="text-xs">AI Assistant</div>
          </div>
          <div className="text-gray-600">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs">Real-time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
