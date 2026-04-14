/**
 * 청소 방식 및 포함 서비스 비교 타입/유틸 테스트
 *
 * cleaning-comparison.ts에 정의된 유틸리티 함수와
 * mock-cleaning-comparison.ts의 샘플 데이터 무결성을 검증한다.
 */

import { describe, it, expect } from "vitest";
import {
  getServiceInclusionLevel,
  formatPriceRangeCompact,
  formatDuration,
  SERVICE_INCLUSION_LEVEL_LABELS,
  SERVICE_INCLUSION_LEVEL_COLORS,
} from "../cleaning-comparison";
import type {
  ServiceInclusionLevel,
  CleaningMethodServiceMatrix,
  CleaningMethodComparisonCards,
  DefaultMethodComparison,
} from "../cleaning-comparison";
import {
  DEFAULT_METHOD_COMPARISONS,
  SAMPLE_SERVICE_MATRIX_GANGNAM_WALLMOUNT,
  SAMPLE_COMPARISON_CARDS_GANGNAM_WALLMOUNT,
  MOCK_COMPLETE_DISASSEMBLY_ENTRIES,
  MOCK_GENERAL_CLEANING_ENTRIES,
  getDefaultMethodComparison,
  getAllMockEntries,
} from "@/data/mock-cleaning-comparison";
import { AIRCON_TYPES, INCLUDED_SERVICES } from "../price-data";

// ─────────────────────────────────────────────
// 1. getServiceInclusionLevel 테스트
// ─────────────────────────────────────────────

describe("getServiceInclusionLevel", () => {
  it("데이터 없으면 no-data를 반환한다", () => {
    expect(getServiceInclusionLevel(0, 0)).toBe("no-data");
    expect(getServiceInclusionLevel(0.5, 0)).toBe("no-data");
  });

  it("포함 비율 0%이면 not-included를 반환한다", () => {
    expect(getServiceInclusionLevel(0, 5)).toBe("not-included");
  });

  it("포함 비율 90% 이상이면 always를 반환한다", () => {
    expect(getServiceInclusionLevel(0.9, 10)).toBe("always");
    expect(getServiceInclusionLevel(1.0, 3)).toBe("always");
  });

  it("포함 비율 60~89%이면 usually를 반환한다", () => {
    expect(getServiceInclusionLevel(0.6, 10)).toBe("usually");
    expect(getServiceInclusionLevel(0.89, 10)).toBe("usually");
  });

  it("포함 비율 30~59%이면 sometimes를 반환한다", () => {
    expect(getServiceInclusionLevel(0.3, 10)).toBe("sometimes");
    expect(getServiceInclusionLevel(0.59, 10)).toBe("sometimes");
  });

  it("포함 비율 30% 미만이면 rarely를 반환한다", () => {
    expect(getServiceInclusionLevel(0.1, 10)).toBe("rarely");
    expect(getServiceInclusionLevel(0.29, 10)).toBe("rarely");
  });
});

// ─────────────────────────────────────────────
// 2. formatPriceRangeCompact 테스트
// ─────────────────────────────────────────────

describe("formatPriceRangeCompact", () => {
  it("동일 가격은 단일 만원으로 표시한다", () => {
    expect(formatPriceRangeCompact(50000, 50000)).toBe("5만원");
  });

  it("다른 가격은 범위로 표시한다", () => {
    expect(formatPriceRangeCompact(30000, 80000)).toBe("3~8만원");
  });

  it("10만원 이상도 올바르게 표시한다", () => {
    expect(formatPriceRangeCompact(100000, 150000)).toBe("10~15만원");
  });
});

// ─────────────────────────────────────────────
// 3. formatDuration 테스트
// ─────────────────────────────────────────────

describe("formatDuration", () => {
  it("동일 시간은 약으로 표시한다", () => {
    expect(formatDuration(30, 30)).toBe("약 30분");
  });

  it("분 단위 범위를 표시한다", () => {
    expect(formatDuration(20, 40)).toBe("20~40분");
  });

  it("60분 이상은 시간 단위로 변환한다", () => {
    expect(formatDuration(60, 120)).toBe("1시간~2시간");
  });

  it("분+시간 혼합을 올바르게 표시한다", () => {
    expect(formatDuration(40, 90)).toBe("40분~1시간 30분");
  });
});

// ─────────────────────────────────────────────
// 4. SERVICE_INCLUSION_LEVEL 상수 검증
// ─────────────────────────────────────────────

describe("SERVICE_INCLUSION_LEVEL constants", () => {
  const allLevels: ServiceInclusionLevel[] = [
    "always",
    "usually",
    "sometimes",
    "rarely",
    "not-included",
    "no-data",
  ];

  it("모든 수준에 대해 한글 라벨이 정의되어 있다", () => {
    for (const level of allLevels) {
      expect(SERVICE_INCLUSION_LEVEL_LABELS[level]).toBeDefined();
      expect(SERVICE_INCLUSION_LEVEL_LABELS[level].length).toBeGreaterThan(0);
    }
  });

  it("모든 수준에 대해 UI 색상이 정의되어 있다", () => {
    for (const level of allLevels) {
      expect(SERVICE_INCLUSION_LEVEL_COLORS[level]).toBeDefined();
      expect(SERVICE_INCLUSION_LEVEL_COLORS[level].length).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────
// 5. DEFAULT_METHOD_COMPARISONS 데이터 무결성
// ─────────────────────────────────────────────

describe("DEFAULT_METHOD_COMPARISONS", () => {
  it("모든 에어컨 유형에 대해 비교 데이터가 존재한다", () => {
    for (const type of AIRCON_TYPES) {
      const comparison = getDefaultMethodComparison(type);
      expect(comparison).toBeDefined();
      expect(comparison!.airconType).toBe(type);
    }
  });

  it("각 유형마다 3개 청소 방식(일반/분해/완전분해) 데이터가 있다", () => {
    for (const comparison of DEFAULT_METHOD_COMPARISONS) {
      expect(comparison.methods).toHaveLength(3);
      const methods = comparison.methods.map((m) => m.method);
      expect(methods).toContain("general");
      expect(methods).toContain("disassembly");
      expect(methods).toContain("complete-disassembly");
    }
  });

  it("가격 범위가 일반 < 분해 < 완전분해 순서다", () => {
    for (const comparison of DEFAULT_METHOD_COMPARISONS) {
      const general = comparison.methods.find((m) => m.method === "general")!;
      const disassembly = comparison.methods.find(
        (m) => m.method === "disassembly",
      )!;
      const complete = comparison.methods.find(
        (m) => m.method === "complete-disassembly",
      )!;

      expect(general.priceRange.min).toBeLessThanOrEqual(
        disassembly.priceRange.min,
      );
      expect(disassembly.priceRange.min).toBeLessThanOrEqual(
        complete.priceRange.min,
      );
    }
  });

  it("소요 시간이 일반 < 분해 < 완전분해 순서다", () => {
    for (const comparison of DEFAULT_METHOD_COMPARISONS) {
      const general = comparison.methods.find((m) => m.method === "general")!;
      const disassembly = comparison.methods.find(
        (m) => m.method === "disassembly",
      )!;
      const complete = comparison.methods.find(
        (m) => m.method === "complete-disassembly",
      )!;

      expect(general.duration.min).toBeLessThanOrEqual(
        disassembly.duration.min,
      );
      expect(disassembly.duration.min).toBeLessThanOrEqual(
        complete.duration.min,
      );
    }
  });

  it("완전분해세척이 가장 많은 서비스를 포함한다", () => {
    for (const comparison of DEFAULT_METHOD_COMPARISONS) {
      const general = comparison.methods.find((m) => m.method === "general")!;
      const complete = comparison.methods.find(
        (m) => m.method === "complete-disassembly",
      )!;

      expect(complete.typicallyIncluded.length).toBeGreaterThanOrEqual(
        general.typicallyIncluded.length,
      );
    }
  });

  it("모든 포함 서비스가 유효한 IncludedService 값이다", () => {
    const validServices = [...INCLUDED_SERVICES];
    for (const comparison of DEFAULT_METHOD_COMPARISONS) {
      for (const method of comparison.methods) {
        for (const service of method.typicallyIncluded) {
          expect(validServices).toContain(service);
        }
        for (const service of method.typicallyExtra) {
          expect(validServices).toContain(service);
        }
      }
    }
  });

  it("추천 대상 텍스트가 비어있지 않다", () => {
    for (const comparison of DEFAULT_METHOD_COMPARISONS) {
      for (const method of comparison.methods) {
        expect(method.recommendedFor.length).toBeGreaterThan(0);
      }
    }
  });
});

// ─────────────────────────────────────────────
// 6. SAMPLE_SERVICE_MATRIX 데이터 검증
// ─────────────────────────────────────────────

describe("SAMPLE_SERVICE_MATRIX_GANGNAM_WALLMOUNT", () => {
  const matrix = SAMPLE_SERVICE_MATRIX_GANGNAM_WALLMOUNT;

  it("올바른 지역과 유형이 설정되어 있다", () => {
    expect(matrix.airconType).toBe("wall-mount");
    expect(matrix.regionCity).toBe("seoul");
    expect(matrix.regionDistrict).toBe("gangnam");
  });

  it("7개 표준 서비스 모두에 대한 행이 있다", () => {
    expect(matrix.rows).toHaveLength(7);
    const services = matrix.rows.map((r) => r.service);
    for (const service of INCLUDED_SERVICES) {
      expect(services).toContain(service);
    }
  });

  it("각 행에 3개 청소 방식(일반/분해/완전분해)의 데이터가 있다", () => {
    for (const row of matrix.rows) {
      expect(row.byMethod).toHaveProperty("general");
      expect(row.byMethod).toHaveProperty("disassembly");
      expect(row.byMethod).toHaveProperty("complete-disassembly");
    }
  });

  it("포함 비율이 0~1 범위 내다", () => {
    for (const row of matrix.rows) {
      for (const detail of Object.values(row.byMethod)) {
        expect(detail.rate).toBeGreaterThanOrEqual(0);
        expect(detail.rate).toBeLessThanOrEqual(1);
      }
    }
  });

  it("완전분해세척의 서비스 포함율이 일반세척보다 높거나 같다", () => {
    for (const row of matrix.rows) {
      expect(row.byMethod["complete-disassembly"].rate).toBeGreaterThanOrEqual(
        row.byMethod.general.rate,
      );
    }
  });

  it("필터 세척은 모든 방식에서 100% 포함이다", () => {
    const filterRow = matrix.rows.find((r) => r.service === "filter-wash")!;
    expect(filterRow.byMethod.general.rate).toBe(1.0);
    expect(filterRow.byMethod.disassembly.rate).toBe(1.0);
    expect(filterRow.byMethod["complete-disassembly"].rate).toBe(1.0);
  });

  it("3개 청소 방식 요약이 있다", () => {
    expect(matrix.methodSummaries).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────
// 7. SAMPLE_COMPARISON_CARDS 데이터 검증
// ─────────────────────────────────────────────

describe("SAMPLE_COMPARISON_CARDS_GANGNAM_WALLMOUNT", () => {
  const cards = SAMPLE_COMPARISON_CARDS_GANGNAM_WALLMOUNT;

  it("3개 비교 카드가 있다", () => {
    expect(cards.cards).toHaveLength(3);
  });

  it("일반 → 분해 → 완전분해 순서다", () => {
    expect(cards.cards[0].method).toBe("general");
    expect(cards.cards[1].method).toBe("disassembly");
    expect(cards.cards[2].method).toBe("complete-disassembly");
  });

  it("평균 가격이 일반 < 분해 < 완전분해 순서다", () => {
    expect(cards.cards[0].avgPrice).toBeLessThan(cards.cards[1].avgPrice);
    expect(cards.cards[1].avgPrice).toBeLessThan(cards.cards[2].avgPrice);
  });

  it("포함 서비스 수가 일반 ≤ 분해 ≤ 완전분해 순서다", () => {
    expect(cards.cards[0].includedServices.length).toBeLessThanOrEqual(
      cards.cards[1].includedServices.length,
    );
    expect(cards.cards[1].includedServices.length).toBeLessThanOrEqual(
      cards.cards[2].includedServices.length,
    );
  });

  it("비교 인사이트 텍스트가 있다", () => {
    expect(cards.comparisonInsight.length).toBeGreaterThan(0);
  });

  it("각 카드에 출처 플랫폼 정보가 있다", () => {
    for (const card of cards.cards) {
      expect(card.sourcePlatforms.length).toBeGreaterThan(0);
    }
  });

  it("각 카드에 데이터 건수가 1 이상이다", () => {
    for (const card of cards.cards) {
      expect(card.dataCount).toBeGreaterThanOrEqual(1);
    }
  });
});

// ─────────────────────────────────────────────
// 8. 완전분해세척 보충 엔트리 검증
// ─────────────────────────────────────────────

describe("MOCK_COMPLETE_DISASSEMBLY_ENTRIES", () => {
  it("모든 엔트리가 complete-disassembly 방식이다", () => {
    for (const entry of MOCK_COMPLETE_DISASSEMBLY_ENTRIES) {
      expect(entry.cleaningMethod).toBe("complete-disassembly");
    }
  });

  it("모든 엔트리에 고유 ID가 있다", () => {
    const ids = MOCK_COMPLETE_DISASSEMBLY_ENTRIES.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("모든 엔트리에 필터 세척이 포함되어 있다", () => {
    for (const entry of MOCK_COMPLETE_DISASSEMBLY_ENTRIES) {
      expect(entry.includedServices).toContain("filter-wash");
    }
  });

  it("모든 엔트리에 항균·살균이 포함되어 있다", () => {
    for (const entry of MOCK_COMPLETE_DISASSEMBLY_ENTRIES) {
      expect(entry.includedServices).toContain("sanitization");
    }
  });

  it("모든 엔트리의 가격이 정상 범위(60,000~300,000원)이다", () => {
    for (const entry of MOCK_COMPLETE_DISASSEMBLY_ENTRIES) {
      expect(entry.price).toBeGreaterThanOrEqual(60000);
      expect(entry.price).toBeLessThanOrEqual(300000);
    }
  });

  it("서울과 경기 양쪽 모두 데이터가 있다", () => {
    const cities = new Set(MOCK_COMPLETE_DISASSEMBLY_ENTRIES.map((e) => e.regionCity));
    expect(cities).toContain("seoul");
    expect(cities).toContain("gyeonggi");
  });

  it("모든 엔트리가 활성 상태다", () => {
    for (const entry of MOCK_COMPLETE_DISASSEMBLY_ENTRIES) {
      expect(entry.isActive).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────
// 9. 일반세척 보충 엔트리 검증
// ─────────────────────────────────────────────

describe("MOCK_GENERAL_CLEANING_ENTRIES", () => {
  it("모든 엔트리가 general 방식이다", () => {
    for (const entry of MOCK_GENERAL_CLEANING_ENTRIES) {
      expect(entry.cleaningMethod).toBe("general");
    }
  });

  it("모든 엔트리에 고유 ID가 있다", () => {
    const ids = MOCK_GENERAL_CLEANING_ENTRIES.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("모든 엔트리에 필터 세척이 포함되어 있다", () => {
    for (const entry of MOCK_GENERAL_CLEANING_ENTRIES) {
      expect(entry.includedServices).toContain("filter-wash");
    }
  });

  it("가격이 일반세척 정상 범위(25,000~100,000원)이다", () => {
    for (const entry of MOCK_GENERAL_CLEANING_ENTRIES) {
      expect(entry.price).toBeGreaterThanOrEqual(25000);
      expect(entry.price).toBeLessThanOrEqual(100000);
    }
  });
});

// ─────────────────────────────────────────────
// 10. getAllMockEntries 통합 검증
// ─────────────────────────────────────────────

describe("getAllMockEntries", () => {
  it("기존 엔트리 + 보충 엔트리를 합친 배열을 반환한다", () => {
    const existing = [MOCK_COMPLETE_DISASSEMBLY_ENTRIES[0]]; // 1개
    const all = getAllMockEntries(existing);
    expect(all.length).toBe(
      1 +
        MOCK_COMPLETE_DISASSEMBLY_ENTRIES.length +
        MOCK_GENERAL_CLEANING_ENTRIES.length,
    );
  });

  it("모든 청소 방식이 포함되어 있다", () => {
    const all = getAllMockEntries([]);
    const methods = new Set(all.map((e) => e.cleaningMethod));
    expect(methods).toContain("complete-disassembly");
    expect(methods).toContain("general");
  });
});
