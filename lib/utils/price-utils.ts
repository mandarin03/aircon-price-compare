/**
 * 가격 데이터 유틸리티 함수
 *
 * 데이터 정규화, 통계 계산, 필터/정렬 처리
 */

import type {
  PriceEntry,
  PriceSummary,
  FilterOptions,
  SortOptions,
  AirconType,
  City,
  CleaningMethod,
  IncludedService,
} from "@/lib/types/price-data";

import {
  AIRCON_TYPE_LABELS,
  CLEANING_METHOD_LABELS,
  DEFAULT_FILTER_OPTIONS,
  DEFAULT_SORT_OPTIONS,
} from "@/lib/types/price-data";

// ─────────────────────────────────────────────
// 가격 통계 계산
// ─────────────────────────────────────────────

/** 특정 지역×유형 조합의 가격 통계 요약 생성 */
export function calculatePriceSummary(
  entries: PriceEntry[],
  airconType: AirconType,
  regionCity: City,
  regionDistrict: string
): PriceSummary {
  const filtered = entries.filter(
    (e) =>
      e.airconType === airconType &&
      e.regionCity === regionCity &&
      e.regionDistrict === regionDistrict &&
      e.isActive
  );

  if (filtered.length === 0) {
    return {
      airconType,
      regionCity,
      regionDistrict,
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0,
      medianPrice: 0,
      totalEntries: 0,
      generalCount: 0,
      disassemblyCount: 0,
      completeDisassemblyCount: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  const prices = filtered.map((e) => e.price).sort((a, b) => a - b);
  const mid = Math.floor(prices.length / 2);

  return {
    airconType,
    regionCity,
    regionDistrict,
    minPrice: prices[0],
    maxPrice: prices[prices.length - 1],
    avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    medianPrice:
      prices.length % 2 === 0
        ? Math.round((prices[mid - 1] + prices[mid]) / 2)
        : prices[mid],
    totalEntries: filtered.length,
    generalCount: filtered.filter(
      (e) => e.cleaningMethod === "general"
    ).length,
    disassemblyCount: filtered.filter(
      (e) => e.cleaningMethod === "disassembly"
    ).length,
    completeDisassemblyCount: filtered.filter(
      (e) => e.cleaningMethod === "complete-disassembly"
    ).length,
    lastUpdated: filtered
      .map((e) => e.verifiedAt)
      .sort()
      .reverse()[0],
  };
}

// ─────────────────────────────────────────────
// 필터 & 정렬
// ─────────────────────────────────────────────

/** 필터 적용 */
export function applyFilters(
  entries: PriceEntry[],
  filters: FilterOptions = DEFAULT_FILTER_OPTIONS
): PriceEntry[] {
  return entries.filter((entry) => {
    // 활성 데이터만
    if (!entry.isActive) return false;

    // 청소 방식 필터
    if (
      filters.cleaningMethod !== "all" &&
      entry.cleaningMethod !== filters.cleaningMethod
    ) {
      return false;
    }

    // 필수 포함 서비스 필터 (AND 조건)
    if (filters.requiredServices.length > 0) {
      const hasAll = filters.requiredServices.every((s) =>
        entry.includedServices.includes(s)
      );
      if (!hasAll) return false;
    }

    // 가격 범위 필터
    if (filters.priceRange.min !== null && entry.price < filters.priceRange.min) {
      return false;
    }
    if (filters.priceRange.max !== null && entry.price > filters.priceRange.max) {
      return false;
    }

    // 출처 플랫폼 필터
    if (
      filters.sourcePlatform !== "all" &&
      entry.sourcePlatform !== filters.sourcePlatform
    ) {
      return false;
    }

    // 불완전 데이터 포함 여부
    if (!filters.includeIncomplete && entry.isIncomplete) {
      return false;
    }

    return true;
  });
}

/** 정렬 적용 */
export function applySort(
  entries: PriceEntry[],
  sort: SortOptions = DEFAULT_SORT_OPTIONS
): PriceEntry[] {
  const sorted = [...entries];
  const dir = sort.direction === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    switch (sort.field) {
      case "price":
        return (a.price - b.price) * dir;
      case "includedServicesCount":
        return (
          (a.includedServices.length - b.includedServices.length) * dir
        );
      case "verifiedAt":
        return a.verifiedAt.localeCompare(b.verifiedAt) * dir;
      case "sourcePlatform":
        return a.sourcePlatform.localeCompare(b.sourcePlatform) * dir;
      default:
        return 0;
    }
  });

  return sorted;
}

// ─────────────────────────────────────────────
// 가격 포맷팅
// ─────────────────────────────────────────────

/** 가격을 한국 원화 형식으로 포맷 */
export function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR") + "원";
}

/** 가격 범위를 포맷 */
export function formatPriceRange(
  price: number,
  priceMax: number | null
): string {
  if (priceMax === null) {
    return formatPrice(price);
  }
  return `${formatPrice(price)} ~ ${formatPrice(priceMax)}`;
}

// ─────────────────────────────────────────────
// SEO 슬러그 생성
// ─────────────────────────────────────────────

/** 지역×유형 조합의 URL 슬러그 생성 */
export function generatePageSlug(
  citySlug: string,
  districtSlug: string,
  airconType: AirconType
): string {
  return `/${citySlug}/${districtSlug}/${airconType}`;
}

/** SEO 페이지 타이틀 생성 */
export function generatePageTitle(
  cityLabel: string,
  districtLabel: string,
  airconType: AirconType
): string {
  const typeLabel = AIRCON_TYPE_LABELS[airconType];
  return `${cityLabel} ${districtLabel} ${typeLabel} 청소 가격 비교 | 2026년 최신`;
}

/** SEO 메타 디스크립션 생성 */
export function generateMetaDescription(
  cityLabel: string,
  districtLabel: string,
  airconType: AirconType,
  summary: PriceSummary
): string {
  const typeLabel = AIRCON_TYPE_LABELS[airconType];
  if (summary.totalEntries === 0) {
    return `${cityLabel} ${districtLabel} ${typeLabel} 청소 업체 가격을 한눈에 비교하세요. 일반세척·분해세척·완전분해세척 방식별 가격, 포함 서비스를 투명하게 확인할 수 있습니다.`;
  }
  return `${cityLabel} ${districtLabel} ${typeLabel} 청소 가격 ${formatPrice(summary.minPrice)}~${formatPrice(summary.maxPrice)} (${summary.totalEntries}개 업체 비교). 일반세척·분해세척·완전분해세척, 포함 서비스까지 한눈에 비교하세요.`;
}

// ─────────────────────────────────────────────
// 크롤링 데이터 정규화 헬퍼
// ─────────────────────────────────────────────

// 가격 정규화는 @/lib/normalizers/price-normalizer 모듈로 이전됨.
// 하위 호환을 위해 parsePriceForEntry를 re-export 한다.
import { parsePriceForEntry, normalizePrice } from "@/lib/normalizers/price-normalizer";

/**
 * 원본 가격 텍스트를 숫자로 파싱
 *
 * @deprecated parsePriceForEntry() 또는 normalizePrice()를 직접 사용하라.
 * 이 함수는 하위 호환을 위해 유지된다.
 */
export function parsePrice(
  priceText: string
): { price: number; priceMax: number | null } | null {
  return parsePriceForEntry(priceText);
}

export { parsePriceForEntry, normalizePrice };

/** 청소 방식 텍스트를 표준 카테고리로 매핑 */
export function normalizeCleaningMethod(text: string): CleaningMethod {
  const lower = text.trim().toLowerCase();
  // 완전분해 → 분해 → 일반 순서로 검사 (구체적인 것 우선)
  if (/완전\s*분해|전체\s*분해|풀\s*분해|오버홀|complete[\s-]?disassembly|full[\s-]?disassembly/i.test(lower)) return "complete-disassembly";
  if (/분해/.test(lower) && !/비분해/.test(lower)) return "disassembly";
  if (/비분해|간편|일반|기본|스팀|고압|외부|약품|general|basic|standard|steam|non[\s-]?disassembly/i.test(lower)) return "general";
  return "unknown";
}

/** 포함 서비스 텍스트를 표준 카테고리로 매핑 */
export function normalizeIncludedServices(
  text: string
): { matched: IncludedService[]; unmatched: string[] } {
  const matched: IncludedService[] = [];
  const unmatched: string[] = [];

  const servicePatterns: [RegExp, IncludedService][] = [
    [/필터\s*세척|필터\s*청소/, "filter-wash"],
    [/살균|항균|소독/, "sanitization"],
    [/실외기/, "outdoor-unit"],
    [/배수관|드레인/, "drain-pipe"],
    [/곰팡이/, "mold-removal"],
    [/냄새|탈취/, "odor-removal"],
    [/점검|테스트|작동/, "operation-check"],
  ];

  const items = text.split(/[,·\n]/);
  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed) continue;

    let found = false;
    for (const [pattern, service] of servicePatterns) {
      if (pattern.test(trimmed) && !matched.includes(service)) {
        matched.push(service);
        found = true;
        break;
      }
    }
    if (!found) {
      unmatched.push(trimmed);
    }
  }

  return { matched, unmatched };
}
