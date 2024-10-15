'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ServerTimeDisplay from "./components/ServerTimeDisplay";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">서버 시간 알림</h1>
        <ServerTimeDisplay />
      </main>
    </QueryClientProvider>
  );
}
