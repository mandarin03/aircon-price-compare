import FilterNavigator from "./components/FilterNavigator";

export default function Home() {
  return (
    <div className="max-w-screen-md mx-auto px-4 py-6">
      {/* Hero */}
      <section className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          에어컨 청소 가격 비교
        </h1>
        <p className="text-sm text-gray-500">
          서울·경기 지역 에어컨 청소 투명 가격 정보
        </p>
      </section>

      {/* 지역 & 에어컨 유형 선택 → 필터 변경 시 해당 URL로 자동 이동 */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          지역과 에어컨 유형을 선택하세요
        </h2>
        <FilterNavigator />
      </section>

      {/* Placeholder: 가격 비교표 영역 */}
      <section className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
        선택한 유형의 가격 비교표가 여기에 표시됩니다.
      </section>
    </div>
  );
}
