/**
 * 에어컨 청소 가격 비교 목업 데이터
 *
 * 서울·경기 지역의 에어컨 유형별 가격 정보 샘플 데이터.
 * 크롤링 데이터가 본격 수집되기 전 개발·테스트용으로 사용한다.
 *
 * 데이터 커버리지 목표:
 * - 서울 25구 × 5유형 = 125 조합 중 주요 지역 우선 확보
 * - 경기 31시군 × 5유형 = 155 조합 중 인구 상위 지역 우선 확보
 * - 빈 비교표 최소화를 위해 벽걸이·스탠드 중심 데이터 확보
 */

import type {
  PriceEntry,
  PriceDataFile,
  PriceSummary,
  AirconType,
  City,
} from "@/types/price";

// ─────────────────────────────────────────────
// 목업 가격 데이터
// ─────────────────────────────────────────────

export const MOCK_PRICE_ENTRIES: PriceEntry[] = [
  // ========================================
  // 서울 강남구
  // ========================================
  {
    id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "gangnam",
    price: 50000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
      { label: "2대 이상 할인", amount: -10000, condition: "2대 이상 동시 의뢰 시" },
    ],
    providerName: "강남 에어컨 전문 A",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-10T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "gangnam",
    price: 45000,
    priceMax: 60000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "mold-removal"],
    additionalServices: ["에바포레이터 고압 세척"],
    extraCharges: [],
    providerName: "강남 클린 서비스 B",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-2",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T14:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "gangnam",
    price: 80000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "outdoor-unit", "operation-check"],
    additionalServices: [],
    extraCharges: [],
    providerName: "강남 에어컨 전문 A",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-10T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "90c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e",
    airconType: "ceiling",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "gangnam",
    price: 130000,
    priceMax: 160000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "drain-pipe", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "4way 추가", amount: 30000, condition: "4방향 카세트" },
    ],
    providerName: "강남 에어컨 전문 A",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-10T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "e4b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d",
    airconType: "system",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "gangnam",
    price: 110000,
    priceMax: 140000,
    priceUnit: "실내기 1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: ["실내기 팬 완전 분해"],
    extraCharges: [
      { label: "실내기 추가", amount: 90000, condition: "2대째부터" },
      { label: "실외기 청소", amount: 35000, condition: null },
      { label: "3대 패키지", amount: -30000, condition: "실내기 3대 이상 동시" },
    ],
    providerName: "강남 프리미엄 시스템 O",
    sourcePlatform: "website",
    sourceUrl: "https://example-premium-aircon.co.kr",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-07T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "gn-window-001",
    airconType: "window",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "gangnam",
    price: 40000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [],
    providerName: "강남 클린 서비스 B",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-gn-w1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 서초구
  // ========================================
  {
    id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
    airconType: "ceiling",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "seocho",
    price: 120000,
    priceMax: 150000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "drain-pipe", "mold-removal", "operation-check"],
    additionalServices: ["드레인팬 완전 분해"],
    extraCharges: [
      { label: "4way 천장형 추가", amount: 30000, condition: "4방향 천장형 카세트" },
    ],
    providerName: "서초 프리미엄 에어컨 D",
    sourcePlatform: "website",
    sourceUrl: "https://example-aircon-cleaning.co.kr",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-09T08:00:00Z",
    verifiedAt: "2026-04-13T15:00:00Z",
    isActive: true,
  },
  {
    id: "seocho-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "seocho",
    price: 55000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "mold-removal", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 22000, condition: null },
    ],
    providerName: "서초 프리미엄 에어컨 D",
    sourcePlatform: "website",
    sourceUrl: "https://example-aircon-cleaning.co.kr",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-09T08:00:00Z",
    verifiedAt: "2026-04-13T15:00:00Z",
    isActive: true,
  },
  {
    id: "seocho-st-001",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "seocho",
    price: 90000,
    priceMax: 110000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "outdoor-unit", "operation-check"],
    additionalServices: [],
    extraCharges: [],
    providerName: "서초 프리미엄 에어컨 D",
    sourcePlatform: "website",
    sourceUrl: "https://example-aircon-cleaning.co.kr",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-09T08:00:00Z",
    verifiedAt: "2026-04-13T15:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 마포구
  // ========================================
  {
    id: "10a1b2c3-d4e5-4f6a-7b8c-9d0e1f2a3b4c",
    airconType: "wall-mount",
    cleaningMethod: "general",
    regionCity: "seoul",
    regionDistrict: "mapo",
    price: 30000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [
      { label: "곰팡이 제거", amount: 10000, condition: "곰팡이 심한 경우" },
    ],
    providerName: "마포 클린에어 F",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-6",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-10T11:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "20b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "mapo",
    price: 55000,
    priceMax: 65000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "mold-removal", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
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
  {
    id: "30c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "mapo",
    price: 85000,
    priceMax: 100000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 25000, condition: null },
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
  {
    id: "mapo-sys-001",
    airconType: "system",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "mapo",
    price: 95000,
    priceMax: 120000,
    priceUnit: "실내기 1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실내기 추가", amount: 80000, condition: "2대째부터" },
      { label: "실외기 청소", amount: 30000, condition: null },
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

  // ========================================
  // 서울 송파구
  // ========================================
  {
    id: "60f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "songpa",
    price: 55000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "mold-removal", "operation-check"],
    additionalServices: ["친환경 세제 사용"],
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
  {
    id: "70a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "songpa",
    price: 90000,
    priceMax: 110000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "outdoor-unit", "operation-check"],
    additionalServices: [],
    extraCharges: [],
    providerName: "송파 에어컨 전문 J",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-10",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-08T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "80b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d",
    airconType: "system",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "songpa",
    price: 90000,
    priceMax: 120000,
    priceUnit: "실내기 1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실내기 추가", amount: 70000, condition: "2대째부터" },
      { label: "실외기 청소", amount: 30000, condition: null },
    ],
    providerName: "송파 시스템 에어컨 K",
    sourcePlatform: "website",
    sourceUrl: "https://example-system-aircon.co.kr",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-10T13:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 노원구
  // ========================================
  {
    id: "f5c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e",
    airconType: "wall-mount",
    cleaningMethod: "general",
    regionCity: "seoul",
    regionDistrict: "nowon",
    price: 25000,
    priceMax: 35000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash"],
    additionalServices: [],
    extraCharges: [
      { label: "살균 소독", amount: 10000, condition: "선택 시" },
    ],
    providerName: "노원 에어컨 P",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-15",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T14:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "a6d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "nowon",
    price: 48000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
    ],
    providerName: "노원 에어컨 P",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-16",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T14:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "nowon-st-001",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "nowon",
    price: 75000,
    priceMax: 90000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "노원 에어컨 P",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-16",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T14:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 관악구
  // ========================================
  {
    id: "40d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
    airconType: "window",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "gwanak",
    price: 45000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [],
    providerName: "관악 에어컨 H",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-8",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "50e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
    airconType: "window",
    cleaningMethod: "general",
    regionCity: "seoul",
    regionDistrict: "gwanak",
    price: 28000,
    priceMax: 35000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash"],
    additionalServices: [],
    extraCharges: [
      { label: "살균 소독", amount: 10000, condition: "선택 시" },
    ],
    providerName: "관악 홈케어 I",
    sourcePlatform: "blog",
    sourceUrl: "https://blog.naver.com/example-9",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T16:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "gwanak-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "gwanak",
    price: 42000,
    priceMax: 55000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
    ],
    providerName: "관악 에어컨 H",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-8",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 영등포구
  // ========================================
  {
    id: "f1c1d2e3-f4a5-4b6c-7d8e-9f0a1b2c3d4e",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "yeongdeungpo",
    price: 50000,
    priceMax: 60000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "odor-removal", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "영등포 에어컨 Q",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-19",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-10T16:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "ydp-st-001",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "yeongdeungpo",
    price: 80000,
    priceMax: 95000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "outdoor-unit", "operation-check"],
    additionalServices: [],
    extraCharges: [],
    providerName: "영등포 에어컨 Q",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-19",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-10T16:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 동대문구
  // ========================================
  {
    id: "b3e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a",
    airconType: "window",
    cleaningMethod: "general",
    regionCity: "seoul",
    regionDistrict: "dongdaemun",
    price: 25000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash"],
    additionalServices: [],
    extraCharges: [
      { label: "살균 소독", amount: 8000, condition: "선택 시" },
    ],
    providerName: "동대문 홈클린 S",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-21",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "ddm-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "dongdaemun",
    price: 45000,
    priceMax: 55000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
    ],
    providerName: "동대문 홈클린 S",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-21",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 강서구
  // ========================================
  {
    id: "gangseo-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "gangseo",
    price: 48000,
    priceMax: 58000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "mold-removal"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "강서 에어컨 전문 T",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-gs1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "gangseo-st-001",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "gangseo",
    price: 80000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 22000, condition: null },
    ],
    providerName: "강서 에어컨 전문 T",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-gs1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 용산구
  // ========================================
  {
    id: "yongsan-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "yongsan",
    price: 52000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "mold-removal", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "용산 에어컨 U",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-ys1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "yongsan-st-001",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "yongsan",
    price: 85000,
    priceMax: 105000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "outdoor-unit", "operation-check"],
    additionalServices: [],
    extraCharges: [],
    providerName: "용산 에어컨 U",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-ys1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 강동구
  // ========================================
  {
    id: "gangdong-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "gangdong",
    price: 48000,
    priceMax: 60000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "강동 에어컨 V",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-gd1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T11:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "gangdong-st-001",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "gangdong",
    price: 82000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 22000, condition: null },
    ],
    providerName: "강동 에어컨 V",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-gd1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T11:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 양천구
  // ========================================
  {
    id: "yangcheon-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "yangcheon",
    price: 45000,
    priceMax: 55000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
    ],
    providerName: "양천 홈케어 W",
    sourcePlatform: "blog",
    sourceUrl: "https://blog.naver.com/example-yc1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T14:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 성동구
  // ========================================
  {
    id: "seongdong-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "seongdong",
    price: 50000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "mold-removal"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "성동 에어컨 X",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-sd1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-10T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 광진구
  // ========================================
  {
    id: "gwangjin-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "gwangjin",
    price: 48000,
    priceMax: 58000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "광진 에어컨 Y",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-gj1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 구로구
  // ========================================
  {
    id: "guro-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "guro",
    price: 43000,
    priceMax: 55000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
    ],
    providerName: "구로 에어컨 Z",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-gr1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T15:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 동작구
  // ========================================
  {
    id: "dongjak-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "general",
    regionCity: "seoul",
    regionDistrict: "dongjak",
    price: 28000,
    priceMax: 38000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash"],
    additionalServices: [],
    extraCharges: [
      { label: "살균 소독", amount: 10000, condition: "선택 시" },
    ],
    providerName: "동작 홈케어 AA",
    sourcePlatform: "blog",
    sourceUrl: "https://blog.naver.com/example-dj1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T11:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 서울 은평구
  // ========================================
  {
    id: "eunpyeong-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "seoul",
    regionDistrict: "eunpyeong",
    price: 45000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
    ],
    providerName: "은평 에어컨 BB",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-ep1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-10T11:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 수원시
  // ========================================
  {
    id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
    airconType: "wall-mount",
    cleaningMethod: "unknown",
    regionCity: "gyeonggi",
    regionDistrict: "suwon",
    price: 40000,
    priceMax: 55000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash"],
    additionalServices: [],
    extraCharges: [],
    providerName: "수원 에어컨 C",
    sourcePlatform: "blog",
    sourceUrl: "https://blog.naver.com/example-3",
    isIncomplete: true,
    incompleteFields: [
      { field: "cleaningMethod", reason: "not-specified" },
      { field: "includedServices", reason: "ambiguous" },
    ],
    collectedAt: "2026-04-12T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "d3a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c",
    airconType: "standing",
    cleaningMethod: "general",
    regionCity: "gyeonggi",
    regionDistrict: "suwon",
    price: 50000,
    priceMax: 65000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [],
    providerName: "수원 홈케어 N",
    sourcePlatform: "blog",
    sourceUrl: "https://blog.naver.com/example-14",
    isIncomplete: true,
    incompleteFields: [
      { field: "includedServices", reason: "ambiguous" },
    ],
    collectedAt: "2026-04-13T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "c8f8a9b0-c1d2-4e3f-4a5b-6c7d8e9f0a1b",
    airconType: "window",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "suwon",
    price: 50000,
    priceMax: 60000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [],
    providerName: "수원 홈케어 N",
    sourcePlatform: "blog",
    sourceUrl: "https://blog.naver.com/example-17",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "suwon-wm-dis-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "suwon",
    price: 45000,
    priceMax: 55000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
    ],
    providerName: "수원 클린에어 CC",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-sw2",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T14:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 성남시
  // ========================================
  {
    id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c",
    airconType: "system",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "seongnam",
    price: 100000,
    priceMax: null,
    priceUnit: "실내기 1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실내기 추가", amount: 80000, condition: "2대째부터" },
      { label: "실외기 청소", amount: 30000, condition: null },
    ],
    providerName: "성남 시스템 에어컨 E",
    sourcePlatform: "registration",
    sourceUrl: "https://soomgo.com/profile/example-5",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T11:00:00Z",
    verifiedAt: "2026-04-13T11:00:00Z",
    isActive: true,
  },
  {
    id: "b7e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "seongnam",
    price: 85000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "outdoor-unit", "operation-check"],
    additionalServices: [],
    extraCharges: [],
    providerName: "성남 시스템 에어컨 E",
    sourcePlatform: "registration",
    sourceUrl: "https://soomgo.com/profile/example-5",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T11:00:00Z",
    verifiedAt: "2026-04-13T11:00:00Z",
    isActive: true,
  },
  {
    id: "seongnam-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "seongnam",
    price: 48000,
    priceMax: 58000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "mold-removal"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "성남 시스템 에어컨 E",
    sourcePlatform: "registration",
    sourceUrl: "https://soomgo.com/profile/example-5",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T11:00:00Z",
    verifiedAt: "2026-04-13T11:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 고양시
  // ========================================
  {
    id: "a0d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "goyang",
    price: 45000,
    priceMax: 55000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "고양 클린에어 L",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-11",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T08:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "b1e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "goyang",
    price: 75000,
    priceMax: 95000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 25000, condition: null },
    ],
    providerName: "고양 클린에어 L",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-12",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T08:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "e0b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d",
    airconType: "system",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "goyang",
    price: 85000,
    priceMax: 110000,
    priceUnit: "실내기 1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실내기 추가", amount: 75000, condition: "2대째부터" },
      { label: "실외기 청소", amount: 28000, condition: null },
    ],
    providerName: "고양 클린에어 L",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-18",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T08:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 용인시
  // ========================================
  {
    id: "c2f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "yongin",
    price: 48000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "mold-removal"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "용인 에어컨 M",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-13",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T14:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "d9a9b0c1-d2e3-4f4a-5b6c-7d8e9f0a1b2c",
    airconType: "ceiling",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "yongin",
    price: 110000,
    priceMax: 140000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "drain-pipe", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "4way 추가", amount: 25000, condition: "4방향 카세트" },
    ],
    providerName: "용인 에어컨 M",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-13",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T14:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "yongin-st-001",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "yongin",
    price: 78000,
    priceMax: 95000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 22000, condition: null },
    ],
    providerName: "용인 에어컨 M",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-13",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T14:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 부천시
  // ========================================
  {
    id: "a2d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f",
    airconType: "wall-mount",
    cleaningMethod: "unknown",
    regionCity: "gyeonggi",
    regionDistrict: "bucheon",
    price: 38000,
    priceMax: 50000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash"],
    additionalServices: [],
    extraCharges: [],
    providerName: "부천 에어컨 R",
    sourcePlatform: "blog",
    sourceUrl: "https://blog.naver.com/example-20",
    isIncomplete: true,
    incompleteFields: [
      { field: "cleaningMethod", reason: "not-specified" },
      { field: "includedServices", reason: "ambiguous" },
    ],
    collectedAt: "2026-04-12T11:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "bucheon-wm-dis-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "bucheon",
    price: 42000,
    priceMax: 52000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
    ],
    providerName: "부천 클린에어 DD",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-bc2",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "bucheon-st-001",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "bucheon",
    price: 72000,
    priceMax: 90000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 22000, condition: null },
    ],
    providerName: "부천 클린에어 DD",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-bc2",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 안산시
  // ========================================
  {
    id: "ansan-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "ansan",
    price: 40000,
    priceMax: 50000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
    ],
    providerName: "안산 에어컨 EE",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-as1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "ansan-st-001",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "ansan",
    price: 70000,
    priceMax: 85000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "안산 에어컨 EE",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-as1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 안양시
  // ========================================
  {
    id: "anyang-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "anyang",
    price: 43000,
    priceMax: 55000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
    ],
    providerName: "안양 에어컨 FF",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-ay1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-10T15:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 남양주시
  // ========================================
  {
    id: "namyangju-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "namyangju",
    price: 42000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
    ],
    providerName: "남양주 에어컨 GG",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-nyj1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T13:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
  {
    id: "namyangju-st-001",
    airconType: "standing",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "namyangju",
    price: 72000,
    priceMax: 88000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 22000, condition: null },
    ],
    providerName: "남양주 에어컨 GG",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-nyj1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T13:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 화성시
  // ========================================
  {
    id: "hwaseong-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "hwaseong",
    price: 40000,
    priceMax: 50000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
      { label: "출장비", amount: 10000, condition: "동탄 이외 지역" },
    ],
    providerName: "화성 에어컨 HH",
    sourcePlatform: "blog",
    sourceUrl: "https://blog.naver.com/example-hs1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T16:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 평택시
  // ========================================
  {
    id: "pyeongtaek-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "pyeongtaek",
    price: 38000,
    priceMax: 48000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 15000, condition: null },
    ],
    providerName: "평택 에어컨 II",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-pt1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 의정부시
  // ========================================
  {
    id: "uijeongbu-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "uijeongbu",
    price: 42000,
    priceMax: 52000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
    ],
    providerName: "의정부 에어컨 JJ",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-uj1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-10T14:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 김포시
  // ========================================
  {
    id: "gimpo-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "gimpo",
    price: 43000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
    ],
    providerName: "김포 에어컨 KK",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-gp1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-12T10:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 파주시
  // ========================================
  {
    id: "paju-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "paju",
    price: 40000,
    priceMax: 50000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 18000, condition: null },
    ],
    providerName: "파주 에어컨 LL",
    sourcePlatform: "blog",
    sourceUrl: "https://blog.naver.com/example-pj1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-11T11:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 광명시
  // ========================================
  {
    id: "gwangmyeong-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "gwangmyeong",
    price: 45000,
    priceMax: 55000,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "operation-check"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "광명 에어컨 MM",
    sourcePlatform: "soomgo",
    sourceUrl: "https://soomgo.com/profile/example-gm1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-10T09:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },

  // ========================================
  // 경기 하남시
  // ========================================
  {
    id: "hanam-wm-001",
    airconType: "wall-mount",
    cleaningMethod: "disassembly",
    regionCity: "gyeonggi",
    regionDistrict: "hanam",
    price: 48000,
    priceMax: null,
    priceUnit: "1대 기준",
    includedServices: ["filter-wash", "sanitization", "mold-removal"],
    additionalServices: [],
    extraCharges: [
      { label: "실외기 청소", amount: 20000, condition: null },
    ],
    providerName: "하남 에어컨 NN",
    sourcePlatform: "danggeun",
    sourceUrl: "https://www.daangn.com/articles/example-hn1",
    isIncomplete: false,
    incompleteFields: [],
    collectedAt: "2026-04-13T08:00:00Z",
    verifiedAt: "2026-04-14T09:00:00Z",
    isActive: true,
  },
];

// ─────────────────────────────────────────────
// 데이터 파일 구조 (메타데이터 포함)
// ─────────────────────────────────────────────

/** 전체 목업 데이터 파일 */
export const MOCK_PRICE_DATA: PriceDataFile = {
  metadata: {
    version: "1.0.0",
    lastUpdated: "2026-04-14T09:00:00Z",
    totalEntries: MOCK_PRICE_ENTRIES.length,
  },
  entries: MOCK_PRICE_ENTRIES,
};

// ─────────────────────────────────────────────
// 데이터 소스: Supabase + Mock 폴백
// ─────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

/** Supabase에서 로드된 데이터 캐시 (빌드 시 1회 로드) */
let _supabaseEntries: PriceEntry[] | null = null;

async function loadSupabaseEntries(): Promise<PriceEntry[]> {
  if (_supabaseEntries !== null) return _supabaseEntries;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.log("⚠️ Supabase 미설정 — mock 데이터 사용");
    _supabaseEntries = MOCK_PRICE_ENTRIES;
    return _supabaseEntries;
  }

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("price_entries")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (error || !data || data.length === 0) {
      console.log("⚠️ Supabase 데이터 없음 — mock 데이터 사용");
      _supabaseEntries = MOCK_PRICE_ENTRIES;
      return _supabaseEntries;
    }

    // snake_case → camelCase 변환
    _supabaseEntries = data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      airconType: row.aircon_type as AirconType,
      cleaningMethod: row.cleaning_method as PriceEntry["cleaningMethod"],
      regionCity: row.region_city as City,
      regionDistrict: row.region_district as string,
      price: row.price as number,
      priceMax: row.price_max as number | null,
      priceUnit: (row.price_unit as string) ?? "1대 기준",
      includedServices: (row.included_services as PriceEntry["includedServices"]) ?? [],
      additionalServices: (row.additional_services as string[]) ?? [],
      extraCharges: (row.extra_charges as PriceEntry["extraCharges"]) ?? [],
      providerName: row.provider_name as string,
      sourcePlatform: row.source_platform as PriceEntry["sourcePlatform"],
      sourceUrl: row.source_url as string,
      isIncomplete: (row.is_incomplete as boolean) ?? false,
      incompleteFields: (row.incomplete_fields as PriceEntry["incompleteFields"]) ?? [],
      collectedAt: row.collected_at as string,
      verifiedAt: row.verified_at as string,
      isActive: (row.is_active as boolean) ?? true,
    }));

    console.log(`✅ Supabase에서 ${_supabaseEntries.length}건 로드`);
    return _supabaseEntries;
  } catch (err) {
    console.log("⚠️ Supabase 연결 실패 — mock 데이터 사용");
    _supabaseEntries = MOCK_PRICE_ENTRIES;
    return _supabaseEntries;
  }
}

/** 데이터 소스 결정 (Supabase 또는 Mock) */
function getEntries(): PriceEntry[] {
  // 이미 로드된 Supabase 데이터가 있으면 사용
  if (_supabaseEntries !== null) return _supabaseEntries;
  // 아직 로드 안 됐으면 mock 폴백
  return MOCK_PRICE_ENTRIES;
}

// ─────────────────────────────────────────────
// 데이터 조회 헬퍼 함수
// ─────────────────────────────────────────────

/** 빌드 시 Supabase 데이터 로드 (페이지에서 호출) */
export async function ensureDataLoaded(): Promise<void> {
  await loadSupabaseEntries();
}

/** 전체 활성 가격 데이터 조회 (홈페이지용) */
export function getAllPriceEntries(): PriceEntry[] {
  return getEntries().filter((e) => e.isActive);
}

/** 전체 데이터 통계 요약 (홈페이지용) */
export function calculateGlobalSummary(): {
  totalEntries: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
} {
  const entries = getAllPriceEntries();
  if (entries.length === 0) {
    return { totalEntries: 0, avgPrice: 0, minPrice: 0, maxPrice: 0 };
  }
  const prices = entries.map((e) => e.price);
  return {
    totalEntries: entries.length,
    avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  };
}

/**
 * 특정 지역×유형 조합의 가격 데이터 조회
 *
 * SEO 페이지에서 비교표 데이터를 가져올 때 사용한다.
 */
export function getPriceEntries(
  regionCity: City,
  regionDistrict: string,
  airconType: AirconType
): PriceEntry[] {
  return getEntries().filter(
    (entry) =>
      entry.regionCity === regionCity &&
      entry.regionDistrict === regionDistrict &&
      entry.airconType === airconType &&
      entry.isActive
  );
}

/**
 * 특정 지역×유형 조합의 가격 통계 계산
 */
export function calculatePriceSummary(
  regionCity: City,
  regionDistrict: string,
  airconType: AirconType
): PriceSummary {
  const entries = getPriceEntries(regionCity, regionDistrict, airconType);

  if (entries.length === 0) {
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

  const prices = entries.map((e) => e.price).sort((a, b) => a - b);
  const mid = Math.floor(prices.length / 2);

  return {
    airconType,
    regionCity,
    regionDistrict,
    minPrice: prices[0],
    maxPrice: prices[prices.length - 1],
    avgPrice: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length),
    medianPrice:
      prices.length % 2 === 0
        ? Math.round((prices[mid - 1] + prices[mid]) / 2)
        : prices[mid],
    totalEntries: entries.length,
    generalCount: entries.filter((e) => e.cleaningMethod === "general").length,
    disassemblyCount: entries.filter((e) => e.cleaningMethod === "disassembly").length,
    completeDisassemblyCount: entries.filter((e) => e.cleaningMethod === "complete-disassembly").length,
    lastUpdated: entries
      .map((e) => e.verifiedAt)
      .sort()
      .reverse()[0],
  };
}

/**
 * 특정 지역의 전체 에어컨 유형별 데이터 유무 확인
 *
 * 빈 비교표 표시 여부를 판단할 때 사용한다.
 */
export function getAvailableAirconTypes(
  regionCity: City,
  regionDistrict: string
): AirconType[] {
  const types = new Set<AirconType>();
  for (const entry of MOCK_PRICE_ENTRIES) {
    if (
      entry.regionCity === regionCity &&
      entry.regionDistrict === regionDistrict &&
      entry.isActive
    ) {
      types.add(entry.airconType);
    }
  }
  return Array.from(types);
}

/**
 * 데이터가 있는 전체 지역 목록 조회
 *
 * 사이트맵 생성이나 빈 페이지 필터링에 사용한다.
 */
export function getRegionsWithData(): Array<{
  city: City;
  district: string;
  airconTypes: AirconType[];
}> {
  const regionMap = new Map<string, { city: City; district: string; types: Set<AirconType> }>();

  for (const entry of MOCK_PRICE_ENTRIES) {
    if (!entry.isActive) continue;
    const key = `${entry.regionCity}:${entry.regionDistrict}`;
    if (!regionMap.has(key)) {
      regionMap.set(key, {
        city: entry.regionCity,
        district: entry.regionDistrict,
        types: new Set(),
      });
    }
    regionMap.get(key)!.types.add(entry.airconType);
  }

  return Array.from(regionMap.values()).map(({ city, district, types }) => ({
    city,
    district,
    airconTypes: Array.from(types),
  }));
}
