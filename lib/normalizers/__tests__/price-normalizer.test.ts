/**
 * 가격 정규화 모듈 테스트
 *
 * 크롤링 데이터의 다양한 가격 표현이 올바른 원(KRW) 단위로 변환되는지 검증한다.
 */

import {
  normalizePrice,
  parseKoreanPrice,
  detectVatStatus,
  applyVat,
  isPriceInValidRange,
  batchNormalizePrices,
  parsePriceForEntry,
} from "../price-normalizer";

// ─────────────────────────────────────────────
// 1. parseKoreanPrice — 한국어 숫자 단위 변환
// ─────────────────────────────────────────────

describe("parseKoreanPrice — 한국어 숫자 단위 변환", () => {
  test.each([
    ["5만", 50_000],
    ["5만원", 50_000],
    ["15만", 150_000],
    ["15만원", 150_000],
    ["5.5만", 55_000],
    ["5.5만원", 55_000],
    ["3.5만", 35_000],
    ["10만", 100_000],
  ])('"%s" → %d원', (input, expected) => {
    expect(parseKoreanPrice(input)).toBe(expected);
  });

  test.each([
    ["5만5천", 55_000],
    ["5만5천원", 55_000],
    ["1만5천", 15_000],
    ["1만5천원", 15_000],
    ["15만3천", 153_000],
  ])('만+천 복합: "%s" → %d원', (input, expected) => {
    expect(parseKoreanPrice(input)).toBe(expected);
  });

  test.each([
    ["3천", 3_000],
    ["3천원", 3_000],
    ["35천", 35_000],
  ])('천 단위: "%s" → %d원', (input, expected) => {
    expect(parseKoreanPrice(input)).toBe(expected);
  });

  test.each([
    ["50000", 50_000],
    ["50000원", 50_000],
    ["45000", 45_000],
    ["100000", 100_000],
    ["100000원", 100_000],
  ])('순수 숫자: "%s" → %d원', (input, expected) => {
    expect(parseKoreanPrice(input)).toBe(expected);
  });

  test.each([
    ["", null],
    ["abc", null],
    ["만원", null],
  ])('파싱 불가: "%s" → null', (input, expected) => {
    expect(parseKoreanPrice(input)).toBe(expected);
  });
});

// ─────────────────────────────────────────────
// 2. normalizePrice — 단일 가격 파싱
// ─────────────────────────────────────────────

describe("normalizePrice — 단일 가격", () => {
  test.each([
    ["5만원", 50_000],
    ["5만", 50_000],
    ["50000원", 50_000],
    ["50,000원", 50_000],
    ["50,000", 50_000],
    ["5.5만원", 55_000],
    ["5만5천원", 55_000],
    ["7만원", 70_000],
    ["10만원", 100_000],
    ["12만원", 120_000],
  ])('"%s" → min: %d, max: null', (input, expectedMin) => {
    const result = normalizePrice(input);
    expect(result.min).toBe(expectedMin);
    expect(result.max).toBeNull();
    expect(result.error).toBeNull();
    expect(result.confidence).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 3. normalizePrice — 범위 가격 파싱
// ─────────────────────────────────────────────

describe("normalizePrice — 범위 가격", () => {
  test.each([
    // "N~M만원" (양쪽 숫자에 오른쪽 단위 적용)
    ["5~7만원", 50_000, 70_000],
    ["15~20만원", 150_000, 200_000],
    ["3~5만원", 30_000, 50_000],
    ["4.5~6만원", 45_000, 60_000],

    // "N만~M만원" (양쪽에 개별 단위)
    ["5만~7만원", 50_000, 70_000],
    ["5만~7만", 50_000, 70_000],
    ["15만~20만원", 150_000, 200_000],

    // "N만원~M만원"
    ["5만원~7만원", 50_000, 70_000],
    ["15만원~20만원", 150_000, 200_000],

    // 순수 숫자 범위
    ["45000~60000원", 45_000, 60_000],
    ["45000~60000", 45_000, 60_000],

    // 하이픈 구분자
    ["5-7만원", 50_000, 70_000],
    ["15-20만원", 150_000, 200_000],
    ["50000-70000원", 50_000, 70_000],
  ])('"%s" → min: %d, max: %d', (input, expectedMin, expectedMax) => {
    const result = normalizePrice(input);
    expect(result.min).toBe(expectedMin);
    expect(result.max).toBe(expectedMax);
    expect(result.error).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 4. detectVatStatus — 부가세 감지
// ─────────────────────────────────────────────

describe("detectVatStatus — 부가세 감지", () => {
  test.each([
    ["50,000원 (부가세 포함)", "included"],
    ["5만원 부가세 포함", "included"],
    ["50000원 VAT 포함", "included"],
    ["5만원 (VAT included)", "included"],
    ["50000원 세금 포함", "included"],
  ])('포함: "%s" → "%s"', (input, expected) => {
    expect(detectVatStatus(input)).toBe(expected);
  });

  test.each([
    ["50,000원 (부가세 별도)", "excluded"],
    ["5만원 부가세 별도", "excluded"],
    ["50000원 + VAT", "excluded"],
    ["5만원 VAT 별도", "excluded"],
    ["50000원 VAT excluded", "excluded"],
    ["5만원 (부가세 제외)", "excluded"],
    ["50000원 세금 별도", "excluded"],
    ["5만원 부가세 미포함", "excluded"],
  ])('별도: "%s" → "%s"', (input, expected) => {
    expect(detectVatStatus(input)).toBe(expected);
  });

  test.each([
    ["50,000원", "unknown"],
    ["5만원", "unknown"],
    ["50000", "unknown"],
    ["5~7만원", "unknown"],
  ])('미확인: "%s" → "%s"', (input, expected) => {
    expect(detectVatStatus(input)).toBe(expected);
  });
});

// ─────────────────────────────────────────────
// 5. applyVat — 부가세 계산
// ─────────────────────────────────────────────

describe("applyVat — 부가세 계산", () => {
  test("부가세 별도: 10% 추가", () => {
    expect(applyVat(50_000, "excluded")).toBe(55_000);
    expect(applyVat(100_000, "excluded")).toBe(110_000);
  });

  test("부가세 포함: 그대로", () => {
    expect(applyVat(50_000, "included")).toBe(50_000);
  });

  test("미확인: 그대로 (가정 소비자 대상 기본값)", () => {
    expect(applyVat(50_000, "unknown")).toBe(50_000);
  });
});

// ─────────────────────────────────────────────
// 6. normalizePrice — 부가세 통합 처리
// ─────────────────────────────────────────────

describe("normalizePrice — 부가세 통합 처리", () => {
  test("부가세 포함 표기", () => {
    const result = normalizePrice("5만원 (부가세 포함)");
    expect(result.min).toBe(50_000);
    expect(result.vatStatus).toBe("included");
    expect(result.minWithVat).toBe(50_000);
  });

  test("부가세 별도 표기 — 단일 가격", () => {
    const result = normalizePrice("50,000원 (부가세 별도)");
    expect(result.min).toBe(50_000);
    expect(result.vatStatus).toBe("excluded");
    expect(result.minWithVat).toBe(55_000);
  });

  test("부가세 별도 표기 — 범위 가격", () => {
    const result = normalizePrice("5~7만원 (부가세 별도)");
    expect(result.min).toBe(50_000);
    expect(result.max).toBe(70_000);
    expect(result.vatStatus).toBe("excluded");
    expect(result.minWithVat).toBe(55_000);
    expect(result.maxWithVat).toBe(77_000);
  });

  test("부가세 표기 없음 — 기본 처리", () => {
    const result = normalizePrice("5만원");
    expect(result.vatStatus).toBe("unknown");
    expect(result.minWithVat).toBe(50_000); // unknown은 포함으로 간주
  });
});

// ─────────────────────────────────────────────
// 7. normalizePrice — 에러 케이스
// ─────────────────────────────────────────────

describe("normalizePrice — 에러 케이스", () => {
  test("빈 문자열", () => {
    const result = normalizePrice("");
    expect(result.min).toBeNull();
    expect(result.error).toBe("빈 문자열");
    expect(result.confidence).toBe(0);
  });

  test("공백만", () => {
    const result = normalizePrice("   ");
    expect(result.min).toBeNull();
    expect(result.error).toBe("빈 문자열");
  });

  test("인식 불가 텍스트", () => {
    const result = normalizePrice("가격문의");
    expect(result.min).toBeNull();
    expect(result.error).toBe("가격 패턴을 인식할 수 없음");
  });

  test("유효 범위 초과", () => {
    const result = normalizePrice("500만원");
    expect(result.min).toBeNull();
    expect(result.error).toContain("유효 범위 밖");
  });

  test("유효 범위 미만", () => {
    const result = normalizePrice("100원");
    expect(result.min).toBeNull();
    expect(result.error).toContain("유효 범위 밖");
  });
});

// ─────────────────────────────────────────────
// 8. normalizePrice — 전각 문자 처리
// ─────────────────────────────────────────────

describe("normalizePrice — 전각 문자 처리", () => {
  test("전각 숫자", () => {
    const result = normalizePrice("５만원");
    expect(result.min).toBe(50_000);
  });

  test("전각 물결", () => {
    const result = normalizePrice("5～7만원");
    expect(result.min).toBe(50_000);
    expect(result.max).toBe(70_000);
  });

  test("전각 콤마", () => {
    const result = normalizePrice("50，000원");
    expect(result.min).toBe(50_000);
  });
});

// ─────────────────────────────────────────────
// 9. isPriceInValidRange — 유효 범위 검증
// ─────────────────────────────────────────────

describe("isPriceInValidRange", () => {
  test("유효 범위 내", () => {
    expect(isPriceInValidRange(50_000)).toBe(true);
    expect(isPriceInValidRange(5_000)).toBe(true);
    expect(isPriceInValidRange(1_000_000)).toBe(true);
  });

  test("유효 범위 밖", () => {
    expect(isPriceInValidRange(4_999)).toBe(false);
    expect(isPriceInValidRange(1_000_001)).toBe(false);
    expect(isPriceInValidRange(0)).toBe(false);
    expect(isPriceInValidRange(-10_000)).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 10. batchNormalizePrices — 배치 처리
// ─────────────────────────────────────────────

describe("batchNormalizePrices", () => {
  test("복수 텍스트 일괄 처리", () => {
    const result = batchNormalizePrices([
      "5만원",
      "15~20만원",
      "가격문의",
      "50,000원 (부가세 별도)",
    ]);

    expect(result.successCount).toBe(3);
    expect(result.failureCount).toBe(1);
    expect(result.successRate).toBeCloseTo(0.75);
    expect(result.results).toHaveLength(4);
    expect(result.results[0].min).toBe(50_000);
    expect(result.results[1].min).toBe(150_000);
    expect(result.results[1].max).toBe(200_000);
    expect(result.results[2].min).toBeNull();
    expect(result.results[3].min).toBe(50_000);
    expect(result.results[3].minWithVat).toBe(55_000);
  });

  test("빈 배열", () => {
    const result = batchNormalizePrices([]);
    expect(result.successCount).toBe(0);
    expect(result.failureCount).toBe(0);
    expect(result.successRate).toBe(0);
  });
});

// ─────────────────────────────────────────────
// 11. parsePriceForEntry — PriceEntry 호환 변환
// ─────────────────────────────────────────────

describe("parsePriceForEntry — PriceEntry 호환", () => {
  test("단일 가격", () => {
    const result = parsePriceForEntry("5만원");
    expect(result).toEqual({ price: 50_000, priceMax: null });
  });

  test("범위 가격", () => {
    const result = parsePriceForEntry("5~7만원");
    expect(result).toEqual({ price: 50_000, priceMax: 70_000 });
  });

  test("부가세 별도 → VAT 포함으로 변환", () => {
    const result = parsePriceForEntry("50,000원 (부가세 별도)");
    expect(result).toEqual({ price: 55_000, priceMax: null });
  });

  test("파싱 실패 → null", () => {
    expect(parsePriceForEntry("가격문의")).toBeNull();
    expect(parsePriceForEntry("")).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 12. 실제 크롤링 데이터 시뮬레이션
// ─────────────────────────────────────────────

describe("실제 크롤링 데이터 시나리오", () => {
  test("숨고 스타일 가격", () => {
    expect(normalizePrice("50,000원").min).toBe(50_000);
    expect(normalizePrice("45,000~60,000원").min).toBe(45_000);
    expect(normalizePrice("45,000~60,000원").max).toBe(60_000);
  });

  test("당근마켓 스타일 가격", () => {
    expect(normalizePrice("5만원").min).toBe(50_000);
    expect(normalizePrice("5~7만").min).toBe(50_000);
    expect(normalizePrice("5~7만").max).toBe(70_000);
  });

  test("블로그 스타일 가격", () => {
    expect(normalizePrice("약 5만원").min).toBe(50_000);
    expect(normalizePrice("5만원~7만원").min).toBe(50_000);
    expect(normalizePrice("5만원~7만원").max).toBe(70_000);
  });

  test("업체 사이트 스타일 가격", () => {
    expect(normalizePrice("50,000원 (부가세 포함)").min).toBe(50_000);
    expect(normalizePrice("50,000원 (부가세 포함)").vatStatus).toBe("included");
    const vatExcl = normalizePrice("50,000원 (부가세 별도)");
    expect(vatExcl.min).toBe(50_000);
    expect(vatExcl.minWithVat).toBe(55_000);
  });

  test("콤마 포함 순수 숫자", () => {
    expect(normalizePrice("50,000").min).toBe(50_000);
    expect(normalizePrice("120,000").min).toBe(120_000);
  });

  test("가정용 에어컨 청소 실제 가격대", () => {
    // 벽걸이 일반세척
    expect(normalizePrice("3~5만원").min).toBe(30_000);
    // 벽걸이 분해세척
    expect(normalizePrice("5~8만원").min).toBe(50_000);
    // 스탠드 분해세척
    expect(normalizePrice("8~12만원").min).toBe(80_000);
    // 천장형
    expect(normalizePrice("12~15만원").min).toBe(120_000);
    // 시스템
    expect(normalizePrice("10~14만원").min).toBe(100_000);
  });
});
