import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "에어컨 청소 가격 비교 | 서울·경기 지역 투명 가격 정보",
    template: "%s | 에어컨 청소 가격 비교",
  },
  description:
    "서울·경기 지역 에어컨 청소 가격을 한눈에 비교하세요. 벽걸이, 스탠드, 천장형, 시스템 에어컨 청소 업체별 투명 가격 정보를 제공합니다.",
  keywords: [
    "에어컨 청소",
    "에어컨 청소 가격",
    "에어컨 청소 비교",
    "서울 에어컨 청소",
    "경기 에어컨 청소",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* Google AdSense - 발급 후 ca-pub-XXXXXXX를 실제 ID로 교체 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="text-lg font-bold text-blue-600">
              에어컨 청소 비교
            </a>
            <nav className="flex items-center gap-4 text-sm">
              <a
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                가격 비교
              </a>
              <a
                href="/partner"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                기사님 등록
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
          <div className="max-w-screen-md mx-auto px-4 text-center text-xs text-gray-500 space-y-2">
            <p>
              &copy; {new Date().getFullYear()} 에어컨 청소 가격 비교. 모든
              가격 정보는 참고용이며 실제 가격과 다를 수 있습니다.
            </p>
            <p>
              <a
                href="/partner"
                className="text-blue-500 hover:underline"
              >
                기사님 서비스 등록
              </a>
              {" · "}
              <span>문의: contact@aircon-compare.kr</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
