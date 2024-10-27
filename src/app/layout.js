export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

export const metadata = {
  title: 'TikTok ライブバトルアイテム管理',
  description: 'TikTokのライブバトルで獲得したアイテムを効率的に管理するためのツール',
};