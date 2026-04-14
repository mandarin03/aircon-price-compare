"use client";

import { useState, useCallback, useMemo } from "react";
import {
  type AirconType,
  getAirconTypeBySlug,
} from "../data/aircon-types";
import {
  type City,
  type District,
  getCityBySlug,
  getDistrictBySlug,
} from "../data/regions";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** 필터 선택 상태의 raw 값 (slug 기반) */
export interface FilterState {
  /** 선택된 에어컨 유형 slug (null = 전체) */
  airconTypeSlug: string | null;
  /** 선택된 시/도 slug (null = 전체) */
  citySlug: string | null;
  /** 선택된 구/시/군 slug (null = 전체) */
  districtSlug: string | null;
}

/** 필터 선택 상태의 resolved 값 (객체 포함) */
export interface ResolvedFilterState {
  /** 선택된 에어컨 유형 객체 (null = 전체) */
  airconType: AirconType | null;
  /** 선택된 시/도 객체 (null = 전체) */
  city: City | null;
  /** 선택된 구/시/군 객체 (null = 전체) */
  district: District | null;
}

/** 사용자가 읽을 수 있는 필터 요약 라벨 */
export interface FilterLabels {
  /** 에어컨 유형 라벨 (e.g. "벽걸이 에어컨" or "전체") */
  airconTypeLabel: string;
  /** 지역 라벨 (e.g. "서울특별시 강남구" or "전체 지역") */
  regionLabel: string;
  /** 전체 요약 (e.g. "서울 강남구 · 벽걸이 에어컨") */
  summary: string;
}

/** useFilterState 훅의 반환 타입 */
export interface UseFilterStateReturn {
  /** Raw slug 기반 상태 */
  state: FilterState;
  /** Resolved 객체 상태 */
  resolved: ResolvedFilterState;
  /** 사용자 친화적 라벨 */
  labels: FilterLabels;

  /** 에어컨 유형 변경 (slug or null for 전체) */
  setAirconType: (slug: string | null) => void;
  /** 시/도 변경 (slug or null for 전체) — 구/시 자동 초기화 */
  setCity: (slug: string | null) => void;
  /** 구/시/군 변경 (slug or null for 전체) */
  setDistrict: (slug: string | null) => void;

  /** 모든 필터를 한번에 설정 */
  setFilter: (partial: Partial<FilterState>) => void;
  /** 모든 필터 초기화 */
  resetFilter: () => void;

  /** 현재 필터가 초기 상태(전체)인지 여부 */
  isDefault: boolean;
  /** SEO 페이지 경로 생성 (e.g. "/seoul/gangnam-gu/wall-mounted") */
  toPath: () => string | null;
}

/* ------------------------------------------------------------------ */
/* Default                                                             */
/* ------------------------------------------------------------------ */

const DEFAULT_STATE: FilterState = {
  airconTypeSlug: null,
  citySlug: null,
  districtSlug: null,
};

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

/**
 * 에어컨 청소 가격 비교 필터 상태를 중앙 관리하는 커스텀 훅.
 *
 * - 에어컨 유형 (slug), 시/도 (slug), 구/시 (slug) 3개의 필터를 관리
 * - 시/도 변경 시 구/시 자동 초기화
 * - slug → 객체 resolve, 라벨 생성, SEO 경로 생성 기능 포함
 *
 * @param initialState - 초기 필터 상태 (URL 파라미터로부터 복원 시 사용)
 */
export function useFilterState(
  initialState: Partial<FilterState> = {}
): UseFilterStateReturn {
  const [state, setState] = useState<FilterState>({
    ...DEFAULT_STATE,
    ...initialState,
  });

  /* ---------- Resolved objects ---------- */
  const resolved = useMemo<ResolvedFilterState>(() => {
    const airconType = state.airconTypeSlug
      ? getAirconTypeBySlug(state.airconTypeSlug) ?? null
      : null;
    const city = state.citySlug
      ? getCityBySlug(state.citySlug) ?? null
      : null;
    const district =
      state.citySlug && state.districtSlug
        ? getDistrictBySlug(state.citySlug, state.districtSlug) ?? null
        : null;
    return { airconType, city, district };
  }, [state.airconTypeSlug, state.citySlug, state.districtSlug]);

  /* ---------- Labels ---------- */
  const labels = useMemo<FilterLabels>(() => {
    const airconTypeLabel = resolved.airconType?.label ?? "전체";

    let regionLabel: string;
    if (!resolved.city) {
      regionLabel = "전체 지역";
    } else if (!resolved.district) {
      regionLabel = `${resolved.city.label} 전체`;
    } else {
      regionLabel = `${resolved.city.label} ${resolved.district.label}`;
    }

    const parts: string[] = [];
    if (resolved.city) {
      parts.push(
        resolved.district
          ? `${resolved.city.label} ${resolved.district.label}`
          : resolved.city.label
      );
    }
    if (resolved.airconType) {
      parts.push(resolved.airconType.label);
    }
    const summary = parts.length > 0 ? parts.join(" · ") : "전체 지역 · 전체 유형";

    return { airconTypeLabel, regionLabel, summary };
  }, [resolved]);

  /* ---------- Setters ---------- */
  const setAirconType = useCallback((slug: string | null) => {
    setState((prev) => ({ ...prev, airconTypeSlug: slug }));
  }, []);

  const setCity = useCallback((slug: string | null) => {
    setState((prev) => ({
      ...prev,
      citySlug: slug,
      districtSlug: null, // 시/도 변경 시 구/시 초기화
    }));
  }, []);

  const setDistrict = useCallback((slug: string | null) => {
    setState((prev) => ({ ...prev, districtSlug: slug }));
  }, []);

  const setFilter = useCallback((partial: Partial<FilterState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      // 시/도가 변경되면 구/시 초기화 (명시적으로 districtSlug도 넘긴 경우는 제외)
      if (
        partial.citySlug !== undefined &&
        partial.citySlug !== prev.citySlug &&
        partial.districtSlug === undefined
      ) {
        next.districtSlug = null;
      }
      return next;
    });
  }, []);

  const resetFilter = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  /* ---------- Derived ---------- */
  const isDefault =
    state.airconTypeSlug === null &&
    state.citySlug === null &&
    state.districtSlug === null;

  const toPath = useCallback((): string | null => {
    if (!state.citySlug || !state.districtSlug || !state.airconTypeSlug) {
      return null;
    }
    return `/${state.citySlug}/${state.districtSlug}/${state.airconTypeSlug}`;
  }, [state.citySlug, state.districtSlug, state.airconTypeSlug]);

  return {
    state,
    resolved,
    labels,
    setAirconType,
    setCity,
    setDistrict,
    setFilter,
    resetFilter,
    isDefault,
    toPath,
  };
}
