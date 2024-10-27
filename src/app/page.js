'use client';

import dynamic from 'next/dynamic'

// TikTokItemManagerを動的にインポート
const TikTokItemManager = dynamic(
  () => import('../components/TikTokItemManager'),
  { ssr: false } // サーバーサイドレンダリングを無効化
);

export default function Home() {
  return (
    <main className="min-h-screen">
      <TikTokItemManager />
    </main>
  );
}