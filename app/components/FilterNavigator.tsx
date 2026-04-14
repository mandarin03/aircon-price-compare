"use client";

import { useCallback } from "react";
import AirconTypeSelector from "./AirconTypeSelector";
import RegionSelector from "./RegionSelector";
import { useFilterNavigation } from "../hooks/useFilterNavigation";
import type { UseFilterNavigationOptions } from "../hooks/useFilterNavigation";
import type { AirconType } from "../data/aircon-types";
import type { RegionSelection } from "./RegionSelector";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

export interface FilterNavigatorProps {
  /** 초기 필터 상태 (현재 페이지의 URL 파라미터에서 복원) */
  initialCitySlug?: string | null;
  initialDistrictSlug?: string | null;
  initialAirconTypeSlug?: string | null;
  /** 에어컨 유형 선택 UI 변형 */
  airconTypeVariant?: "button-group" | "dropdown";
  /** 지역 선택 레이아웃 */
  regionLayout?: "inline" | "stacked";
  /** 추가 className */
  className?: string;
  /** 네비게이션 옵션 */
  navigationOptions?: Omit<UseFilterNavigationOptions, "initialState">;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * 필터 선택 시 해당 지역×유형 조합 URL로 자동 이동하는 네비게이터 컴포넌트.
 *
 * 지역 드롭다운과 에어컨 유형 선택을 통합하여,
 * 선택이 변경되면 router.push로 해당 SEO 페이지로 이동한다.
 *
 * @example
 * ```tsx
 * // 홈페이지 (필터 초기값 없음 → 선택 시 해당 페이지로 이동)
 * <FilterNavigator />
 *
 * // 이미 특정 페이지에 있을 때 (현재 경로에서 필터 변경)
 * <FilterNavigator
 *   initialCitySlug="seoul"
 *   initialDistrictSlug="gangnam-gu"
 *   initialAirconTypeSlug="wall-mounted"
 * />
 * ```
 */
export default function FilterNavigator({
  initialCitySlug = null,
  initialDistrictSlug = null,
  initialAirconTypeSlug = null,
  airconTypeVariant = "button-group",
  regionLayout = "inline",
  className = "",
  navigationOptions = {},
}: FilterNavigatorProps) {
  const {
    state,
    labels,
    isDefault,
    getNavigationPath,
    setAirconType,
    setCity,
    setDistrict,
    resetFilter,
  } = useFilterNavigation({
    initialState: {
      citySlug: initialCitySlug,
      districtSlug: initialDistrictSlug,
      airconTypeSlug: initialAirconTypeSlug,
    },
    ...navigationOptions,
  });

  /** 에어컨 유형 변경 → URL 이동 */
  const handleTypeChange = useCallback(
    (type: AirconType | null) => {
      setAirconType(type?.slug ?? null);
    },
    [setAirconType]
  );

  /** 지역 변경 → URL 이동 */
  const handleRegionChange = useCallback(
    (selection: RegionSelection) => {
      if (!selection.city) {
        setCity(null);
      } else if (!selection.district) {
        setCity(selection.city.slug);
      } else {
        setDistrict(selection.district.slug);
      }
    },
    [setCity, setDistrict]
  );

  const targetPath = getNavigationPath();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 지역 선택 (계층형 드롭다운) */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          지역
        </label>
        <RegionSelector
          citySlug={state.citySlug}
          districtSlug={state.districtSlug}
          onChange={handleRegionChange}
          layout={regionLayout}
          showAll
        />
      </div>

      {/* 에어컨 유형 선택 */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          에어컨 유형
        </label>
        <AirconTypeSelector
          value={state.airconTypeSlug}
          onChange={handleTypeChange}
          variant={airconTypeVariant}
          showAll
        />
      </div>

      {/* 선택 상태 요약 + 네비게이션 힌트 */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">
          {labels.summary}
        </span>

        {/* 초기화 버튼 */}
        {!isDefault && (
          <button
            type="button"
            onClick={resetFilter}
            className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
            aria-label="필터 초기화"
          >
            초기화
          </button>
        )}
      </div>

      {/* 이동 경로 안내 (city+district 선택 후 airconType 미선택 시) */}
      {state.citySlug && state.districtSlug && !state.airconTypeSlug && (
        <p className="text-xs text-gray-400 text-center">
          에어컨 유형을 선택하면 가격 비교 페이지로 이동합니다.
        </p>
      )}

      {/* city만 선택된 경우 */}
      {state.citySlug && !state.districtSlug && (
        <p className="text-xs text-gray-400 text-center">
          구/시를 선택하면 해당 지역 페이지로 이동합니다.
        </p>
      )}
    </div>
  );
}
