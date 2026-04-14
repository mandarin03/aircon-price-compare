/**
 * 비교표 데이터 가공 유틸리티
 *
 * 정규화된 청소 방식(CleaningMethod) 및 포함 서비스(IncludedService) 데이터를
 * 비교표에 적합한 구조로 변환한다.
 *
 * 주요 기능:
 * 1. 청소 방식별 그룹화 — 동일 지역 내 일반/분해/완전분해 비교
 * 2. 서비스 포함 여부 매트릭스 — 업체별 서비스 포함 여부를 O/X로 비교
 * 3. 비교 행 데이터 변환 — 비교표 렌더링에 최적화된 구조
 * 4. 청소 방식별 가격 통계 — 방식별 최저/최고/평균 요약
 * 5. 서비스 커버리지 통계 — 어떤 서비스가 얼마나 포함되는지 분석
 *
 * @module comparison-table-utils
 */

import type {
  PriceEntry,
  CleaningMethod,
  IncludedService,
  AirconType,
  City,
  SourcePlatform,
  ExtraCharge,
} from "@/lib/types/price-data";

import {
  CLEANING_METHOD_LABELS,
  INCLUDED_SERVICE_LABELS,
  INCLUDED_SERVICES,
  CLEANING_METHODS,
  SOURCE_PLATFORM_LABELS,
} from "@/lib/types/price-data";

import {
  CLEANING_METHOD_INFO,
  INCLUDED_SERVICE_INFO,
  type CleaningMethodInfo,
  type IncludedServiceInfo,
} from "@/lib/constants/cleaning-services";

// ─────────────────────────────────────────────
// 1. 타입 정의
// ─────────────────────────────────────────────

/** 청소 방식별 그룹화된 엔트리 */
export interface CleaningMethodGroup {
  /** 청소 방식 코드 */
  method: CleaningMethod;
  /** 한글 라벨 */
  label: string;
  /** 짧은 한글 라벨 (모바일 UI용) */
  shortLabel: string;
  /** 청소 방식 설명 */
  description: string;
  /** 해당 방식의 엔트리 목록 (가격 오름차순) */
  entries: PriceEntry[];
  /** 엔트리 수 */
  count: number;
  /** 최저가 */
  minPrice: number;
  /** 최고가 */
  maxPrice: number;
  /** 평균가 */
  avgPrice: number;
}

/** 서비스 포함 여부 매트릭스의 한 행 (= 하나의 PriceEntry) */
export interface ServiceComparisonRow {
  /** 원본 PriceEntry ID */
  entryId: string;
  /** 비식별 업체명 */
  providerName: string;
  /** 청소 방식 코드 */
  cleaningMethod: CleaningMethod;
  /** 청소 방식 한글 라벨 */
  cleaningMethodLabel: string;
  /** 기본 가격 */
  price: number;
  /** 가격 상한 */
  priceMax: number | null;
  /** 가격 표시 텍스트 (포맷팅 완료) */
  priceDisplay: string;
  /** 출처 플랫폼 */
  sourcePlatform: SourcePlatform;
  /** 출처 플랫폼 한글 라벨 */
  sourcePlatformLabel: string;
  /** 원본 출처 URL */
  sourceUrl: string;
  /** 각 표준 서비스의 포함 여부 */
  serviceMatrix: ServiceInclusionStatus[];
  /** 표준 카테고리에 매핑되지 않은 추가 서비스 */
  additionalServices: string[];
  /** 추가 요금 항목 */
  extraCharges: ExtraCharge[];
  /** 포함 서비스 개수 (표준 + 추가) */
  totalServiceCount: number;
  /** 데이터 불완전 여부 */
  isIncomplete: boolean;
  /** 불완전 필드 표시 텍스트 목록 */
  incompleteFieldLabels: string[];
  /** 데이터 최종 확인일 */
  verifiedAt: string;
}

/** 개별 서비스의 포함 상태 */
export interface ServiceInclusionStatus {
  /** 서비스 코드 */
  service: IncludedService;
  /** 서비스 한글 라벨 */
  label: string;
  /** 짧은 라벨 (배지용) */
  shortLabel: string;
  /** 포함 여부 */
  included: boolean;
  /** 해당 에어컨 유형에 적용 가능한지 여부 */
  applicable: boolean;
}

/** 서비스 커버리지 통계 (컬럼 헤더 표시용) */
export interface ServiceCoverageStats {
  /** 서비스 코드 */
  service: IncludedService;
  /** 서비스 한글 라벨 */
  label: string;
  /** 짧은 라벨 */
  shortLabel: string;
  /** 해당 서비스를 포함하는 엔트리 수 */
  includedCount: number;
  /** 전체 엔트리 수 */
  totalCount: number;
  /** 포함 비율 (0~1) */
  inclusionRate: number;
  /** 포함 비율 표시 텍스트 (예: "80%") */
  inclusionRateDisplay: string;
  /** 해당 에어컨 유형에 적용 가능한지 */
  applicable: boolean;
  /** 별도 추가 시 일반적인 비용 */
  typicalExtraCost: number;
}

/** 비교표 전체 가공 데이터 (한 페이지 분량) */
export interface ComparisonTableData {
  /** 청소 방식별 그룹 (표시 우선순위 순) */
  methodGroups: CleaningMethodGroup[];
  /** 전체 엔트리의 서비스 비교 행 데이터 */
  serviceComparisonRows: ServiceComparisonRow[];
  /** 서비스별 커버리지 통계 (컬럼 헤더용) */
  serviceCoverage: ServiceCoverageStats[];
  /** 전체 엔트리 수 */
  totalEntries: number;
  /** 활성 청소 방식 목록 (데이터가 있는 것만) */
  activeCleaningMethods: CleaningMethod[];
  /** 활성 출처 플랫폼 목록 */
  activeSourcePlatforms: SourcePlatform[];
  /** 해당 에어컨 유형에 적용 가능한 서비스 목록 */
  applicableServices: IncludedService[];
}

// ─────────────────────────────────────────────
// 2. 청소 방식별 그룹화
// ─────────────────────────────────────────────

/**
 * PriceEntry 목록을 청소 방식별로 그룹화
 *
 * 각 그룹 내에서 가격 오름차순으로 정렬한다.
 * 엔트리가 없는 청소 방식도 빈 그룹으로 포함하여
 * UI에서 "데이터 없음"을 표시할 수 있도록 한다.
 *
 * @param entries - 정규화된 PriceEntry 목록 (활성 상태만)
 * @param includeEmpty - 엔트리가 없는 방식도 포함할지 여부 (기본: true)
 * @returns 청소 방식별 그룹 배열 (우선순위 순)
 *
 * @example
 * const groups = groupByCleaningMethod(entries);
 * // → [
 * //   { method: "general", label: "일반세척", entries: [...], count: 3, ... },
 * //   { method: "disassembly", label: "분해세척", entries: [...], count: 5, ... },
 * //   { method: "complete-disassembly", label: "완전분해세척", entries: [], count: 0, ... },
 * //   { method: "unknown", label: "미확인", entries: [...], count: 1, ... },
 * // ]
 */
export function groupByCleaningMethod(
  entries: PriceEntry[],
  includeEmpty: boolean = true,
): CleaningMethodGroup[] {
  // 방식별 엔트리 맵 생성
  const groupMap = new Map<CleaningMethod, PriceEntry[]>();
  for (const method of CLEANING_METHODS) {
    groupMap.set(method, []);
  }
  for (const entry of entries) {
    const group = groupMap.get(entry.cleaningMethod);
    if (group) {
      group.push(entry);
    }
  }

  // 그룹 데이터 구성 (우선순위 순)
  const result: CleaningMethodGroup[] = [];
  const sortedMethods = CLEANING_METHOD_INFO.sort(
    (a, b) => a.priority - b.priority,
  );

  for (const methodInfo of sortedMethods) {
    const methodEntries = groupMap.get(methodInfo.code) ?? [];

    if (!includeEmpty && methodEntries.length === 0) continue;

    // 가격 오름차순 정렬
    const sorted = [...methodEntries].sort((a, b) => a.price - b.price);
    const prices = sorted.map((e) => e.price);

    result.push({
      method: methodInfo.code,
      label: methodInfo.label,
      shortLabel: methodInfo.shortLabel,
      description: methodInfo.description,
      entries: sorted,
      count: sorted.length,
      minPrice: prices.length > 0 ? prices[0] : 0,
      maxPrice: prices.length > 0 ? prices[prices.length - 1] : 0,
      avgPrice:
        prices.length > 0
          ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
          : 0,
    });
  }

  return result;
}

// ─────────────────────────────────────────────
// 3. 서비스 포함 여부 매트릭스 변환
// ─────────────────────────────────────────────

/**
 * PriceEntry를 서비스 비교 행으로 변환
 *
 * 표준 서비스 7종에 대해 해당 엔트리의 포함 여부를 O/X 매트릭스로 제공한다.
 * 해당 에어컨 유형에 적용 불가한 서비스는 `applicable: false`로 표시한다.
 *
 * @param entry - 변환할 PriceEntry
 * @param airconType - 현재 페이지의 에어컨 유형 (적용 가능 서비스 판단용)
 * @returns 서비스 비교 행 데이터
 */
export function toServiceComparisonRow(
  entry: PriceEntry,
  airconType: AirconType,
): ServiceComparisonRow {
  const serviceMatrix: ServiceInclusionStatus[] = INCLUDED_SERVICES.map(
    (service) => {
      const info = INCLUDED_SERVICE_INFO.find((s) => s.code === service);
      const applicable =
        !info?.applicableAirconTypes.length ||
        info.applicableAirconTypes.includes(airconType);

      return {
        service,
        label: INCLUDED_SERVICE_LABELS[service],
        shortLabel: info?.shortLabel ?? INCLUDED_SERVICE_LABELS[service],
        included: entry.includedServices.includes(service),
        applicable,
      };
    },
  );

  // 불완전 필드 라벨 생성
  const fieldLabels: Record<string, string> = {
    cleaningMethod: "청소 방식",
    includedServices: "포함 서비스",
    price: "가격",
    airconType: "에어컨 유형",
    regionCity: "지역(시/도)",
    regionDistrict: "지역(구/시)",
  };
  const reasonLabels: Record<string, string> = {
    "not-specified": "미표기",
    ambiguous: "불명확",
    "crawl-error": "수집 오류",
  };

  return {
    entryId: entry.id,
    providerName: entry.providerName,
    cleaningMethod: entry.cleaningMethod,
    cleaningMethodLabel: CLEANING_METHOD_LABELS[entry.cleaningMethod],
    price: entry.price,
    priceMax: entry.priceMax,
    priceDisplay: formatPriceCompact(entry.price, entry.priceMax),
    sourcePlatform: entry.sourcePlatform,
    sourcePlatformLabel: SOURCE_PLATFORM_LABELS[entry.sourcePlatform],
    sourceUrl: entry.sourceUrl,
    serviceMatrix,
    additionalServices: entry.additionalServices,
    extraCharges: entry.extraCharges,
    totalServiceCount:
      entry.includedServices.length + entry.additionalServices.length,
    isIncomplete: entry.isIncomplete,
    incompleteFieldLabels: entry.incompleteFields.map(
      (f) =>
        `${fieldLabels[f.field] ?? f.field} (${reasonLabels[f.reason] ?? f.reason})`,
    ),
    verifiedAt: entry.verifiedAt,
  };
}

/**
 * PriceEntry 목록을 서비스 비교 행 배열로 일괄 변환
 *
 * @param entries - PriceEntry 목록
 * @param airconType - 에어컨 유형
 * @returns 서비스 비교 행 배열
 */
export function toServiceComparisonRows(
  entries: PriceEntry[],
  airconType: AirconType,
): ServiceComparisonRow[] {
  return entries.map((entry) => toServiceComparisonRow(entry, airconType));
}

// ─────────────────────────────────────────────
// 4. 서비스 커버리지 통계
// ─────────────────────────────────────────────

/**
 * 서비스별 포함 비율 통계 계산 (비교표 컬럼 헤더용)
 *
 * 각 표준 서비스가 전체 엔트리 중 몇 %에 포함되는지 계산한다.
 * 비교표의 컬럼 헤더에 "필터 세척 (95%)" 등으로 표시할 수 있다.
 *
 * @param entries - PriceEntry 목록
 * @param airconType - 에어컨 유형 (적용 가능 서비스 판단용)
 * @returns 서비스별 커버리지 통계 배열 (우선순위 순)
 */
export function calculateServiceCoverage(
  entries: PriceEntry[],
  airconType: AirconType,
): ServiceCoverageStats[] {
  const totalCount = entries.length;

  return INCLUDED_SERVICE_INFO
    .sort((a, b) => a.priority - b.priority)
    .map((info) => {
      const applicable =
        info.applicableAirconTypes.length === 0 ||
        info.applicableAirconTypes.includes(airconType);

      const includedCount = entries.filter((e) =>
        e.includedServices.includes(info.code),
      ).length;

      const inclusionRate = totalCount > 0 ? includedCount / totalCount : 0;

      return {
        service: info.code,
        label: info.label,
        shortLabel: info.shortLabel,
        includedCount,
        totalCount,
        inclusionRate,
        inclusionRateDisplay: `${Math.round(inclusionRate * 100)}%`,
        applicable,
        typicalExtraCost: info.typicalExtraCost,
      };
    });
}

// ─────────────────────────────────────────────
// 5. 비교표 전체 데이터 가공 (통합 함수)
// ─────────────────────────────────────────────

/**
 * PriceEntry 목록을 비교표 전체 가공 데이터로 변환
 *
 * 한 SEO 페이지(지역×유형)에 필요한 모든 비교표 데이터를 한 번에 생성한다.
 * - 청소 방식별 그룹
 * - 서비스 비교 매트릭스
 * - 서비스 커버리지 통계
 * - 활성 필터 옵션 목록
 *
 * @param entries - 해당 페이지의 PriceEntry 목록 (활성 상태만)
 * @param airconType - 에어컨 유형
 * @returns 비교표 전체 가공 데이터
 *
 * @example
 * const tableData = buildComparisonTableData(entries, "wall-mount");
 * // tableData.methodGroups → 청소 방식별 탭/그룹
 * // tableData.serviceComparisonRows → 서비스 O/X 매트릭스 행
 * // tableData.serviceCoverage → "필터 세척 95%" 등 컬럼 헤더 통계
 */
export function buildComparisonTableData(
  entries: PriceEntry[],
  airconType: AirconType,
): ComparisonTableData {
  // 활성 엔트리만 필터
  const activeEntries = entries.filter((e) => e.isActive);

  // 청소 방식별 그룹
  const methodGroups = groupByCleaningMethod(activeEntries, true);

  // 서비스 비교 행
  const serviceComparisonRows = toServiceComparisonRows(
    activeEntries,
    airconType,
  );

  // 서비스 커버리지 통계
  const serviceCoverage = calculateServiceCoverage(activeEntries, airconType);

  // 활성 청소 방식 (데이터 있는 것만)
  const activeCleaningMethods = methodGroups
    .filter((g) => g.count > 0)
    .map((g) => g.method);

  // 활성 출처 플랫폼
  const activePlatformSet = new Set(
    activeEntries.map((e) => e.sourcePlatform),
  );
  const activeSourcePlatforms = Array.from(activePlatformSet);

  // 적용 가능한 서비스
  const applicableServices = serviceCoverage
    .filter((s) => s.applicable)
    .map((s) => s.service);

  return {
    methodGroups,
    serviceComparisonRows,
    serviceCoverage,
    totalEntries: activeEntries.length,
    activeCleaningMethods,
    activeSourcePlatforms,
    applicableServices,
  };
}

// ─────────────────────────────────────────────
// 6. 청소 방식 간 가격 비교 데이터
// ─────────────────────────────────────────────

/** 청소 방식별 가격 비교 요약 */
export interface MethodPriceComparison {
  /** 방식 코드 */
  method: CleaningMethod;
  /** 한글 라벨 */
  label: string;
  /** 최저가 */
  minPrice: number;
  /** 최고가 */
  maxPrice: number;
  /** 평균가 */
  avgPrice: number;
  /** 건수 */
  count: number;
  /** 일반세척 대비 가격 배율 (일반 = 1.0 기준). 일반세척 데이터 없으면 null */
  priceRatioVsGeneral: number | null;
}

/**
 * 청소 방식 간 가격 비교 데이터 생성
 *
 * "분해세척은 일반세척 대비 약 1.8배" 등의 비교 데이터를 생성한다.
 * 비교표 상단 요약 섹션에서 방식별 가격 차이를 시각적으로 보여줄 때 사용한다.
 *
 * @param entries - PriceEntry 목록
 * @returns 방식별 가격 비교 배열 (우선순위 순, 데이터 있는 방식만)
 */
export function buildMethodPriceComparison(
  entries: PriceEntry[],
): MethodPriceComparison[] {
  const activeEntries = entries.filter((e) => e.isActive);
  const groups = groupByCleaningMethod(activeEntries, false);

  // 일반세척 평균가 (비교 기준)
  const generalGroup = groups.find((g) => g.method === "general");
  const generalAvg = generalGroup?.avgPrice ?? null;

  return groups.map((group) => ({
    method: group.method,
    label: group.label,
    minPrice: group.minPrice,
    maxPrice: group.maxPrice,
    avgPrice: group.avgPrice,
    count: group.count,
    priceRatioVsGeneral:
      generalAvg && generalAvg > 0 && group.method !== "unknown"
        ? Math.round((group.avgPrice / generalAvg) * 100) / 100
        : null,
  }));
}

// ─────────────────────────────────────────────
// 7. 서비스 가성비 점수
// ─────────────────────────────────────────────

/** 엔트리별 가성비 점수 */
export interface ServiceValueScore {
  /** PriceEntry ID */
  entryId: string;
  /** 업체명 */
  providerName: string;
  /** 가격 (원) */
  price: number;
  /** 포함 서비스 수 (표준만) */
  standardServiceCount: number;
  /** 포함 서비스 수 (표준 + 추가) */
  totalServiceCount: number;
  /** 서비스 1개당 가격 (가격 / 표준서비스수) — 낮을수록 가성비 좋음 */
  pricePerService: number;
  /** 가성비 등급: "best" | "good" | "average" | "below-average" */
  valueRating: "best" | "good" | "average" | "below-average";
}

/**
 * 엔트리별 가성비 점수 계산
 *
 * 서비스 1개당 가격을 계산하여 가성비 등급을 매긴다.
 * 동일 청소 방식 내에서 상대 비교한다.
 *
 * @param entries - PriceEntry 목록 (같은 청소 방식이어야 의미 있음)
 * @returns 가성비 점수 배열 (가성비 좋은 순)
 */
export function calculateServiceValueScores(
  entries: PriceEntry[],
): ServiceValueScore[] {
  const activeEntries = entries.filter(
    (e) => e.isActive && e.includedServices.length > 0,
  );

  if (activeEntries.length === 0) return [];

  const scores: ServiceValueScore[] = activeEntries.map((entry) => {
    const standardCount = entry.includedServices.length;
    const totalCount = standardCount + entry.additionalServices.length;
    const pricePerService =
      standardCount > 0 ? Math.round(entry.price / standardCount) : entry.price;

    return {
      entryId: entry.id,
      providerName: entry.providerName,
      price: entry.price,
      standardServiceCount: standardCount,
      totalServiceCount: totalCount,
      pricePerService,
      valueRating: "average" as const, // 아래에서 재계산
    };
  });

  // 가성비 순 정렬 (pricePerService 오름차순)
  scores.sort((a, b) => a.pricePerService - b.pricePerService);

  // 등급 부여 (상대적 분위)
  const total = scores.length;
  scores.forEach((score, idx) => {
    const percentile = idx / total;
    if (percentile < 0.25) {
      score.valueRating = "best";
    } else if (percentile < 0.5) {
      score.valueRating = "good";
    } else if (percentile < 0.75) {
      score.valueRating = "average";
    } else {
      score.valueRating = "below-average";
    }
  });

  return scores;
}

// ─────────────────────────────────────────────
// 8. 추가 요금 정규화 및 비교 구조 변환
// ─────────────────────────────────────────────

/** 추가 요금 비교 항목 (동일 항목을 업체별로 비교) */
export interface ExtraChargeComparison {
  /** 추가 요금 항목명 (정규화됨) */
  normalizedLabel: string;
  /** 해당 항목이 있는 엔트리별 정보 */
  entries: Array<{
    entryId: string;
    providerName: string;
    amount: number;
    condition: string | null;
  }>;
  /** 최소 추가 금액 */
  minAmount: number;
  /** 최대 추가 금액 */
  maxAmount: number;
}

/**
 * 추가 요금 항목을 정규화하여 업체 간 비교 가능하게 변환
 *
 * "실외기 청소", "실외기 세척" 등 같은 항목을 하나로 묶어
 * 업체별 추가 요금을 비교할 수 있도록 한다.
 *
 * @param entries - PriceEntry 목록
 * @returns 정규화된 추가 요금 비교 배열
 */
export function buildExtraChargeComparison(
  entries: PriceEntry[],
): ExtraChargeComparison[] {
  const chargeMap = new Map<string, ExtraChargeComparison>();

  for (const entry of entries) {
    if (!entry.isActive) continue;

    for (const charge of entry.extraCharges) {
      const normalized = normalizeExtraChargeLabel(charge.label);
      let comparison = chargeMap.get(normalized);

      if (!comparison) {
        comparison = {
          normalizedLabel: normalized,
          entries: [],
          minAmount: Infinity,
          maxAmount: -Infinity,
        };
        chargeMap.set(normalized, comparison);
      }

      comparison.entries.push({
        entryId: entry.id,
        providerName: entry.providerName,
        amount: charge.amount,
        condition: charge.condition,
      });

      if (charge.amount < comparison.minAmount) {
        comparison.minAmount = charge.amount;
      }
      if (charge.amount > comparison.maxAmount) {
        comparison.maxAmount = charge.amount;
      }
    }
  }

  return Array.from(chargeMap.values());
}

// ─────────────────────────────────────────────
// 9. 내부 헬퍼 함수
// ─────────────────────────────────────────────

/**
 * 가격을 간결한 형식으로 포맷
 * "50,000원", "50,000~60,000원"
 */
function formatPriceCompact(
  price: number,
  priceMax: number | null,
): string {
  const formatted = price.toLocaleString("ko-KR");
  if (priceMax === null || priceMax === price) {
    return `${formatted}원`;
  }
  return `${formatted}~${priceMax.toLocaleString("ko-KR")}원`;
}

/**
 * 추가 요금 항목명을 정규화
 *
 * 동일한 의미의 다른 표현을 하나로 통합한다.
 * 예: "실외기 청소", "실외기 세척", "실외기" → "실외기 청소"
 */
function normalizeExtraChargeLabel(label: string): string {
  const normalized = label.trim().toLowerCase();

  // 실외기 관련
  if (/실외기/.test(normalized)) return "실외기 청소";
  // 실내기 추가
  if (/실내기\s*추가/.test(normalized)) return "실내기 추가";
  // 할인
  if (/할인/.test(normalized)) return normalized;
  // 패키지
  if (/패키지/.test(normalized)) return normalized;
  // 4way/천장형 관련
  if (/4way|4방향|천장/.test(normalized)) return "4way 천장형 추가";
  // 살균 소독
  if (/살균|소독/.test(normalized)) return "살균 소독";
  // 곰팡이
  if (/곰팡이/.test(normalized)) return "곰팡이 제거";

  return label.trim();
}

// ─────────────────────────────────────────────
// 10. 비교표 데이터 검증 유틸리티
// ─────────────────────────────────────────────

/** 데이터 품질 요약 */
export interface DataQualitySummary {
  /** 전체 엔트리 수 */
  totalEntries: number;
  /** 활성 엔트리 수 */
  activeEntries: number;
  /** 불완전 데이터 수 */
  incompleteEntries: number;
  /** 불완전 비율 (0~1) */
  incompleteRate: number;
  /** 청소 방식 미확인 수 */
  unknownMethodCount: number;
  /** 포함 서비스 없음 수 (빈 배열) */
  noServicesCount: number;
  /** 비교표 표시 적합 여부 (최소 2건 이상이어야 비교 가능) */
  isComparable: boolean;
  /** 경고 메시지 목록 */
  warnings: string[];
}

/**
 * 비교표 데이터 품질 요약 생성
 *
 * 비교표를 표시하기 전에 데이터 품질을 확인하여
 * 사용자에게 적절한 안내 메시지를 표시할 수 있도록 한다.
 *
 * @param entries - PriceEntry 목록
 * @returns 데이터 품질 요약
 */
export function assessDataQuality(entries: PriceEntry[]): DataQualitySummary {
  const activeEntries = entries.filter((e) => e.isActive);
  const incompleteEntries = activeEntries.filter((e) => e.isIncomplete);
  const unknownMethodCount = activeEntries.filter(
    (e) => e.cleaningMethod === "unknown",
  ).length;
  const noServicesCount = activeEntries.filter(
    (e) => e.includedServices.length === 0,
  ).length;

  const warnings: string[] = [];

  if (activeEntries.length < 2) {
    warnings.push("비교를 위해 최소 2건의 데이터가 필요합니다.");
  }
  if (incompleteEntries.length > activeEntries.length * 0.5) {
    warnings.push("절반 이상의 데이터가 불완전합니다. 참고용으로 활용하세요.");
  }
  if (unknownMethodCount > 0) {
    warnings.push(
      `${unknownMethodCount}건의 청소 방식이 미확인 상태입니다.`,
    );
  }
  if (noServicesCount > 0) {
    warnings.push(
      `${noServicesCount}건의 포함 서비스 정보가 없습니다.`,
    );
  }

  return {
    totalEntries: entries.length,
    activeEntries: activeEntries.length,
    incompleteEntries: incompleteEntries.length,
    incompleteRate:
      activeEntries.length > 0
        ? incompleteEntries.length / activeEntries.length
        : 0,
    unknownMethodCount,
    noServicesCount,
    isComparable: activeEntries.length >= 2,
    warnings,
  };
}
