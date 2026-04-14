/**
 * 청소 방식 및 포함 서비스 비교 목업 데이터
 *
 * 청소 방식(일반/분해/완전분해)별 서비스 비교를 위한 샘플 데이터.
 * 크롤링 데이터가 충분히 쌓이기 전 개발·테스트용으로 사용한다.
 *
 * 포함 내용:
 * 1. 에어컨 유형별 청소 방식 기본 비교 데이터 (업계 일반 기준)
 * 2. 서울 강남구 벽걸이 에어컨 청소 방식 비교 샘플
 * 3. 완전분해세척 포함 PriceEntry 샘플 데이터
 *
 * @module mock-cleaning-comparison
 */

import type {
  PriceEntry,
  AirconType,
  CleaningMethod,
  IncludedService,
} from "@/lib/types/price-data";

import type {
  DefaultMethodComparison,
  CleaningMethodServiceMatrix,
  CleaningMethodComparisonCards,
  CleaningMethodSummary,
  CleaningMethodCard,
  MethodDurationEstimate,
} from "@/lib/types/cleaning-comparison";

import {
  formatPriceRangeCompact,
  formatDuration,
} from "@/lib/types/cleaning-comparison";

// ─────────────────────────────────────────────
// 1. 에어컨 유형별 청소 방식 기본 비교 데이터
// ─────────────────────────────────────────────

/**
 * 에어컨 유형별 청소 방식 기본 비교 데이터
 *
 * 업계 일반적인 기준으로 구성.
 * 실제 크롤링 데이터가 있는 지역에서는 이 데이터가 실제 데이터로 대체된다.
 */
export const DEFAULT_METHOD_COMPARISONS: DefaultMethodComparison[] = [
  {
    airconType: "wall-mount",
    methods: [
      {
        method: "general",
        priceRange: { min: 30000, max: 60000 },
        typicallyIncluded: ["filter-wash", "sanitization"],
        typicallyExtra: ["outdoor-unit", "mold-removal", "odor-removal"],
        duration: { min: 20, max: 40 },
        recommendedFor:
          "매년 정기 청소, 사용 기간이 짧은 에어컨, 예산이 제한적인 경우",
      },
      {
        method: "disassembly",
        priceRange: { min: 50000, max: 100000 },
        typicallyIncluded: [
          "filter-wash",
          "sanitization",
          "mold-removal",
          "operation-check",
        ],
        typicallyExtra: ["outdoor-unit", "drain-pipe", "odor-removal"],
        duration: { min: 40, max: 90 },
        recommendedFor:
          "2년 이상 미청소, 냄새·곰팡이가 있는 경우, 일반세척으로 부족한 경우",
      },
      {
        method: "complete-disassembly",
        priceRange: { min: 80000, max: 150000 },
        typicallyIncluded: [
          "filter-wash",
          "sanitization",
          "mold-removal",
          "drain-pipe",
          "odor-removal",
          "operation-check",
        ],
        typicallyExtra: ["outdoor-unit"],
        duration: { min: 60, max: 120 },
        recommendedFor:
          "3년 이상 미청소, 알레르기·아토피 가정, 최초 청소, 가장 깨끗한 결과를 원하는 경우",
      },
    ],
  },
  {
    airconType: "standing",
    methods: [
      {
        method: "general",
        priceRange: { min: 50000, max: 100000 },
        typicallyIncluded: ["filter-wash", "sanitization"],
        typicallyExtra: ["outdoor-unit", "mold-removal", "odor-removal"],
        duration: { min: 30, max: 50 },
        recommendedFor: "매년 정기 청소, 예산이 제한적인 경우",
      },
      {
        method: "disassembly",
        priceRange: { min: 80000, max: 180000 },
        typicallyIncluded: [
          "filter-wash",
          "sanitization",
          "mold-removal",
          "operation-check",
        ],
        typicallyExtra: ["outdoor-unit", "drain-pipe", "odor-removal"],
        duration: { min: 60, max: 120 },
        recommendedFor:
          "2년 이상 미청소, 냄새가 심한 경우, 거실용 스탠드 에어컨",
      },
      {
        method: "complete-disassembly",
        priceRange: { min: 120000, max: 280000 },
        typicallyIncluded: [
          "filter-wash",
          "sanitization",
          "mold-removal",
          "drain-pipe",
          "odor-removal",
          "operation-check",
        ],
        typicallyExtra: ["outdoor-unit"],
        duration: { min: 90, max: 180 },
        recommendedFor:
          "3년 이상 미청소, 아토피·알레르기 가정, 최초 청소",
      },
    ],
  },
  {
    airconType: "ceiling",
    methods: [
      {
        method: "general",
        priceRange: { min: 70000, max: 150000 },
        typicallyIncluded: ["filter-wash", "sanitization"],
        typicallyExtra: [
          "outdoor-unit",
          "drain-pipe",
          "mold-removal",
          "odor-removal",
        ],
        duration: { min: 40, max: 60 },
        recommendedFor: "매년 정기 청소, 접근이 용이한 천장형",
      },
      {
        method: "disassembly",
        priceRange: { min: 100000, max: 250000 },
        typicallyIncluded: [
          "filter-wash",
          "sanitization",
          "drain-pipe",
          "operation-check",
        ],
        typicallyExtra: ["outdoor-unit", "mold-removal", "odor-removal"],
        duration: { min: 60, max: 150 },
        recommendedFor: "2년 이상 미청소, 물이 새는 경우",
      },
      {
        method: "complete-disassembly",
        priceRange: { min: 150000, max: 380000 },
        typicallyIncluded: [
          "filter-wash",
          "sanitization",
          "drain-pipe",
          "mold-removal",
          "odor-removal",
          "operation-check",
        ],
        typicallyExtra: ["outdoor-unit"],
        duration: { min: 120, max: 240 },
        recommendedFor:
          "3년 이상 미청소, 드레인팬 곰팡이 심한 경우, 최초 청소",
      },
    ],
  },
  {
    airconType: "system",
    methods: [
      {
        method: "general",
        priceRange: { min: 50000, max: 120000 },
        typicallyIncluded: ["filter-wash", "sanitization"],
        typicallyExtra: ["outdoor-unit", "mold-removal", "odor-removal"],
        duration: { min: 30, max: 50 },
        recommendedFor: "매년 정기 청소, 실내기 수가 많은 경우",
      },
      {
        method: "disassembly",
        priceRange: { min: 80000, max: 200000 },
        typicallyIncluded: [
          "filter-wash",
          "sanitization",
          "operation-check",
        ],
        typicallyExtra: [
          "outdoor-unit",
          "drain-pipe",
          "mold-removal",
          "odor-removal",
        ],
        duration: { min: 50, max: 120 },
        recommendedFor: "2년 이상 미청소, 냄새가 심한 경우",
      },
      {
        method: "complete-disassembly",
        priceRange: { min: 120000, max: 300000 },
        typicallyIncluded: [
          "filter-wash",
          "sanitization",
          "mold-removal",
          "drain-pipe",
          "odor-removal",
          "operation-check",
        ],
        typicallyExtra: ["outdoor-unit"],
        duration: { min: 90, max: 180 },
        recommendedFor:
          "3년 이상 미청소, 아이 방 시스템 에어컨, 최초 청소",
      },
    ],
  },
  {
    airconType: "window",
    methods: [
      {
        method: "general",
        priceRange: { min: 25000, max: 50000 },
        typicallyIncluded: ["filter-wash"],
        typicallyExtra: ["sanitization", "mold-removal"],
        duration: { min: 15, max: 30 },
        recommendedFor: "매년 정기 청소, 간단한 먼지 제거",
      },
      {
        method: "disassembly",
        priceRange: { min: 40000, max: 80000 },
        typicallyIncluded: ["filter-wash", "sanitization"],
        typicallyExtra: ["mold-removal", "odor-removal"],
        duration: { min: 30, max: 60 },
        recommendedFor: "2년 이상 미청소, 곰팡이가 보이는 경우",
      },
      {
        method: "complete-disassembly",
        priceRange: { min: 60000, max: 120000 },
        typicallyIncluded: [
          "filter-wash",
          "sanitization",
          "mold-removal",
          "odor-removal",
        ],
        typicallyExtra: [],
        duration: { min: 40, max: 90 },
        recommendedFor: "오래된 창문형 에어컨, 최초 청소",
      },
    ],
  },
];

// ─────────────────────────────────────────────
// 2. 서울 강남구 벽걸이 에어컨 — 청소 방식별 서비스 매트릭스 샘플
// ─────────────────────────────────────────────

/**
 * 서울 강남구 벽걸이 에어컨 청소 방식별 서비스 포함 비교 매트릭스 샘플
 *
 * 실제로는 PriceEntry 데이터에서 동적으로 계산하지만,
 * UI 개발/테스트 시 이 샘플 데이터를 사용한다.
 */
export const SAMPLE_SERVICE_MATRIX_GANGNAM_WALLMOUNT: CleaningMethodServiceMatrix =
  {
    airconType: "wall-mount",
    regionCity: "seoul",
    regionDistrict: "gangnam",
    rows: [
      {
        service: "filter-wash",
        label: "필터 세척",
        shortLabel: "필터",
        applicable: true,
        byMethod: {
          general: {
            level: "always",
            rate: 1.0,
            rateDisplay: "100%",
            typicalExtraCost: 0,
            sampleCount: 3,
          },
          disassembly: {
            level: "always",
            rate: 1.0,
            rateDisplay: "100%",
            typicalExtraCost: 0,
            sampleCount: 5,
          },
          "complete-disassembly": {
            level: "always",
            rate: 1.0,
            rateDisplay: "100%",
            typicalExtraCost: 0,
            sampleCount: 2,
          },
        },
      },
      {
        service: "sanitization",
        label: "항균·살균",
        shortLabel: "살균",
        applicable: true,
        byMethod: {
          general: {
            level: "usually",
            rate: 0.67,
            rateDisplay: "67%",
            typicalExtraCost: 10000,
            sampleCount: 3,
          },
          disassembly: {
            level: "always",
            rate: 0.95,
            rateDisplay: "95%",
            typicalExtraCost: 0,
            sampleCount: 5,
          },
          "complete-disassembly": {
            level: "always",
            rate: 1.0,
            rateDisplay: "100%",
            typicalExtraCost: 0,
            sampleCount: 2,
          },
        },
      },
      {
        service: "outdoor-unit",
        label: "실외기 청소",
        shortLabel: "실외기",
        applicable: true,
        byMethod: {
          general: {
            level: "not-included",
            rate: 0,
            rateDisplay: "0%",
            typicalExtraCost: 20000,
            sampleCount: 3,
          },
          disassembly: {
            level: "rarely",
            rate: 0.2,
            rateDisplay: "20%",
            typicalExtraCost: 20000,
            sampleCount: 5,
          },
          "complete-disassembly": {
            level: "sometimes",
            rate: 0.5,
            rateDisplay: "50%",
            typicalExtraCost: 20000,
            sampleCount: 2,
          },
        },
      },
      {
        service: "drain-pipe",
        label: "배수관 청소",
        shortLabel: "배수관",
        applicable: true,
        byMethod: {
          general: {
            level: "not-included",
            rate: 0,
            rateDisplay: "0%",
            typicalExtraCost: 10000,
            sampleCount: 3,
          },
          disassembly: {
            level: "sometimes",
            rate: 0.4,
            rateDisplay: "40%",
            typicalExtraCost: 10000,
            sampleCount: 5,
          },
          "complete-disassembly": {
            level: "always",
            rate: 1.0,
            rateDisplay: "100%",
            typicalExtraCost: 0,
            sampleCount: 2,
          },
        },
      },
      {
        service: "mold-removal",
        label: "곰팡이 제거",
        shortLabel: "곰팡이",
        applicable: true,
        byMethod: {
          general: {
            level: "not-included",
            rate: 0,
            rateDisplay: "0%",
            typicalExtraCost: 15000,
            sampleCount: 3,
          },
          disassembly: {
            level: "usually",
            rate: 0.6,
            rateDisplay: "60%",
            typicalExtraCost: 10000,
            sampleCount: 5,
          },
          "complete-disassembly": {
            level: "always",
            rate: 1.0,
            rateDisplay: "100%",
            typicalExtraCost: 0,
            sampleCount: 2,
          },
        },
      },
      {
        service: "odor-removal",
        label: "냄새 제거",
        shortLabel: "냄새",
        applicable: true,
        byMethod: {
          general: {
            level: "not-included",
            rate: 0,
            rateDisplay: "0%",
            typicalExtraCost: 10000,
            sampleCount: 3,
          },
          disassembly: {
            level: "rarely",
            rate: 0.2,
            rateDisplay: "20%",
            typicalExtraCost: 10000,
            sampleCount: 5,
          },
          "complete-disassembly": {
            level: "always",
            rate: 1.0,
            rateDisplay: "100%",
            typicalExtraCost: 0,
            sampleCount: 2,
          },
        },
      },
      {
        service: "operation-check",
        label: "작동 점검",
        shortLabel: "점검",
        applicable: true,
        byMethod: {
          general: {
            level: "sometimes",
            rate: 0.33,
            rateDisplay: "33%",
            typicalExtraCost: 0,
            sampleCount: 3,
          },
          disassembly: {
            level: "usually",
            rate: 0.8,
            rateDisplay: "80%",
            typicalExtraCost: 0,
            sampleCount: 5,
          },
          "complete-disassembly": {
            level: "always",
            rate: 1.0,
            rateDisplay: "100%",
            typicalExtraCost: 0,
            sampleCount: 2,
          },
        },
      },
    ],
    methodSummaries: [
      {
        method: "general",
        label: "일반세척",
        shortLabel: "일반",
        description:
          "에어컨을 분해하지 않고 고압 스팀이나 세정제를 사용하여 외부에서 세척하는 방식입니다.",
        priceStats: {
          min: 30000,
          max: 50000,
          avg: 38000,
          rangeDisplay: "3~5만원",
          ratioVsGeneral: 1.0,
        },
        serviceSummary: {
          typicalIncludedCount: 2,
          typicalServices: ["filter-wash", "sanitization"],
          typicalExtraServices: [
            "outdoor-unit",
            "mold-removal",
            "odor-removal",
          ],
          summaryText: "필터 세척 + 항균살균 기본 포함",
        },
        dataCount: 3,
        estimatedDuration: { minMinutes: 20, maxMinutes: 40, display: "20~40분" },
        recommendedFor:
          "매년 정기 청소, 사용 기간이 짧은 에어컨, 예산이 제한적인 경우",
      },
      {
        method: "disassembly",
        label: "분해세척",
        shortLabel: "분해",
        description:
          "에어컨 전면 패널과 필터를 분해하여 내부 열교환기, 팬 등을 세척하는 방식입니다.",
        priceStats: {
          min: 45000,
          max: 65000,
          avg: 52000,
          rangeDisplay: "5~7만원",
          ratioVsGeneral: 1.37,
        },
        serviceSummary: {
          typicalIncludedCount: 4,
          typicalServices: [
            "filter-wash",
            "sanitization",
            "mold-removal",
            "operation-check",
          ],
          typicalExtraServices: ["outdoor-unit", "drain-pipe", "odor-removal"],
          summaryText: "필터 세척 + 항균살균 + 곰팡이 제거 + 작동 점검 기본 포함",
        },
        dataCount: 5,
        estimatedDuration: { minMinutes: 40, maxMinutes: 90, display: "40~90분" },
        recommendedFor:
          "2년 이상 미청소, 냄새·곰팡이가 있는 경우",
      },
      {
        method: "complete-disassembly",
        label: "완전분해세척",
        shortLabel: "완전분해",
        description:
          "에어컨의 모든 부품을 완전히 분리하여 개별 세척하는 가장 철저한 방식입니다.",
        priceStats: {
          min: 90000,
          max: 130000,
          avg: 110000,
          rangeDisplay: "9~13만원",
          ratioVsGeneral: 2.89,
        },
        serviceSummary: {
          typicalIncludedCount: 6,
          typicalServices: [
            "filter-wash",
            "sanitization",
            "drain-pipe",
            "mold-removal",
            "odor-removal",
            "operation-check",
          ],
          typicalExtraServices: ["outdoor-unit"],
          summaryText: "실외기 외 모든 서비스 기본 포함",
        },
        dataCount: 2,
        estimatedDuration: {
          minMinutes: 60,
          maxMinutes: 120,
          display: "1시간~2시간",
        },
        recommendedFor:
          "3년 이상 미청소, 알레르기·아토피 가정, 최초 청소",
      },
    ],
    generatedAt: "2026-04-14T09:00:00Z",
  };

// ─────────────────────────────────────────────
// 3. 비교 카드 샘플 데이터
// ─────────────────────────────────────────────

/**
 * 서울 강남구 벽걸이 에어컨 — 청소 방식 비교 카드 샘플
 */
export const SAMPLE_COMPARISON_CARDS_GANGNAM_WALLMOUNT: CleaningMethodComparisonCards =
  {
    airconType: "wall-mount",
    region: {
      city: "seoul",
      district: "gangnam",
      districtLabel: "강남구",
    },
    cards: [
      {
        method: "general",
        label: "일반세척",
        priceRange: "3~5만원",
        avgPrice: 38000,
        includedServices: [
          { service: "filter-wash", label: "필터 세척", shortLabel: "필터" },
          { service: "sanitization", label: "항균·살균", shortLabel: "살균" },
        ],
        optionalServices: [
          {
            service: "outdoor-unit",
            label: "실외기 청소",
            shortLabel: "실외기",
            typicalExtraCost: 20000,
          },
          {
            service: "mold-removal",
            label: "곰팡이 제거",
            shortLabel: "곰팡이",
            typicalExtraCost: 15000,
          },
        ],
        duration: "20~40분",
        recommendation: "매년 정기 청소에 추천",
        dataCount: 3,
        sourcePlatforms: [
          { platform: "danggeun", label: "당근마켓", count: 2 },
          { platform: "soomgo", label: "숨고", count: 1 },
        ],
        badge: "가성비 최고",
      },
      {
        method: "disassembly",
        label: "분해세척",
        priceRange: "5~7만원",
        avgPrice: 52000,
        includedServices: [
          { service: "filter-wash", label: "필터 세척", shortLabel: "필터" },
          { service: "sanitization", label: "항균·살균", shortLabel: "살균" },
          {
            service: "mold-removal",
            label: "곰팡이 제거",
            shortLabel: "곰팡이",
          },
          {
            service: "operation-check",
            label: "작동 점검",
            shortLabel: "점검",
          },
        ],
        optionalServices: [
          {
            service: "outdoor-unit",
            label: "실외기 청소",
            shortLabel: "실외기",
            typicalExtraCost: 20000,
          },
          {
            service: "drain-pipe",
            label: "배수관 청소",
            shortLabel: "배수관",
            typicalExtraCost: 10000,
          },
        ],
        duration: "40~90분",
        recommendation: "2년 이상 미청소 시 추천",
        dataCount: 5,
        sourcePlatforms: [
          { platform: "soomgo", label: "숨고", count: 2 },
          { platform: "danggeun", label: "당근마켓", count: 2 },
          { platform: "blog", label: "블로그", count: 1 },
        ],
        badge: "가장 인기",
      },
      {
        method: "complete-disassembly",
        label: "완전분해세척",
        priceRange: "9~13만원",
        avgPrice: 110000,
        includedServices: [
          { service: "filter-wash", label: "필터 세척", shortLabel: "필터" },
          { service: "sanitization", label: "항균·살균", shortLabel: "살균" },
          { service: "drain-pipe", label: "배수관 청소", shortLabel: "배수관" },
          {
            service: "mold-removal",
            label: "곰팡이 제거",
            shortLabel: "곰팡이",
          },
          { service: "odor-removal", label: "냄새 제거", shortLabel: "냄새" },
          {
            service: "operation-check",
            label: "작동 점검",
            shortLabel: "점검",
          },
        ],
        optionalServices: [
          {
            service: "outdoor-unit",
            label: "실외기 청소",
            shortLabel: "실외기",
            typicalExtraCost: 20000,
          },
        ],
        duration: "1시간~2시간",
        recommendation: "알레르기 가정, 최초 청소 시 추천",
        dataCount: 2,
        sourcePlatforms: [
          { platform: "soomgo", label: "숨고", count: 1 },
          { platform: "website", label: "업체 사이트", count: 1 },
        ],
        badge: "가장 깨끗",
      },
    ],
    comparisonInsight:
      "강남구 벽걸이 에어컨 기준, 분해세척은 일반세척 대비 약 1.4배 비싸지만 포함 서비스가 2개 더 많습니다. 완전분해세척은 일반세척 대비 약 2.9배 비싸지만 실외기 외 모든 서비스가 기본 포함됩니다.",
  };

// ─────────────────────────────────────────────
// 4. 완전분해세척 포함 PriceEntry 샘플 데이터
// ─────────────────────────────────────────────

/**
 * 완전분해세척 PriceEntry 샘플 데이터
 *
 * 기존 MOCK_PRICE_ENTRIES에 완전분해세척 데이터가 없으므로
 * 주요 지역에 대해 완전분해세척 엔트리를 보충한다.
 */
export const MOCK_COMPLETE_DISASSEMBLY_ENTRIES: PriceEntry[] = [
  // ── 서울 강남구 벽걸이 완전분해 ──
  {
    id: "cd-gn-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "complete-disassembly",
    regionCity: "seoul",
    regionDistrict: "gangnam",
    price: 90000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: [
      "filter-wash",
      "sanitization",
      "drain-pipe",
      "mold-removal",
      "odor-removal",
      "operation-check",
    ],
    additionalServices: ["열교환기 완전 분리 세척", "드레인팬 별도 세척"],
    extraCharges: [
      { label: "실외기 청소", amount: 25000, condition: null },
      { label: "2대 이상 할인", amount: -15000, condition: "2대 이상 동시 의뢰 시" },
    ],
    providerName: "강남 프리미엄 클린 R",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-cd-1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "cd-gn-wm-002",
    airconType: "wall-mount",
    cleaningMethod: "complete-disassembly",
    regionCity: "seoul",
    regionDistrict: "gangnam",
    price: 130000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: [
      "filter-wash",
      "sanitization",
      "outdoor-unit",
      "drain-pipe",
      "mold-removal",
      "odor-removal",
      "operation-check",
    ],
    additionalServices: [
      "모터 분리 세척",
      "에바포레이터 개별 세척",
      "항균 코팅 마감",
    ],
    extraCharges: [],
    providerName: "강남 에어컨 오버홀 S",
    sourcePlatform: "website",
    sourceUrl: "https://example-aircon-overhaul.co.kr",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T14:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  // ── 서울 강남구 스탠드 완전분해 ──
  {
    id: "cd-gn-st-001",
    airconType: "standing",
    cleaningMethod: "complete-disassembly",
    regionCity: "seoul",
    regionDistrict: "gangnam",
    price: 180000,
    priceMax: 220000,
    priceUnit: "1대 기준",
    includedServices: [
      "filter-wash",
      "sanitization",
      "drain-pipe",
      "mold-removal",
      "odor-removal",
      "operation-check",
    ],
    additionalServices: ["크로스플로우팬 분리 세척", "드레인팬 별도 세척"],
    extraCharges: [
      { label: "실외기 청소", amount: 30000, condition: null },
    ],
    providerName: "강남 프리미엄 클린 R",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-cd-1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  // ── 서울 서초구 벽걸이 완전분해 ──
  {
    id: "cd-sc-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "complete-disassembly",
    regionCity: "seoul",
    regionDistrict: "seocho",
    price: 100000,
    priceMax: 120000,
    priceUnit: "1대 기준",
    includedServices: [
      "filter-wash",
      "sanitization",
      "drain-pipe",
      "mold-removal",
      "odor-removal",
      "operation-check",
    ],
    additionalServices: ["열교환기 완전 분리"],
    extraCharges: [
      { label: "실외기 청소", amount: 25000, condition: null },
    ],
    providerName: "서초 프리미엄 에어컨 D",
    sourcePlatform: "website",
    sourceUrl: "https://example-aircon-cleaning.co.kr/complete",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-09T08:00:00Z",
    verifiedAt: "2026-04-13T15:00:00Z",
    isActive: true,
  },
  // ── 서울 마포구 벽걸이 완전분해 ──
  {
    id: "cd-mp-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "complete-disassembly",
    regionCity: "seoul",
    regionDistrict: "mapo",
    price: 85000,
    priceMax: 110000,
    priceUnit: "1대 기준",
    includedServices: [
      "filter-wash",
      "sanitization",
      "drain-pipe",
      "mold-removal",
      "operation-check",
    ],
    additionalServices: ["팬 모터 분리 세척"],
    extraCharges: [
      { label: "실외기 청소", amount: 22000, condition: null },
      { label: "냄새 제거", amount: 15000, condition: "심한 경우" },
    ],
    providerName: "마포 에어컨 전문 G",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-7",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-09T15:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  // ── 서울 송파구 벽걸이 완전분해 ──
  {
    id: "cd-sp-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "complete-disassembly",
    regionCity: "seoul",
    regionDistrict: "songpa",
    price: 95000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: [
      "filter-wash",
      "sanitization",
      "drain-pipe",
      "mold-removal",
      "odor-removal",
      "operation-check",
    ],
    additionalServices: ["친환경 세제 사용", "에바포레이터 분리 세척"],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "송파 에어컨 전문 J",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-10",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-08T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  // ── 경기 수원시 벽걸이 완전분해 ──
  {
    id: "cd-sw-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "complete-disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "suwon",
    price: 80000,
    priceMax: 100000,
    priceUnit: "1대 기준",
    includedServices: [
      "filter-wash",
      "sanitization",
      "drain-pipe",
      "mold-removal",
      "odor-removal",
      "operation-check",
    ],
    additionalServices: ["열교환기 완전 분리 세척"],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "수원 에어컨 전문 T",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-cd-sw",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  // ── 경기 성남시 벽걸이 완전분해 ──
  {
    id: "cd-sn-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "complete-disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "seongnam",
    price: 85000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: [
      "filter-wash",
      "sanitization",
      "drain-pipe",
      "mold-removal",
      "odor-removal",
      "operation-check",
    ],
    additionalServices: ["에바포레이터 분리", "항균 코팅"],
    extraCharges: [
      { label: "실외기 청소", amount: 22000, condition: null },
    ],
    providerName: "성남 프리미엄 에어컨 U",
    sourcePlatform: "website",
    sourceUrl: "https://example-seongnam-aircon.co.kr",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-10T11:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  // ── 경기 용인시 벽걸이 완전분해 ──
  {
    id: "cd-yi-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "complete-disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "yongin",
    price: 80000,
    priceMax: 95000,
    priceUnit: "1대 기준",
    includedServices: [
      "filter-wash",
      "sanitization",
      "mold-removal",
      "drain-pipe",
      "operation-check",
    ],
    additionalServices: ["팬 모터 분리"],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
      { label: "냄새 제거", amount: 10000, condition: "요청 시" },
    ],
    providerName: "용인 에어컨 클린 V",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-cd-yi",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
];

// ── 서울 강남구 일반세척 보충 엔트리 ──

/**
 * 일반세척 PriceEntry 보충 데이터
 *
 * 주요 지역에서 일반세척 데이터가 부족한 경우를 보충한다.
 */
export const MOCK_GENERAL_CLEANING_ENTRIES: PriceEntry[] = [
  {
    id: "gen-gn-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "general",
    regionCity: "seoul",
    regionDistrict: "gangnam",
    price: 35000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [
      { label: "곰팡이 제거", amount: 15000, condition: "곰팡이 심한 경우" },
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "강남 스피드 클린 W",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-gen-gn-1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "gen-gn-wm-002",
    airconType: "wall-mount",
    cleaningMethod: "general",
    regionCity: "seoul",
    regionDistrict: "gangnam",
    price: 40000,
    priceMax: 50000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: ["고압 스팀 세척"],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "강남 에어컨 스팀 X",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-gen-gn-2",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T14:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "gen-gn-st-001",
    airconType: "standing",
    cleaningMethod: "general",
    regionCity: "seoul",
    regionDistrict: "gangnam",
    price: 60000,
    priceMax: 70000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 25000, condition: null },
    ],
    providerName: "강남 스피드 클린 W",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-gen-gn-3",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  // ── 서초구 일반세척 보충 ──
  {
    id: "gen-sc-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "general",
    regionCity: "seoul",
    regionDistrict: "seocho",
    price: 38000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 22000, condition: null },
    ],
    providerName: "서초 에어컨 클린 Y",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-gen-sc-1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  // ── 송파구 일반세척 보충 ──
  {
    id: "gen-sp-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "general",
    regionCity: "seoul",
    regionDistrict: "songpa",
    price: 33000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash"],
    additionalServices: [],
    extraCharges: [
      { label: "살균 소독", amount: 10000, condition: "선택 시" },
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "송파 에어컨 클린 Z",
    sourcePlatform: "blog",
    sourceUrl: "https://blog.naver.com/example-gen-sp-1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T16:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  // ── 수원시 일반세척 보충 ──
  {
    id: "gen-sw-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "general",
    regionCity: "gyeonggi",
    regionDistrict: "suwon",
    price: 30000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash"],
    additionalServices: [],
    extraCharges: [
      { label: "살균 소독", amount: 8000, condition: "선택 시" },
    ],
    providerName: "수원 에어컨 클린 AA",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-gen-sw-1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
];

// ─────────────────────────────────────────────
// 5. 헬퍼: 에어컨 유형별 기본 비교 데이터 조회
// ─────────────────────────────────────────────

/**
 * 에어컨 유형별 기본 청소 방식 비교 데이터 조회
 *
 * @param airconType 에어컨 유형 코드
 * @returns 해당 유형의 기본 비교 데이터, 없으면 undefined
 */
export function getDefaultMethodComparison(
  airconType: AirconType,
): DefaultMethodComparison | undefined {
  return DEFAULT_METHOD_COMPARISONS.find((c) => c.airconType === airconType);
}

/**
 * 보충 엔트리를 포함한 전체 mock 엔트리 반환
 *
 * 기존 MOCK_PRICE_ENTRIES에 완전분해세척, 일반세척 보충 데이터를 합친다.
 */
export function getAllMockEntries(
  existingEntries: PriceEntry[],
): PriceEntry[] {
  return [
    ...existingEntries,
    ...MOCK_COMPLETE_DISASSEMBLY_ENTRIES,
    ...MOCK_GENERAL_CLEANING_ENTRIES,
  ];
}
