/**
 * 가격 데이터 정규화 모듈
 *
 * 크롤링 데이터(숨고, 당근, 블로그, 업체 사이트)에서 수집된 다양한 가격 표현을
 * 원(KRW) 단위의 표준 숫자 값으로 정규화한다.
 *
 * 처리 범위:
 *   1. 단위 통일: 만원→원, 천원→원, 만→원
 *   2. 범위 문자열 파싱: "15~20만원" → { min: 150000, max: 200000 }
 *   3. 부가세(VAT) 포함/별도 처리
 *   4. 콤마 구분자, 공백, 특수문자 정리
 *
 * @module price-normalizer
 */

// ─────────────────────────────────────────────
// 1. 결과 타입 정의
// ─────────────────────────────────────────────

/** 가격 정규화 결과 */
export interface PriceNormalizationResult {
  /** 최소 가격 (원 단위). 파싱 실패 시 null */
  min: number | null;
  /** 최대 가격 (원 단위). 단일 가격이면 null */
  max: number | null;
  /** 부가세 처리 상태 */
  vatStatus: VatStatus;
  /** 부가세 포함 가격 (원 단위). 파싱 실패 시 null */
  minWithVat: number | null;
  /** 부가세 포함 최대 가격 (원 단위). 단일 가격이면 null */
  maxWithVat: number | null;
  /** 매칭 신뢰도 (0~1) */
  confidence: number;
  /** 원본 입력 텍스트 */
  originalText: string;
  /** 파싱 실패 사유 (성공 시 null) */
  error: string | null;
}

/** 부가세 처리 상태 */
export type VatStatus =
  | "included"     // 부가세 포함 (VAT 포함)
  | "excluded"     // 부가세 별도 (VAT 별도)
  | "unknown";     // 미확인 (별도 표기 없음)

/** 배치 정규화 결과 */
export interface BatchPriceNormalizationResult {
  /** 성공 건수 */
  successCount: number;
  /** 실패 건수 */
  failureCount: number;
  /** 성공률 (0~1) */
  successRate: number;
  /** 개별 결과 목록 */
  results: PriceNormalizationResult[];
}

// ─────────────────────────────────────────────
// 2. 상수
// ─────────────────────────────────────────────

/** 부가세율 (10%) */
const VAT_RATE = 0.1;

/** 에어컨 청소 가격 유효 범위 (원) — 이상치 감지용 */
const PRICE_BOUNDS = {
  /** 최소 유효 가격 (5,000원) */
  min: 5_000,
  /** 최대 유효 가격 (1,000,000원 = 100만원) */
  max: 1_000_000,
} as const;

// ─────────────────────────────────────────────
// 3. 전처리 유틸리티
// ─────────────────────────────────────────────

/**
 * 가격 텍스트 전처리
 * - 앞뒤 공백 제거
 * - 전각 문자 → 반각
 * - 콤마 제거 (천 단위 구분자)
 * - 연속 공백 → 단일 공백
 */
function preprocess(text: string): string {
  return text
    .trim()
    .replace(/，/g, ",")       // 전각 콤마 → 반각
    .replace(/～/g, "~")       // 전각 물결 → 반각
    .replace(/－/g, "-")       // 전각 하이픈 → 반각
    .replace(/０/g, "0").replace(/１/g, "1").replace(/２/g, "2")
    .replace(/３/g, "3").replace(/４/g, "4").replace(/５/g, "5")
    .replace(/６/g, "6").replace(/７/g, "7").replace(/８/g, "8")
    .replace(/９/g, "9")       // 전각 숫자 → 반각
    .replace(/,/g, "")         // 콤마 제거 (천 단위 구분자)
    .replace(/\s+/g, " ");     // 연속 공백 → 단일 공백
}

// ─────────────────────────────────────────────
// 4. 한국어 숫자 단위 변환
// ─────────────────────────────────────────────

/**
 * 한국어 숫자 표현을 원(KRW) 단위 정수로 변환
 *
 * 지원 패턴:
 *   - "5만"     → 50,000
 *   - "5만원"   → 50,000
 *   - "5만5천"  → 55,000
 *   - "5만5천원" → 55,000
 *   - "15만"    → 150,000
 *   - "50000"   → 50,000
 *   - "50000원" → 50,000
 *   - "5.5만원" → 55,000
 *   - "5.5만"   → 55,000
 *   - "3천원"   → 3,000
 *   - "1만5천원" → 15,000
 *
 * @param text - 숫자 표현 문자열 (전처리 완료 상태)
 * @returns 원 단위 정수, 변환 불가 시 null
 */
export function parseKoreanPrice(text: string): number | null {
  const cleaned = text.replace(/\s/g, "").replace(/원$/, "");

  if (!cleaned) return null;

  // 패턴 1: "N만N천" (예: "5만5천", "1만5천", "15만3천")
  const manCheonMatch = cleaned.match(
    /^(\d+(?:\.\d+)?)만(\d+(?:\.\d+)?)천?$/
  );
  if (manCheonMatch) {
    const manPart = parseFloat(manCheonMatch[1]) * 10_000;
    const cheonPart = parseFloat(manCheonMatch[2]) * 1_000;
    return Math.round(manPart + cheonPart);
  }

  // 패턴 2: "N만" (예: "5만", "15만", "5.5만")
  const manMatch = cleaned.match(/^(\d+(?:\.\d+)?)만$/);
  if (manMatch) {
    return Math.round(parseFloat(manMatch[1]) * 10_000);
  }

  // 패턴 3: "N천" (예: "3천", "35천")
  const cheonMatch = cleaned.match(/^(\d+(?:\.\d+)?)천$/);
  if (cheonMatch) {
    return Math.round(parseFloat(cheonMatch[1]) * 1_000);
  }

  // 패턴 4: 순수 숫자 (예: "50000", "45000")
  const numMatch = cleaned.match(/^(\d+)$/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }

  // 패턴 5: 소수점 숫자 (예: "5.5")
  const floatMatch = cleaned.match(/^(\d+\.\d+)$/);
  if (floatMatch) {
    // 소수점이 있는 순수 숫자는 만원 단위로 해석할 수 없으므로 그대로 반환
    return Math.round(parseFloat(floatMatch[1]));
  }

  return null;
}

// ─────────────────────────────────────────────
// 5. 부가세(VAT) 감지
// ─────────────────────────────────────────────

/**
 * 텍스트에서 부가세 포함/별도 여부를 감지
 *
 * @param text - 원문 가격 텍스트 (전처리 전)
 * @returns 부가세 상태
 */
export function detectVatStatus(text: string): VatStatus {
  const lower = text.toLowerCase();

  // 부가세 포함 패턴
  const includedPatterns = [
    /부가세\s*포함/,
    /vat\s*포함/i,
    /vat\s*incl/i,
    /부가세\s*included/i,
    /세금\s*포함/,
    /tax\s*incl/i,
    /vat\s*in/i,
    /부가\s*포함/,
  ];

  // 부가세 별도 패턴
  const excludedPatterns = [
    /부가세\s*별도/,
    /부가세\s*제외/,
    /부가세\s*불포함/,
    /부가세\s*미포함/,
    /vat\s*별도/i,
    /vat\s*excl/i,
    /vat\s*제외/i,
    /세금\s*별도/,
    /세금\s*제외/,
    /tax\s*excl/i,
    /\+\s*vat/i,
    /부가\s*별도/,
    /부가\s*제외/,
  ];

  for (const pattern of excludedPatterns) {
    if (pattern.test(lower)) return "excluded";
  }

  for (const pattern of includedPatterns) {
    if (pattern.test(lower)) return "included";
  }

  return "unknown";
}

/**
 * 부가세 적용 계산
 *
 * @param price - 원 단위 가격
 * @param vatStatus - 부가세 상태
 * @returns 부가세 포함 가격 (원 단위, 반올림)
 */
export function applyVat(price: number, vatStatus: VatStatus): number {
  switch (vatStatus) {
    case "excluded":
      // 부가세 별도 → 10% 추가
      return Math.round(price * (1 + VAT_RATE));
    case "included":
    case "unknown":
      // 부가세 포함 또는 미확인 → 그대로 (가정 소비자 대상이므로 VAT 포함 가격으로 간주)
      return price;
  }
}

// ─────────────────────────────────────────────
// 6. 가격 유효성 검증
// ─────────────────────────────────────────────

/**
 * 파싱된 가격이 에어컨 청소 가격으로 유효한 범위인지 검증
 *
 * @param price - 원 단위 가격
 * @returns 유효 여부
 */
export function isPriceInValidRange(price: number): boolean {
  return price >= PRICE_BOUNDS.min && price <= PRICE_BOUNDS.max;
}

// ─────────────────────────────────────────────
// 7. 핵심 정규화 함수
// ─────────────────────────────────────────────

/**
 * 가격 텍스트를 표준 원(KRW) 단위로 정규화
 *
 * 매칭 순서:
 * 1. 전처리 (전각→반각, 콤마 제거, 공백 정리)
 * 2. 범위 가격 파싱 ("N~M만원", "N만~M만", "N원~M원")
 * 3. 단일 가격 파싱 ("N만원", "N천원", "N원", "N")
 * 4. 부가세 처리
 * 5. 유효 범위 검증
 *
 * @param priceText - 크롤링된 원문 가격 텍스트
 * @returns 정규화 결과
 *
 * @example
 * normalizePrice("5만원")
 * // → { min: 50000, max: null, vatStatus: "unknown", ... }
 *
 * normalizePrice("15~20만원")
 * // → { min: 150000, max: 200000, vatStatus: "unknown", ... }
 *
 * normalizePrice("50,000원 (부가세 별도)")
 * // → { min: 50000, max: null, vatStatus: "excluded", minWithVat: 55000, ... }
 */
export function normalizePrice(priceText: string): PriceNormalizationResult {
  const originalText = priceText;

  if (!priceText || !priceText.trim()) {
    return makeError(originalText, "빈 문자열");
  }

  // 부가세 상태 감지 (전처리 전에 원본 텍스트로 확인)
  const vatStatus = detectVatStatus(priceText);

  // 전처리
  const cleaned = preprocess(priceText);

  // 범위 가격 파싱 시도
  const rangeResult = parseRangePrice(cleaned);
  if (rangeResult) {
    const { min, max } = rangeResult;

    // 유효 범위 검증
    if (!isPriceInValidRange(min)) {
      return makeError(originalText, `최소 가격이 유효 범위 밖: ${min}원`);
    }
    if (!isPriceInValidRange(max)) {
      return makeError(originalText, `최대 가격이 유효 범위 밖: ${max}원`);
    }
    if (min > max) {
      return makeError(originalText, `최소 가격(${min})이 최대 가격(${max})보다 큼`);
    }

    return {
      min,
      max,
      vatStatus,
      minWithVat: applyVat(min, vatStatus),
      maxWithVat: applyVat(max, vatStatus),
      confidence: 0.9,
      originalText,
      error: null,
    };
  }

  // 단일 가격 파싱 시도
  const singleResult = parseSinglePrice(cleaned);
  if (singleResult !== null) {
    if (!isPriceInValidRange(singleResult)) {
      return makeError(originalText, `가격이 유효 범위 밖: ${singleResult}원`);
    }

    return {
      min: singleResult,
      max: null,
      vatStatus,
      minWithVat: applyVat(singleResult, vatStatus),
      maxWithVat: null,
      confidence: 1.0,
      originalText,
      error: null,
    };
  }

  return makeError(originalText, "가격 패턴을 인식할 수 없음");
}

// ─────────────────────────────────────────────
// 8. 범위 가격 파싱
// ─────────────────────────────────────────────

/**
 * 범위 가격 문자열 파싱
 *
 * 지원 패턴:
 *   - "15~20만원"     → { min: 150000, max: 200000 }
 *   - "15만~20만원"   → { min: 150000, max: 200000 }
 *   - "15만~20만"     → { min: 150000, max: 200000 }
 *   - "5~7만원"       → { min: 50000, max: 70000 }
 *   - "5만원~7만원"   → { min: 50000, max: 70000 }
 *   - "45000~60000원" → { min: 45000, max: 60000 }
 *   - "45000~60000"   → { min: 45000, max: 60000 }
 *   - "4.5~6만원"     → { min: 45000, max: 60000 }
 *   - "4만5천~6만원"  → { min: 45000, max: 60000 }
 *   - "3-5만원"       → { min: 30000, max: 50000 }
 *
 * @param text - 전처리된 가격 텍스트
 * @returns { min, max } 또는 null
 */
function parseRangePrice(
  text: string
): { min: number; max: number } | null {
  // 가격 관련 텍스트만 추출 (부가세 표기 등 제거)
  const priceArea = text
    .replace(/\(.*?\)/g, "")   // 괄호 내용 제거
    .replace(/부가세.*$/g, "")  // "부가세~" 이후 제거
    .replace(/vat.*$/gi, "")   // "VAT~" 이후 제거
    .replace(/세금.*$/g, "")   // "세금~" 이후 제거
    .trim();

  // 범위 구분자 (~, -, ~)를 찾아 양쪽을 분리
  // "~" 또는 "-"를 기준으로 분리하되, 숫자 사이에 있는 것만
  const rangeSeparatorMatch = priceArea.match(
    /^(.+?)\s*[~\-]\s*(.+?)(?:원)?$/
  );

  if (!rangeSeparatorMatch) return null;

  const leftRaw = rangeSeparatorMatch[1].trim();
  const rightRaw = rangeSeparatorMatch[2].trim().replace(/원$/, "");

  // 오른쪽에 단위(만, 천)가 있는지 확인하여 왼쪽에 단위가 없으면 같은 단위 적용
  const rightUnit = detectUnit(rightRaw);
  const leftUnit = detectUnit(leftRaw);

  let minVal: number | null;
  let maxVal: number | null;

  // 양쪽 모두 단위가 있는 경우 (예: "5만~7만", "5만원~7만원")
  if (leftUnit !== "none" && rightUnit !== "none") {
    minVal = parseKoreanPrice(leftRaw);
    maxVal = parseKoreanPrice(rightRaw);
  }
  // 오른쪽에만 단위가 있는 경우 (예: "15~20만원", "5~7만원", "4.5~6만")
  else if (leftUnit === "none" && rightUnit !== "none") {
    // 왼쪽 숫자에 오른쪽과 같은 단위 적용
    const leftNum = leftRaw.replace(/원$/, "");
    minVal = parseKoreanPrice(leftNum + rightUnit);
    maxVal = parseKoreanPrice(rightRaw);
  }
  // 양쪽 모두 단위 없는 경우 (예: "45000~60000")
  else {
    minVal = parseKoreanPrice(leftRaw);
    maxVal = parseKoreanPrice(rightRaw);
  }

  if (minVal === null || maxVal === null) return null;
  if (minVal <= 0 || maxVal <= 0) return null;

  return { min: minVal, max: maxVal };
}

/**
 * 텍스트에서 한국어 숫자 단위를 감지
 *
 * @returns "만", "천", "none"
 */
function detectUnit(text: string): string {
  const cleaned = text.replace(/원$/, "").trim();
  if (/만/.test(cleaned)) return "만";
  if (/천/.test(cleaned)) return "천";
  return "none";
}

// ─────────────────────────────────────────────
// 9. 단일 가격 파싱
// ─────────────────────────────────────────────

/**
 * 단일 가격 문자열 파싱
 *
 * 지원 패턴:
 *   - "5만원"     → 50,000
 *   - "5만"       → 50,000
 *   - "50000원"   → 50,000
 *   - "50000"     → 50,000
 *   - "5.5만원"   → 55,000
 *   - "5만5천원"  → 55,000
 *   - "3천원"     → 3,000 (유효 범위 검증은 호출 측에서)
 *
 * @param text - 전처리된 가격 텍스트
 * @returns 원 단위 가격 또는 null
 */
function parseSinglePrice(text: string): number | null {
  // 가격 관련 텍스트만 추출
  const priceArea = text
    .replace(/\(.*?\)/g, "")
    .replace(/부가세.*$/g, "")
    .replace(/vat.*$/gi, "")
    .replace(/세금.*$/g, "")
    .replace(/1대\s*기준/g, "")
    .replace(/대당/g, "")
    .replace(/부터/g, "")
    .replace(/약/g, "")
    .replace(/~$/g, "")       // 끝에 물결 제거 ("5만원~" → "5만원")
    .trim();

  if (!priceArea) return null;

  return parseKoreanPrice(priceArea);
}

// ─────────────────────────────────────────────
// 10. 에러 결과 헬퍼
// ─────────────────────────────────────────────

function makeError(
  originalText: string,
  error: string
): PriceNormalizationResult {
  return {
    min: null,
    max: null,
    vatStatus: "unknown",
    minWithVat: null,
    maxWithVat: null,
    confidence: 0,
    originalText,
    error,
  };
}

// ─────────────────────────────────────────────
// 11. 배치 정규화
// ─────────────────────────────────────────────

/**
 * 여러 가격 텍스트를 한 번에 정규화
 *
 * @param texts - 가격 텍스트 배열
 * @returns 배치 결과 (통계 + 개별 결과)
 *
 * @example
 * batchNormalizePrices(["5만원", "15~20만원", "???"])
 * // → { successCount: 2, failureCount: 1, successRate: 0.667, results: [...] }
 */
export function batchNormalizePrices(
  texts: string[]
): BatchPriceNormalizationResult {
  const results = texts.map(normalizePrice);
  const successCount = results.filter((r) => r.min !== null).length;
  const failureCount = results.length - successCount;

  return {
    successCount,
    failureCount,
    successRate: results.length > 0 ? successCount / results.length : 0,
    results,
  };
}

// ─────────────────────────────────────────────
// 12. 간편 함수 (기존 API 호환)
// ─────────────────────────────────────────────

/**
 * 가격 텍스트를 { price, priceMax } 형태로 변환 (PriceEntry 호환)
 *
 * 기존 price-utils.ts의 parsePrice()를 대체하는 향상 버전.
 * 부가세 별도 가격은 자동으로 VAT 포함 가격으로 변환한다.
 *
 * @param priceText - 원문 가격 텍스트
 * @returns { price, priceMax } 또는 null (파싱 실패)
 *
 * @example
 * parsePriceForEntry("5~7만원")
 * // → { price: 50000, priceMax: 70000 }
 *
 * parsePriceForEntry("50,000원 (부가세 별도)")
 * // → { price: 55000, priceMax: null }
 */
export function parsePriceForEntry(
  priceText: string
): { price: number; priceMax: number | null } | null {
  const result = normalizePrice(priceText);

  if (result.min === null) return null;

  // 부가세 포함 가격 사용 (가정 소비자 기준)
  return {
    price: result.minWithVat!,
    priceMax: result.maxWithVat ?? null,
  };
}
