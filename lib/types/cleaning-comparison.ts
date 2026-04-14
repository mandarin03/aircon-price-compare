/**
 * 청소 방식 및 포함 서비스 비교 데이터 모델
 *
 * 청소 방식(일반/분해/완전분해)별로 어떤 서비스가 포함되는지,
 * 가격 차이는 어떤지를 동일 선상에서 비교할 수 있는 데이터 구조.
 *
 * 용도:
 * - 청소 방식별 서비스 포함 비교표 렌더링
 * - 방식 간 가격 차이 시각화 (바 차트, 요약 카드)
 * - SEO 페이지 본문 콘텐츠 자동 생성
 *
 * @module cleaning-comparison
 */

import type {
  AirconType,
  City,
  CleaningMethod,
  IncludedService,
  SourcePlatform,
} from "./price-data";

// ─────────────────────────────────────────────
// 1. 청소 방식별 서비스 포함 비교 매트릭스
// ─────────────────────────────────────────────

/**
 * 청소 방식 × 포함 서비스 비교 매트릭스
 *
 * 특정 지역×에어컨 유형에서 각 청소 방식이
 * 얼마나 자주 특정 서비스를 포함하는지 보여주는 구조.
 *
 * 비교표에서 "일반세척 vs 분해세척 vs 완전분해세척"
 * 서비스 포함 여부를 한눈에 보여준다.
 */
export interface CleaningMethodServiceMatrix {
  /** 에어컨 유형 */
  airconType: AirconType;
  /** 시/도 */
  regionCity: City;
  /** 구/시/군 슬러그 */
  regionDistrict: string;
  /** 서비스 목록 (행) — 각 서비스별 방식 포함 여부 */
  rows: CleaningServiceMatrixRow[];
  /** 청소 방식별 요약 (열 헤더) */
  methodSummaries: CleaningMethodSummary[];
  /** 데이터 기준 시각 (ISO 8601) */
  generatedAt: string;
}

/**
 * 매트릭스의 한 행 — 하나의 포함 서비스에 대해
 * 각 청소 방식에서의 포함 빈도를 보여준다.
 */
export interface CleaningServiceMatrixRow {
  /** 서비스 코드 */
  service: IncludedService;
  /** 서비스 한글 라벨 */
  label: string;
  /** 짧은 한글 라벨 (모바일용) */
  shortLabel: string;
  /** 해당 에어컨 유형에 적용 가능한 서비스인지 */
  applicable: boolean;
  /** 각 청소 방식별 포함 상태 */
  byMethod: Record<Exclude<CleaningMethod, "unknown">, ServiceInclusionDetail>;
}

/** 특정 서비스가 특정 청소 방식에서 포함되는 상세 정보 */
export interface ServiceInclusionDetail {
  /** 포함 빈도 수준 */
  level: ServiceInclusionLevel;
  /** 포함 비율 (0~1). 해당 방식의 엔트리 중 이 서비스를 포함하는 비율 */
  rate: number;
  /** 포함 비율 표시 텍스트 (예: "80%") */
  rateDisplay: string;
  /** 별도 추가 시 일반적 비용 (원). 0이면 보통 기본 포함 */
  typicalExtraCost: number;
  /** 해당 방식의 데이터 건수 (0이면 데이터 부족) */
  sampleCount: number;
}

/** 서비스 포함 빈도 수준 */
export type ServiceInclusionLevel =
  | "always" // 거의 항상 포함 (≥90%)
  | "usually" // 보통 포함 (60~89%)
  | "sometimes" // 가끔 포함 (30~59%)
  | "rarely" // 드물게 포함 (<30%)
  | "not-included" // 포함 안 됨 (0%)
  | "no-data"; // 해당 방식 데이터 없음

/** 서비스 포함 빈도 수준 한글 라벨 */
export const SERVICE_INCLUSION_LEVEL_LABELS: Record<
  ServiceInclusionLevel,
  string
> = {
  always: "기본 포함",
  usually: "대부분 포함",
  sometimes: "선택적 포함",
  rarely: "일부만 포함",
  "not-included": "미포함",
  "no-data": "데이터 없음",
};

/** 서비스 포함 수준별 UI 색상 코드 (Tailwind 클래스 힌트) */
export const SERVICE_INCLUSION_LEVEL_COLORS: Record<
  ServiceInclusionLevel,
  string
> = {
  always: "text-green-600 bg-green-50",
  usually: "text-blue-600 bg-blue-50",
  sometimes: "text-yellow-600 bg-yellow-50",
  rarely: "text-orange-600 bg-orange-50",
  "not-included": "text-gray-400 bg-gray-50",
  "no-data": "text-gray-300 bg-gray-50",
};

// ─────────────────────────────────────────────
// 2. 청소 방식별 요약 (비교 카드)
// ─────────────────────────────────────────────

/** 하나의 청소 방식에 대한 요약 (비교 카드용) */
export interface CleaningMethodSummary {
  /** 청소 방식 코드 */
  method: CleaningMethod;
  /** 한글 라벨 */
  label: string;
  /** 짧은 라벨 */
  shortLabel: string;
  /** 설명 */
  description: string;
  /** 가격 통계 */
  priceStats: MethodPriceStats;
  /** 포함 서비스 요약 */
  serviceSummary: MethodServiceSummary;
  /** 데이터 건수 */
  dataCount: number;
  /** 소요 시간 목안 (분) */
  estimatedDuration: MethodDurationEstimate;
  /** 추천 대상 텍스트 */
  recommendedFor: string;
}

/** 청소 방식별 가격 통계 */
export interface MethodPriceStats {
  /** 최저가 (원) */
  min: number;
  /** 최고가 (원) */
  max: number;
  /** 평균가 (원) */
  avg: number;
  /** 가격 표시 텍스트 (예: "4~8만원") */
  rangeDisplay: string;
  /** 일반세척 대비 가격 배율 (일반 = 1.0). null이면 비교 불가 */
  ratioVsGeneral: number | null;
}

/** 청소 방식별 포함 서비스 요약 */
export interface MethodServiceSummary {
  /** 기본 포함 서비스 수 (보통 포함되는 것) */
  typicalIncludedCount: number;
  /** 보통 기본 포함되는 서비스 목록 */
  typicalServices: IncludedService[];
  /** 보통 별도 요금인 서비스 목록 */
  typicalExtraServices: IncludedService[];
  /** 서비스 요약 텍스트 (예: "필터 세척 + 항균살균 기본 포함") */
  summaryText: string;
}

/** 예상 소요 시간 */
export interface MethodDurationEstimate {
  /** 최소 소요 시간 (분) */
  minMinutes: number;
  /** 최대 소요 시간 (분) */
  maxMinutes: number;
  /** 표시 텍스트 (예: "30~60분") */
  display: string;
}

// ─────────────────────────────────────────────
// 3. 청소 방식 비교 카드 데이터 (3열 비교용)
// ─────────────────────────────────────────────

/**
 * 청소 방식 비교 카드 데이터
 *
 * 모바일에서 "일반 vs 분해 vs 완전분해" 3개 카드를
 * 좌우 스와이프로 비교하는 UI에 사용한다.
 */
export interface CleaningMethodComparisonCards {
  /** 에어컨 유형 */
  airconType: AirconType;
  /** 지역 정보 */
  region: {
    city: City;
    district: string;
    districtLabel: string;
  };
  /** 비교 카드 배열 (일반 → 분해 → 완전분해 순) */
  cards: CleaningMethodCard[];
  /** 비교 요약 텍스트 (예: "분해세척은 일반세척 대비 약 1.7배 비싸지만 서비스가 2개 더 포함됩니다") */
  comparisonInsight: string;
}

/** 청소 방식 비교 개별 카드 */
export interface CleaningMethodCard {
  /** 청소 방식 코드 */
  method: Exclude<CleaningMethod, "unknown">;
  /** 라벨 */
  label: string;
  /** 가격 범위 표시 */
  priceRange: string;
  /** 평균 가격 */
  avgPrice: number;
  /** 기본 포함 서비스 (보통 ≥70% 포함) */
  includedServices: Array<{
    service: IncludedService;
    label: string;
    shortLabel: string;
  }>;
  /** 선택적/별도 서비스 (30~69% 포함) */
  optionalServices: Array<{
    service: IncludedService;
    label: string;
    shortLabel: string;
    typicalExtraCost: number;
  }>;
  /** 소요 시간 표시 */
  duration: string;
  /** 추천 문구 */
  recommendation: string;
  /** 데이터 건수 */
  dataCount: number;
  /** 출처 플랫폼 분포 */
  sourcePlatforms: Array<{
    platform: SourcePlatform;
    label: string;
    count: number;
  }>;
  /** 하이라이트 뱃지 텍스트 (예: "가성비 최고", "가장 깨끗") — null이면 뱃지 없음 */
  badge: string | null;
}

// ─────────────────────────────────────────────
// 4. 에어컨 유형별 청소 방식 기본 비교 데이터
// ─────────────────────────────────────────────

/**
 * 에어컨 유형별 청소 방식 기본 비교 데이터
 *
 * 크롤링 데이터가 충분히 쌓이기 전,
 * 업계 일반적인 기준으로 청소 방식을 비교하는 기본 데이터.
 * 크롤링 데이터가 있는 지역에서는 실제 데이터로 대체된다.
 */
export interface DefaultMethodComparison {
  /** 에어컨 유형 */
  airconType: AirconType;
  /** 청소 방식별 기본 정보 */
  methods: Array<{
    /** 청소 방식 */
    method: Exclude<CleaningMethod, "unknown">;
    /** 일반적인 가격 범위 (원) */
    priceRange: { min: number; max: number };
    /** 일반적으로 포함되는 서비스 */
    typicallyIncluded: IncludedService[];
    /** 보통 별도 요금인 서비스 */
    typicallyExtra: IncludedService[];
    /** 소요 시간 (분) */
    duration: { min: number; max: number };
    /** 추천 대상 */
    recommendedFor: string;
  }>;
}

// ─────────────────────────────────────────────
// 5. 유틸리티 함수
// ─────────────────────────────────────────────

/**
 * 포함 비율에서 서비스 포함 수준을 결정
 */
export function getServiceInclusionLevel(
  rate: number,
  sampleCount: number,
): ServiceInclusionLevel {
  if (sampleCount === 0) return "no-data";
  if (rate === 0) return "not-included";
  if (rate >= 0.9) return "always";
  if (rate >= 0.6) return "usually";
  if (rate >= 0.3) return "sometimes";
  return "rarely";
}

/**
 * 가격을 간결한 만원 단위로 표시
 * 예: 50000 → "5만원", { min: 30000, max: 80000 } → "3~8만원"
 */
export function formatPriceRangeCompact(min: number, max: number): string {
  const minMan = Math.round(min / 10000);
  const maxMan = Math.round(max / 10000);
  if (minMan === maxMan) return `${minMan}만원`;
  return `${minMan}~${maxMan}만원`;
}

/**
 * 예상 소요 시간 포맷
 */
export function formatDuration(minMinutes: number, maxMinutes: number): string {
  if (minMinutes === maxMinutes) return `약 ${minMinutes}분`;
  if (maxMinutes >= 60) {
    const minHour = Math.floor(minMinutes / 60);
    const maxHour = Math.floor(maxMinutes / 60);
    const minRem = minMinutes % 60;
    const maxRem = maxMinutes % 60;
    if (minHour === 0) return `${minMinutes}분~${maxHour}시간${maxRem > 0 ? ` ${maxRem}분` : ""}`;
    return `${minHour}시간${minRem > 0 ? ` ${minRem}분` : ""}~${maxHour}시간${maxRem > 0 ? ` ${maxRem}분` : ""}`;
  }
  return `${minMinutes}~${maxMinutes}분`;
}
