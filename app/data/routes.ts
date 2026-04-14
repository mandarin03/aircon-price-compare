/**
 * 라우트 유틸리티
 *
 * 지역(시/구)×에어컨 유형 조합의 URL 경로 생성 및 검증 함수를 제공한다.
 * SEO 페이지 자동 생성(generateStaticParams)에서 사용한다.
 */

import { CITIES, getCityBySlug, getDistrictBySlug } from "./regions";
import { AIRCON_TYPES, getAirconTypeBySlug } from "./aircon-types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** 시/도 레벨 라우트 파라미터 */
export interface CityRouteParams {
  city: string;
}

/** 구/시/군 레벨 라우트 파라미터 */
export interface DistrictRouteParams extends CityRouteParams {
  district: string;
}

/** 에어컨 유형×지역 조합 라우트 파라미터 (최종 비교 페이지) */
export interface PriceCompareRouteParams extends DistrictRouteParams {
  airconType: string;
}

/* ------------------------------------------------------------------ */
/* Static Params Generators                                            */
/* ------------------------------------------------------------------ */

/**
 * 시/도 레벨 정적 파라미터 생성
 * 예: [{ city: "seoul" }, { city: "gyeonggi" }]
 */
export function generateCityStaticParams(): CityRouteParams[] {
  return CITIES.map((c) => ({ city: c.slug }));
}

/**
 * 구/시/군 레벨 정적 파라미터 생성
 * 예: [{ city: "seoul", district: "gangnam-gu" }, ...]
 */
export function generateDistrictStaticParams(): DistrictRouteParams[] {
  return CITIES.flatMap((city) =>
    city.districts.map((district) => ({
      city: city.slug,
      district: district.slug,
    }))
  );
}

/**
 * 에어컨 유형×지역 전체 조합 정적 파라미터 생성
 * 서울 25구 × 5유형 = 125, 경기 30시군 × 5유형 = 150 → 총 275개 페이지
 */
export function generatePriceCompareStaticParams(): PriceCompareRouteParams[] {
  return CITIES.flatMap((city) =>
    city.districts.flatMap((district) =>
      AIRCON_TYPES.map((airconType) => ({
        city: city.slug,
        district: district.slug,
        airconType: airconType.slug,
      }))
    )
  );
}

/* ------------------------------------------------------------------ */
/* Param Validation                                                    */
/* ------------------------------------------------------------------ */

/**
 * 시/도 slug 유효성 검증
 * @returns 유효한 경우 City 객체, 아니면 null
 */
export function validateCityParam(citySlug: string) {
  return getCityBySlug(citySlug) ?? null;
}

/**
 * 구/시/군 slug 유효성 검증
 * @returns 유효한 경우 { city, district } 객체, 아니면 null
 */
export function validateDistrictParam(
  citySlug: string,
  districtSlug: string
) {
  const city = getCityBySlug(citySlug);
  if (!city) return null;
  const district = getDistrictBySlug(citySlug, districtSlug);
  if (!district) return null;
  return { city, district };
}

/**
 * 에어컨 유형×지역 전체 파라미터 유효성 검증
 * @returns 유효한 경우 { city, district, airconType } 객체, 아니면 null
 */
export function validatePriceCompareParams(
  citySlug: string,
  districtSlug: string,
  airconTypeSlug: string
) {
  const regionResult = validateDistrictParam(citySlug, districtSlug);
  if (!regionResult) return null;
  const airconType = getAirconTypeBySlug(airconTypeSlug);
  if (!airconType) return null;
  return { ...regionResult, airconType };
}

/* ------------------------------------------------------------------ */
/* URL Path Builders                                                   */
/* ------------------------------------------------------------------ */

/** 시/도 페이지 경로 */
export function cityPath(citySlug: string): string {
  return `/${citySlug}`;
}

/** 구/시/군 페이지 경로 */
export function districtPath(citySlug: string, districtSlug: string): string {
  return `/${citySlug}/${districtSlug}`;
}

/** 에어컨 유형×지역 비교 페이지 경로 */
export function priceComparePath(
  citySlug: string,
  districtSlug: string,
  airconTypeSlug: string
): string {
  return `/${citySlug}/${districtSlug}/${airconTypeSlug}`;
}
