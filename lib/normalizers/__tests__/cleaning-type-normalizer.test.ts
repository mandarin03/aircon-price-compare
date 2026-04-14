/**
 * 서비스 유형(청소 방식) 정규화 모듈 테스트
 *
 * 크롤링 데이터의 다양한 청소 방식 표현이 올바른 표준 카테고리로 매핑되는지 검증한다.
 * 표준 카테고리: 일반세척(general), 분해세척(disassembly), 완전분해세척(complete-disassembly)
 */

import {
  normalizeCleaningType,
  matchCleaningTypeFromText,
  batchNormalizeCleaningTypes,
  getCleaningKeywordsForType,
  getCleaningMappingCoverage,
  addCleaningCustomKeywords,
} from "../cleaning-type-normalizer";

// ─────────────────────────────────────────────
// 1. 일반세척 (general) 매핑 테스트
// ─────────────────────────────────────────────

describe("일반세척 (general) 정규화", () => {
  const generalInputs = [
    // 정확 매칭 - 일반/기본
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
    // 스팀
    "스팀",
    "스팀세척",
    "스팀 세척",
    "스팀청소",
    "스팀 청소",
    // 고압
    "고압세척",
    "고압 세척",
    // 외부
    "외부세척",
    "외부 세척",
    // 영어
    "general",
    "basic",
    "standard",
    "steam",
    "non-disassembly",
  ];

  test.each(generalInputs)('"%s" → general', (input) => {
    const result = normalizeCleaningType(input);
    expect(result.type).toBe("general");
    expect(result.confidence).toBeGreaterThan(0);
  });

  test("패턴 매칭: 추가 텍스트 포함", () => {
    const result = normalizeCleaningType("벽걸이 에어컨 일반 세척 서비스");
    expect(result.type).toBe("general");
    expect(result.matchMethod).toBe("pattern");
  });

  test("패턴 매칭: 스팀 관련 표현", () => {
    expect(normalizeCleaningType("고압 스팀 세척").type).toBe("general");
    expect(normalizeCleaningType("스팀 클리닝").type).toBe("general");
  });
});

// ─────────────────────────────────────────────
// 2. 분해세척 (disassembly) 매핑 테스트
// ─────────────────────────────────────────────

describe("분해세척 (disassembly) 정규화", () => {
  const disassemblyInputs = [
    // 정확 매칭
    "분해세척",
    "분해 세척",
    "분해청소",
    "분해 청소",
    // 반분해 / 부분분해
    "반분해",
    "반분해세척",
    "부분분해",
    "부분분해세척",
    "부분 분해",
    // 영어
    "disassembly",
    "partial disassembly",
  ];

  test.each(disassemblyInputs)('"%s" → disassembly', (input) => {
    const result = normalizeCleaningType(input);
    expect(result.type).toBe("disassembly");
    expect(result.confidence).toBeGreaterThan(0);
  });

  test("패턴 매칭: 브랜드명 포함", () => {
    const result = normalizeCleaningType("삼성 벽걸이 분해 청소 서비스");
    expect(result.type).toBe("disassembly");
  });

  test("'분해'만 있고 '완전/전체/풀'이 없는 경우 disassembly", () => {
    expect(normalizeCleaningType("에어컨 분해 청소해드립니다").type).toBe(
      "disassembly",
    );
  });
});

// ─────────────────────────────────────────────
// 3. 완전분해세척 (complete-disassembly) 매핑 테스트
// ─────────────────────────────────────────────

describe("완전분해세척 (complete-disassembly) 정규화", () => {
  const completeDisassemblyInputs = [
    // 완전분해
    "완전분해",
    "완전분해세척",
    "완전분해 세척",
    "완전 분해 세척",
    "완전분해청소",
    "완전분해 청소",
    "완전 분해 청소",
    // 전체분해
    "전체분해",
    "전체분해세척",
    "전체 분해 세척",
    // 풀분해
    "풀분해",
    "풀분해세척",
    "풀 분해 세척",
    // 오버홀
    "오버홀",
    "오버홀 세척",
    "오버홀청소",
    // 영어
    "complete disassembly",
    "complete-disassembly",
    "full disassembly",
    "overhaul",
  ];

  test.each(completeDisassemblyInputs)(
    '"%s" → complete-disassembly',
    (input) => {
      const result = normalizeCleaningType(input);
      expect(result.type).toBe("complete-disassembly");
      expect(result.confidence).toBeGreaterThan(0);
    },
  );

  test("패턴 매칭: 완전분해 관련 표현 포함", () => {
    expect(normalizeCleaningType("벽걸이 완전분해 청소 후기").type).toBe(
      "complete-disassembly",
    );
    expect(normalizeCleaningType("스탠드 에어컨 풀분해 세척").type).toBe(
      "complete-disassembly",
    );
    expect(normalizeCleaningType("에어컨 오버홀 전문업체").type).toBe(
      "complete-disassembly",
    );
  });
});

// ─────────────────────────────────────────────
// 4. 완전분해 vs 분해 우선순위 테스트
// ─────────────────────────────────────────────

describe("완전분해 vs 분해 우선순위", () => {
  test('"완전분해"는 complete-disassembly (분해 아님)', () => {
    expect(matchCleaningTypeFromText("완전분해")).toBe("complete-disassembly");
  });

  test('"전체분해"는 complete-disassembly (분해 아님)', () => {
    expect(matchCleaningTypeFromText("전체분해")).toBe("complete-disassembly");
  });

  test('"풀분해"는 complete-disassembly (분해 아님)', () => {
    expect(matchCleaningTypeFromText("풀분해")).toBe("complete-disassembly");
  });

  test('"분해"만 있으면 disassembly', () => {
    expect(matchCleaningTypeFromText("분해세척")).toBe("disassembly");
    expect(matchCleaningTypeFromText("분해 청소")).toBe("disassembly");
  });

  test('"완전분해세척"과 "분해세척" 구분', () => {
    expect(matchCleaningTypeFromText("완전분해세척")).toBe(
      "complete-disassembly",
    );
    expect(matchCleaningTypeFromText("분해세척")).toBe("disassembly");
  });
});

// ─────────────────────────────────────────────
// 5. 매칭 실패 케이스 (unknown)
// ─────────────────────────────────────────────

describe("매칭 실패 케이스 (unknown)", () => {
  test("빈 문자열", () => {
    const result = normalizeCleaningType("");
    expect(result.type).toBe("unknown");
    expect(result.confidence).toBe(0);
    expect(result.matchMethod).toBe("none");
  });

  test("공백만 있는 문자열", () => {
    expect(normalizeCleaningType("   ").type).toBe("unknown");
  });

  test("관련 없는 텍스트", () => {
    expect(normalizeCleaningType("가격 문의").type).toBe("unknown");
    expect(normalizeCleaningType("배송 안내").type).toBe("unknown");
  });
});

// ─────────────────────────────────────────────
// 6. 신뢰도 테스트
// ─────────────────────────────────────────────

describe("신뢰도(confidence) 레벨", () => {
  test("정확 매칭은 confidence 1.0", () => {
    const result = normalizeCleaningType("분해세척");
    expect(result.confidence).toBe(1.0);
    expect(result.matchMethod).toBe("exact");
  });

  test("패턴 매칭은 confidence 0.8", () => {
    const result = normalizeCleaningType("삼성 벽걸이 분해 청소 후기");
    expect(result.type).toBe("disassembly");
    expect(result.confidence).toBe(0.8);
    expect(result.matchMethod).toBe("pattern");
  });

  test("부수 키워드 제거 후 매칭은 confidence 0.6~0.7", () => {
    // 부수 키워드 제거 후 매칭되는 케이스
    const result = normalizeCleaningType("삼성 에어컨 스팀");
    expect(result.type).toBe("general");
    expect(result.confidence).toBeLessThanOrEqual(0.8);
  });

  test("매칭 실패는 confidence 0", () => {
    const result = normalizeCleaningType("알 수 없는 표현");
    expect(result.confidence).toBe(0);
  });
});

// ─────────────────────────────────────────────
// 7. 간편 함수 테스트
// ─────────────────────────────────────────────

describe("matchCleaningTypeFromText (간편 함수)", () => {
  test("각 카테고리 정상 매핑", () => {
    expect(matchCleaningTypeFromText("일반세척")).toBe("general");
    expect(matchCleaningTypeFromText("분해세척")).toBe("disassembly");
    expect(matchCleaningTypeFromText("완전분해세척")).toBe(
      "complete-disassembly",
    );
  });

  test("매칭 실패 시 unknown 반환", () => {
    expect(matchCleaningTypeFromText("")).toBe("unknown");
    expect(matchCleaningTypeFromText("알 수 없는 유형")).toBe("unknown");
  });
});

// ─────────────────────────────────────────────
// 8. 배치 정규화 테스트
// ─────────────────────────────────────────────

describe("batchNormalizeCleaningTypes", () => {
  test("복수 텍스트 일괄 처리", () => {
    const result = batchNormalizeCleaningTypes([
      "일반세척",
      "분해 청소",
      "완전분해 세척",
      "알 수 없음",
    ]);

    expect(result.successCount).toBe(3);
    expect(result.failureCount).toBe(1);
    expect(result.successRate).toBeCloseTo(0.75);
    expect(result.results).toHaveLength(4);
    expect(result.results[0].type).toBe("general");
    expect(result.results[1].type).toBe("disassembly");
    expect(result.results[2].type).toBe("complete-disassembly");
    expect(result.results[3].type).toBe("unknown");
  });

  test("카테고리별 건수 집계", () => {
    const result = batchNormalizeCleaningTypes([
      "스팀세척",
      "일반청소",
      "분해청소",
      "완전분해",
      "오버홀",
      "???",
    ]);

    expect(result.categoryCounts["general"]).toBe(2);
    expect(result.categoryCounts["disassembly"]).toBe(1);
    expect(result.categoryCounts["complete-disassembly"]).toBe(2);
    expect(result.categoryCounts["unknown"]).toBe(1);
  });

  test("빈 배열", () => {
    const result = batchNormalizeCleaningTypes([]);
    expect(result.successCount).toBe(0);
    expect(result.failureCount).toBe(0);
    expect(result.successRate).toBe(0);
    expect(result.results).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────
// 9. 유틸리티 함수 테스트
// ─────────────────────────────────────────────

describe("유틸리티 함수", () => {
  test("getCleaningKeywordsForType: 키워드 목록 반환", () => {
    const keywords = getCleaningKeywordsForType("general");
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords).toContain("일반세척");
    expect(keywords).toContain("스팀세척");
  });

  test("getCleaningKeywordsForType: complete-disassembly 키워드", () => {
    const keywords = getCleaningKeywordsForType("complete-disassembly");
    expect(keywords).toContain("완전분해");
    expect(keywords).toContain("전체분해");
    expect(keywords).toContain("풀분해");
    expect(keywords).toContain("오버홀");
  });

  test("getCleaningKeywordsForType: unknown은 빈 배열", () => {
    const keywords = getCleaningKeywordsForType("unknown");
    expect(keywords).toHaveLength(0);
  });

  test("getCleaningMappingCoverage: 모든 유형에 대한 커버리지", () => {
    const coverage = getCleaningMappingCoverage();
    expect(coverage["general"]).toBeGreaterThan(0);
    expect(coverage["disassembly"]).toBeGreaterThan(0);
    expect(coverage["complete-disassembly"]).toBeGreaterThan(0);
    expect(coverage["unknown"]).toBe(0);
  });
});

// ─────────────────────────────────────────────
// 10. 실제 크롤링 데이터 시뮬레이션
// ─────────────────────────────────────────────

describe("실제 크롤링 데이터 시나리오", () => {
  test("숨고 스타일 텍스트", () => {
    expect(matchCleaningTypeFromText("에어컨 분해청소")).toBe("disassembly");
    expect(matchCleaningTypeFromText("에어컨 완전분해 세척")).toBe(
      "complete-disassembly",
    );
    expect(matchCleaningTypeFromText("에어컨 일반 청소")).toBe("general");
  });

  test("당근마켓 스타일 텍스트", () => {
    expect(matchCleaningTypeFromText("에어컨 분해 청소 해드려요")).toBe(
      "disassembly",
    );
    expect(matchCleaningTypeFromText("스팀 세척으로 깨끗하게")).toBe("general");
    expect(matchCleaningTypeFromText("완전분해 세척 전문")).toBe(
      "complete-disassembly",
    );
  });

  test("블로그 스타일 텍스트", () => {
    expect(matchCleaningTypeFromText("에어컨 풀분해 세척 후기")).toBe(
      "complete-disassembly",
    );
    expect(matchCleaningTypeFromText("오버홀 세척 경험담")).toBe(
      "complete-disassembly",
    );
    expect(matchCleaningTypeFromText("에어컨 비분해 세척 비교")).toBe(
      "general",
    );
  });

  test("업체 사이트 스타일 텍스트", () => {
    expect(matchCleaningTypeFromText("Complete Disassembly Cleaning")).toBe(
      "complete-disassembly",
    );
    expect(matchCleaningTypeFromText("Steam Cleaning Service")).toBe(
      "general",
    );
  });

  test("특수문자가 포함된 텍스트", () => {
    expect(matchCleaningTypeFromText("분해(세척)")).toBe("disassembly");
    expect(matchCleaningTypeFromText("[완전분해] 세척")).toBe(
      "complete-disassembly",
    );
    expect(matchCleaningTypeFromText("일반/스팀 세척")).toBe("general");
  });
});

// ─────────────────────────────────────────────
// 11. 동적 키워드 추가 테스트
// ─────────────────────────────────────────────

describe("addCleaningCustomKeywords", () => {
  test("커스텀 키워드 추가 후 매칭", () => {
    // "딥클린"은 기존에 매핑되지 않음
    const before = matchCleaningTypeFromText("딥클린");
    expect(before).toBe("unknown");

    // 커스텀 키워드 추가
    addCleaningCustomKeywords("complete-disassembly", [
      "딥클린",
      "딥 클린",
    ]);

    // 추가 후 매칭 확인
    expect(matchCleaningTypeFromText("딥클린")).toBe("complete-disassembly");
  });
});

// ─────────────────────────────────────────────
// 12. 동의어/유사 표현 통합 테스트
// ─────────────────────────────────────────────

describe("동의어/유사 표현 통합", () => {
  describe("일반세척 동의어", () => {
    test("비분해 계열 → general", () => {
      expect(matchCleaningTypeFromText("비분해")).toBe("general");
      expect(matchCleaningTypeFromText("비분해청소")).toBe("general");
      expect(matchCleaningTypeFromText("비분해 세척")).toBe("general");
    });

    test("스팀/고압 계열 → general", () => {
      expect(matchCleaningTypeFromText("스팀")).toBe("general");
      expect(matchCleaningTypeFromText("스팀청소")).toBe("general");
      expect(matchCleaningTypeFromText("고압세척")).toBe("general");
      expect(matchCleaningTypeFromText("고압 청소")).toBe("general");
    });

    test("외부/약품 계열 → general", () => {
      expect(matchCleaningTypeFromText("외부세척")).toBe("general");
      expect(matchCleaningTypeFromText("약품세척")).toBe("general");
    });
  });

  describe("완전분해 동의어", () => {
    test("완전/전체/풀 분해 계열 → complete-disassembly", () => {
      expect(matchCleaningTypeFromText("완전 분해")).toBe(
        "complete-disassembly",
      );
      expect(matchCleaningTypeFromText("전체 분해")).toBe(
        "complete-disassembly",
      );
      expect(matchCleaningTypeFromText("풀 분해")).toBe(
        "complete-disassembly",
      );
    });

    test("오버홀 계열 → complete-disassembly", () => {
      expect(matchCleaningTypeFromText("오버홀")).toBe("complete-disassembly");
      expect(matchCleaningTypeFromText("에어컨 오버홀")).toBe(
        "complete-disassembly",
      );
    });
  });
});
