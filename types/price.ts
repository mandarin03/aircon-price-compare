/**
 * 에어컨 청소 가격 비교 데이터 타입 정의
 *
 * 크롤링 데이터를 표준 카테고리(에어컨 유형, 청소 방식, 포함 서비스)로
 * 정규화하여 동일 선상에서 비교 가능한 가격 비교표를 생성한다.
 *
 * 이 파일은 프로젝트 전체에서 사용하는 가격 관련 타입의 단일 진실 소스(SSOT)이다.
 */

// ─────────────────────────────────────────────
// 1. 에어컨 유형
// ─────────────────────────────────────────────

/** 에어컨 유형 (5종: 벽걸이, 스탠드, 천장형, 시스템, 창문형) */
export const AIRCON_TYPES = [
  "wall-mount",
  "standing",
  "ceiling",
  "system",
  "window",
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

/** 에어컨 유형 짧은 한글 라벨 (모바일 UI용) */
export const AIRCON_TYPE_SHORT_LABELS: Record<AirconType, string> = {
  "wall-mount": "벽걸이",
  standing: "스탠드",
  ceiling: "천장형",
  system: "시스템",
  window: "창문형",
};

/** 에어컨 유형 URL 슬러그 */
export const AIRCON_TYPE_SLUGS: Record<AirconType, string> = {
  "wall-mount": "wall-mount",
  standing: "standing",
  ceiling: "ceiling",
  system: "system",
  window: "window",
};

/** 에어컨 유형별 일반 가격 범위 힌트 (만 원 단위) */
export const AIRCON_TYPE_PRICE_HINTS: Record<
  AirconType,
  { min: number; max: number }
> = {
  "wall-mount": { min: 4, max: 8 },
  standing: { min: 8, max: 15 },
  ceiling: { min: 10, max: 20 },
  system: { min: 8, max: 18 },
  window: { min: 3, max: 6 },
};

/** 에어컨 유형별 가정 보유 빈도 우선순위 (낮을수록 흔함) */
export const AIRCON_TYPE_PRIORITY: Record<AirconType, number> = {
  "wall-mount": 1,
  standing: 2,
  ceiling: 3,
  system: 4,
  window: 5,
};

// ─────────────────────────────────────────────
// 2. 청소 방식
// ─────────────────────────────────────────────

/** 청소 방식 */
export const CLEANING_METHODS = [
  "general",
  "disassembly",
  "complete-disassembly",
  "unknown",
] as const;
export type CleaningMethod = (typeof CLEANING_METHODS)[number];

/** 청소 방식 한글 라벨 */
export const CLEANING_METHOD_LABELS: Record<CleaningMethod, string> = {
  general: "일반세척",
  disassembly: "분해세척",
  "complete-disassembly": "완전분해세척",
  unknown: "미확인",
};

// ─────────────────────────────────────────────
// 3. 포함 서비스
// ─────────────────────────────────────────────

/** 포함 서비스 (표준 카테고리 7종) */
export const INCLUDED_SERVICES = [
  "filter-wash",
  "sanitization",
  "outdoor-unit",
  "drain-pipe",
  "mold-removal",
  "odor-removal",
  "operation-check",
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

// ─────────────────────────────────────────────
// 4. 데이터 출처 플랫폼
// ─────────────────────────────────────────────

/** 데이터 출처 플랫폼 */
export const SOURCE_PLATFORMS = [
  "soomgo",
  "danggeun",
  "blog",
  "website",
  "registration",
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
// 5. 지역 데이터 타입
// ─────────────────────────────────────────────

/** 시/도 */
export type City = "seoul" | "gyeonggi";

/** 지역 정보 (플랫 구조) */
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

/** 구/시/군 단위 정보 */
export interface District {
  /** URL 슬러그 (예: "gangnam") */
  slug: string;
  /** 한글명 (예: "강남구") */
  label: string;
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

// ─────────────────────────────────────────────
// 6. 핵심 가격 데이터 모델
// ─────────────────────────────────────────────

/**
 * 개별 가격 항목 (비교표의 한 행)
 *
 * 크롤링 또는 기사님 등록으로 수집된 단일 가격 정보.
 * 업체 연락처를 직접 노출하지 않고 sourceUrl로만 연결한다.
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
// 7. 가격 통계 (비교표 상단 요약)
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
// 8. 비교 페이지 데이터 (SEO 페이지용)
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
  | "bottom"
  | "middle"
  | "top"
  | "between-rows";

// ─────────────────────────────────────────────
// 9. 크롤링 원본 데이터 (정규화 전)
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
    providerName?: string;
    priceText?: string;
    airconTypeText?: string;
    cleaningMethodText?: string;
    servicesText?: string;
    regionText?: string;
    [key: string]: string | undefined;
  };

  /** 정규화 처리 상태 */
  normalizationStatus: "pending" | "completed" | "failed" | "manual-review";
  /** 정규화된 PriceEntry ID (정규화 완료 시) */
  normalizedEntryId: string | null;
}

// ─────────────────────────────────────────────
// 10. 필터·정렬 옵션 (프론트엔드용)
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
  | "price"
  | "includedServicesCount"
  | "verifiedAt"
  | "sourcePlatform";

/** 정렬 필드 한글 라벨 */
export const SORT_FIELD_LABELS: Record<SortField, string> = {
  price: "가격순",
  includedServicesCount: "서비스 많은 순",
  verifiedAt: "최근 확인순",
  sourcePlatform: "출처별",
};

// ─────────────────────────────────────────────
// 11. 기본값
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

// ─────────────────────────────────────────────
// 12. 가격 데이터 파일 구조 (JSON 입출력용)
// ─────────────────────────────────────────────

/** 가격 데이터 파일의 메타데이터 */
export interface PriceDataMetadata {
  /** 데이터 스키마 버전 */
  version: string;
  /** 마지막 업데이트 일시 (ISO 8601) */
  lastUpdated: string;
  /** 전체 항목 수 */
  totalEntries: number;
}

/** 가격 데이터 파일 전체 구조 */
export interface PriceDataFile {
  /** 메타데이터 */
  metadata: PriceDataMetadata;
  /** 가격 항목 배열 */
  entries: PriceEntry[];
}
