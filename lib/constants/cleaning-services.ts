/**
 * 청소 방식 및 포함 서비스 표준 카테고리 상수 정의
 *
 * 크롤링 데이터를 표준 카테고리로 정규화하기 위한 기준 데이터.
 * 각 항목별로 slug, 한글 라벨, 설명, 매칭 키워드를 포함하여
 * 동일 선상 비교가 가능하도록 한다.
 *
 * @module cleaning-services
 */

import type {
  CleaningMethod,
  IncludedService,
  AirconType,
} from "@/lib/types/price-data";

// ─────────────────────────────────────────────
// 1. 청소 방식 (CleaningMethod) 상세 정의
// ─────────────────────────────────────────────

/** 청소 방식 상세 정보 */
export interface CleaningMethodInfo {
  /** 청소 방식 코드 */
  code: CleaningMethod;
  /** 한글 라벨 */
  label: string;
  /** 짧은 한글 라벨 (모바일 UI용) */
  shortLabel: string;
  /** 사용자용 설명 */
  description: string;
  /** 정렬 우선순위 (낮을수록 우선) */
  priority: number;
  /** 일반적인 가격 가산율 (분해 기준 = 1.0) */
  priceMultiplier: number;
  /** SVG 아이콘 path (24x24 viewBox 기준) */
  iconPath: string;
  /** 크롤링 데이터 매칭용 키워드 목록 */
  matchKeywords: string[];
}

/** 청소 방식 상세 목록 */
export const CLEANING_METHOD_INFO: CleaningMethodInfo[] = [
  {
    code: "general",
    label: "일반세척",
    shortLabel: "일반",
    description:
      "에어컨을 분해하지 않고 고압 스팀이나 세정제를 사용하여 외부에서 세척하는 방식입니다. 분해 대비 시간이 짧고 가격이 저렴합니다.",
    priority: 1,
    priceMultiplier: 0.6,
    iconPath:
      "M12 2v6m0 0l-3-3m3 3l3-3M4.93 10.93l1.41 1.41M2 18h2m16 0h2m-3.93-5.66l1.41-1.41M12 14a4 4 0 100 8 4 4 0 000-8z",
    matchKeywords: [
      "일반",
      "일반세척",
      "일반 세척",
      "일반청소",
      "일반 청소",
      "비분해",
      "비분해청소",
      "비분해 청소",
      "간단청소",
      "간단 청소",
      "간단세척",
      "간단 세척",
      "기본청소",
      "기본 청소",
      "기본세척",
      "기본 세척",
      "스팀",
      "스팀청소",
      "스팀 청소",
      "스팀세척",
      "스팀 세척",
      "고압세척",
      "고압 세척",
      "고압청소",
      "고압 청소",
      "non-disassembly",
      "general",
      "basic",
      "steam",
      "standard",
    ],
  },
  {
    code: "disassembly",
    label: "분해세척",
    shortLabel: "분해",
    description:
      "에어컨 전면 패널과 필터를 분해하여 내부 열교환기, 팬 등을 세척하는 방식입니다. 일반세척 대비 청소 효과가 높지만 시간이 더 소요됩니다.",
    priority: 2,
    priceMultiplier: 1.0,
    iconPath:
      "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
    matchKeywords: [
      "분해",
      "분해세척",
      "분해 세척",
      "분해청소",
      "분해 청소",
      "반분해",
      "반 분해",
      "부분분해",
      "부분 분해",
      "disassembly",
      "partial",
    ],
  },
  {
    code: "complete-disassembly",
    label: "완전분해세척",
    shortLabel: "완전분해",
    description:
      "에어컨의 모든 부품(열교환기, 팬, 드레인팬, 모터 등)을 완전히 분리하여 개별 세척하는 가장 철저한 방식입니다. 분해세척 대비 시간과 비용이 더 들지만 청소 효과가 가장 뛰어납니다.",
    priority: 3,
    priceMultiplier: 1.5,
    iconPath:
      "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    matchKeywords: [
      "완전분해",
      "완전 분해",
      "완전분해세척",
      "완전분해 세척",
      "완전 분해 세척",
      "완전분해청소",
      "완전분해 청소",
      "완전 분해 청소",
      "전체분해",
      "전체 분해",
      "전체분해세척",
      "전체분해 세척",
      "전체 분해 세척",
      "풀분해",
      "풀 분해",
      "풀분해세척",
      "풀분해 세척",
      "오버홀",
      "overhaul",
      "complete disassembly",
      "complete-disassembly",
      "full disassembly",
      "full-disassembly",
    ],
  },
  {
    code: "unknown",
    label: "미확인",
    shortLabel: "미확인",
    description: "청소 방식이 명시되지 않았거나 확인할 수 없는 경우입니다.",
    priority: 4,
    priceMultiplier: 0.8,
    iconPath: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zm0-14v4m0 4h.01",
    matchKeywords: [],
  },
];

// ─────────────────────────────────────────────
// 2. 포함 서비스 (IncludedService) 상세 정의
// ─────────────────────────────────────────────

/** 포함 서비스 상세 정보 */
export interface IncludedServiceInfo {
  /** 서비스 코드 */
  code: IncludedService;
  /** 한글 라벨 */
  label: string;
  /** 짧은 한글 라벨 (모바일 UI 뱃지용) */
  shortLabel: string;
  /** 사용자용 설명 */
  description: string;
  /** 정렬 우선순위 (소비자 관심도 기준, 낮을수록 우선) */
  priority: number;
  /** 일반적으로 기본 포함되는 빈도 (0~1, 높을수록 기본 포함 빈도 높음) */
  defaultInclusionRate: number;
  /** 별도 추가 시 일반적인 추가 비용 (원, 0이면 보통 기본 포함) */
  typicalExtraCost: number;
  /** SVG 아이콘 path (24x24 viewBox 기준) */
  iconPath: string;
  /** 해당 서비스가 적용 가능한 에어컨 유형 (빈 배열이면 전체) */
  applicableAirconTypes: AirconType[];
  /** 크롤링 데이터 매칭용 키워드 목록 */
  matchKeywords: string[];
}

/** 포함 서비스 상세 목록 */
export const INCLUDED_SERVICE_INFO: IncludedServiceInfo[] = [
  {
    code: "filter-wash",
    label: "필터 세척",
    shortLabel: "필터",
    description:
      "에어컨 필터를 분리하여 물세척 또는 고압 세척합니다. 대부분의 청소 서비스에 기본 포함됩니다.",
    priority: 1,
    defaultInclusionRate: 0.95,
    typicalExtraCost: 0,
    iconPath:
      "M3 4h18l-2 14H5L3 4zm4 0V2h10v2M8 8h8m-8 3h8",
    applicableAirconTypes: [],
    matchKeywords: [
      "필터",
      "필터세척",
      "필터 세척",
      "필터 청소",
      "필터청소",
      "filter",
      "에어필터",
    ],
  },
  {
    code: "sanitization",
    label: "항균·살균",
    shortLabel: "살균",
    description:
      "항균·살균 코팅 또는 살균제를 사용하여 세균과 곰팡이 번식을 억제합니다.",
    priority: 2,
    defaultInclusionRate: 0.7,
    typicalExtraCost: 10000,
    iconPath:
      "M12 2a10 10 0 100 20 10 10 0 000-20zm-1 5h2v6h-2zm0 8h2v2h-2z",
    applicableAirconTypes: [],
    matchKeywords: [
      "살균",
      "항균",
      "살균코팅",
      "항균코팅",
      "살균 코팅",
      "항균 코팅",
      "항균·살균",
      "살균처리",
      "살균 처리",
      "sanitization",
      "antibacterial",
      "UV살균",
    ],
  },
  {
    code: "outdoor-unit",
    label: "실외기 청소",
    shortLabel: "실외기",
    description:
      "실외기 열교환기 및 팬을 고압 세척합니다. 별도 요금이 부과되는 경우가 많습니다.",
    priority: 3,
    defaultInclusionRate: 0.3,
    typicalExtraCost: 20000,
    iconPath:
      "M4 4h16v16H4V4zm4 4h8m-8 4h8m-4-8v16",
    applicableAirconTypes: ["wall-mount", "standing", "ceiling", "system"],
    matchKeywords: [
      "실외기",
      "실외기청소",
      "실외기 청소",
      "실외기 세척",
      "실외기세척",
      "outdoor",
      "outdoor unit",
      "컴프레서",
      "열교환기",
    ],
  },
  {
    code: "drain-pipe",
    label: "배수관 청소",
    shortLabel: "배수관",
    description:
      "에어컨 응축수 배수관의 막힘을 제거하고 세척합니다. 물이 새는 경우 필수적입니다.",
    priority: 4,
    defaultInclusionRate: 0.5,
    typicalExtraCost: 10000,
    iconPath:
      "M12 2v20M6 6l6 6-6 6m12-12l-6 6 6 6",
    applicableAirconTypes: [],
    matchKeywords: [
      "배수",
      "배수관",
      "배수관청소",
      "배수관 청소",
      "드레인",
      "드레인관",
      "드레인 청소",
      "drain",
      "배수호스",
      "배수 호스",
    ],
  },
  {
    code: "mold-removal",
    label: "곰팡이 제거",
    shortLabel: "곰팡이",
    description:
      "에어컨 내부에 발생한 곰팡이를 전문 세정제로 제거합니다.",
    priority: 5,
    defaultInclusionRate: 0.4,
    typicalExtraCost: 15000,
    iconPath:
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    applicableAirconTypes: [],
    matchKeywords: [
      "곰팡이",
      "곰팡이제거",
      "곰팡이 제거",
      "곰팡이청소",
      "곰팡이 청소",
      "mold",
      "mold removal",
      "진균",
      "카비",
    ],
  },
  {
    code: "odor-removal",
    label: "냄새 제거",
    shortLabel: "냄새",
    description:
      "에어컨에서 발생하는 악취를 전문 탈취제나 오존 처리로 제거합니다.",
    priority: 6,
    defaultInclusionRate: 0.35,
    typicalExtraCost: 10000,
    iconPath:
      "M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.72 0l-.7.7M6.34 17.66l-.7.7",
    applicableAirconTypes: [],
    matchKeywords: [
      "냄새",
      "냄새제거",
      "냄새 제거",
      "탈취",
      "악취",
      "악취제거",
      "악취 제거",
      "odor",
      "탈취제",
      "오존",
    ],
  },
  {
    code: "operation-check",
    label: "작동 점검",
    shortLabel: "점검",
    description:
      "청소 후 에어컨의 정상 작동 여부, 냉매 상태, 이상 소음 등을 점검합니다.",
    priority: 7,
    defaultInclusionRate: 0.6,
    typicalExtraCost: 0,
    iconPath:
      "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
    applicableAirconTypes: [],
    matchKeywords: [
      "점검",
      "작동점검",
      "작동 점검",
      "시운전",
      "테스트",
      "냉매",
      "냉매점검",
      "냉매 점검",
      "operation check",
      "가동테스트",
      "가동 테스트",
    ],
  },
];

// ─────────────────────────────────────────────
// 3. 유틸리티 함수
// ─────────────────────────────────────────────

/** 코드로 청소 방식 상세 정보 조회 */
export function getCleaningMethodInfo(
  code: CleaningMethod,
): CleaningMethodInfo | undefined {
  return CLEANING_METHOD_INFO.find((m) => m.code === code);
}

/** 코드로 포함 서비스 상세 정보 조회 */
export function getIncludedServiceInfo(
  code: IncludedService,
): IncludedServiceInfo | undefined {
  return INCLUDED_SERVICE_INFO.find((s) => s.code === code);
}

/**
 * 키워드로 청소 방식 매칭 (크롤링 데이터 정규화용)
 *
 * 매칭 우선순위: 완전분해 → 분해 → 일반 → 미확인
 * "완전분해"가 "분해"를 포함하므로, 더 구체적인 카테고리를 먼저 검사한다.
 *
 * @param text - 크롤링된 원문 텍스트
 * @returns 매칭된 청소 방식 코드, 매칭 실패 시 "unknown"
 */
export function matchCleaningMethod(text: string): CleaningMethod {
  const normalized = text.trim().toLowerCase();

  // 완전분해 → 분해 → 일반 순서로 검사 (구체적인 것 우선)
  const priorityOrder: CleaningMethod[] = [
    "complete-disassembly",
    "disassembly",
    "general",
  ];

  for (const code of priorityOrder) {
    const method = CLEANING_METHOD_INFO.find((m) => m.code === code);
    if (
      method &&
      method.matchKeywords.some((kw) => normalized.includes(kw.toLowerCase()))
    ) {
      return method.code;
    }
  }
  return "unknown";
}

/**
 * 키워드로 포함 서비스 매칭 (크롤링 데이터 정규화용)
 *
 * 텍스트에서 매칭되는 모든 서비스를 반환한다.
 *
 * @param text - 크롤링된 원문 텍스트
 * @returns 매칭된 포함 서비스 코드 배열
 */
export function matchIncludedServices(text: string): IncludedService[] {
  const normalized = text.trim().toLowerCase();
  const matched: IncludedService[] = [];

  for (const service of INCLUDED_SERVICE_INFO) {
    if (service.matchKeywords.some((kw) => normalized.includes(kw.toLowerCase()))) {
      matched.push(service.code);
    }
  }

  return matched;
}

/**
 * 에어컨 유형에 적용 가능한 서비스 목록 조회
 *
 * @param airconType - 에어컨 유형 코드
 * @returns 해당 유형에 적용 가능한 서비스 목록
 */
export function getApplicableServices(
  airconType: AirconType,
): IncludedServiceInfo[] {
  return INCLUDED_SERVICE_INFO.filter(
    (s) =>
      s.applicableAirconTypes.length === 0 ||
      s.applicableAirconTypes.includes(airconType),
  );
}

/**
 * 서비스의 기본 포함 여부 판단 (정규화 시 추정용)
 *
 * defaultInclusionRate가 0.8 이상이면 "높음(기본 포함 추정)",
 * 0.5 이상이면 "보통", 미만이면 "낮음(별도 요금 추정)"
 */
export function getServiceInclusionLevel(
  code: IncludedService,
): "high" | "medium" | "low" {
  const info = getIncludedServiceInfo(code);
  if (!info) return "low";
  if (info.defaultInclusionRate >= 0.8) return "high";
  if (info.defaultInclusionRate >= 0.5) return "medium";
  return "low";
}

// ─────────────────────────────────────────────
// 4. 에어컨 유형별 청소 방식 가격 참고 데이터
// ─────────────────────────────────────────────

/**
 * 에어컨 유형 × 청소 방식별 일반적인 가격 범위 (원)
 *
 * 크롤링 데이터 검증 및 이상치 탐지에 사용한다.
 * 이 범위를 크게 벗어나는 가격 데이터는 수동 확인 대상이 된다.
 */
export const PRICE_RANGE_BY_TYPE_METHOD: Record<
  AirconType,
  Record<Exclude<CleaningMethod, "unknown">, { min: number; max: number }>
> = {
  "wall-mount": {
    general: { min: 30000, max: 60000 },
    disassembly: { min: 50000, max: 100000 },
    "complete-disassembly": { min: 80000, max: 150000 },
  },
  standing: {
    general: { min: 50000, max: 100000 },
    disassembly: { min: 80000, max: 180000 },
    "complete-disassembly": { min: 120000, max: 280000 },
  },
  ceiling: {
    general: { min: 70000, max: 150000 },
    disassembly: { min: 100000, max: 250000 },
    "complete-disassembly": { min: 150000, max: 380000 },
  },
  system: {
    general: { min: 50000, max: 120000 },
    disassembly: { min: 80000, max: 200000 },
    "complete-disassembly": { min: 120000, max: 300000 },
  },
  window: {
    general: { min: 25000, max: 50000 },
    disassembly: { min: 40000, max: 80000 },
    "complete-disassembly": { min: 60000, max: 120000 },
  },
};

/**
 * 가격이 정상 범위 내인지 검증
 *
 * @returns true이면 정상 범위, false이면 이상치 (수동 확인 필요)
 */
export function isPriceInRange(
  airconType: AirconType,
  cleaningMethod: CleaningMethod,
  price: number,
): boolean {
  if (cleaningMethod === "unknown") return true; // 미확인은 검증 불가
  const range = PRICE_RANGE_BY_TYPE_METHOD[airconType]?.[cleaningMethod];
  if (!range) return true;
  // 범위의 50%~200% 허용 (업체별 편차 고려)
  return price >= range.min * 0.5 && price <= range.max * 2.0;
}
