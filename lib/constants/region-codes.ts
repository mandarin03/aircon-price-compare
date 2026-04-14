/**
 * 서울·경기 지역 표준 코드 데이터 — 시/구/동 계층 구조
 *
 * data/region-codes.json 파일을 기반으로
 * 시/도 → 구/시/군 → 동/읍/면 3계층 구조의 타입 안전한 접근을 제공한다.
 *
 * 주요 용도:
 * - 크롤링 데이터의 지역 정규화 (원문 텍스트 → 표준 코드 매핑)
 * - SEO 페이지 생성 시 동 수준의 키워드 확보
 * - 지역 선택 UI에서 세부 지역 표시
 *
 * @module region-codes
 */

import type {
  City,
  CityDataWithDongs,
  Dong,
  DistrictWithDongs,
  RegionCodesData,
  RegionHierarchyWithDongs,
} from "@/lib/types/price-data";

import regionCodesJson from "@/data/region-codes.json";

// ─────────────────────────────────────────────
// 1. JSON 데이터 로드 및 타입 캐스팅
// ─────────────────────────────────────────────

const regionData = regionCodesJson as RegionCodesData;

/** 전체 지역 코드 데이터 (시/구/동 3계층) */
export const REGION_CODES: RegionCodesData = regionData;

/** 시/도별 데이터 맵 */
export const REGION_CODES_BY_CITY: RegionHierarchyWithDongs =
  regionData.cities.reduce(
    (acc, city) => {
      acc[city.code] = city;
      return acc;
    },
    {} as RegionHierarchyWithDongs,
  );

// ─────────────────────────────────────────────
// 2. 조회 유틸리티 함수
// ─────────────────────────────────────────────

/**
 * 시/도 코드로 시/도 데이터 조회 (동 포함)
 *
 * @example getCityWithDongs("seoul") → { code: "seoul", name: "서울특별시", ... }
 */
export function getCityWithDongs(
  cityCode: City,
): CityDataWithDongs | undefined {
  return REGION_CODES_BY_CITY[cityCode];
}

/**
 * 시/도 + 구/시/군 코드로 구/시/군 데이터 조회 (동 포함)
 *
 * @example getDistrictWithDongs("seoul", "gangnam") → { code: "gangnam", name: "강남구", dongs: [...] }
 */
export function getDistrictWithDongs(
  cityCode: City,
  districtCode: string,
): DistrictWithDongs | undefined {
  const city = REGION_CODES_BY_CITY[cityCode];
  if (!city) return undefined;
  return city.districts.find((d) => d.code === districtCode);
}

/**
 * 시/도 + 구/시/군 + 동 코드로 동 데이터 조회
 *
 * @example getDong("seoul", "gangnam", "sinsa") → { code: "sinsa", name: "신사동", adminCode: "1168010100" }
 */
export function getDong(
  cityCode: City,
  districtCode: string,
  dongCode: string,
): Dong | undefined {
  const district = getDistrictWithDongs(cityCode, districtCode);
  if (!district) return undefined;
  return district.dongs.find((d) => d.code === dongCode);
}

/**
 * 특정 구/시/군의 동 목록 조회
 *
 * @example getDongsByDistrict("seoul", "gangnam") → [{ code: "sinsa", name: "신사동", ... }, ...]
 */
export function getDongsByDistrict(
  cityCode: City,
  districtCode: string,
): Dong[] {
  const district = getDistrictWithDongs(cityCode, districtCode);
  return district?.dongs ?? [];
}

/**
 * 행정표준코드로 지역 역조회
 *
 * @example findByAdminCode("11680") → { city: "seoul", district: "gangnam" }
 * @example findByAdminCode("1168010100") → { city: "seoul", district: "gangnam", dong: "sinsa" }
 */
export function findByAdminCode(
  adminCode: string,
):
  | { city: City; district?: string; dong?: string }
  | undefined {
  for (const city of regionData.cities) {
    // 시/도 코드 매칭 (2자리)
    if (city.adminCode === adminCode) {
      return { city: city.code };
    }

    for (const district of city.districts) {
      // 구/시/군 코드 매칭 (5자리)
      if (district.adminCode === adminCode) {
        return { city: city.code, district: district.code };
      }

      // 동 코드 매칭 (10자리)
      for (const dong of district.dongs) {
        if (dong.adminCode === adminCode) {
          return {
            city: city.code,
            district: district.code,
            dong: dong.code,
          };
        }
      }
    }
  }

  return undefined;
}

/**
 * 한글 지역명으로 매칭 (크롤링 데이터 정규화용)
 *
 * 원문 텍스트에서 지역명을 추출하여 표준 코드로 매핑한다.
 * 부분 매칭 지원: "강남" → 강남구, "분당" → 분당구
 *
 * @example matchRegionByName("강남구") → { city: "seoul", district: "gangnam" }
 * @example matchRegionByName("신사동") → { city: "seoul", district: "gangnam", dong: "sinsa" }
 * @example matchRegionByName("분당") → { city: "gyeonggi", district: "seongnam", dong: "bundang" }
 */
export function matchRegionByName(
  text: string,
):
  | { city: City; district: string; dong?: string }
  | undefined {
  const normalized = text.trim();

  for (const city of regionData.cities) {
    for (const district of city.districts) {
      // 동 수준 매칭 (가장 구체적인 것 우선)
      for (const dong of district.dongs) {
        if (normalized.includes(dong.name)) {
          return {
            city: city.code,
            district: district.code,
            dong: dong.code,
          };
        }
      }

      // 구/시/군 수준 매칭
      if (normalized.includes(district.name)) {
        return { city: city.code, district: district.code };
      }

      // 부분 매칭 (구/시/군 접미사 제거)
      const shortName = district.name.replace(/(구|시|군)$/, "");
      if (shortName.length >= 2 && normalized.includes(shortName)) {
        return { city: city.code, district: district.code };
      }
    }
  }

  return undefined;
}

/**
 * 전체 동 목록 플랫 배열 반환 (검색·자동완성용)
 *
 * @returns { cityCode, districtCode, dong }[] 형태의 플랫 배열
 */
export function getAllDongs(): Array<{
  cityCode: City;
  cityName: string;
  districtCode: string;
  districtName: string;
  dong: Dong;
}> {
  return regionData.cities.flatMap((city) =>
    city.districts.flatMap((district) =>
      district.dongs.map((dong) => ({
        cityCode: city.code,
        cityName: city.shortName,
        districtCode: district.code,
        districtName: district.name,
        dong,
      })),
    ),
  );
}

/**
 * 전체 구/시/군 수 반환
 */
export function getTotalDistrictCount(): number {
  return regionData.cities.reduce(
    (sum, city) => sum + city.districts.length,
    0,
  );
}

/**
 * 전체 동/읍/면 수 반환
 */
export function getTotalDongCount(): number {
  return regionData.cities.reduce(
    (sum, city) =>
      sum +
      city.districts.reduce(
        (dSum, district) => dSum + district.dongs.length,
        0,
      ),
    0,
  );
}

/**
 * SEO 메타 키워드 생성용: 구/시/군에 소속된 동 이름 목록 반환
 *
 * @example getDongNamesForSEO("seoul", "gangnam")
 * → "신사동, 논현동, 압구정동, 청담동, 삼성동, ..."
 */
export function getDongNamesForSEO(
  cityCode: City,
  districtCode: string,
): string {
  const dongs = getDongsByDistrict(cityCode, districtCode);
  return dongs.map((d) => d.name).join(", ");
}

// ─────────────────────────────────────────────
// 3. 통계 상수 (빌드 타임 계산)
// ─────────────────────────────────────────────

/** 전체 구/시/군 수 */
export const TOTAL_DISTRICT_COUNT = getTotalDistrictCount(); // 56

/** 전체 동/읍/면 수 */
export const TOTAL_DONG_COUNT = getTotalDongCount();

/** 데이터 버전 */
export const REGION_CODES_VERSION = regionData.version;

/** 마지막 업데이트일 */
export const REGION_CODES_LAST_UPDATED = regionData.lastUpdated;
