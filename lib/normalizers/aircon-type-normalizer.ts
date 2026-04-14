/**
 * 에어컨 유형 표준 카테고리 정규화 모듈
 *
 * 크롤링 데이터(숨고, 당근, 블로그, 업체 사이트)에서 수집된 다양한 에어컨 유형
 * 표현을 5가지 표준 카테고리로 매핑한다.
 *
 * 표준 카테고리:
 *   1. wall-mount  (벽걸이)
 *   2. standing    (스탠드/타워)
 *   3. ceiling     (천장형/카세트)
 *   4. system      (시스템/멀티)
 *   5. window      (창문형/일체형)
 *
 * @module aircon-type-normalizer
 */

import type { AirconType } from "@/lib/types/price-data";

// ─────────────────────────────────────────────
// 1. 매핑 규칙 정의
// ─────────────────────────────────────────────

/**
 * 에어컨 유형별 매핑 규칙
 *
 * 각 표준 유형에 대해:
 * - exactMatches: 정확히 일치하면 즉시 매핑 (정규화된 소문자 기준)
 * - patterns: 정규표현식 패턴으로 매칭 (부분 일치 허용)
 * - priority: 여러 패턴이 동시 매칭될 때 우선순위 (낮을수록 우선)
 *
 * 크롤링 소스별 다양한 표현을 고려한다:
 * - 숨고: "벽걸이 에어컨 청소", "스탠드형 에어컨"
 * - 당근: "벽걸이에어컨", "거실 스탠드"
 * - 블로그: "삼성 벽걸이", "LG 휘센 스탠드", "천정형"
 * - 업체 사이트: "wall-mounted", "cassette type"
 */
interface AirconTypeMappingRule {
  /** 표준 유형 코드 */
  type: AirconType;
  /** 정확히 일치하는 문자열 목록 (소문자 정규화 후 비교) */
  exactMatches: string[];
  /** 부분 일치 정규표현식 패턴 목록 */
  patterns: RegExp[];
  /** 우선순위 (낮을수록 우선, 여러 패턴 동시 매칭 시 사용) */
  priority: number;
}

const MAPPING_RULES: AirconTypeMappingRule[] = [
  {
    type: "wall-mount",
    priority: 1,
    exactMatches: [
      // 한국어 정확 매칭
      "벽걸이",
      "벽걸이형",
      "벽걸이에어컨",
      "벽걸이 에어컨",
      "벽걸이형 에어컨",
      "벽걸이 에어컨 청소",
      "벽걸이형에어컨",
      // 오타 변형
      "벽결이",
      "벽결이형",
      "벽결이에어컨",
      "벽결이 에어컨",
      "벽겔이",
      "벽겔이형",
      // 영어
      "wall-mounted",
      "wall-mount",
      "wall mount",
      "wall mounted",
      "wallmount",
      "wallmounted",
      "wall type",
    ],
    patterns: [
      /벽걸이/,
      /벽결이/,    // 오타
      /벽겔이/,    // 오타
      /wall[\s-]?mount/i,
      /wall[\s-]?type/i,
    ],
  },
  {
    type: "standing",
    priority: 2,
    exactMatches: [
      // 한국어 정확 매칭
      "스탠드",
      "스탠드형",
      "스탠드에어컨",
      "스탠드 에어컨",
      "스탠드형 에어컨",
      "스탠드형에어컨",
      "스탠드 에어컨 청소",
      // 오타 변형
      "스텐드",
      "스텐드형",
      "스텐드에어컨",
      "스텐드 에어컨",
      // 타워형 동의어
      "타워형",
      "타워",
      "타워형 에어컨",
      "타워에어컨",
      "타워형에어컨",
      // 거실형 (스탠드를 의미하는 경우)
      "거실형",
      "거실 에어컨",
      "거실형 에어컨",
      // 영어
      "standing",
      "stand",
      "stand type",
      "tower",
      "tower type",
      "floor standing",
    ],
    patterns: [
      /스탠드/,
      /스텐드/,    // 오타
      /타워\s*형?/,
      /tower/i,
      /stand(?:ing)?[\s-]?(?:type)?/i,
      /floor[\s-]?stand/i,
    ],
  },
  {
    type: "ceiling",
    priority: 3,
    exactMatches: [
      // 한국어 정확 매칭
      "천장형",
      "천장",
      "천장형 에어컨",
      "천장형에어컨",
      "천장 에어컨",
      "천장에어컨",
      "천장형 에어컨 청소",
      // 천정 (비표준이지만 흔한 표현)
      "천정형",
      "천정",
      "천정형 에어컨",
      "천정형에어컨",
      "천정 에어컨",
      // 카세트형 동의어
      "카세트",
      "카세트형",
      "카세트 에어컨",
      "카세트형 에어컨",
      "카세트형에어컨",
      // 매립형
      "매립형",
      "매립형 에어컨",
      "매립",
      "천장 매립",
      "천장매립",
      "천정매립",
      // 4way/2way
      "4way",
      "2way",
      "포웨이",
      "투웨이",
      // 영어
      "ceiling",
      "ceiling type",
      "cassette",
      "cassette type",
    ],
    patterns: [
      /천장\s*형?/,
      /천정\s*형?/,   // 비표준 표기
      /카세트\s*형?/,
      /매립\s*형?/,
      /[24]\s*way/i,
      /[투포]\s*웨이/,
      /cassette/i,
      /ceiling/i,
    ],
  },
  {
    type: "system",
    priority: 4,
    exactMatches: [
      // 한국어 정확 매칭
      "시스템",
      "시스템형",
      "시스템 에어컨",
      "시스템에어컨",
      "시스템형 에어컨",
      "시스템형에어컨",
      "시스템 에어컨 청소",
      // 멀티 동의어
      "멀티",
      "멀티형",
      "멀티 에어컨",
      "멀티에어컨",
      "멀티형 에어컨",
      "멀티형에어컨",
      "멀티스플릿",
      "멀티 스플릿",
      // 빌트인 동의어
      "빌트인",
      "빌트인형",
      "빌트인 에어컨",
      "빌트인에어컨",
      "빌트인형 에어컨",
      // 영어
      "system",
      "system type",
      "multi",
      "multi-split",
      "multi split",
      "multisplit",
      "built-in",
      "builtin",
      "built in",
    ],
    patterns: [
      /시스템\s*형?/,
      /멀티\s*(?:형|스플릿)?/,
      /빌트\s*인\s*형?/,
      /system/i,
      /multi[\s-]?(?:split)?/i,
      /built[\s-]?in/i,
    ],
  },
  {
    type: "window",
    priority: 5,
    exactMatches: [
      // 한국어 정확 매칭
      "창문형",
      "창문",
      "창문형 에어컨",
      "창문에어컨",
      "창문형에어컨",
      "창문 에어컨",
      "창문 에어컨 청소",
      "창문형 에어컨 청소",
      // 일체형 동의어
      "일체형",
      "일체형 에어컨",
      "일체형에어컨",
      // 이동식/포터블 (창문형과 유사)
      "이동식",
      "이동식 에어컨",
      "이동식에어컨",
      "포터블",
      "포터블 에어컨",
      "포터블에어컨",
      // 영어
      "window",
      "window type",
      "window unit",
      "portable",
    ],
    patterns: [
      /창문\s*형?/,
      /일체\s*형/,
      /이동\s*식/,
      /포터블/,
      /window/i,
      /portable/i,
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
    .replace(/[()[\]{}\/\\|]+/g, " ")  // 괄호, 슬래시 → 공백
    .replace(/\s+/g, " ")               // 연속 공백 → 단일 공백
    .toLowerCase();
}

/**
 * 에어컨 관련 불필요 접미어 제거
 * "에어컨", "청소", "세척", "분해" 등의 공통 키워드를 제거하여 유형만 추출
 */
function stripCommonSuffixes(text: string): string {
  return text
    .replace(/\s*에어컨\s*/g, " ")
    .replace(/\s*청소\s*/g, " ")
    .replace(/\s*세척\s*/g, " ")
    .replace(/\s*분해\s*/g, " ")
    .replace(/\s*클리닝\s*/g, " ")
    .replace(/\s*서비스\s*/g, " ")
    .trim();
}

// ─────────────────────────────────────────────
// 3. 정규화 결과 타입
// ─────────────────────────────────────────────

/** 정규화 결과 */
export interface NormalizationResult {
  /** 매핑된 표준 에어컨 유형 (매칭 실패 시 null) */
  type: AirconType | null;
  /** 매칭 신뢰도 (0~1) */
  confidence: number;
  /** 매칭 방식 */
  matchMethod: "exact" | "pattern" | "none";
  /** 원본 입력 텍스트 */
  originalText: string;
  /** 전처리된 텍스트 */
  normalizedText: string;
}

/** 배치 정규화 결과 */
export interface BatchNormalizationResult {
  /** 성공적으로 매핑된 항목 수 */
  successCount: number;
  /** 매핑 실패 항목 수 */
  failureCount: number;
  /** 전체 항목 대비 성공률 (0~1) */
  successRate: number;
  /** 개별 결과 목록 */
  results: NormalizationResult[];
}

// ─────────────────────────────────────────────
// 4. 핵심 정규화 함수
// ─────────────────────────────────────────────

/**
 * 에어컨 유형 텍스트를 표준 카테고리로 정규화
 *
 * 매칭 순서:
 * 1. 정확 매칭 (exactMatches) — confidence: 1.0
 * 2. 패턴 매칭 (patterns) — confidence: 0.8
 * 3. 접미어 제거 후 재시도 — confidence: 0.6
 * 4. 매칭 실패 — confidence: 0, type: null
 *
 * @param text - 크롤링된 원문 에어컨 유형 텍스트
 * @returns 정규화 결과 (유형, 신뢰도, 매칭 방식)
 *
 * @example
 * normalizeAirconType("벽걸이 에어컨")
 * // → { type: "wall-mount", confidence: 1.0, matchMethod: "exact", ... }
 *
 * normalizeAirconType("LG 휘센 벽걸이형 분해청소")
 * // → { type: "wall-mount", confidence: 0.8, matchMethod: "pattern", ... }
 *
 * normalizeAirconType("가습기 청소")
 * // → { type: null, confidence: 0, matchMethod: "none", ... }
 */
export function normalizeAirconType(text: string): NormalizationResult {
  const normalizedText = preprocess(text);

  if (!normalizedText) {
    return {
      type: null,
      confidence: 0,
      matchMethod: "none",
      originalText: text,
      normalizedText,
    };
  }

  // 1단계: 정확 매칭 (가장 높은 신뢰도)
  for (const rule of MAPPING_RULES) {
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
  const patternMatches: { type: AirconType; priority: number }[] = [];
  for (const rule of MAPPING_RULES) {
    if (rule.patterns.some((p) => p.test(normalizedText))) {
      patternMatches.push({ type: rule.type, priority: rule.priority });
    }
  }

  if (patternMatches.length > 0) {
    // 우선순위가 낮은(숫자가 작은) 매칭 선택
    patternMatches.sort((a, b) => a.priority - b.priority);
    return {
      type: patternMatches[0].type,
      confidence: patternMatches.length === 1 ? 0.8 : 0.7,
      matchMethod: "pattern",
      originalText: text,
      normalizedText,
    };
  }

  // 3단계: 접미어 제거 후 재시도 (중간 신뢰도)
  const stripped = stripCommonSuffixes(normalizedText);
  if (stripped && stripped !== normalizedText) {
    // 접미어 제거 후 정확 매칭
    for (const rule of MAPPING_RULES) {
      if (rule.exactMatches.some((em) => stripped === em)) {
        return {
          type: rule.type,
          confidence: 0.7,
          matchMethod: "exact",
          originalText: text,
          normalizedText,
        };
      }
    }

    // 접미어 제거 후 패턴 매칭
    const strippedMatches: { type: AirconType; priority: number }[] = [];
    for (const rule of MAPPING_RULES) {
      if (rule.patterns.some((p) => p.test(stripped))) {
        strippedMatches.push({ type: rule.type, priority: rule.priority });
      }
    }

    if (strippedMatches.length > 0) {
      strippedMatches.sort((a, b) => a.priority - b.priority);
      return {
        type: strippedMatches[0].type,
        confidence: 0.6,
        matchMethod: "pattern",
        originalText: text,
        normalizedText,
      };
    }
  }

  // 4단계: 매칭 실패
  return {
    type: null,
    confidence: 0,
    matchMethod: "none",
    originalText: text,
    normalizedText,
  };
}

// ─────────────────────────────────────────────
// 5. 간편 함수 (기존 API 호환)
// ─────────────────────────────────────────────

/**
 * 에어컨 유형 텍스트를 표준 카테고리 코드로 변환 (간편 버전)
 *
 * 매칭 실패 시 null을 반환한다.
 * 상세 결과가 필요하면 normalizeAirconType()을 사용하라.
 *
 * @param text - 크롤링된 원문 에어컨 유형 텍스트
 * @returns 표준 유형 코드 또는 null
 *
 * @example
 * matchAirconTypeFromText("벽걸이") // → "wall-mount"
 * matchAirconTypeFromText("스텐드형 에어컨") // → "standing"
 * matchAirconTypeFromText("알 수 없음") // → null
 */
export function matchAirconTypeFromText(text: string): AirconType | null {
  return normalizeAirconType(text).type;
}

// ─────────────────────────────────────────────
// 6. 배치 정규화
// ─────────────────────────────────────────────

/**
 * 여러 텍스트를 한 번에 정규화 (크롤링 결과 일괄 처리용)
 *
 * @param texts - 정규화할 텍스트 배열
 * @returns 배치 결과 (성공/실패 통계 + 개별 결과)
 *
 * @example
 * batchNormalizeAirconTypes([
 *   "벽걸이 에어컨",
 *   "스탠드형",
 *   "알 수 없는 유형",
 * ])
 * // → { successCount: 2, failureCount: 1, successRate: 0.667, results: [...] }
 */
export function batchNormalizeAirconTypes(
  texts: string[],
): BatchNormalizationResult {
  const results = texts.map(normalizeAirconType);
  const successCount = results.filter((r) => r.type !== null).length;
  const failureCount = results.length - successCount;

  return {
    successCount,
    failureCount,
    successRate: results.length > 0 ? successCount / results.length : 0,
    results,
  };
}

// ─────────────────────────────────────────────
// 7. 유틸리티
// ─────────────────────────────────────────────

/**
 * 특정 표준 유형에 매핑되는 모든 키워드 목록 반환 (디버깅/관리 도구용)
 */
export function getKeywordsForType(type: AirconType): string[] {
  const rule = MAPPING_RULES.find((r) => r.type === type);
  return rule ? [...rule.exactMatches] : [];
}

/**
 * 모든 매핑 규칙의 정확 매칭 키워드 수를 유형별로 반환 (커버리지 확인용)
 */
export function getMappingCoverage(): Record<AirconType, number> {
  const coverage: Partial<Record<AirconType, number>> = {};
  for (const rule of MAPPING_RULES) {
    coverage[rule.type] = rule.exactMatches.length + rule.patterns.length;
  }
  return coverage as Record<AirconType, number>;
}

/**
 * 매핑 규칙에 커스텀 키워드를 동적으로 추가
 * (운영 중 새로운 표현이 발견되었을 때 사용)
 *
 * @param type - 대상 표준 유형
 * @param keywords - 추가할 키워드 목록 (소문자로 자동 변환)
 */
export function addCustomKeywords(
  type: AirconType,
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
