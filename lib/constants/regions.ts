/**
 * 서울·경기 지역 데이터 상수
 *
 * 서울특별시 25개 구 + 경기도 31개 시/군 = 56개 지역
 * 에어컨 유형 × 56개 지역 = SEO 개별 URL 페이지 생성 기반 데이터
 *
 * 계층 구조: City(시/도) → District(구/시/군)
 */

import {
  type City,
  type CityData,
  type District,
  type Region,
  type RegionHierarchy,
} from "@/lib/types/price-data";

// ─────────────────────────────────────────────
// 1. 계층형 데이터 구조 (시/도 → 구/시/군)
// ─────────────────────────────────────────────

/** 서울특별시 25개 구 */
const SEOUL_DISTRICT_LIST: District[] = [
  { slug: "gangnam", label: "강남구" },
  { slug: "gangdong", label: "강동구" },
  { slug: "gangbuk", label: "강북구" },
  { slug: "gangseo", label: "강서구" },
  { slug: "gwanak", label: "관악구" },
  { slug: "gwangjin", label: "광진구" },
  { slug: "guro", label: "구로구" },
  { slug: "geumcheon", label: "금천구" },
  { slug: "nowon", label: "노원구" },
  { slug: "dobong", label: "도봉구" },
  { slug: "dongdaemun", label: "동대문구" },
  { slug: "dongjak", label: "동작구" },
  { slug: "mapo", label: "마포구" },
  { slug: "seodaemun", label: "서대문구" },
  { slug: "seocho", label: "서초구" },
  { slug: "seongdong", label: "성동구" },
  { slug: "seongbuk", label: "성북구" },
  { slug: "songpa", label: "송파구" },
  { slug: "yangcheon", label: "양천구" },
  { slug: "yeongdeungpo", label: "영등포구" },
  { slug: "yongsan", label: "용산구" },
  { slug: "eunpyeong", label: "은평구" },
  { slug: "jongno", label: "종로구" },
  { slug: "jung", label: "중구" },
  { slug: "jungnang", label: "중랑구" },
];

/** 경기도 31개 시/군 */
const GYEONGGI_DISTRICT_LIST: District[] = [
  { slug: "suwon", label: "수원시" },
  { slug: "seongnam", label: "성남시" },
  { slug: "goyang", label: "고양시" },
  { slug: "yongin", label: "용인시" },
  { slug: "bucheon", label: "부천시" },
  { slug: "ansan", label: "안산시" },
  { slug: "anyang", label: "안양시" },
  { slug: "namyangju", label: "남양주시" },
  { slug: "hwaseong", label: "화성시" },
  { slug: "pyeongtaek", label: "평택시" },
  { slug: "uijeongbu", label: "의정부시" },
  { slug: "siheung", label: "시흥시" },
  { slug: "paju", label: "파주시" },
  { slug: "gimpo", label: "김포시" },
  { slug: "gwangmyeong", label: "광명시" },
  { slug: "gwangju", label: "광주시" },
  { slug: "gunpo", label: "군포시" },
  { slug: "hanam", label: "하남시" },
  { slug: "osan", label: "오산시" },
  { slug: "icheon", label: "이천시" },
  { slug: "anseong", label: "안성시" },
  { slug: "uiwang", label: "의왕시" },
  { slug: "yangju", label: "양주시" },
  { slug: "pocheon", label: "포천시" },
  { slug: "yeoju", label: "여주시" },
  { slug: "dongducheon", label: "동두천시" },
  { slug: "gwacheon", label: "과천시" },
  { slug: "guri", label: "구리시" },
  { slug: "yangpyeong", label: "양평군" },
  { slug: "gapyeong", label: "가평군" },
  { slug: "yeoncheon", label: "연천군" },
];

/** 서울특별시 계층 데이터 */
const SEOUL_DATA: CityData = {
  code: "seoul",
  label: "서울",
  fullLabel: "서울특별시",
  slug: "seoul",
  districts: SEOUL_DISTRICT_LIST,
};

/** 경기도 계층 데이터 */
const GYEONGGI_DATA: CityData = {
  code: "gyeonggi",
  label: "경기",
  fullLabel: "경기도",
  slug: "gyeonggi",
  districts: GYEONGGI_DISTRICT_LIST,
};

/**
 * 전체 지역 계층 구조
 *
 * 사용 예:
 *   REGION_HIERARCHY.seoul.districts → 서울 25구
 *   REGION_HIERARCHY.gyeonggi.fullLabel → "경기도"
 */
export const REGION_HIERARCHY: RegionHierarchy = {
  seoul: SEOUL_DATA,
  gyeonggi: GYEONGGI_DATA,
};

// ─────────────────────────────────────────────
// 2. 플랫 Region 배열 (기존 호환 + SEO 페이지 생성용)
// ─────────────────────────────────────────────

/** CityData → Region[] 변환 헬퍼 */
function toRegions(cityData: CityData): Region[] {
  return cityData.districts.map((d) => ({
    city: cityData.code,
    cityLabel: cityData.label,
    districtSlug: d.slug,
    districtLabel: d.label,
  }));
}

/** 서울 25구 (플랫 배열) */
export const SEOUL_DISTRICTS: Region[] = toRegions(SEOUL_DATA);

/** 경기 31시군 (플랫 배열) */
export const GYEONGGI_DISTRICTS: Region[] = toRegions(GYEONGGI_DATA);

/** 전체 지역 목록 (56개) */
export const ALL_REGIONS: Region[] = [
  ...SEOUL_DISTRICTS,
  ...GYEONGGI_DISTRICTS,
];

/** 시/도 라벨 */
export const CITY_LABELS: Record<City, string> = {
  seoul: "서울",
  gyeonggi: "경기",
};

/** 시/도 정식명칭 */
export const CITY_FULL_LABELS: Record<City, string> = {
  seoul: "서울특별시",
  gyeonggi: "경기도",
};

/** 전체 시/도 코드 목록 */
export const ALL_CITIES: City[] = ["seoul", "gyeonggi"] as const as City[];

// ─────────────────────────────────────────────
// 3. 조회 유틸리티 함수
// ─────────────────────────────────────────────

/** 지역 슬러그로 Region 조회 */
export function getRegionBySlug(
  citySlug: string,
  districtSlug: string
): Region | undefined {
  return ALL_REGIONS.find(
    (r) => r.city === citySlug && r.districtSlug === districtSlug
  );
}

/** 시/도별 지역 목록 조회 */
export function getDistrictsByCity(city: City): Region[] {
  return ALL_REGIONS.filter((r) => r.city === city);
}

/** 시/도 코드로 CityData 조회 */
export function getCityData(city: City): CityData {
  return REGION_HIERARCHY[city];
}

/** 시/도 슬러그 유효성 검사 */
export function isValidCitySlug(slug: string): slug is City {
  return slug === "seoul" || slug === "gyeonggi";
}

/** 구/시/군 슬러그가 해당 시/도에 존재하는지 확인 */
export function isValidDistrictSlug(city: City, districtSlug: string): boolean {
  return REGION_HIERARCHY[city].districts.some((d) => d.slug === districtSlug);
}

/**
 * SEO 페이지 경로 생성용: 모든 지역×유형 조합의 슬러그 쌍 반환
 *
 * 사용 예 (Next.js generateStaticParams):
 *   getAllRegionSlugs().map(({ city, district }) => ({ city, district }))
 */
export function getAllRegionSlugs(): Array<{
  city: City;
  district: string;
}> {
  return ALL_REGIONS.map((r) => ({
    city: r.city,
    district: r.districtSlug,
  }));
}

/** 전체 지역 수 */
export const TOTAL_REGION_COUNT = ALL_REGIONS.length; // 56
