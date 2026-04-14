/**
 * 에어컨 유형 정규화 모듈 테스트
 *
 * 크롤링 데이터의 다양한 표현이 올바른 표준 카테고리로 매핑되는지 검증한다.
 */

import {
  normalizeAirconType,
  matchAirconTypeFromText,
  batchNormalizeAirconTypes,
  getKeywordsForType,
  getMappingCoverage,
  addCustomKeywords,
} from "../aircon-type-normalizer";

// ─────────────────────────────────────────────
// 1. 벽걸이 (wall-mount) 매핑 테스트
// ─────────────────────────────────────────────

describe("벽걸이 에어컨 정규화", () => {
  const wallMountInputs = [
    // 정확 매칭
    "벽걸이",
    "벽걸이형",
    "벽걸이 에어컨",
    "벽걸이형 에어컨",
    "벽걸이에어컨",
    // 오타 변형
    "벽결이",
    "벽결이형",
    "벽결이 에어컨",
    "벽겔이",
    // 영어
    "wall-mounted",
    "wall-mount",
    "Wall Mount",
    "WALL MOUNTED",
  ];

  test.each(wallMountInputs)('"%s" → wall-mount', (input) => {
    const result = normalizeAirconType(input);
    expect(result.type).toBe("wall-mount");
    expect(result.confidence).toBeGreaterThan(0);
  });

  test("패턴 매칭: 브랜드명 포함", () => {
    const result = normalizeAirconType("삼성 벽걸이형 에어컨 분해청소");
    expect(result.type).toBe("wall-mount");
    expect(result.matchMethod).toBe("pattern");
  });

  test("패턴 매칭: 블로그 스타일 텍스트", () => {
    const result = normalizeAirconType("LG 휘센 벽걸이 에어컨 청소 후기");
    expect(result.type).toBe("wall-mount");
  });
});

// ─────────────────────────────────────────────
// 2. 스탠드 (standing) 매핑 테스트
// ─────────────────────────────────────────────

describe("스탠드 에어컨 정규화", () => {
  const standingInputs = [
    "스탠드",
    "스탠드형",
    "스탠드 에어컨",
    "스탠드형 에어컨",
    // 오타
    "스텐드",
    "스텐드형",
    "스텐드 에어컨",
    // 동의어
    "타워형",
    "타워",
    "타워형 에어컨",
    "거실형",
    "거실 에어컨",
    // 영어
    "standing",
    "tower",
    "floor standing",
  ];

  test.each(standingInputs)('"%s" → standing', (input) => {
    const result = normalizeAirconType(input);
    expect(result.type).toBe("standing");
    expect(result.confidence).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 3. 천장형 (ceiling) 매핑 테스트
// ─────────────────────────────────────────────

describe("천장형 에어컨 정규화", () => {
  const ceilingInputs = [
    "천장형",
    "천장형 에어컨",
    "천장 에어컨",
    // 비표준 표기
    "천정형",
    "천정형 에어컨",
    "천정 에어컨",
    // 동의어
    "카세트",
    "카세트형",
    "카세트 에어컨",
    "매립형",
    "천장 매립",
    "4way",
    "2way",
    "포웨이",
    // 영어
    "ceiling",
    "cassette",
    "cassette type",
  ];

  test.each(ceilingInputs)('"%s" → ceiling', (input) => {
    const result = normalizeAirconType(input);
    expect(result.type).toBe("ceiling");
    expect(result.confidence).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 4. 시스템 (system) 매핑 테스트
// ─────────────────────────────────────────────

describe("시스템 에어컨 정규화", () => {
  const systemInputs = [
    "시스템",
    "시스템형",
    "시스템 에어컨",
    "시스템형 에어컨",
    // 동의어
    "멀티",
    "멀티형",
    "멀티 에어컨",
    "멀티스플릿",
    "빌트인",
    "빌트인 에어컨",
    "빌트인형",
    // 영어
    "system",
    "multi-split",
    "multi split",
    "built-in",
  ];

  test.each(systemInputs)('"%s" → system', (input) => {
    const result = normalizeAirconType(input);
    expect(result.type).toBe("system");
    expect(result.confidence).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 5. 창문형 (window) 매핑 테스트
// ─────────────────────────────────────────────

describe("창문형 에어컨 정규화", () => {
  const windowInputs = [
    "창문형",
    "창문형 에어컨",
    "창문 에어컨",
    // 동의어
    "일체형",
    "일체형 에어컨",
    "이동식",
    "이동식 에어컨",
    "포터블",
    "포터블 에어컨",
    // 영어
    "window",
    "window type",
    "portable",
  ];

  test.each(windowInputs)('"%s" → window', (input) => {
    const result = normalizeAirconType(input);
    expect(result.type).toBe("window");
    expect(result.confidence).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 6. 매칭 실패 케이스
// ─────────────────────────────────────────────

describe("매칭 실패 케이스", () => {
  test("빈 문자열", () => {
    const result = normalizeAirconType("");
    expect(result.type).toBeNull();
    expect(result.confidence).toBe(0);
    expect(result.matchMethod).toBe("none");
  });

  test("공백만 있는 문자열", () => {
    const result = normalizeAirconType("   ");
    expect(result.type).toBeNull();
  });

  test("관련 없는 텍스트", () => {
    expect(normalizeAirconType("가습기 청소").type).toBeNull();
    expect(normalizeAirconType("보일러 수리").type).toBeNull();
    expect(normalizeAirconType("냉장고").type).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 7. 신뢰도 테스트
// ─────────────────────────────────────────────

describe("신뢰도(confidence) 레벨", () => {
  test("정확 매칭은 confidence 1.0", () => {
    const result = normalizeAirconType("벽걸이 에어컨");
    expect(result.confidence).toBe(1.0);
    expect(result.matchMethod).toBe("exact");
  });

  test("패턴 매칭은 confidence 0.8 이하", () => {
    const result = normalizeAirconType("삼성 벽걸이형 2024년 모델");
    expect(result.type).toBe("wall-mount");
    expect(result.confidence).toBeLessThanOrEqual(0.8);
    expect(result.matchMethod).toBe("pattern");
  });
});

// ─────────────────────────────────────────────
// 8. 간편 함수 테스트
// ─────────────────────────────────────────────

describe("matchAirconTypeFromText (간편 함수)", () => {
  test("성공 시 유형 코드 반환", () => {
    expect(matchAirconTypeFromText("벽걸이")).toBe("wall-mount");
    expect(matchAirconTypeFromText("스탠드")).toBe("standing");
    expect(matchAirconTypeFromText("천장형")).toBe("ceiling");
    expect(matchAirconTypeFromText("시스템")).toBe("system");
    expect(matchAirconTypeFromText("창문형")).toBe("window");
  });

  test("실패 시 null 반환", () => {
    expect(matchAirconTypeFromText("")).toBeNull();
    expect(matchAirconTypeFromText("알 수 없는 유형")).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 9. 배치 정규화 테스트
// ─────────────────────────────────────────────

describe("batchNormalizeAirconTypes", () => {
  test("복수 텍스트 일괄 처리", () => {
    const result = batchNormalizeAirconTypes([
      "벽걸이 에어컨",
      "스탠드형",
      "알 수 없는 유형",
      "천장형 에어컨",
    ]);

    expect(result.successCount).toBe(3);
    expect(result.failureCount).toBe(1);
    expect(result.successRate).toBeCloseTo(0.75);
    expect(result.results).toHaveLength(4);
    expect(result.results[0].type).toBe("wall-mount");
    expect(result.results[1].type).toBe("standing");
    expect(result.results[2].type).toBeNull();
    expect(result.results[3].type).toBe("ceiling");
  });

  test("빈 배열", () => {
    const result = batchNormalizeAirconTypes([]);
    expect(result.successCount).toBe(0);
    expect(result.failureCount).toBe(0);
    expect(result.successRate).toBe(0);
    expect(result.results).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────
// 10. 유틸리티 함수 테스트
// ─────────────────────────────────────────────

describe("유틸리티 함수", () => {
  test("getKeywordsForType: 키워드 목록 반환", () => {
    const keywords = getKeywordsForType("wall-mount");
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords).toContain("벽걸이");
    expect(keywords).toContain("wall-mounted");
  });

  test("getMappingCoverage: 모든 유형에 대한 커버리지", () => {
    const coverage = getMappingCoverage();
    expect(coverage["wall-mount"]).toBeGreaterThan(0);
    expect(coverage["standing"]).toBeGreaterThan(0);
    expect(coverage["ceiling"]).toBeGreaterThan(0);
    expect(coverage["system"]).toBeGreaterThan(0);
    expect(coverage["window"]).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 11. 실제 크롤링 데이터 시뮬레이션
// ─────────────────────────────────────────────

describe("실제 크롤링 데이터 시나리오", () => {
  test("숨고 스타일 텍스트", () => {
    expect(matchAirconTypeFromText("벽걸이 에어컨 청소")).toBe("wall-mount");
    expect(matchAirconTypeFromText("스탠드형 에어컨 분해청소")).toBe("standing");
    expect(matchAirconTypeFromText("천장형(카세트) 에어컨 청소")).toBe("ceiling");
    expect(matchAirconTypeFromText("시스템 에어컨 청소")).toBe("system");
  });

  test("당근마켓 스타일 텍스트", () => {
    expect(matchAirconTypeFromText("벽걸이에어컨 청소 해드려요")).toBe("wall-mount");
    expect(matchAirconTypeFromText("거실 스탠드 에어컨")).toBe("standing");
  });

  test("블로그 스타일 텍스트", () => {
    expect(matchAirconTypeFromText("우리집 벽걸이 에어컨 청소 후기")).toBe("wall-mount");
    expect(matchAirconTypeFromText("신축 아파트 시스템 에어컨 청소")).toBe("system");
    expect(matchAirconTypeFromText("빌트인 에어컨 분해청소 가격")).toBe("system");
  });

  test("업체 사이트 스타일 텍스트", () => {
    expect(matchAirconTypeFromText("Wall-Mounted AC Cleaning")).toBe("wall-mount");
    expect(matchAirconTypeFromText("Ceiling Cassette Type")).toBe("ceiling");
  });

  test("특수문자가 포함된 텍스트", () => {
    expect(matchAirconTypeFromText("벽걸이(분해)")).toBe("wall-mount");
    expect(matchAirconTypeFromText("[천장형] 에어컨")).toBe("ceiling");
    expect(matchAirconTypeFromText("스탠드/타워형")).toBe("standing");
  });
});

// ─────────────────────────────────────────────
// 12. 동적 키워드 추가 테스트
// ─────────────────────────────────────────────

describe("addCustomKeywords", () => {
  test("커스텀 키워드 추가 후 매칭", () => {
    // 기존에 매칭되지 않는 키워드
    const before = matchAirconTypeFromText("미니에어컨");

    // 커스텀 키워드 추가
    addCustomKeywords("window", ["미니에어컨", "미니 에어컨"]);

    // 추가 후 매칭 확인
    const after = matchAirconTypeFromText("미니에어컨");
    expect(after).toBe("window");
  });
});
