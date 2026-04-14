/**
 * CleaningComparisonGrid 컴포넌트 테스트
 *
 * 청소 방식별 포함 서비스 비교 그리드의 데이터 가공 및 렌더링을 검증한다.
 */

import { describe, it, expect } from "vitest";
import type { PriceEntry } from "@/lib/types/price-data";
import {
  groupByCleaningMethod,
  buildMethodPriceComparison,
  calculateServiceCoverage,
  buildComparisonTableData,
} from "@/lib/utils/comparison-table-utils";

// ─────────────────────────────────────────────
// 테스트용 PriceEntry 팩토리
// ─────────────────────────────────────────────

function createEntry(overrides: Partial<PriceEntry> = {}): PriceEntry {
  return {
    id: "test-" + Math.random().toString(36).slice(2, 8),
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "gangnam",
    price: 50000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [],
    providerName: "테스트 업체",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/test",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-10T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// 청소 방식별 그룹화 (비교표 컬럼 데이터)
// ─────────────────────────────────────────────

describe("청소 방식별 그룹화 (CleaningComparisonGrid 컬럼)", () => {
  it("3가지 청소 방식으로 올바르게 그룹화된다", () => {
    const entries = [
      createEntry({ cleaningMethod: "general", price: 30000 }),
      createEntry({ cleaningMethod: "general", price: 35000 }),
      createEntry({ cleaningMethod: "disassembly", price: 50000 }),
      createEntry({ cleaningMethod: "disassembly", price: 60000 }),
      createEntry({ cleaningMethod: "complete-disassembly", price: 100000 }),
    ];

    const groups = groupByCleaningMethod(entries);

    const generalGroup = groups.find((g) => g.method === "general");
    const disassemblyGroup = groups.find((g) => g.method === "disassembly");
    const completeGroup = groups.find(
      (g) => g.method === "complete-disassembly",
    );

    expect(generalGroup).toBeDefined();
    expect(generalGroup!.count).toBe(2);
    expect(generalGroup!.minPrice).toBe(30000);
    expect(generalGroup!.maxPrice).toBe(35000);

    expect(disassemblyGroup).toBeDefined();
    expect(disassemblyGroup!.count).toBe(2);

    expect(completeGroup).toBeDefined();
    expect(completeGroup!.count).toBe(1);
    expect(completeGroup!.minPrice).toBe(100000);
  });

  it("데이터가 없는 방식도 빈 그룹으로 포함된다", () => {
    const entries = [
      createEntry({ cleaningMethod: "general", price: 30000 }),
    ];

    const groups = groupByCleaningMethod(entries, true);
    const completeGroup = groups.find(
      (g) => g.method === "complete-disassembly",
    );

    expect(completeGroup).toBeDefined();
    expect(completeGroup!.count).toBe(0);
    expect(completeGroup!.minPrice).toBe(0);
  });

  it("각 그룹 내 엔트리가 가격 오름차순으로 정렬된다", () => {
    const entries = [
      createEntry({ cleaningMethod: "disassembly", price: 70000 }),
      createEntry({ cleaningMethod: "disassembly", price: 45000 }),
      createEntry({ cleaningMethod: "disassembly", price: 55000 }),
    ];

    const groups = groupByCleaningMethod(entries);
    const group = groups.find((g) => g.method === "disassembly")!;

    expect(group.entries[0].price).toBe(45000);
    expect(group.entries[1].price).toBe(55000);
    expect(group.entries[2].price).toBe(70000);
  });
});

// ─────────────────────────────────────────────
// 서비스 커버리지 (비교표 행 데이터)
// ─────────────────────────────────────────────

describe("서비스 커버리지 통계 (행 렌더링 데이터)", () => {
  it("각 포함 서비스별 커버리지 비율을 올바르게 계산한다", () => {
    const entries = [
      createEntry({
        includedServices: ["filter-wash", "sanitization", "operation-check"],
      }),
      createEntry({
        includedServices: ["filter-wash", "sanitization"],
      }),
      createEntry({
        includedServices: ["filter-wash"],
      }),
    ];

    const coverage = calculateServiceCoverage(entries, "wall-mount");

    const filterCoverage = coverage.find((c) => c.service === "filter-wash")!;
    expect(filterCoverage.inclusionRate).toBe(1); // 3/3

    const sanitizationCoverage = coverage.find(
      (c) => c.service === "sanitization",
    )!;
    expect(sanitizationCoverage.inclusionRate).toBeCloseTo(0.667, 2); // 2/3

    const operationCoverage = coverage.find(
      (c) => c.service === "operation-check",
    )!;
    expect(operationCoverage.inclusionRate).toBeCloseTo(0.333, 2); // 1/3
  });

  it("에어컨 유형에 적용 불가한 서비스가 applicable=false로 표시된다", () => {
    const entries = [createEntry()];
    const coverage = calculateServiceCoverage(entries, "window");

    // 실외기 청소는 window 에어컨에는 적용 가능 (applicableAirconTypes에 window 없지만 wall-mount, standing, ceiling, system만 지정)
    const outdoorCoverage = coverage.find(
      (c) => c.service === "outdoor-unit",
    )!;
    expect(outdoorCoverage.applicable).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 방식별 가격 비교 (헤더 데이터)
// ─────────────────────────────────────────────

describe("청소 방식별 가격 비교 데이터", () => {
  it("일반세척 대비 분해세척 가격 비율을 올바르게 계산한다", () => {
    const entries = [
      createEntry({ cleaningMethod: "general", price: 30000 }),
      createEntry({ cleaningMethod: "general", price: 40000 }),
      createEntry({ cleaningMethod: "disassembly", price: 60000 }),
      createEntry({ cleaningMethod: "disassembly", price: 70000 }),
    ];

    const comparison = buildMethodPriceComparison(entries);

    const general = comparison.find((c) => c.method === "general")!;
    expect(general.avgPrice).toBe(35000);
    expect(general.priceRatioVsGeneral).toBe(1);

    const disassembly = comparison.find((c) => c.method === "disassembly")!;
    expect(disassembly.avgPrice).toBe(65000);
    expect(disassembly.priceRatioVsGeneral).toBeCloseTo(1.86, 1);
  });

  it("일반세척 데이터가 없으면 비율이 null이다", () => {
    const entries = [
      createEntry({ cleaningMethod: "disassembly", price: 60000 }),
    ];

    const comparison = buildMethodPriceComparison(entries);
    const disassembly = comparison.find((c) => c.method === "disassembly")!;
    expect(disassembly.priceRatioVsGeneral).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 비교표 전체 데이터 가공
// ─────────────────────────────────────────────

describe("비교표 전체 데이터 가공", () => {
  it("비활성 엔트리를 필터링한다", () => {
    const entries = [
      createEntry({ isActive: true }),
      createEntry({ isActive: false }),
      createEntry({ isActive: true }),
    ];

    const data = buildComparisonTableData(entries, "wall-mount");
    expect(data.totalEntries).toBe(2);
  });

  it("활성 청소 방식 목록을 올바르게 추출한다", () => {
    const entries = [
      createEntry({ cleaningMethod: "general" }),
      createEntry({ cleaningMethod: "disassembly" }),
    ];

    const data = buildComparisonTableData(entries, "wall-mount");
    expect(data.activeCleaningMethods).toContain("general");
    expect(data.activeCleaningMethods).toContain("disassembly");
    expect(data.activeCleaningMethods).not.toContain("complete-disassembly");
  });

  it("서비스 비교 행이 올바른 수로 생성된다", () => {
    const entries = [
      createEntry(),
      createEntry(),
    ];

    const data = buildComparisonTableData(entries, "wall-mount");
    expect(data.serviceComparisonRows.length).toBe(2);
  });

  it("적용 가능 서비스 목록에 해당 에어컨 유형 기준 서비스가 포함된다", () => {
    const entries = [createEntry()];
    const data = buildComparisonTableData(entries, "wall-mount");

    // wall-mount에는 filter-wash, sanitization 등 대부분 적용 가능
    expect(data.applicableServices).toContain("filter-wash");
    expect(data.applicableServices).toContain("sanitization");
  });
});
