import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-screen-md mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        요청하신 지역 또는 에어컨 유형의 가격 비교 정보가 없습니다.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 text-sm transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
