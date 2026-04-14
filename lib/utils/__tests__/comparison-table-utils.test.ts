/**
 * 비교표 데이터 가공 유틸리티 테스트
 *
 * 정규화된 청소 방식 및 포함 서비스 데이터가 비교표에 적합한 구조로
 * 올바르게 변환되는지 검증한다.
 */

import { describe, it, expect } from "vitest";
import type { PriceEntry, AirconType } from "@/lib/types/price-data";
import {
  groupByCleaningMethod,
  toServiceComparisonRow,
  toServiceComparisonRows,
  calculateServiceCoverage,
  buildComparisonTableData,
  buildMethodPriceComparison,
  calculateServiceValueScores,
  buildExtraChargeComparison,
  assessDataQuality,
} from "../comparison-table-utils";

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
// 1. groupByCleaningMethod 테스트
// ─────────────────────────────────────────────

describe("groupByCleaningMethod", () => {
  it("빈 배열 → 모든 방식의 빈 그룹을 반환 (includeEmpty=true)", () => {
    const groups = groupByCleaningMethod([]);
    expect(groups.length).toBeGreaterThanOrEqual(4); // general, disassembly, complete-disassembly, unknown
    groups.forEach((g) => {
      expect(g.count).toBe(0);
      expect(g.entries).toEqual([]);
      expect(g.minPrice).toBe(0);
      expect(g.maxPrice).toBe(0);
      expect(g.avgPrice).toBe(0);
    });
  });

  it("빈 배열 → 빈 배열 반환 (includeEmpty=false)", () => {
    const groups = groupByCleaningMethod([], false);
    expect(groups).toEqual([]);
  });

  it("청소 방식별로 정확하게 그룹화", () => {
    const entries = [
      createEntry({ cleaningMethod: "general", price: 30000 }),
      createEntry({ cleaningMethod: "disassembly", price: 50000 }),
      createEntry({ cleaningMethod: "disassembly", price: 60000 }),
      createEntry({ cleaningMethod: "complete-disassembly", price: 100000 }),
    ];

    const groups = groupByCleaningMethod(entries, false);

    const generalGroup = groups.find((g) => g.method === "general");
    const disassemblyGroup = groups.find((g) => g.method === "disassembly");
    const completeGroup = groups.find(
      (g) => g.method === "complete-disassembly",
    );

    expect(generalGroup?.count).toBe(1);
    expect(disassemblyGroup?.count).toBe(2);
    expect(completeGroup?.count).toBe(1);
  });

  it("각 그룹 내에서 가격 오름차순 정렬", () => {
    const entries = [
      createEntry({ cleaningMethod: "disassembly", price: 70000 }),
      createEntry({ cleaningMethod: "disassembly", price: 40000 }),
      createEntry({ cleaningMethod: "disassembly", price: 55000 }),
    ];

    const groups = groupByCleaningMethod(entries, false);
    const group = groups.find((g) => g.method === "disassembly")!;

    expect(group.entries[0].price).toBe(40000);
    expect(group.entries[1].price).toBe(55000);
    expect(group.entries[2].price).toBe(70000);
  });

  it("가격 통계(min/max/avg) 정확히 계산", () => {
    const entries = [
      createEntry({ cleaningMethod: "disassembly", price: 40000 }),
      createEntry({ cleaningMethod: "disassembly", price: 60000 }),
      createEntry({ cleaningMethod: "disassembly", price: 80000 }),
    ];

    const groups = groupByCleaningMethod(entries, false);
    const group = groups.find((g) => g.method === "disassembly")!;

    expect(group.minPrice).toBe(40000);
    expect(group.maxPrice).toBe(80000);
    expect(group.avgPrice).toBe(60000);
  });

  it("한글 라벨과 설명이 정확히 포함", () => {
    const entries = [createEntry({ cleaningMethod: "general", price: 30000 })];
    const groups = groupByCleaningMethod(entries, false);
    const group = groups.find((g) => g.method === "general")!;

    expect(group.label).toBe("일반세척");
    expect(group.shortLabel).toBe("일반");
    expect(group.description).toBeTruthy();
  });

  it("우선순위 순서로 정렬 (일반 → 분해 → 완전분해 → 미확인)", () => {
    const entries = [
      createEntry({ cleaningMethod: "unknown", price: 40000 }),
      createEntry({ cleaningMethod: "complete-disassembly", price: 100000 }),
      createEntry({ cleaningMethod: "general", price: 30000 }),
      createEntry({ cleaningMethod: "disassembly", price: 50000 }),
    ];

    const groups = groupByCleaningMethod(entries, false);
    const methods = groups.map((g) => g.method);

    expect(methods.indexOf("general")).toBeLessThan(
      methods.indexOf("disassembly"),
    );
    expect(methods.indexOf("disassembly")).toBeLessThan(
      methods.indexOf("complete-disassembly"),
    );
  });
});

// ─────────────────────────────────────────────
// 2. toServiceComparisonRow 테스트
// ─────────────────────────────────────────────

describe("toServiceComparisonRow", () => {
  it("표준 서비스 7종에 대한 포함 여부 매트릭스 생성", () => {
    const entry = createEntry({
      includedServices: ["filter-wash", "sanitization", "mold-removal"],
    });

    const row = toServiceComparisonRow(entry, "wall-mount");

    expect(row.serviceMatrix.length).toBe(7);

    const filterWash = row.serviceMatrix.find(
      (s) => s.service === "filter-wash",
    )!;
    expect(filterWash.included).toBe(true);
    expect(filterWash.label).toBe("필터 세척");

    const sanitization = row.serviceMatrix.find(
      (s) => s.service === "sanitization",
    )!;
    expect(sanitization.included).toBe(true);

    const outdoorUnit = row.serviceMatrix.find(
      (s) => s.service === "outdoor-unit",
    )!;
    expect(outdoorUnit.included).toBe(false);

    const moldRemoval = row.serviceMatrix.find(
      (s) => s.service === "mold-removal",
    )!;
    expect(moldRemoval.included).toBe(true);
  });

  it("청소 방식 한글 라벨 정확히 매핑", () => {
    const entry = createEntry({ cleaningMethod: "complete-disassembly" });
    const row = toServiceComparisonRow(entry, "wall-mount");
    expect(row.cleaningMethodLabel).toBe("완전분해세척");
  });

  it("가격 표시 텍스트 (단일 가격)", () => {
    const entry = createEntry({ price: 50000, priceMax: null });
    const row = toServiceComparisonRow(entry, "wall-mount");
    expect(row.priceDisplay).toBe("50,000원");
  });

  it("가격 표시 텍스트 (범위 가격)", () => {
    const entry = createEntry({ price: 50000, priceMax: 70000 });
    const row = toServiceComparisonRow(entry, "wall-mount");
    expect(row.priceDisplay).toBe("50,000~70,000원");
  });

  it("totalServiceCount는 표준 + 추가 서비스 합계", () => {
    const entry = createEntry({
      includedServices: ["filter-wash", "sanitization"],
      additionalServices: ["친환경 세제"],
    });
    const row = toServiceComparisonRow(entry, "wall-mount");
    expect(row.totalServiceCount).toBe(3);
  });

  it("불완전 데이터의 필드 라벨이 한글로 표시", () => {
    const entry = createEntry({
      isIncomplete: true,
      incompleteFields: [
        { field: "cleaningMethod", reason: "not-specified" },
        { field: "includedServices", reason: "ambiguous" },
      ],
    });
    const row = toServiceComparisonRow(entry, "wall-mount");
    expect(row.isIncomplete).toBe(true);
    expect(row.incompleteFieldLabels).toContain("청소 방식 (미표기)");
    expect(row.incompleteFieldLabels).toContain("포함 서비스 (불명확)");
  });

  it("에어컨 유형별 적용 가능 서비스 표시 (창문형은 실외기 N/A)", () => {
    const entry = createEntry({
      airconType: "window",
      includedServices: ["filter-wash"],
    });
    const row = toServiceComparisonRow(entry, "window");
    const outdoorUnit = row.serviceMatrix.find(
      (s) => s.service === "outdoor-unit",
    )!;
    // 창문형은 실외기 서비스가 적용 가능 목록에 포함되지 않음
    // (INCLUDED_SERVICE_INFO의 applicableAirconTypes에 window가 없음)
    expect(outdoorUnit.applicable).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 3. toServiceComparisonRows 테스트
// ─────────────────────────────────────────────

describe("toServiceComparisonRows", () => {
  it("복수 엔트리를 일괄 변환", () => {
    const entries = [
      createEntry({ id: "a" }),
      createEntry({ id: "b" }),
      createEntry({ id: "c" }),
    ];
    const rows = toServiceComparisonRows(entries, "wall-mount");
    expect(rows.length).toBe(3);
    expect(rows[0].entryId).toBe("a");
    expect(rows[1].entryId).toBe("b");
    expect(rows[2].entryId).toBe("c");
  });
});

// ─────────────────────────────────────────────
// 4. calculateServiceCoverage 테스트
// ─────────────────────────────────────────────

describe("calculateServiceCoverage", () => {
  it("모든 엔트리가 포함하는 서비스 → 100%", () => {
    const entries = [
      createEntry({ includedServices: ["filter-wash", "sanitization"] }),
      createEntry({ includedServices: ["filter-wash", "sanitization"] }),
    ];
    const coverage = calculateServiceCoverage(entries, "wall-mount");
    const filterCov = coverage.find((c) => c.service === "filter-wash")!;
    expect(filterCov.inclusionRate).toBe(1.0);
    expect(filterCov.inclusionRateDisplay).toBe("100%");
  });

  it("절반이 포함하는 서비스 → 50%", () => {
    const entries = [
      createEntry({
        includedServices: ["filter-wash", "sanitization", "mold-removal"],
      }),
      createEntry({ includedServices: ["filter-wash", "sanitization"] }),
    ];
    const coverage = calculateServiceCoverage(entries, "wall-mount");
    const moldCov = coverage.find((c) => c.service === "mold-removal")!;
    expect(moldCov.inclusionRate).toBe(0.5);
    expect(moldCov.inclusionRateDisplay).toBe("50%");
  });

  it("빈 배열 → 모든 서비스 0%", () => {
    const coverage = calculateServiceCoverage([], "wall-mount");
    coverage.forEach((c) => {
      expect(c.inclusionRate).toBe(0);
      expect(c.includedCount).toBe(0);
    });
  });

  it("서비스 우선순위 순으로 정렬", () => {
    const entries = [createEntry()];
    const coverage = calculateServiceCoverage(entries, "wall-mount");
    expect(coverage[0].service).toBe("filter-wash"); // priority 1
  });

  it("해당 에어컨 유형에 적용 불가한 서비스는 applicable=false", () => {
    const entries = [createEntry()];
    const coverage = calculateServiceCoverage(entries, "window");
    const outdoorCov = coverage.find((c) => c.service === "outdoor-unit")!;
    expect(outdoorCov.applicable).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 5. buildComparisonTableData 통합 테스트
// ─────────────────────────────────────────────

describe("buildComparisonTableData", () => {
  const entries = [
    createEntry({
      id: "1",
      cleaningMethod: "general",
      price: 30000,
      sourcePlatform: "danggeun",
      includedServices: ["filter-wash"],
    }),
    createEntry({
      id: "2",
      cleaningMethod: "disassembly",
      price: 50000,
      sourcePlatform: "soomgo",
      includedServices: ["filter-wash", "sanitization", "operation-check"],
    }),
    createEntry({
      id: "3",
      cleaningMethod: "disassembly",
      price: 60000,
      sourcePlatform: "soomgo",
      includedServices: [
        "filter-wash",
        "sanitization",
        "mold-removal",
        "operation-check",
      ],
    }),
    createEntry({
      id: "inactive",
      cleaningMethod: "general",
      price: 25000,
      isActive: false,
    }),
  ];

  it("비활성 엔트리를 제외", () => {
    const data = buildComparisonTableData(entries, "wall-mount");
    expect(data.totalEntries).toBe(3); // 4 - 1 inactive
  });

  it("청소 방식별 그룹 포함", () => {
    const data = buildComparisonTableData(entries, "wall-mount");
    expect(data.methodGroups.length).toBeGreaterThanOrEqual(3);

    const generalGroup = data.methodGroups.find(
      (g) => g.method === "general",
    )!;
    expect(generalGroup.count).toBe(1);

    const disassemblyGroup = data.methodGroups.find(
      (g) => g.method === "disassembly",
    )!;
    expect(disassemblyGroup.count).toBe(2);
  });

  it("서비스 비교 행 생성", () => {
    const data = buildComparisonTableData(entries, "wall-mount");
    expect(data.serviceComparisonRows.length).toBe(3);
  });

  it("서비스 커버리지 통계 포함", () => {
    const data = buildComparisonTableData(entries, "wall-mount");
    expect(data.serviceCoverage.length).toBe(7);
  });

  it("활성 청소 방식 목록 (데이터 있는 것만)", () => {
    const data = buildComparisonTableData(entries, "wall-mount");
    expect(data.activeCleaningMethods).toContain("general");
    expect(data.activeCleaningMethods).toContain("disassembly");
    expect(data.activeCleaningMethods).not.toContain("complete-disassembly");
  });

  it("활성 출처 플랫폼 목록", () => {
    const data = buildComparisonTableData(entries, "wall-mount");
    expect(data.activeSourcePlatforms).toContain("danggeun");
    expect(data.activeSourcePlatforms).toContain("soomgo");
  });

  it("적용 가능 서비스 목록 (에어컨 유형별)", () => {
    const data = buildComparisonTableData(entries, "window");
    // 창문형은 실외기 서비스 적용 불가
    expect(data.applicableServices).not.toContain("outdoor-unit");
  });
});

// ─────────────────────────────────────────────
// 6. buildMethodPriceComparison 테스트
// ─────────────────────────────────────────────

describe("buildMethodPriceComparison", () => {
  it("일반세척 대비 가격 배율 계산", () => {
    const entries = [
      createEntry({ cleaningMethod: "general", price: 30000 }),
      createEntry({ cleaningMethod: "disassembly", price: 60000 }),
    ];

    const comparison = buildMethodPriceComparison(entries);
    const disassembly = comparison.find((c) => c.method === "disassembly")!;

    // 60000 / 30000 = 2.0
    expect(disassembly.priceRatioVsGeneral).toBe(2.0);
  });

  it("일반세척 데이터 없으면 배율 null", () => {
    const entries = [
      createEntry({ cleaningMethod: "disassembly", price: 60000 }),
    ];
    const comparison = buildMethodPriceComparison(entries);
    const disassembly = comparison.find((c) => c.method === "disassembly")!;
    expect(disassembly.priceRatioVsGeneral).toBeNull();
  });

  it("unknown 방식의 배율은 null", () => {
    const entries = [
      createEntry({ cleaningMethod: "general", price: 30000 }),
      createEntry({ cleaningMethod: "unknown", price: 40000 }),
    ];
    const comparison = buildMethodPriceComparison(entries);
    const unknown = comparison.find((c) => c.method === "unknown")!;
    expect(unknown.priceRatioVsGeneral).toBeNull();
  });

  it("데이터 없는 방식은 제외", () => {
    const entries = [
      createEntry({ cleaningMethod: "general", price: 30000 }),
    ];
    const comparison = buildMethodPriceComparison(entries);
    expect(comparison.length).toBe(1);
    expect(comparison[0].method).toBe("general");
  });
});

// ─────────────────────────────────────────────
// 7. calculateServiceValueScores 테스트
// ─────────────────────────────────────────────

describe("calculateServiceValueScores", () => {
  it("서비스 1개당 가격 계산", () => {
    const entries = [
      createEntry({
        id: "a",
        price: 60000,
        includedServices: ["filter-wash", "sanitization", "mold-removal"],
      }),
      createEntry({
        id: "b",
        price: 50000,
        includedServices: ["filter-wash"],
      }),
    ];

    const scores = calculateServiceValueScores(entries);
    const scoreA = scores.find((s) => s.entryId === "a")!;
    const scoreB = scores.find((s) => s.entryId === "b")!;

    // A: 60000/3 = 20000, B: 50000/1 = 50000
    expect(scoreA.pricePerService).toBe(20000);
    expect(scoreB.pricePerService).toBe(50000);
  });

  it("가성비 좋은 순으로 정렬", () => {
    const entries = [
      createEntry({
        id: "expensive",
        price: 80000,
        includedServices: ["filter-wash"],
      }),
      createEntry({
        id: "cheap-good",
        price: 40000,
        includedServices: [
          "filter-wash",
          "sanitization",
          "mold-removal",
          "operation-check",
        ],
      }),
    ];

    const scores = calculateServiceValueScores(entries);
    expect(scores[0].entryId).toBe("cheap-good");
  });

  it("비활성 엔트리 제외", () => {
    const entries = [
      createEntry({ id: "active", isActive: true }),
      createEntry({ id: "inactive", isActive: false }),
    ];
    const scores = calculateServiceValueScores(entries);
    expect(scores.length).toBe(1);
    expect(scores[0].entryId).toBe("active");
  });

  it("서비스 없는 엔트리 제외", () => {
    const entries = [createEntry({ includedServices: [] })];
    const scores = calculateServiceValueScores(entries);
    expect(scores.length).toBe(0);
  });
});

// ─────────────────────────────────────────────
// 8. buildExtraChargeComparison 테스트
// ─────────────────────────────────────────────

describe("buildExtraChargeComparison", () => {
  it("동일 항목(실외기)을 업체별로 그룹화", () => {
    const entries = [
      createEntry({
        id: "a",
        providerName: "A업체",
        extraCharges: [
          { label: "실외기 청소", amount: 20000, condition: null },
        ],
      }),
      createEntry({
        id: "b",
        providerName: "B업체",
        extraCharges: [
          { label: "실외기 세척", amount: 25000, condition: null },
        ],
      }),
    ];

    const comparisons = buildExtraChargeComparison(entries);
    const outdoorCharge = comparisons.find(
      (c) => c.normalizedLabel === "실외기 청소",
    )!;

    expect(outdoorCharge.entries.length).toBe(2);
    expect(outdoorCharge.minAmount).toBe(20000);
    expect(outdoorCharge.maxAmount).toBe(25000);
  });

  it("비활성 엔트리 제외", () => {
    const entries = [
      createEntry({
        isActive: false,
        extraCharges: [
          { label: "실외기 청소", amount: 20000, condition: null },
        ],
      }),
    ];
    const comparisons = buildExtraChargeComparison(entries);
    expect(comparisons.length).toBe(0);
  });
});

// ─────────────────────────────────────────────
// 9. assessDataQuality 테스트
// ─────────────────────────────────────────────

describe("assessDataQuality", () => {
  it("2건 이상이면 비교 가능", () => {
    const entries = [createEntry(), createEntry()];
    const quality = assessDataQuality(entries);
    expect(quality.isComparable).toBe(true);
  });

  it("1건이면 비교 불가", () => {
    const entries = [createEntry()];
    const quality = assessDataQuality(entries);
    expect(quality.isComparable).toBe(false);
    expect(quality.warnings.length).toBeGreaterThan(0);
  });

  it("불완전 데이터 비율 계산", () => {
    const entries = [
      createEntry({ isIncomplete: true }),
      createEntry({ isIncomplete: false }),
    ];
    const quality = assessDataQuality(entries);
    expect(quality.incompleteEntries).toBe(1);
    expect(quality.incompleteRate).toBe(0.5);
  });

  it("청소 방식 미확인 수 추적", () => {
    const entries = [
      createEntry({ cleaningMethod: "unknown" }),
      createEntry({ cleaningMethod: "disassembly" }),
    ];
    const quality = assessDataQuality(entries);
    expect(quality.unknownMethodCount).toBe(1);
  });

  it("서비스 정보 없는 엔트리 수 추적", () => {
    const entries = [
      createEntry({ includedServices: [] }),
      createEntry({ includedServices: ["filter-wash"] }),
    ];
    const quality = assessDataQuality(entries);
    expect(quality.noServicesCount).toBe(1);
  });

  it("절반 이상 불완전 → 경고 포함", () => {
    const entries = [
      createEntry({ isIncomplete: true }),
      createEntry({ isIncomplete: true }),
      createEntry({ isIncomplete: false }),
    ];
    const quality = assessDataQuality(entries);
    expect(
      quality.warnings.some((w) => w.includes("절반 이상")),
    ).toBe(true);
  });

  it("비활성 엔트리는 활성 수에서 제외", () => {
    const entries = [
      createEntry({ isActive: true }),
      createEntry({ isActive: false }),
    ];
    const quality = assessDataQuality(entries);
    expect(quality.totalEntries).toBe(2);
    expect(quality.activeEntries).toBe(1);
  });
});
