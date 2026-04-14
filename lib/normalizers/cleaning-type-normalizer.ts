/**
 * 서비스 유형(청소 방식) 표준 카테고리 정규화 모듈
 *
 * 크롤링 데이터(숨고, 당근, 블로그, 업체 사이트)에서 수집된 다양한 청소 방식
 * 표현을 3가지 표준 카테고리로 매핑한다.
 *
 * 표준 카테고리:
 *   1. general              (일반세척) - 비분해, 스팀, 고압세척 등
 *   2. disassembly          (분해세척) - 부분 분해 후 내부 세척
 *   3. complete-disassembly (완전분해세척) - 전체 부품 분리 후 개별 세척
 *
 * 매칭 실패 시 "unknown"을 반환한다.
 *
 * @module cleaning-type-normalizer
 */

import type { CleaningMethod } from "@/lib/types/price-data";

// ─────────────────────────────────────────────
// 1. 매핑 규칙 정의
// ─────────────────────────────────────────────

/**
 * 청소 방식별 매핑 규칙
 *
 * 크롤링 소스별 다양한 표현을 고려한다:
 * - 숨고: "분해청소", "완전분해 세척", "일반 에어컨 청소"
 * - 당근: "에어컨 분해 청소해드려요", "스팀청소"
 * - 블로그: "완전분해 후기", "오버홀 세척"
 * - 업체 사이트: "분해세척", "풀분해 클리닝"
 *
 * 주의: "완전분해" 키워드가 "분해"를 포함하므로
 *       반드시 complete-disassembly를 disassembly보다 먼저 검사해야 한다.
 */
interface CleaningTypeMappingRule {
  /** 표준 청소 방식 코드 */
  type: CleaningMethod;
  /** 정확히 일치하는 문자열 목록 (소문자 정규화 후 비교) */
  exactMatches: string[];
  /** 부분 일치 정규표현식 패턴 목록 */
  patterns: RegExp[];
  /**
   * 매칭 우선순위 (낮을수록 우선)
   * 여러 패턴이 동시 매칭될 때 사용.
   * 특히 "완전분해"가 "분해"에도 매칭되므로 우선순위가 중요하다.
   */
  priority: number;
}

const MAPPING_RULES: CleaningTypeMappingRule[] = [
  {
    type: "complete-disassembly",
    priority: 1,
    exactMatches: [
      // 한국어 정확 매칭 - 완전분해
      "완전분해",
      "완전분해세척",
      "완전분해 세척",
      "완전 분해 세척",
      "완전분해청소",
      "완전분해 청소",
      "완전 분해 청소",
      "완전 분해",
      // 전체분해
      "전체분해",
      "전체분해세척",
      "전체분해 세척",
      "전체 분해 세척",
      "전체분해청소",
      "전체분해 청소",
      "전체 분해 청소",
      "전체 분해",
      // 풀분해
      "풀분해",
      "풀분해세척",
      "풀분해 세척",
      "풀 분해 세척",
      "풀분해청소",
      "풀분해 청소",
      "풀 분해 청소",
      "풀 분해",
      // 오버홀
      "오버홀",
      "오버홀 세척",
      "오버홀세척",
      "오버홀 청소",
      "오버홀청소",
      // 영어
      "complete disassembly",
      "complete-disassembly",
      "full disassembly",
      "full-disassembly",
      "overhaul",
    ],
    patterns: [
      /완전\s*분해/,
      /전체\s*분해/,
      /풀\s*분해/,
      /오버홀/,
      /overhaul/i,
      /complete[\s-]?disassembly/i,
      /full[\s-]?disassembly/i,
    ],
  },
  {
    type: "disassembly",
    priority: 2,
    exactMatches: [
      // 한국어 정확 매칭
      "분해",
      "분해세척",
      "분해 세척",
      "분해청소",
      "분해 청소",
      // 반분해 / 부분분해 (완전분해가 아닌 분해)
      "반분해",
      "반분해세척",
      "반분해 세척",
      "반 분해",
      "반 분해 세척",
      "부분분해",
      "부분분해세척",
      "부분분해 세척",
      "부분 분해",
      "부분 분해 세척",
      // 영어
      "disassembly",
      "partial disassembly",
      "partial-disassembly",
    ],
    patterns: [
      /(?<!완전|전체|풀|비)\s*분해/, // "완전분해", "전체분해", "풀분해", "비분해"가 아닌 "분해"
      /반\s*분해/,
      /부분\s*분해/,
      /(?<!complete[\s-]?)(?<!full[\s-]?)disassembly/i,
      /partial[\s-]?disassembly/i,
    ],
  },
  {
    type: "general",
    priority: 3,
    exactMatches: [
      // 한국어 정확 매칭 - 일반/기본
      "일반세척",
      "일반 세척",
      "일반청소",
      "일반 청소",
      "기본세척",
      "기본 세척",
      "기본청소",
      "기본 청소",
      // 비분해
      "비분해",
      "비분해세척",
      "비분해 세척",
      "비분해청소",
      "비분해 청소",
      // 간단
      "간단세척",
      "간단 세척",
      "간단청소",
      "간단 청소",
      // 스팀
      "스팀",
      "스팀세척",
      "스팀 세척",
      "스팀청소",
      "스팀 청소",
      // 고압
      "고압세척",
      "고압 세척",
      "고압청소",
      "고압 청소",
      // 외부세척
      "외부세척",
      "외부 세척",
      "외부청소",
      "외부 청소",
      // 약품
      "약품세척",
      "약품 세척",
      "약품청소",
      "약품 청소",
      // 에어컨 세척/청소 (방식 미지정 → 일반으로 분류)
      "에어컨 세척",
      "에어컨세척",
      "에어컨 청소",
      "에어컨청소",
      // 영어
      "general",
      "basic",
      "standard",
      "steam",
      "steam cleaning",
      "non-disassembly",
    ],
    patterns: [
      /일반\s*(?:세척|청소)/,
      /기본\s*(?:세척|청소)/,
      /비분해/,
      /간단\s*(?:세척|청소)/,
      /스팀\s*(?:세척|청소)?/,
      /고압\s*(?:세척|청소)/,
      /외부\s*(?:세척|청소)/,
      /약품\s*(?:세척|청소)/,
      /non[\s-]?disassembly/i,
      /steam[\s-]?clean/i,
      /general[\s-]?clean/i,
      /basic[\s-]?clean/i,
      /standard[\s-]?clean/i,
    ],
  },
];

// ─────────────────────────────────────────────
// 2. 전처리 유틸리티
// ─────────────────────────────────────────────

/**
 * 입력 텍스트 전처리 (정규화)
 *
 * - 앞뒤 공백 제거
 * - 연속 공백을 단일 공백으로
 * - 특수문자 정리 (괄호, 슬래시 등 → 공백)
 * - 소문자 변환
 */
function preprocess(text: string): string {
  return text
    .trim()
    .replace(/[()[\]{}\/\\|]+/g, " ") // 괄호, 슬래시 → 공백
    .replace(/\s+/g, " ") // 연속 공백 → 단일 공백
    .toLowerCase();
}

/**
 * 청소 방식에 무관한 부수 키워드 제거
 * 브랜드명, 에어컨 유형 등 청소 방식 판별에 불필요한 텍스트를 제거한다.
 */
function stripIrrelevantTokens(text: string): string {
  return text
    .replace(/\s*(벽걸이|스탠드|스텐드|타워|천장|천정|카세트|시스템|멀티|빌트인|창문|일체|이동식|포터블)\s*형?\s*/g, " ")
    .replace(/\s*(에어컨|에어콘|냉방기)\s*/g, " ")
    .replace(/\s*(서비스|클리닝|크리닝|전문|업체|가격|비용|후기|견적)\s*/g, " ")
    .replace(/\s*(삼성|lg|엘지|캐리어|위니아|대우|센추리)\s*/gi, " ")
    .trim();
}

// ─────────────────────────────────────────────
// 3. 정규화 결과 타입
// ─────────────────────────────────────────────

/** 청소 방식 정규화 결과 */
export interface CleaningTypeNormalizationResult {
  /** 매핑된 표준 청소 방식 (매칭 실패 시 "unknown") */
  type: CleaningMethod;
  /** 매칭 신뢰도 (0~1) */
  confidence: number;
  /** 매칭 방식 */
  matchMethod: "exact" | "pattern" | "stripped" | "none";
  /** 원본 입력 텍스트 */
  originalText: string;
  /** 전처리된 텍스트 */
  normalizedText: string;
}

/** 배치 정규화 결과 */
export interface BatchCleaningTypeResult {
  /** 성공적으로 매핑된 항목 수 (unknown 제외) */
  successCount: number;
  /** 매핑 실패(unknown) 항목 수 */
  failureCount: number;
  /** 전체 항목 대비 성공률 (0~1) */
  successRate: number;
  /** 카테고리별 매핑 건수 */
  categoryCounts: Record<CleaningMethod, number>;
  /** 개별 결과 목록 */
  results: CleaningTypeNormalizationResult[];
}

// ─────────────────────────────────────────────
// 4. 핵심 정규화 함수
// ─────────────────────────────────────────────

/**
 * 서비스 유형(청소 방식) 텍스트를 표준 카테고리로 정규화
 *
 * 매칭 순서:
 * 1. 정확 매칭 (exactMatches) — confidence: 1.0
 * 2. 패턴 매칭 (patterns) — confidence: 0.8
 * 3. 부수 키워드 제거 후 재시도 — confidence: 0.6
 * 4. 매칭 실패 — confidence: 0, type: "unknown"
 *
 * 우선순위: complete-disassembly > disassembly > general
 * ("완전분해"가 "분해"를 포함하므로 구체적인 것을 먼저 검사)
 *
 * @param text - 크롤링된 원문 서비스 유형 텍스트
 * @returns 정규화 결과 (유형, 신뢰도, 매칭 방식)
 *
 * @example
 * normalizeCleaningType("완전분해세척")
 * // → { type: "complete-disassembly", confidence: 1.0, matchMethod: "exact", ... }
 *
 * @example
 * normalizeCleaningType("LG 벽걸이 분해 청소")
 * // → { type: "disassembly", confidence: 0.8, matchMethod: "pattern", ... }
 *
 * @example
 * normalizeCleaningType("스팀 세척")
 * // → { type: "general", confidence: 1.0, matchMethod: "exact", ... }
 */
export function normalizeCleaningType(
  text: string,
): CleaningTypeNormalizationResult {
  const normalizedText = preprocess(text);

  if (!normalizedText) {
    return {
      type: "unknown",
      confidence: 0,
      matchMethod: "none",
      originalText: text,
      normalizedText,
    };
  }

  // 규칙을 우선순위 순으로 정렬 (complete-disassembly → disassembly → general)
  const sortedRules = [...MAPPING_RULES].sort(
    (a, b) => a.priority - b.priority,
  );

  // 1단계: 정확 매칭 (가장 높은 신뢰도)
  for (const rule of sortedRules) {
    if (rule.exactMatches.some((em) => normalizedText === em)) {
      return {
        type: rule.type,
        confidence: 1.0,
        matchMethod: "exact",
        originalText: text,
        normalizedText,
      };
    }
  }

  // 2단계: 패턴 매칭 (높은 신뢰도)
  // 우선순위 순으로 검사하여 가장 구체적인 매칭을 선택
  for (const rule of sortedRules) {
    if (rule.patterns.some((p) => p.test(normalizedText))) {
      return {
        type: rule.type,
        confidence: 0.8,
        matchMethod: "pattern",
        originalText: text,
        normalizedText,
      };
    }
  }

  // 3단계: 부수 키워드 제거 후 재시도 (중간 신뢰도)
  const stripped = stripIrrelevantTokens(normalizedText);
  if (stripped && stripped !== normalizedText) {
    // 제거 후 정확 매칭
    for (const rule of sortedRules) {
      if (rule.exactMatches.some((em) => stripped === em)) {
        return {
          type: rule.type,
          confidence: 0.7,
          matchMethod: "stripped",
          originalText: text,
          normalizedText,
        };
      }
    }

    // 제거 후 패턴 매칭
    for (const rule of sortedRules) {
      if (rule.patterns.some((p) => p.test(stripped))) {
        return {
          type: rule.type,
          confidence: 0.6,
          matchMethod: "stripped",
          originalText: text,
          normalizedText,
        };
      }
    }
  }

  // 4단계: 매칭 실패
  return {
    type: "unknown",
    confidence: 0,
    matchMethod: "none",
    originalText: text,
    normalizedText,
  };
}

// ─────────────────────────────────────────────
// 5. 간편 함수
// ─────────────────────────────────────────────

/**
 * 서비스 유형 텍스트를 표준 카테고리 코드로 변환 (간편 버전)
 *
 * 매칭 실패 시 "unknown"을 반환한다.
 * 상세 결과가 필요하면 normalizeCleaningType()을 사용하라.
 *
 * @param text - 크롤링된 원문 서비스 유형 텍스트
 * @returns 표준 청소 방식 코드
 *
 * @example
 * matchCleaningTypeFromText("분해세척") // → "disassembly"
 * matchCleaningTypeFromText("완전분해") // → "complete-disassembly"
 * matchCleaningTypeFromText("스팀청소") // → "general"
 * matchCleaningTypeFromText("알 수 없음") // → "unknown"
 */
export function matchCleaningTypeFromText(text: string): CleaningMethod {
  return normalizeCleaningType(text).type;
}

// ─────────────────────────────────────────────
// 6. 배치 정규화
// ─────────────────────────────────────────────

/**
 * 여러 텍스트를 한 번에 정규화 (크롤링 결과 일괄 처리용)
 *
 * @param texts - 정규화할 텍스트 배열
 * @returns 배치 결과 (성공/실패 통계 + 카테고리별 건수 + 개별 결과)
 *
 * @example
 * batchNormalizeCleaningTypes([
 *   "분해세척",
 *   "완전분해 청소",
 *   "스팀 세척",
 *   "알 수 없는 표현",
 * ])
 * // → { successCount: 3, failureCount: 1, successRate: 0.75,
 * //     categoryCounts: { general: 1, disassembly: 1, "complete-disassembly": 1, unknown: 1 },
 * //     results: [...] }
 */
export function batchNormalizeCleaningTypes(
  texts: string[],
): BatchCleaningTypeResult {
  const results = texts.map(normalizeCleaningType);
  const successCount = results.filter((r) => r.type !== "unknown").length;
  const failureCount = results.length - successCount;

  const categoryCounts: Record<CleaningMethod, number> = {
    general: 0,
    disassembly: 0,
    "complete-disassembly": 0,
    unknown: 0,
  };
  for (const r of results) {
    categoryCounts[r.type]++;
  }

  return {
    successCount,
    failureCount,
    successRate: results.length > 0 ? successCount / results.length : 0,
    categoryCounts,
    results,
  };
}

// ─────────────────────────────────────────────
// 7. 유틸리티
// ─────────────────────────────────────────────

/**
 * 특정 표준 청소 방식에 매핑되는 모든 키워드 목록 반환 (디버깅/관리 도구용)
 */
export function getCleaningKeywordsForType(type: CleaningMethod): string[] {
  const rule = MAPPING_RULES.find((r) => r.type === type);
  return rule ? [...rule.exactMatches] : [];
}

/**
 * 모든 매핑 규칙의 키워드 수를 유형별로 반환 (커버리지 확인용)
 */
export function getCleaningMappingCoverage(): Record<CleaningMethod, number> {
  const coverage: Partial<Record<CleaningMethod, number>> = {};
  for (const rule of MAPPING_RULES) {
    coverage[rule.type] = rule.exactMatches.length + rule.patterns.length;
  }
  coverage["unknown"] = 0;
  return coverage as Record<CleaningMethod, number>;
}

/**
 * 매핑 규칙에 커스텀 키워드를 동적으로 추가
 * (운영 중 새로운 표현이 발견되었을 때 사용)
 *
 * @param type - 대상 표준 청소 방식
 * @param keywords - 추가할 키워드 목록 (소문자로 자동 변환)
 */
export function addCleaningCustomKeywords(
  type: CleaningMethod,
  keywords: string[],
): void {
  const rule = MAPPING_RULES.find((r) => r.type === type);
  if (!rule) return;
  for (const kw of keywords) {
    const lower = kw.trim().toLowerCase();
    if (lower && !rule.exactMatches.includes(lower)) {
      rule.exactMatches.push(lower);
    }
  }
}
