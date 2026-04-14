"use client";

import AirconTypeSelector from "./AirconTypeSelector";
import RegionSelector from "./RegionSelector";
import { useFilterState } from "../hooks/useFilterState";
import type { AirconType } from "../data/aircon-types";
import type { RegionSelection } from "./RegionSelector";

/**
 * 홈페이지에서 지역 선택 + 에어컨 유형 선택을 시연하기 위한 클라이언트 래퍼.
 * useFilterState 훅을 사용하여 필터 상태를 중앙 관리한다.
 */
export default function AirconTypeSelectorDemo() {
  const {
    state,
    labels,
    isDefault,
    toPath,
    setAirconType,
    setCity,
    setDistrict,
    resetFilter,
  } = useFilterState();

  const handleTypeChange = (type: AirconType | null) => {
    setAirconType(type?.slug ?? null);
  };

  const handleRegionChange = (selection: RegionSelection) => {
    if (!selection.city) {
      setCity(null);
    } else if (!selection.district) {
      setCity(selection.city.slug);
    } else {
      setDistrict(selection.district.slug);
    }
  };

  const seoPath = toPath();

  return (
    <div className="space-y-4">
      {/* 지역 선택 (계층형 드롭다운) */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          지역
        </label>
        <RegionSelector
          citySlug={state.citySlug}
          districtSlug={state.districtSlug}
          onChange={handleRegionChange}
          layout="inline"
          showAll
        />
      </div>

      {/* 에어컨 유형 선택 (버튼 그룹) */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          에어컨 유형
        </label>
        <AirconTypeSelector
          value={state.airconTypeSlug}
          onChange={handleTypeChange}
          variant="button-group"
          showAll
        />
      </div>

      {/* 선택 결과 표시 */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 space-y-0.5">
        <p>
          지역: <span className="font-medium text-gray-900">{labels.regionLabel}</span>
        </p>
        <p>
          유형: <span className="font-medium text-gray-900">{labels.airconTypeLabel}</span>
        </p>
        <p>
          요약: <span className="font-medium text-gray-900">{labels.summary}</span>
        </p>
        {seoPath && (
          <p>
            SEO 경로: <span className="font-medium text-blue-600">{seoPath}</span>
          </p>
        )}
      </div>

      {/* 초기화 버튼 */}
      {!isDefault && (
        <button
          type="button"
          onClick={resetFilter}
          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          필터 초기화
        </button>
      )}
    </div>
  );
}
