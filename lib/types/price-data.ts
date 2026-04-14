/**
 * 에어컨 청소 가격 데이터 구조 정의
 *
 * 크롤링 데이터를 표준 카테고리로 정규화하여
 * 동일 선상에서 비교 가능한 가격 비교표를 생성한다.
 */

// ─────────────────────────────────────────────
// 1. Enum / 표준 카테고리 상수
// ─────────────────────────────────────────────

/** 에어컨 유형 (5종) */
export const AIRCON_TYPES = [
  "wall-mount", // 벽걸이
  "standing", // 스탠드
  "ceiling", // 천장형
  "system", // 시스템 (멀티)
  "window", // 창문형
] as const;
export type AirconType = (typeof AIRCON_TYPES)[number];

/** 에어컨 유형 한글 라벨 */
export const AIRCON_TYPE_LABELS: Record<AirconType, string> = {
  "wall-mount": "벽걸이 에어컨",
  standing: "스탠드 에어컨",
  ceiling: "천장형 에어컨",
  system: "시스템 에어컨",
  window: "창문형 에어컨",
};

/** 에어컨 유형 URL 슬러그 */
export const AIRCON_TYPE_SLUGS: Record<AirconType, string> = {
  "wall-mount": "wall-mount",
  standing: "standing",
  ceiling: "ceiling",
  system: "system",
  window: "window",
};

/** 청소 방식 */
export const CLEANING_METHODS = [
  "general", // 일반세척 (비분해)
  "disassembly", // 분해세척
  "complete-disassembly", // 완전분해세척
  "unknown", // 미확인
] as const;
export type CleaningMethod = (typeof CLEANING_METHODS)[number];

/** 청소 방식 한글 라벨 */
export const CLEANING_METHOD_LABELS: Record<CleaningMethod, string> = {
  general: "일반세척",
  disassembly: "분해세척",
  "complete-disassembly": "완전분해세척",
  unknown: "미확인",
};

/** 포함 서비스 (표준 카테고리) */
export const INCLUDED_SERVICES = [
  "filter-wash", // 필터 세척
  "sanitization", // 항균·살균 처리
  "outdoor-unit", // 실외기 청소
  "drain-pipe", // 배수관 청소
  "mold-removal", // 곰팡이 제거
  "odor-removal", // 냄새 제거
  "operation-check", // 에어컨 작동 점검
] as const;
export type IncludedService = (typeof INCLUDED_SERVICES)[number];

/** 포함 서비스 한글 라벨 */
export const INCLUDED_SERVICE_LABELS: Record<IncludedService, string> = {
  "filter-wash": "필터 세척",
  sanitization: "항균·살균",
  "outdoor-unit": "실외기 청소",
  "drain-pipe": "배수관 청소",
  "mold-removal": "곰팡이 제거",
  "odor-removal": "냄새 제거",
  "operation-check": "작동 점검",
};

/** 데이터 출처 플랫폼 */
export const SOURCE_PLATFORMS = [
  "soomgo", // 숨고
  "danggeun", // 당근마켓
  "blog", // 네이버 블로그
  "website", // 업체 자체 사이트
  "registration", // 기사님 직접 등록 (구글폼)
] as const;
export type SourcePlatform = (typeof SOURCE_PLATFORMS)[number];

/** 출처 플랫폼 한글 라벨 */
export const SOURCE_PLATFORM_LABELS: Record<SourcePlatform, string> = {
  soomgo: "숨고",
  danggeun: "당근마켓",
  blog: "블로그",
  website: "업체 사이트",
  registration: "직접 등록",
};

// ─────────────────────────────────────────────
// 2. 지역 데이터 타입
// ─────────────────────────────────────────────

/** 시/도 */
export type City = "seoul" | "gyeonggi";

/** 지역 정보 */
export interface Region {
  /** 시/도 코드 */
  city: City;
  /** 시/도 한글명 */
  cityLabel: string;
  /** 구/시/군 코드 (URL 슬러그용) */
  districtSlug: string;
  /** 구/시/군 한글명 */
  districtLabel: string;
}

/** 동/읍/면 단위 정보 */
export interface Dong {
  /** 코드 (예: "sinsa") */
  code: string;
  /** 한글명 (예: "신사동") */
  name: string;
  /** 행정표준코드 (예: "1168010100") */
  adminCode: string;
}

/** 구/시/군 단위 정보 */
export interface District {
  /** URL 슬러그 (예: "gangnam") */
  slug: string;
  /** 한글명 (예: "강남구") */
  label: string;
}

/** 구/시/군 단위 정보 (동 포함 계층형) */
export interface DistrictWithDongs extends District {
  /** 코드 (예: "gangnam") */
  code: string;
  /** 한글명 (예: "강남구") */
  name: string;
  /** 행정표준코드 (예: "11680") */
  adminCode: string;
  /** 소속 동/읍/면 목록 */
  dongs: Dong[];
}

/** 시/도 단위 정보 (계층형 구조) */
export interface CityData {
  /** 시/도 코드 (예: "seoul") */
  code: City;
  /** 시/도 한글명 (예: "서울") */
  label: string;
  /** 시/도 정식 한글명 (예: "서울특별시") */
  fullLabel: string;
  /** URL 슬러그 (예: "seoul") */
  slug: string;
  /** 소속 구/시/군 목록 */
  districts: District[];
}

/** 시/도 단위 정보 (동 포함 계층형) */
export interface CityDataWithDongs {
  /** 시/도 코드 (예: "seoul") */
  code: City;
  /** 시/도 한글명 (예: "서울특별시") */
  name: string;
  /** 시/도 약칭 (예: "서울") */
  shortName: string;
  /** URL 슬러그 (예: "seoul") */
  slug: string;
  /** 행정표준코드 (예: "11") */
  adminCode: string;
  /** 소속 구/시/군 목록 (동 포함) */
  districts: DistrictWithDongs[];
}

/** 전체 지역 계층 구조 */
export type RegionHierarchy = Record<City, CityData>;

/** 전체 지역 계층 구조 (동 포함) */
export type RegionHierarchyWithDongs = Record<City, CityDataWithDongs>;

/** 지역 코드 JSON 데이터 루트 타입 */
export interface RegionCodesData {
  version: string;
  description: string;
  lastUpdated: string;
  source: string;
  cities: CityDataWithDongs[];
}

// ─────────────────────────────────────────────
// 3. 핵심 가격 데이터 모델
// ─────────────────────────────────────────────

/**
 * 개별 가격 항목 (비교표의 한 행)
 *
 * 크롤링 또는 기사님 등록으로 수집된 단일 가격 정보.
 * 업체 연락처를 직접 노출하지 않고 source_url로만 연결한다.
 */
export interface PriceEntry {
  /** 고유 ID (UUID v4) */
  id: string;

  // ── 분류 ──
  /** 에어컨 유형 */
  airconType: AirconType;
  /** 청소 방식 */
  cleaningMethod: CleaningMethod;

  // ── 지역 ──
  /** 시/도 */
  regionCity: City;
  /** 구/시/군 슬러그 */
  regionDistrict: string;

  // ── 가격 ──
  /** 기본 가격 (원, 1대 기준) */
  price: number;
  /** 가격 상한 (범위 가격인 경우, 원) - null이면 단일 가격 */
  priceMax: number | null;
  /** 가격 단위 설명 (예: "1대 기준", "2대 이상 할인") */
  priceUnit: string;

  // ── 포함 서비스 ──
  /** 기본 포함 서비스 목록 */
  includedServices: IncludedService[];
  /** 표준 카테고리에 매핑되지 않은 추가 서비스 (원문 텍스트) */
  additionalServices: string[];

  // ── 추가 요금 ──
  /** 추가 요금 항목 */
  extraCharges: ExtraCharge[];

  // ── 출처 ──
  /** 비식별 업체명 (예: "A업체", "강남 에어컨 전문") */
  providerName: string;
  /** 데이터 출처 플랫폼 */
  sourcePlatform: SourcePlatform;
  /** 원래 출처 URL (사용자가 클릭하여 이동) */
  sourceUrl: string;

  // ── 데이터 품질 ──
  /** 데이터 불완전 여부 (표준 카테고리 매핑 불완전) */
  isIncomplete: boolean;
  /** 불완전한 필드 목록 (미확인 항목 표시용) */
  incompleteFields: IncompleteField[];
  /** 데이터 최초 수집일 (ISO 8601) */
  collectedAt: string;
  /** 데이터 최종 확인일 (ISO 8601) */
  verifiedAt: string;
  /** 데이터 활성 상태 */
  isActive: boolean;
}

/** 추가 요금 항목 */
export interface ExtraCharge {
  /** 항목명 (예: "실외기 별도", "2대 이상 할인") */
  label: string;
  /** 추가 금액 (원). 음수이면 할인 */
  amount: number;
  /** 조건 설명 (예: "2대 이상 시") */
  condition: string | null;
}

/** 불완전 필드 정보 */
export interface IncompleteField {
  /** 필드명 */
  field: keyof PriceEntry;
  /** 미확인 사유 */
  reason: "not-specified" | "ambiguous" | "crawl-error";
}

// ─────────────────────────────────────────────
// 4. 가격 통계 (비교표 상단 요약)
// ─────────────────────────────────────────────

/** 특정 지역×유형 조합의 가격 통계 요약 */
export interface PriceSummary {
  /** 에어컨 유형 */
  airconType: AirconType;
  /** 시/도 */
  regionCity: City;
  /** 구/시/군 슬러그 */
  regionDistrict: string;

  /** 최저 가격 (원) */
  minPrice: number;
  /** 최고 가격 (원) */
  maxPrice: number;
  /** 평균 가격 (원, 반올림) */
  avgPrice: number;
  /** 중간 가격 (원) */
  medianPrice: number;

  /** 데이터 건수 */
  totalEntries: number;
  /** 일반세척 건수 */
  generalCount: number;
  /** 분해세척 건수 */
  disassemblyCount: number;
  /** 완전분해세척 건수 */
  completeDisassemblyCount: number;

  /** 마지막 데이터 갱신일 (ISO 8601) */
  lastUpdated: string;
}

// ─────────────────────────────────────────────
// 5. 비교표 페이지 데이터 (SEO 페이지용)
// ─────────────────────────────────────────────

/** 개별 SEO 페이지에 필요한 전체 데이터 */
export interface ComparisonPageData {
  /** SEO 페이지 메타 정보 */
  meta: PageMeta;
  /** 가격 통계 요약 */
  summary: PriceSummary;
  /** 가격 항목 목록 (비교표 행) */
  entries: PriceEntry[];
  /** 광고 설정 */
  adConfig: AdConfig;
}

/** SEO 페이지 메타 정보 */
export interface PageMeta {
  /** URL 슬러그 (예: "/seoul/gangnam/wall-mount") */
  slug: string;
  /** 페이지 타이틀 (예: "서울 강남구 벽걸이 에어컨 청소 가격 비교") */
  title: string;
  /** 메타 디스크립션 */
  description: string;
  /** 캐노니컬 URL */
  canonicalUrl: string;
  /** 구조화 데이터 (JSON-LD) */
  jsonLd: Record<string, unknown>;
}

/** 광고 배치 설정 */
export interface AdConfig {
  /** 광고 배치 위치 */
  position: AdPosition;
  /** 애드센스 슬롯 ID */
  adSlotId: string;
  /** 광고 활성화 여부 */
  enabled: boolean;
}

/** 광고 배치 위치 옵션 */
export type AdPosition =
  | "bottom" // 비교표 하단 (기본값)
  | "middle" // 비교표 중간
  | "top" // 비교표 상단
  | "between-rows"; // 비교표 행 사이 (네이티브 광고)

// ─────────────────────────────────────────────
// 6. 크롤링 원본 데이터 (정규화 전)
// ─────────────────────────────────────────────

/** 크롤링 원본 데이터 (정규화 처리 전) */
export interface RawCrawlData {
  /** 크롤링 ID */
  crawlId: string;
  /** 출처 플랫폼 */
  sourcePlatform: SourcePlatform;
  /** 원본 URL */
  sourceUrl: string;
  /** 크롤링 시각 (ISO 8601) */
  crawledAt: string;

  /** 원본 텍스트 데이터 (정규화 전) */
  rawText: string;
  /** 파싱된 원본 필드 */
  parsedFields: {
    /** 원본 업체명 */
    providerName?: string;
    /** 원본 가격 텍스트 (예: "5만원~7만원", "50,000원") */
    priceText?: string;
    /** 원본 에어컨 유형 텍스트 */
    airconTypeText?: string;
    /** 원본 청소 방식 텍스트 */
    cleaningMethodText?: string;
    /** 원본 서비스 목록 텍스트 */
    servicesText?: string;
    /** 원본 지역 텍스트 */
    regionText?: string;
    /** 기타 파싱된 필드 */
    [key: string]: string | undefined;
  };

  /** 정규화 처리 상태 */
  normalizationStatus: "pending" | "completed" | "failed" | "manual-review";
  /** 정규화된 PriceEntry ID (정규화 완료 시) */
  normalizedEntryId: string | null;
}

// ─────────────────────────────────────────────
// 7. 필터·정렬 옵션 (프론트엔드용)
// ─────────────────────────────────────────────

/** 비교표 필터 옵션 */
export interface FilterOptions {
  /** 청소 방식 필터 */
  cleaningMethod: CleaningMethod | "all";
  /** 포함 서비스 필터 (AND 조건) */
  requiredServices: IncludedService[];
  /** 가격 범위 필터 */
  priceRange: {
    min: number | null;
    max: number | null;
  };
  /** 출처 플랫폼 필터 */
  sourcePlatform: SourcePlatform | "all";
  /** 불완전 데이터 포함 여부 */
  includeIncomplete: boolean;
}

/** 비교표 정렬 옵션 */
export interface SortOptions {
  /** 정렬 기준 필드 */
  field: SortField;
  /** 정렬 방향 */
  direction: "asc" | "desc";
}

/** 정렬 가능 필드 */
export type SortField =
  | "price" // 가격순 (기본: 낮은순)
  | "includedServicesCount" // 포함 서비스 많은 순
  | "verifiedAt" // 최근 확인순
  | "sourcePlatform"; // 출처별

/** 정렬 필드 한글 라벨 */
export const SORT_FIELD_LABELS: Record<SortField, string> = {
  price: "가격순",
  includedServicesCount: "서비스 많은 순",
  verifiedAt: "최근 확인순",
  sourcePlatform: "출처별",
};

// ─────────────────────────────────────────────
// 8. 기본값 & 팩토리
// ─────────────────────────────────────────────

/** 기본 필터 옵션 */
export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  cleaningMethod: "all",
  requiredServices: [],
  priceRange: { min: null, max: null },
  sourcePlatform: "all",
  includeIncomplete: true,
};

/** 기본 정렬 옵션 (가격 낮은 순) */
export const DEFAULT_SORT_OPTIONS: SortOptions = {
  field: "price",
  direction: "asc",
};

/** 기본 광고 설정 */
export const DEFAULT_AD_CONFIG: AdConfig = {
  position: "bottom",
  adSlotId: "",
  enabled: false,
};
