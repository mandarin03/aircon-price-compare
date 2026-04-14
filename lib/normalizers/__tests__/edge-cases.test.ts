/**
 * 정규화 함수 엣지 케이스 단위 테스트
 *
 * 빈 값, 비정상 포맷, 부가세 미표기, 경계값, 특수문자 등
 * 실제 크롤링 데이터에서 발생할 수 있는 예외 상황을 검증한다.
 */

import {
  normalizeAirconType,
  matchAirconTypeFromText,
  batchNormalizeAirconTypes,
  getKeywordsForType,
} from "../aircon-type-normalizer";
import {
  normalizeCleaningType,
  matchCleaningTypeFromText,
  batchNormalizeCleaningTypes,
} from "../cleaning-type-normalizer";
import {
  normalizePrice,
  parseKoreanPrice,
  detectVatStatus,
  applyVat,
  isPriceInValidRange,
  batchNormalizePrices,
  parsePriceForEntry,
} from "../price-normalizer";

// ═════════════════════════════════════════════
// A. 에어컨 유형 정규화 — 엣지 케이스
// ═════════════════════════════════════════════

describe("에어컨 유형 정규화 — 엣지 케이스", () => {
  // ── 빈 값 / 공백 변형 ──
  describe("빈 값 및 공백 변형", () => {
    test("빈 문자열", () => {
      const r = normalizeAirconType("");
      expect(r.type).toBeNull();
      expect(r.confidence).toBe(0);
      expect(r.matchMethod).toBe("none");
      expect(r.originalText).toBe("");
      expect(r.normalizedText).toBe("");
    });

    test("단일 공백", () => {
      const r = normalizeAirconType(" ");
      expect(r.type).toBeNull();
    });

    test("탭 문자만", () => {
      const r = normalizeAirconType("\t");
      expect(r.type).toBeNull();
    });

    test("개행 문자만", () => {
      const r = normalizeAirconType("\n");
      expect(r.type).toBeNull();
    });

    test("복합 공백 (탭+공백+개행)", () => {
      const r = normalizeAirconType("  \t  \n  ");
      expect(r.type).toBeNull();
    });

    test("키워드 앞뒤에 과도한 공백", () => {
      const r = normalizeAirconType("   벽걸이   ");
      expect(r.type).toBe("wall-mount");
    });

    test("키워드 사이 다중 공백", () => {
      const r = normalizeAirconType("벽걸이   에어컨");
      expect(r.type).toBe("wall-mount");
    });
  });

  // ── 특수문자 포함 ──
  describe("특수문자 포함 텍스트", () => {
    test("괄호로 둘러싸인 유형", () => {
      expect(matchAirconTypeFromText("(벽걸이)")).toBe("wall-mount");
    });

    test("대괄호로 둘러싸인 유형", () => {
      expect(matchAirconTypeFromText("[스탠드]")).toBe("standing");
    });

    test("중괄호로 둘러싸인 유형", () => {
      expect(matchAirconTypeFromText("{천장형}")).toBe("ceiling");
    });

    test("슬래시로 구분된 복합 표현", () => {
      // 슬래시가 공백으로 대체되므로 첫 번째 매칭
      expect(matchAirconTypeFromText("벽걸이/스탠드")).toBe("wall-mount");
    });

    test("백슬래시 포함", () => {
      expect(matchAirconTypeFromText("벽걸이\\에어컨")).toBe("wall-mount");
    });

    test("파이프 문자 포함", () => {
      expect(matchAirconTypeFromText("벽걸이|에어컨")).toBe("wall-mount");
    });

    test("HTML 태그 잔재 (꺾쇠 미처리)", () => {
      // 꺾쇠는 전처리에서 제거되지 않지만 패턴으로 매칭 가능
      const r = normalizeAirconType("<b>벽걸이</b>");
      expect(r.type).toBe("wall-mount");
      expect(r.matchMethod).toBe("pattern");
    });

    test("점·쉼표 포함된 비정상 텍스트", () => {
      expect(matchAirconTypeFromText("벽걸이, 에어컨")).toBe("wall-mount");
    });

    test("이모지 포함", () => {
      const r = normalizeAirconType("🏠 벽걸이 에어컨 ❄️");
      expect(r.type).toBe("wall-mount");
      expect(r.matchMethod).toBe("pattern");
    });
  });

  // ── 대소문자 혼합 ──
  describe("대소문자 혼합 영어 입력", () => {
    test("대문자만", () => {
      expect(matchAirconTypeFromText("WALL-MOUNTED")).toBe("wall-mount");
    });

    test("혼합 케이스", () => {
      expect(matchAirconTypeFromText("Wall-Mounted")).toBe("wall-mount");
    });

    test("불규칙 대소문자", () => {
      expect(matchAirconTypeFromText("wAlL mOuNt")).toBe("wall-mount");
    });

    test("대문자 CEILING TYPE", () => {
      expect(matchAirconTypeFromText("CEILING TYPE")).toBe("ceiling");
    });

    test("대문자 SYSTEM", () => {
      expect(matchAirconTypeFromText("SYSTEM")).toBe("system");
    });
  });

  // ── 관련 없는 텍스트 ──
  describe("관련 없는 / 모호한 텍스트", () => {
    test("숫자만", () => {
      expect(matchAirconTypeFromText("12345")).toBeNull();
    });

    test("특수문자만", () => {
      expect(matchAirconTypeFromText("@#$%^")).toBeNull();
    });

    test("단일 한글 글자", () => {
      expect(matchAirconTypeFromText("가")).toBeNull();
    });

    test("다른 가전제품", () => {
      expect(matchAirconTypeFromText("세탁기 청소")).toBeNull();
      expect(matchAirconTypeFromText("냉장고 청소")).toBeNull();
      expect(matchAirconTypeFromText("보일러 세척")).toBeNull();
    });

    test("매우 긴 무관한 텍스트", () => {
      const longText = "이것은 에어컨과 전혀 관계없는 매우 긴 텍스트입니다. ".repeat(10);
      expect(matchAirconTypeFromText(longText)).toBeNull();
    });
  });

  // ── originalText 보존 ──
  describe("originalText 보존", () => {
    test("원본 텍스트가 결과에 보존된다", () => {
      const input = "  WALL-MOUNTED  ";
      const r = normalizeAirconType(input);
      expect(r.originalText).toBe(input);
      expect(r.normalizedText).not.toBe(input);
    });
  });

  // ── 배치 엣지 케이스 ──
  describe("배치 정규화 엣지 케이스", () => {
    test("전부 빈 문자열인 배열", () => {
      const r = batchNormalizeAirconTypes(["", "   ", "\t"]);
      expect(r.successCount).toBe(0);
      expect(r.failureCount).toBe(3);
      expect(r.successRate).toBe(0);
    });

    test("전부 성공하는 배열", () => {
      const r = batchNormalizeAirconTypes(["벽걸이", "스탠드", "천장형"]);
      expect(r.successCount).toBe(3);
      expect(r.failureCount).toBe(0);
      expect(r.successRate).toBe(1);
    });

    test("단일 항목 배열", () => {
      const r = batchNormalizeAirconTypes(["벽걸이"]);
      expect(r.successCount).toBe(1);
      expect(r.successRate).toBe(1);
    });
  });

  // ── getKeywordsForType 엣지 케이스 ──
  describe("getKeywordsForType 엣지 케이스", () => {
    test("존재하지 않는 유형에 대해 빈 배열 반환", () => {
      // "unknown"은 AirconType에 없으므로 빈 배열
      expect(getKeywordsForType("nonexistent" as never)).toEqual([]);
    });
  });
});

// ═════════════════════════════════════════════
// B. 청소 방식 정규화 — 엣지 케이스
// ═════════════════════════════════════════════

describe("청소 방식 정규화 — 엣지 케이스", () => {
  // ── 빈 값 / 공백 변형 ──
  describe("빈 값 및 공백 변형", () => {
    test("빈 문자열 → unknown", () => {
      const r = normalizeCleaningType("");
      expect(r.type).toBe("unknown");
      expect(r.confidence).toBe(0);
      expect(r.matchMethod).toBe("none");
    });

    test("공백만 → unknown", () => {
      expect(normalizeCleaningType("   ").type).toBe("unknown");
    });

    test("탭만 → unknown", () => {
      expect(normalizeCleaningType("\t\t").type).toBe("unknown");
    });

    test("개행만 → unknown", () => {
      expect(normalizeCleaningType("\n\r\n").type).toBe("unknown");
    });

    test("키워드 앞뒤 과도한 공백", () => {
      expect(matchCleaningTypeFromText("   분해세척   ")).toBe("disassembly");
    });

    test("키워드 사이 다중 공백", () => {
      expect(matchCleaningTypeFromText("완전   분해   세척")).toBe(
        "complete-disassembly"
      );
    });
  });

  // ── 특수문자 포함 ──
  describe("특수문자 포함 텍스트", () => {
    test("괄호 안에 키워드", () => {
      expect(matchCleaningTypeFromText("(완전분해)")).toBe(
        "complete-disassembly"
      );
    });

    test("대괄호 포함", () => {
      expect(matchCleaningTypeFromText("[분해세척]")).toBe("disassembly");
    });

    test("슬래시 구분", () => {
      // "분해/세척" → 전처리 후 "분해 세척"
      expect(matchCleaningTypeFromText("분해/세척")).toBe("disassembly");
    });

    test("하이픈 포함 영어", () => {
      expect(matchCleaningTypeFromText("complete-disassembly")).toBe(
        "complete-disassembly"
      );
    });

    test("이모지 포함", () => {
      expect(matchCleaningTypeFromText("✨ 완전분해 세척 ✨")).toBe(
        "complete-disassembly"
      );
    });
  });

  // ── 우선순위 엣지 ──
  describe("완전분해 vs 분해 우선순위 엣지 케이스", () => {
    test("'비분해'는 general (분해의 부정)", () => {
      expect(matchCleaningTypeFromText("비분해")).toBe("general");
    });

    test("'반분해'는 disassembly", () => {
      expect(matchCleaningTypeFromText("반분해")).toBe("disassembly");
    });

    test("'부분분해'는 disassembly", () => {
      expect(matchCleaningTypeFromText("부분분해")).toBe("disassembly");
    });

    test("'완전분해'와 '일반세척' 모두 포함 시 완전분해 우선", () => {
      expect(matchCleaningTypeFromText("완전분해 일반세척")).toBe(
        "complete-disassembly"
      );
    });

    test("분해 키워드만 단독으로 있을 때", () => {
      expect(matchCleaningTypeFromText("분해")).toBe("disassembly");
    });
  });

  // ── 브랜드명 + 에어컨 유형 혼합 ──
  describe("브랜드명/에어컨 유형이 포함된 복합 텍스트", () => {
    test("삼성 + 벽걸이 + 분해 → disassembly", () => {
      expect(
        matchCleaningTypeFromText("삼성 벽걸이 에어컨 분해 청소")
      ).toBe("disassembly");
    });

    test("LG + 스탠드 + 완전분해 → complete-disassembly", () => {
      expect(
        matchCleaningTypeFromText("LG 스탠드 에어컨 완전분해 세척")
      ).toBe("complete-disassembly");
    });

    test("에어컨만 있고 청소 방식 없으면 → general (에어컨 청소 기본값)", () => {
      expect(matchCleaningTypeFromText("에어컨 청소")).toBe("general");
    });

    test("에어컨 세척만 있으면 → general", () => {
      expect(matchCleaningTypeFromText("에어컨 세척")).toBe("general");
    });
  });

  // ── 모호한 텍스트 ──
  describe("관련 없는 / 모호한 텍스트", () => {
    test("숫자만 → unknown", () => {
      expect(matchCleaningTypeFromText("50000")).toBe("unknown");
    });

    test("가격 텍스트 → unknown", () => {
      expect(matchCleaningTypeFromText("5만원")).toBe("unknown");
    });

    test("URL → unknown", () => {
      expect(matchCleaningTypeFromText("https://example.com")).toBe("unknown");
    });

    test("단일 글자 → unknown", () => {
      expect(matchCleaningTypeFromText("a")).toBe("unknown");
    });
  });

  // ── 배치 엣지 케이스 ──
  describe("배치 정규화 엣지 케이스", () => {
    test("전부 빈 문자열 → 성공 0건", () => {
      const r = batchNormalizeCleaningTypes(["", "", ""]);
      expect(r.successCount).toBe(0);
      expect(r.failureCount).toBe(3);
      expect(r.categoryCounts.unknown).toBe(3);
    });

    test("중복 항목 처리", () => {
      const r = batchNormalizeCleaningTypes([
        "분해세척",
        "분해세척",
        "분해세척",
      ]);
      expect(r.successCount).toBe(3);
      expect(r.categoryCounts.disassembly).toBe(3);
    });
  });
});

// ═════════════════════════════════════════════
// C. 가격 정규화 — 엣지 케이스
// ═════════════════════════════════════════════

describe("가격 정규화 — 엣지 케이스", () => {
  // ── 빈 값 / 공백 변형 ──
  describe("빈 값 및 공백 변형", () => {
    test("빈 문자열", () => {
      const r = normalizePrice("");
      expect(r.min).toBeNull();
      expect(r.max).toBeNull();
      expect(r.error).toBe("빈 문자열");
      expect(r.confidence).toBe(0);
    });

    test("공백만", () => {
      const r = normalizePrice("   ");
      expect(r.min).toBeNull();
      expect(r.error).toBe("빈 문자열");
    });

    test("탭만", () => {
      const r = normalizePrice("\t");
      expect(r.min).toBeNull();
    });

    test("개행만", () => {
      const r = normalizePrice("\n");
      expect(r.min).toBeNull();
    });

    test("가격 앞뒤 과도한 공백", () => {
      const r = normalizePrice("   5만원   ");
      expect(r.min).toBe(50_000);
    });
  });

  // ── parseKoreanPrice 엣지 케이스 ──
  describe("parseKoreanPrice 엣지 케이스", () => {
    test("빈 문자열 → null", () => {
      expect(parseKoreanPrice("")).toBeNull();
    });

    test("공백만 → null", () => {
      expect(parseKoreanPrice("   ")).toBeNull();
    });

    test("'원'만 → null", () => {
      expect(parseKoreanPrice("원")).toBeNull();
    });

    test("'만원'만 → null (숫자 없음)", () => {
      expect(parseKoreanPrice("만원")).toBeNull();
    });

    test("0원 → 0", () => {
      expect(parseKoreanPrice("0")).toBe(0);
    });

    test("0만원 → 0", () => {
      expect(parseKoreanPrice("0만")).toBe(0);
    });

    test("매우 작은 소수 만원 → 반올림", () => {
      // 0.1만 = 1000
      expect(parseKoreanPrice("0.1만")).toBe(1_000);
    });

    test("소수 천원 → 반올림", () => {
      // 1.5천 = 1500
      expect(parseKoreanPrice("1.5천")).toBe(1_500);
    });

    test("음수는 매칭하지 않음 → null", () => {
      expect(parseKoreanPrice("-5만")).toBeNull();
    });

    test("문자열 중간의 숫자는 매칭하지 않음", () => {
      expect(parseKoreanPrice("약5만")).toBeNull();
    });
  });

  // ── 부가세(VAT) 엣지 케이스 ──
  describe("부가세(VAT) 감지 엣지 케이스", () => {
    test("아무 표기 없음 → unknown", () => {
      expect(detectVatStatus("50000원")).toBe("unknown");
    });

    test("빈 문자열 → unknown", () => {
      expect(detectVatStatus("")).toBe("unknown");
    });

    test("VAT만 단독 표기 → unknown (포함/별도 미지정)", () => {
      expect(detectVatStatus("50000원 VAT")).toBe("unknown");
    });

    test("부가세만 단독 표기 → unknown", () => {
      expect(detectVatStatus("50000원 부가세")).toBe("unknown");
    });

    test("'부가 포함' (줄임말) → included", () => {
      expect(detectVatStatus("50000원 부가 포함")).toBe("included");
    });

    test("'부가 별도' (줄임말) → excluded", () => {
      expect(detectVatStatus("50000원 부가 별도")).toBe("excluded");
    });

    test("'+VAT' → excluded", () => {
      expect(detectVatStatus("50000원 + VAT")).toBe("excluded");
    });

    test("'부가세 미포함' → excluded", () => {
      expect(detectVatStatus("50000원 부가세 미포함")).toBe("excluded");
    });

    test("'부가세 불포함' → excluded", () => {
      expect(detectVatStatus("50000원 부가세 불포함")).toBe("excluded");
    });

    test("대문자 'VAT INCLUDED' → included", () => {
      expect(detectVatStatus("50000 VAT INCLUDED")).toBe("included");
    });

    test("대문자 'VAT EXCLUDED' → excluded", () => {
      expect(detectVatStatus("50000 VAT EXCLUDED")).toBe("excluded");
    });

    test("부가세 포함과 별도가 동시 표기되면 별도 우선 (먼저 검사)", () => {
      // 구현에서 excludedPatterns를 먼저 검사
      expect(detectVatStatus("부가세 별도 부가세 포함")).toBe("excluded");
    });
  });

  // ── applyVat 엣지 케이스 ──
  describe("applyVat 엣지 케이스", () => {
    test("0원에 부가세 적용", () => {
      expect(applyVat(0, "excluded")).toBe(0);
      expect(applyVat(0, "included")).toBe(0);
      expect(applyVat(0, "unknown")).toBe(0);
    });

    test("소액 부가세 반올림", () => {
      // 33333 * 1.1 = 36666.3 → 반올림 36666
      expect(applyVat(33_333, "excluded")).toBe(36_666);
    });

    test("큰 금액 부가세", () => {
      expect(applyVat(1_000_000, "excluded")).toBe(1_100_000);
    });
  });

  // ── isPriceInValidRange 경계값 ──
  describe("isPriceInValidRange 경계값", () => {
    test("정확히 최소 경계 (5,000원)", () => {
      expect(isPriceInValidRange(5_000)).toBe(true);
    });

    test("최소 경계 바로 아래 (4,999원)", () => {
      expect(isPriceInValidRange(4_999)).toBe(false);
    });

    test("정확히 최대 경계 (1,000,000원)", () => {
      expect(isPriceInValidRange(1_000_000)).toBe(true);
    });

    test("최대 경계 바로 위 (1,000,001원)", () => {
      expect(isPriceInValidRange(1_000_001)).toBe(false);
    });

    test("0원", () => {
      expect(isPriceInValidRange(0)).toBe(false);
    });

    test("음수", () => {
      expect(isPriceInValidRange(-1)).toBe(false);
    });
  });

  // ── 비정상 가격 포맷 ──
  describe("비정상 가격 포맷", () => {
    test("한글 텍스트만 있는 경우", () => {
      const r = normalizePrice("가격문의");
      expect(r.min).toBeNull();
      expect(r.error).toBe("가격 패턴을 인식할 수 없음");
    });

    test("'무료' 표기", () => {
      const r = normalizePrice("무료");
      expect(r.min).toBeNull();
    });

    test("'협의' 표기", () => {
      const r = normalizePrice("가격 협의");
      expect(r.min).toBeNull();
    });

    test("'전화문의' 표기", () => {
      const r = normalizePrice("전화문의");
      expect(r.min).toBeNull();
    });

    test("'별도 문의' 표기", () => {
      const r = normalizePrice("별도 문의");
      expect(r.min).toBeNull();
    });

    test("단위 없는 소수점 숫자 (가격으로 인식 가능하나 범위 밖)", () => {
      // "5.5" → 정수 6으로 파싱 → 유효 범위 밖
      const r = normalizePrice("5.5");
      expect(r.min).toBeNull();
      expect(r.error).toContain("유효 범위 밖");
    });

    test("유효 범위 초과 — 1000만원", () => {
      const r = normalizePrice("1000만원");
      expect(r.min).toBeNull();
      expect(r.error).toContain("유효 범위 밖");
    });

    test("유효 범위 미만 — 1000원", () => {
      const r = normalizePrice("1000원");
      expect(r.min).toBeNull();
      expect(r.error).toContain("유효 범위 밖");
    });
  });

  // ── 범위 가격 엣지 케이스 ──
  describe("범위 가격 엣지 케이스", () => {
    test("min == max (동일 가격 범위)", () => {
      const r = normalizePrice("5~5만원");
      expect(r.min).toBe(50_000);
      expect(r.max).toBe(50_000);
      expect(r.error).toBeNull();
    });

    test("범위 역전 (min > max) → 에러", () => {
      const r = normalizePrice("20~15만원");
      expect(r.min).toBeNull();
      expect(r.error).toContain("최소 가격");
      expect(r.error).toContain("최대 가격");
    });

    test("범위 한쪽이 유효 범위 밖 — 최소 미달", () => {
      // 0.1만 = 1000 → 유효 범위 밖
      const r = normalizePrice("0.1~5만원");
      expect(r.min).toBeNull();
      expect(r.error).toContain("유효 범위 밖");
    });

    test("범위 한쪽이 유효 범위 밖 — 최대 초과", () => {
      const r = normalizePrice("50~200만원");
      expect(r.min).toBeNull();
      expect(r.error).toContain("유효 범위 밖");
    });

    test("넓은 범위 (경계 내)", () => {
      const r = normalizePrice("1~100만원");
      expect(r.min).toBe(10_000);
      expect(r.max).toBe(1_000_000);
    });
  });

  // ── 전각 문자 엣지 케이스 ──
  describe("전각 문자 엣지 케이스", () => {
    test("전각 하이픈 범위", () => {
      const r = normalizePrice("5－7만원");
      expect(r.min).toBe(50_000);
      expect(r.max).toBe(70_000);
    });

    test("전각 숫자 범위", () => {
      const r = normalizePrice("５～７만원");
      expect(r.min).toBe(50_000);
      expect(r.max).toBe(70_000);
    });

    test("전각 콤마 + 숫자", () => {
      const r = normalizePrice("５０，０００원");
      expect(r.min).toBe(50_000);
    });
  });

  // ── 부가세 미표기 가격 ──
  describe("부가세 미표기 가격 처리", () => {
    test("단일 가격 — 부가세 미표기 시 unknown, 그대로 사용", () => {
      const r = normalizePrice("5만원");
      expect(r.vatStatus).toBe("unknown");
      expect(r.minWithVat).toBe(50_000); // unknown은 포함으로 간주
    });

    test("범위 가격 — 부가세 미표기 시 unknown, 그대로 사용", () => {
      const r = normalizePrice("5~7만원");
      expect(r.vatStatus).toBe("unknown");
      expect(r.minWithVat).toBe(50_000);
      expect(r.maxWithVat).toBe(70_000);
    });

    test("부가세 별도 — 10% 추가 반영", () => {
      const r = normalizePrice("5만원 (부가세 별도)");
      expect(r.vatStatus).toBe("excluded");
      expect(r.min).toBe(50_000);
      expect(r.minWithVat).toBe(55_000);
    });

    test("부가세 포함 — 금액 그대로", () => {
      const r = normalizePrice("5만원 (부가세 포함)");
      expect(r.vatStatus).toBe("included");
      expect(r.min).toBe(50_000);
      expect(r.minWithVat).toBe(50_000);
    });
  });

  // ── 실제 크롤링에서 자주 발견되는 비정상 포맷 ──
  describe("실제 크롤링 비정상 포맷", () => {
    test("'약' 접두어", () => {
      expect(normalizePrice("약 5만원").min).toBe(50_000);
    });

    test("'~' 로 끝나는 가격 (이상 표시)", () => {
      // "5만원~" → 끝 물결 제거 → "5만원"
      expect(normalizePrice("5만원~").min).toBe(50_000);
    });

    test("'1대 기준' 텍스트 포함", () => {
      expect(normalizePrice("5만원 1대 기준").min).toBe(50_000);
    });

    test("'대당' 텍스트 포함", () => {
      expect(normalizePrice("5만원 대당").min).toBe(50_000);
    });

    test("'부터' 텍스트 포함", () => {
      expect(normalizePrice("5만원부터").min).toBe(50_000);
    });

    test("콤마 천 단위 구분자 포함 범위", () => {
      const r = normalizePrice("50,000~70,000원");
      expect(r.min).toBe(50_000);
      expect(r.max).toBe(70_000);
    });

    test("괄호 안 부가세 표기 + 범위 가격", () => {
      const r = normalizePrice("5~7만원 (부가세 별도)");
      expect(r.min).toBe(50_000);
      expect(r.max).toBe(70_000);
      expect(r.vatStatus).toBe("excluded");
      expect(r.minWithVat).toBe(55_000);
      expect(r.maxWithVat).toBe(77_000);
    });
  });

  // ── parsePriceForEntry 엣지 케이스 ──
  describe("parsePriceForEntry 엣지 케이스", () => {
    test("빈 문자열 → null", () => {
      expect(parsePriceForEntry("")).toBeNull();
    });

    test("인식 불가 → null", () => {
      expect(parsePriceForEntry("가격문의")).toBeNull();
    });

    test("범위 초과 → null", () => {
      expect(parsePriceForEntry("500만원")).toBeNull();
    });

    test("부가세 별도 범위 가격 → VAT 포함 변환", () => {
      const r = parsePriceForEntry("5~7만원 (부가세 별도)");
      expect(r).not.toBeNull();
      expect(r!.price).toBe(55_000);    // 5만 + 10%
      expect(r!.priceMax).toBe(77_000); // 7만 + 10%
    });

    test("부가세 미표기 → 그대로 (unknown은 포함으로 간주)", () => {
      const r = parsePriceForEntry("5만원");
      expect(r).not.toBeNull();
      expect(r!.price).toBe(50_000);
      expect(r!.priceMax).toBeNull();
    });
  });

  // ── batchNormalizePrices 엣지 케이스 ──
  describe("batchNormalizePrices 엣지 케이스", () => {
    test("빈 배열", () => {
      const r = batchNormalizePrices([]);
      expect(r.successCount).toBe(0);
      expect(r.failureCount).toBe(0);
      expect(r.successRate).toBe(0);
    });

    test("전부 실패", () => {
      const r = batchNormalizePrices(["", "가격문의", "무료"]);
      expect(r.successCount).toBe(0);
      expect(r.failureCount).toBe(3);
      expect(r.successRate).toBe(0);
    });

    test("전부 성공", () => {
      const r = batchNormalizePrices(["5만원", "7만원", "10만원"]);
      expect(r.successCount).toBe(3);
      expect(r.failureCount).toBe(0);
      expect(r.successRate).toBe(1);
    });

    test("단일 항목", () => {
      const r = batchNormalizePrices(["5만원"]);
      expect(r.successCount).toBe(1);
      expect(r.successRate).toBe(1);
      expect(r.results).toHaveLength(1);
    });

    test("혼합 (성공+실패)", () => {
      const r = batchNormalizePrices(["5만원", "무료", "7만원"]);
      expect(r.successCount).toBe(2);
      expect(r.failureCount).toBe(1);
      expect(r.successRate).toBeCloseTo(0.667, 2);
    });
  });

  // ── 에러 결과 구조 검증 ──
  describe("에러 결과 구조 검증", () => {
    test("에러 결과의 모든 필드가 올바름", () => {
      const r = normalizePrice("");
      expect(r.min).toBeNull();
      expect(r.max).toBeNull();
      expect(r.vatStatus).toBe("unknown");
      expect(r.minWithVat).toBeNull();
      expect(r.maxWithVat).toBeNull();
      expect(r.confidence).toBe(0);
      expect(r.originalText).toBe("");
      expect(r.error).toBeTruthy();
    });

    test("성공 결과의 에러 필드는 null", () => {
      const r = normalizePrice("5만원");
      expect(r.error).toBeNull();
      expect(r.min).not.toBeNull();
      expect(r.confidence).toBeGreaterThan(0);
    });
  });
});

// ═════════════════════════════════════════════
// D. 세 정규화 모듈 간 크로스 검증
// ═════════════════════════════════════════════

describe("크로스 모듈 일관성 검증", () => {
  test("에어컨 유형 정규화 실패 시 confidence 0, type null", () => {
    const r = normalizeAirconType("알 수 없음");
    expect(r.type).toBeNull();
    expect(r.confidence).toBe(0);
    expect(r.matchMethod).toBe("none");
  });

  test("청소 방식 정규화 실패 시 confidence 0, type unknown", () => {
    const r = normalizeCleaningType("알 수 없음");
    expect(r.type).toBe("unknown");
    expect(r.confidence).toBe(0);
    expect(r.matchMethod).toBe("none");
  });

  test("가격 정규화 실패 시 confidence 0, min null", () => {
    const r = normalizePrice("알 수 없음");
    expect(r.min).toBeNull();
    expect(r.confidence).toBe(0);
    expect(r.error).toBeTruthy();
  });

  test("모든 정규화 함수가 원본 텍스트를 보존", () => {
    const text = "  테스트 입력  ";
    expect(normalizeAirconType(text).originalText).toBe(text);
    expect(normalizeCleaningType(text).originalText).toBe(text);
    expect(normalizePrice(text).originalText).toBe(text);
  });

  test("실제 크롤링 시나리오: 유형+방식+가격 동시 정규화", () => {
    // 숨고에서 크롤링한 데이터 시뮬레이션
    const airconType = normalizeAirconType("벽걸이 에어컨");
    const cleaningMethod = normalizeCleaningType("분해세척");
    const price = normalizePrice("5~7만원");

    expect(airconType.type).toBe("wall-mount");
    expect(cleaningMethod.type).toBe("disassembly");
    expect(price.min).toBe(50_000);
    expect(price.max).toBe(70_000);

    // 모두 높은 신뢰도
    expect(airconType.confidence).toBeGreaterThanOrEqual(0.8);
    expect(cleaningMethod.confidence).toBeGreaterThanOrEqual(0.8);
    expect(price.confidence).toBeGreaterThanOrEqual(0.8);
  });

  test("실제 크롤링 시나리오: 부분 정규화 실패", () => {
    // 가격만 파싱 실패하는 경우
    const airconType = normalizeAirconType("스탠드 에어컨");
    const cleaningMethod = normalizeCleaningType("완전분해 세척");
    const price = normalizePrice("가격 문의");

    expect(airconType.type).toBe("standing");
    expect(cleaningMethod.type).toBe("complete-disassembly");
    expect(price.min).toBeNull();
    expect(price.error).toBeTruthy();
  });
});
