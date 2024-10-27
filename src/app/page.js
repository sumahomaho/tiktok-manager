"use client";  // この行を追加

import TikTokItemManager from '../components/TikTokItemManager';

export default function Home() {
  return (
    <main className="min-h-screen">
      <TikTokItemManager />
    </main>
  );
}