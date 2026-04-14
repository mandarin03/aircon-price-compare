"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useFilterState, type FilterState } from "./useFilterState";
import { cityPath, districtPath, priceComparePath } from "../data/routes";
import { validateCityParam, validateDistrictParam, validatePriceCompareParams } from "../data/routes";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface UseFilterNavigationOptions {
  /** 초기 필터 상태 (URL 파라미터로부터 복원 시 사용) */
  initialState?: Partial<FilterState>;
  /**
   * 자동 네비게이션 활성화 여부 (기본값: true)
   * false로 설정하면 필터 변경 시 URL 이동 없이 상태만 변경
   */
  autoNavigate?: boolean;
  /**
   * 네비게이션 시 scroll top 여부 (기본값: false)
   * true로 설정하면 페이지 이동 시 스크롤을 맨 위로 이동
   */
  scrollOnNavigate?: boolean;
}

export interface UseFilterNavigationReturn {
  /** useFilterState의 모든 반환값 */
  state: ReturnType<typeof useFilterState>["state"];
  resolved: ReturnType<typeof useFilterState>["resolved"];
  labels: ReturnType<typeof useFilterState>["labels"];
  isDefault: ReturnType<typeof useFilterState>["isDefault"];
  toPath: ReturnType<typeof useFilterState>["toPath"];

  /** 에어컨 유형 변경 + URL 이동 */
  setAirconType: (slug: string | null) => void;
  /** 시/도 변경 + URL 이동 (구/시 자동 초기화) */
  setCity: (slug: string | null) => void;
  /** 구/시/군 변경 + URL 이동 */
  setDistrict: (slug: string | null) => void;
  /** 모든 필터를 한번에 설정 + URL 이동 */
  setFilter: (partial: Partial<FilterState>) => void;
  /** 모든 필터 초기화 → 홈으로 이동 */
  resetFilter: () => void;

  /** 현재 필터 상태에 해당하는 경로를 계산 (이동 없이) */
  getNavigationPath: () => string;
  /** 수동으로 현재 필터 상태에 해당하는 페이지로 이동 */
  navigateToCurrentFilter: () => void;
}

/* ------------------------------------------------------------------ */
/* Path Builder                                                        */
/* ------------------------------------------------------------------ */

/**
 * 필터 상태에서 최적의 네비게이션 경로를 결정한다.
 *
 * - city + district + airconType 모두 유효 → /city/district/airconType
 * - city + district만 유효 → /city/district
 * - city만 유효 → /city
 * - 아무것도 없으면 → /
 */
function resolveNavigationPath(state: FilterState): string {
  const { citySlug, districtSlug, airconTypeSlug } = state;

  // 3단계: 전체 조합 (city + district + airconType)
  if (citySlug && districtSlug && airconTypeSlug) {
    const valid = validatePriceCompareParams(citySlug, districtSlug, airconTypeSlug);
    if (valid) {
      return priceComparePath(citySlug, districtSlug, airconTypeSlug);
    }
  }

  // 2단계: 지역만 (city + district)
  if (citySlug && districtSlug) {
    const valid = validateDistrictParam(citySlug, districtSlug);
    if (valid) {
      return districtPath(citySlug, districtSlug);
    }
  }

  // 1단계: 시/도만
  if (citySlug) {
    const valid = validateCityParam(citySlug);
    if (valid) {
      return cityPath(citySlug);
    }
  }

  // 기본: 홈
  return "/";
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

/**
 * 필터 선택 시 해당 조합 URL로 자동 이동하는 네비게이션 연동 훅.
 *
 * useFilterState를 래핑하여 setter 호출 시 router.push를 통해
 * 해당 조합의 SEO 페이지로 이동시킨다.
 *
 * @example
 * ```tsx
 * const { setCity, setDistrict, setAirconType } = useFilterNavigation({
 *   initialState: { citySlug: "seoul", districtSlug: "gangnam-gu" }
 * });
 *
 * // 사용자가 에어컨 유형을 선택하면 → /seoul/gangnam-gu/wall-mounted 로 이동
 * setAirconType("wall-mounted");
 * ```
 */
export function useFilterNavigation(
  options: UseFilterNavigationOptions = {}
): UseFilterNavigationReturn {
  const {
    initialState = {},
    autoNavigate = true,
    scrollOnNavigate = false,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const filter = useFilterState(initialState);

  // 초기 마운트 여부 추적 (마운트 시 불필요한 네비게이션 방지)
  const isInitialMount = useRef(true);
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  /** 경로 계산 후 네비게이션 실행 */
  const navigateTo = useCallback(
    (nextState: FilterState) => {
      if (!autoNavigate) return;

      const targetPath = resolveNavigationPath(nextState);

      // 현재 경로와 동일하면 이동하지 않음
      if (targetPath === pathname) return;

      router.push(targetPath, { scroll: scrollOnNavigate });
    },
    [autoNavigate, pathname, router, scrollOnNavigate]
  );

  /* ---------- Navigation-aware setters ---------- */

  const setAirconType = useCallback(
    (slug: string | null) => {
      filter.setAirconType(slug);
      const nextState: FilterState = {
        ...filter.state,
        airconTypeSlug: slug,
      };
      navigateTo(nextState);
    },
    [filter, navigateTo]
  );

  const setCity = useCallback(
    (slug: string | null) => {
      filter.setCity(slug);
      const nextState: FilterState = {
        ...filter.state,
        citySlug: slug,
        districtSlug: null, // 시/도 변경 시 구/시 자동 초기화
      };
      navigateTo(nextState);
    },
    [filter, navigateTo]
  );

  const setDistrict = useCallback(
    (slug: string | null) => {
      filter.setDistrict(slug);
      const nextState: FilterState = {
        ...filter.state,
        districtSlug: slug,
      };
      navigateTo(nextState);
    },
    [filter, navigateTo]
  );

  const setFilter = useCallback(
    (partial: Partial<FilterState>) => {
      filter.setFilter(partial);
      const nextState: FilterState = { ...filter.state, ...partial };
      // 시/도 변경 시 구/시 초기화 로직 반영
      if (
        partial.citySlug !== undefined &&
        partial.citySlug !== filter.state.citySlug &&
        partial.districtSlug === undefined
      ) {
        nextState.districtSlug = null;
      }
      navigateTo(nextState);
    },
    [filter, navigateTo]
  );

  const resetFilter = useCallback(() => {
    filter.resetFilter();
    if (autoNavigate && pathname !== "/") {
      router.push("/", { scroll: scrollOnNavigate });
    }
  }, [filter, autoNavigate, pathname, router, scrollOnNavigate]);

  /** 현재 필터 상태에 해당하는 경로 반환 (이동 없이) */
  const getNavigationPath = useCallback((): string => {
    return resolveNavigationPath(filter.state);
  }, [filter.state]);

  /** 수동 네비게이션 트리거 */
  const navigateToCurrentFilter = useCallback(() => {
    const targetPath = resolveNavigationPath(filter.state);
    if (targetPath !== pathname) {
      router.push(targetPath, { scroll: scrollOnNavigate });
    }
  }, [filter.state, pathname, router, scrollOnNavigate]);

  return {
    state: filter.state,
    resolved: filter.resolved,
    labels: filter.labels,
    isDefault: filter.isDefault,
    toPath: filter.toPath,

    setAirconType,
    setCity,
    setDistrict,
    setFilter,
    resetFilter,

    getNavigationPath,
    navigateToCurrentFilter,
  };
}

/** resolveNavigationPath를 외부에서도 사용 가능하도록 export */
export { resolveNavigationPath };
