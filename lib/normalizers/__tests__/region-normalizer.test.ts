/**
 * 지역 정규화 모듈 테스트
 *
 * 크롤링 데이터의 다양한 지역 표현이 올바른 표준 지역 코드로 매핑되는지 검증한다.
 * 테스트 카테고리:
 * 1. 정식명칭 매칭
 * 2. 약칭 매칭
 * 3. 시/도 + 구/시/군 조합 매칭
 * 4. 영어 슬러그 매칭
 * 5. 오타/비표준 표기 처리
 * 6. 불필요 단어 제거 후 매칭
 * 7. 퍼지 매칭 (레벤슈타인)
 * 8. 경기도 하위 행정구역 (분당, 일산 등) 매칭
 * 9. 모호한 입력 (광주 등)
 * 10. 배치 정규화
 * 11. 엣지 케이스
 */

import {
  normalizeRegion,
  matchRegionFromText,
  batchNormalizeRegions,
  getAliasesForDistrict,
  getRegionMappingCoverage,
  addRegionCustomAliases,
  normalizeRegionWithGyeonggiContext,
} from "../region-normalizer";

// ─────────────────────────────────────────────
// 1. 서울 구 정식명칭 매칭
// ─────────────────────────────────────────────

describe("서울 구 정식명칭 매칭", () => {
  const seoulDistricts: [string, string][] = [
    ["강남구", "gangnam"],
    ["강동구", "gangdong"],
    ["강북구", "gangbuk"],
    ["강서구", "gangseo"],
    ["관악구", "gwanak"],
    ["광진구", "gwangjin"],
    ["구로구", "guro"],
    ["금천구", "geumcheon"],
    ["노원구", "nowon"],
    ["도봉구", "dobong"],
    ["동대문구", "dongdaemun"],
    ["동작구", "dongjak"],
    ["마포구", "mapo"],
    ["서대문구", "seodaemun"],
    ["서초구", "seocho"],
    ["성동구", "seongdong"],
    ["성북구", "seongbuk"],
    ["송파구", "songpa"],
    ["양천구", "yangcheon"],
    ["영등포구", "yeongdeungpo"],
    ["용산구", "yongsan"],
    ["은평구", "eunpyeong"],
    ["종로구", "jongno"],
    ["중구", "jung"],
    ["중랑구", "jungnang"],
  ];

  test.each(seoulDistricts)('"%s" → seoul/%s', (input, expectedSlug) => {
    const result = normalizeRegion(input);
    expect(result.city).toBe("seoul");
    expect(result.district).toBe(expectedSlug);
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });
});

// ─────────────────────────────────────────────
// 2. 경기도 시/군 정식명칭 매칭
// ─────────────────────────────────────────────

describe("경기도 시/군 정식명칭 매칭", () => {
  const gyeonggiDistricts: [string, string][] = [
    ["수원시", "suwon"],
    ["성남시", "seongnam"],
    ["고양시", "goyang"],
    ["용인시", "yongin"],
    ["부천시", "bucheon"],
    ["안산시", "ansan"],
    ["안양시", "anyang"],
    ["남양주시", "namyangju"],
    ["화성시", "hwaseong"],
    ["평택시", "pyeongtaek"],
    ["의정부시", "uijeongbu"],
    ["시흥시", "siheung"],
    ["파주시", "paju"],
    ["김포시", "gimpo"],
    ["광명시", "gwangmyeong"],
    ["군포시", "gunpo"],
    ["하남시", "hanam"],
    ["오산시", "osan"],
    ["이천시", "icheon"],
    ["안성시", "anseong"],
    ["의왕시", "uiwang"],
    ["양주시", "yangju"],
    ["포천시", "pocheon"],
    ["여주시", "yeoju"],
    ["동두천시", "dongducheon"],
    ["과천시", "gwacheon"],
    ["구리시", "guri"],
    ["양평군", "yangpyeong"],
    ["가평군", "gapyeong"],
    ["연천군", "yeoncheon"],
  ];

  test.each(gyeonggiDistricts)('"%s" → gyeonggi/%s', (input, expectedSlug) => {
    const result = normalizeRegion(input);
    expect(result.city).toBe("gyeonggi");
    expect(result.district).toBe(expectedSlug);
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });
});

// ─────────────────────────────────────────────
// 3. 약칭 매칭 (접미어 생략)
// ─────────────────────────────────────────────

describe("약칭 매칭", () => {
  test.each([
    ["강남", "seoul", "gangnam"],
    ["마포", "seoul", "mapo"],
    ["송파", "seoul", "songpa"],
    ["수원", "gyeonggi", "suwon"],
    ["부천", "gyeonggi", "bucheon"],
    ["파주", "gyeonggi", "paju"],
    ["양평", "gyeonggi", "yangpyeong"],
    ["가평", "gyeonggi", "gapyeong"],
  ])('"%s" → %s/%s', (input, expectedCity, expectedSlug) => {
    const result = normalizeRegion(input);
    expect(result.city).toBe(expectedCity);
    expect(result.district).toBe(expectedSlug);
    expect(result.confidence).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 4. 시/도 + 구/시/군 조합 매칭
// ─────────────────────────────────────────────

describe("시/도 + 구/시/군 조합 매칭", () => {
  test.each([
    ["서울특별시 강남구", "seoul", "gangnam"],
    ["서울시 마포구", "seoul", "mapo"],
    ["서울 송파구", "seoul", "songpa"],
    ["서울 강남", "seoul", "gangnam"],
    ["경기도 수원시", "gyeonggi", "suwon"],
    ["경기 성남시", "gyeonggi", "seongnam"],
    ["경기 부천", "gyeonggi", "bucheon"],
  ])('"%s" → %s/%s', (input, expectedCity, expectedSlug) => {
    const result = normalizeRegion(input);
    expect(result.city).toBe(expectedCity);
    expect(result.district).toBe(expectedSlug);
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
  });
});

// ─────────────────────────────────────────────
// 5. 영어 슬러그 매칭
// ─────────────────────────────────────────────

describe("영어 슬러그 매칭", () => {
  test.each([
    ["gangnam", "seoul", "gangnam"],
    ["gangnam-gu", "seoul", "gangnam"],
    ["Gangnam-gu", "seoul", "gangnam"],
    ["suwon", "gyeonggi", "suwon"],
    ["suwon-si", "gyeonggi", "suwon"],
    ["mapo", "seoul", "mapo"],
    ["mapo-gu", "seoul", "mapo"],
    ["yongin", "gyeonggi", "yongin"],
  ])('"%s" → %s/%s', (input, expectedCity, expectedSlug) => {
    const result = normalizeRegion(input);
    expect(result.city).toBe(expectedCity);
    expect(result.district).toBe(expectedSlug);
    expect(result.confidence).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 6. 구식 로마자 / 오타 영어 매칭
// ─────────────────────────────────────────────

describe("오타/비표준 영어 매칭", () => {
  test.each([
    ["kangnam", "seoul", "gangnam"],
    ["kimpo", "gyeonggi", "gimpo"],
    ["buchon", "gyeonggi", "bucheon"],
  ])('"%s" → %s/%s', (input, expectedCity, expectedSlug) => {
    const result = normalizeRegion(input);
    expect(result.city).toBe(expectedCity);
    expect(result.district).toBe(expectedSlug);
    expect(result.confidence).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 7. 한글 오타 처리
// ─────────────────────────────────────────────

describe("한글 오타 처리", () => {
  test.each([
    ["동데문구", "seoul", "dongdaemun"],
    ["서데문구", "seoul", "seodaemun"],
  ])('"%s" → %s/%s', (input, expectedCity, expectedSlug) => {
    const result = normalizeRegion(input);
    expect(result.city).toBe(expectedCity);
    expect(result.district).toBe(expectedSlug);
    expect(result.confidence).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 8. 불필요 단어 제거 후 매칭
// ─────────────────────────────────────────────

describe("불필요 단어 제거 후 매칭", () => {
  test.each([
    ["강남구 에어컨 청소", "seoul", "gangnam"],
    ["수원시 에어컨 청소 업체", "gyeonggi", "suwon"],
    ["마포구 에어컨 세척 추천", "seoul", "mapo"],
    ["서울 강남 에어컨 분해 클리닝", "seoul", "gangnam"],
  ])('"%s" → %s/%s', (input, expectedCity, expectedSlug) => {
    const result = normalizeRegion(input);
    expect(result.city).toBe(expectedCity);
    expect(result.district).toBe(expectedSlug);
    expect(result.confidence).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 9. 경기도 하위 행정구역 (분당, 일산, 판교 등) 매칭
// ─────────────────────────────────────────────

describe("경기도 하위 행정구역 매칭", () => {
  test.each([
    ["분당", "gyeonggi", "seongnam"],
    ["분당구", "gyeonggi", "seongnam"],
    ["판교", "gyeonggi", "seongnam"],
    ["일산", "gyeonggi", "goyang"],
    ["동탄", "gyeonggi", "hwaseong"],
    ["수지", "gyeonggi", "yongin"],
    ["기흥", "gyeonggi", "yongin"],
  ])('"%s" → %s/%s', (input, expectedCity, expectedSlug) => {
    const result = normalizeRegion(input);
    expect(result.city).toBe(expectedCity);
    expect(result.district).toBe(expectedSlug);
    expect(result.confidence).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 10. 모호한 입력 (광주)
// ─────────────────────────────────────────────

describe("모호한 입력 처리", () => {
  test("경기광주 → gyeonggi/gwangju", () => {
    const result = normalizeRegion("경기광주");
    expect(result.city).toBe("gyeonggi");
    expect(result.district).toBe("gwangju");
  });

  test("경기 광주 → gyeonggi/gwangju", () => {
    const result = normalizeRegion("경기 광주");
    expect(result.city).toBe("gyeonggi");
    expect(result.district).toBe("gwangju");
  });

  test("normalizeRegionWithGyeonggiContext: 광주 → gyeonggi/gwangju", () => {
    const result = normalizeRegionWithGyeonggiContext("광주");
    expect(result.city).toBe("gyeonggi");
    expect(result.district).toBe("gwangju");
  });
});

// ─────────────────────────────────────────────
// 11. 시/도만 매칭
// ─────────────────────────────────────────────

describe("시/도만 매칭", () => {
  test("서울 → city only", () => {
    const result = normalizeRegion("서울");
    expect(result.city).toBe("seoul");
    expect(result.district).toBeNull();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThan(0.5);
  });

  test("경기도 → city only", () => {
    const result = normalizeRegion("경기도");
    expect(result.city).toBe("gyeonggi");
    expect(result.district).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 12. 매칭 실패
// ─────────────────────────────────────────────

describe("매칭 실패", () => {
  test.each([
    "",
    "   ",
    "부산",
    "대전광역시",
    "에어컨 청소",
    "알 수 없음",
    "가나다라",
  ])('"%s" → 매칭 실패', (input) => {
    const result = normalizeRegion(input);
    expect(result.district).toBeNull();
    expect(result.matchMethod === "none" || result.confidence === 0).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 13. 간편 함수 matchRegionFromText
// ─────────────────────────────────────────────

describe("matchRegionFromText", () => {
  test("성공 시 { city, district } 반환", () => {
    const result = matchRegionFromText("서울 강남구");
    expect(result).toEqual({ city: "seoul", district: "gangnam" });
  });

  test("실패 시 null 반환", () => {
    expect(matchRegionFromText("부산")).toBeNull();
  });

  test("시/도만 매칭된 경우 null 반환 (district 필수)", () => {
    expect(matchRegionFromText("서울")).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 14. 배치 정규화
// ─────────────────────────────────────────────

describe("batchNormalizeRegions", () => {
  test("정상 배치 처리", () => {
    const result = batchNormalizeRegions([
      "서울 강남구",
      "경기 수원시",
      "알 수 없음",
      "마포구",
    ]);

    expect(result.successCount).toBe(3);
    expect(result.failureCount).toBe(1);
    expect(result.successRate).toBeCloseTo(0.75);
    expect(result.results).toHaveLength(4);
  });

  test("빈 배열", () => {
    const result = batchNormalizeRegions([]);
    expect(result.successCount).toBe(0);
    expect(result.failureCount).toBe(0);
    expect(result.successRate).toBe(0);
  });
});

// ─────────────────────────────────────────────
// 15. 유틸리티 함수
// ─────────────────────────────────────────────

describe("유틸리티 함수", () => {
  test("getAliasesForDistrict: 존재하는 슬러그", () => {
    const result = getAliasesForDistrict("gangnam");
    expect(result).not.toBeNull();
    expect(result!.name).toBe("강남구");
    expect(result!.aliases.length).toBeGreaterThan(0);
    expect(result!.aliases).toContain("강남");
  });

  test("getAliasesForDistrict: 존재하지 않는 슬러그", () => {
    expect(getAliasesForDistrict("nonexistent")).toBeNull();
  });

  test("getRegionMappingCoverage", () => {
    const coverage = getRegionMappingCoverage();
    expect(coverage.totalDistricts).toBe(56); // 서울 25 + 경기 31
    expect(coverage.byCity.seoul.districts).toBe(25);
    expect(coverage.byCity.gyeonggi.districts).toBe(31);
    expect(coverage.totalAliases).toBeGreaterThan(0);
    expect(coverage.totalPatterns).toBeGreaterThan(0);
  });

  test("addRegionCustomAliases", () => {
    addRegionCustomAliases("gangnam", ["GN", "가남"]);
    const result = normalizeRegion("GN");
    expect(result.city).toBe("seoul");
    expect(result.district).toBe("gangnam");
  });
});

// ─────────────────────────────────────────────
// 16. 공백/특수문자 전처리
// ─────────────────────────────────────────────

describe("전처리 엣지 케이스", () => {
  test("앞뒤 공백", () => {
    const result = normalizeRegion("  강남구  ");
    expect(result.city).toBe("seoul");
    expect(result.district).toBe("gangnam");
  });

  test("연속 공백", () => {
    const result = normalizeRegion("서울   강남구");
    expect(result.city).toBe("seoul");
    expect(result.district).toBe("gangnam");
  });

  test("괄호 포함", () => {
    const result = normalizeRegion("강남구(서울)");
    expect(result.district).toBe("gangnam");
  });

  test("슬래시 포함", () => {
    const result = normalizeRegion("서울/강남구");
    expect(result.district).toBe("gangnam");
  });
});

// ─────────────────────────────────────────────
// 17. 실제 크롤링 데이터 형태 테스트
// ─────────────────────────────────────────────

describe("실제 크롤링 데이터 형태", () => {
  test("숨고 형태: 서비스 가능 지역 표시", () => {
    const result = normalizeRegion("서울특별시 강남구");
    expect(result.city).toBe("seoul");
    expect(result.district).toBe("gangnam");
    expect(result.confidence).toBeGreaterThanOrEqual(0.95);
  });

  test("당근마켓 형태: 약칭", () => {
    const result = normalizeRegion("강남");
    expect(result.city).toBe("seoul");
    expect(result.district).toBe("gangnam");
  });

  test("블로그 형태: 지역 + 키워드", () => {
    const result = normalizeRegion("강남구 에어컨 청소");
    expect(result.city).toBe("seoul");
    expect(result.district).toBe("gangnam");
  });

  test("업체 사이트 형태: 영어 URL", () => {
    const result = normalizeRegion("gangnam-gu");
    expect(result.city).toBe("seoul");
    expect(result.district).toBe("gangnam");
  });
});

// ─────────────────────────────────────────────
// 18. 정상 매핑 — 결과 구조 완전성 검증
// ─────────────────────────────────────────────

describe("정상 매핑 결과 구조 완전성", () => {
  test("정확 매칭 결과에 모든 필드가 존재한다", () => {
    const result = normalizeRegion("강남구");
    expect(result).toHaveProperty("city");
    expect(result).toHaveProperty("district");
    expect(result).toHaveProperty("confidence");
    expect(result).toHaveProperty("matchMethod");
    expect(result).toHaveProperty("originalText");
    expect(result).toHaveProperty("normalizedText");
    expect(result.originalText).toBe("강남구");
    expect(result.normalizedText).toBe("강남구");
  });

  test("정확 매칭 시 confidence가 1.0이다", () => {
    const result = normalizeRegion("강남구");
    expect(result.confidence).toBe(1.0);
    expect(result.matchMethod).toBe("exact");
  });

  test("별칭 매칭 시 confidence가 0.9이다", () => {
    const result = normalizeRegion("강남");
    expect(result.confidence).toBe(0.9);
    expect(result.matchMethod).toBe("alias");
  });

  test("시/도+구 조합 매칭 시 confidence가 0.95이다", () => {
    const result = normalizeRegion("서울특별시 강남구");
    expect(result.confidence).toBe(0.95);
  });

  test("오타 별칭 매칭('동데문구')은 alias로 처리된다", () => {
    const result = normalizeRegion("동데문구");
    // '동데문구'는 aliases에 등록되어 있으므로 alias 매칭
    expect(result.city).toBe("seoul");
    expect(result.district).toBe("dongdaemun");
    expect(result.matchMethod).toBe("alias");
    expect(result.confidence).toBe(0.9);
  });

  test("지역명+키워드 혼합 입력 시 패턴 매칭된다", () => {
    const result = normalizeRegion("강남구 에어컨 청소");
    expect(result.city).toBe("seoul");
    expect(result.district).toBe("gangnam");
    // 패턴이 강남구를 먼저 잡거나, 키워드 제거 후 매칭
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1.0);
  });
});

// ─────────────────────────────────────────────
// 19. 유사 명칭 — 로마자 변형 매핑
// ─────────────────────────────────────────────

describe("유사 명칭 - 로마자 변형 매핑", () => {
  test.each([
    ["kangnam", "seoul", "gangnam"],       // k → g 변형
    ["kangdong", "seoul", "gangdong"],
    ["kangbuk", "seoul", "gangbuk"],
    ["kangseo", "seoul", "gangseo"],
    ["kwanak", "seoul", "gwanak"],
    ["kwangjin", "seoul", "gwangjin"],
    ["kuro", "seoul", "guro"],
    ["kimpo", "gyeonggi", "gimpo"],        // k → g (경기)
    ["buchon", "gyeonggi", "bucheon"],      // o → eo 변형
    ["tongdaemun", "seoul", "dongdaemun"], // t → d 변형
  ])('로마자 변형: "%s" → %s/%s', (input, expectedCity, expectedSlug) => {
    const result = normalizeRegion(input);
    expect(result.city).toBe(expectedCity);
    expect(result.district).toBe(expectedSlug);
    expect(result.confidence).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 20. 유사 명칭 — 공백/접미사 변형
// ─────────────────────────────────────────────

describe("유사 명칭 - 공백·접미사 변형", () => {
  test.each([
    ["강남 구", "seoul", "gangnam"],
    ["마포 구", "seoul", "mapo"],
    ["수원 시", "gyeonggi", "suwon"],
    ["양평 군", "gyeonggi", "yangpyeong"],
    ["가평 군", "gyeonggi", "gapyeong"],
  ])('공백 포함 접미사: "%s" → %s/%s', (input, expectedCity, expectedSlug) => {
    const result = normalizeRegion(input);
    expect(result.city).toBe(expectedCity);
    expect(result.district).toBe(expectedSlug);
  });

  test.each([
    ["Gangnam-gu", "seoul", "gangnam"],
    ["Suwon-si", "gyeonggi", "suwon"],
    ["MAPO-GU", "seoul", "mapo"],
    ["GANGNAM", "seoul", "gangnam"],
  ])('대소문자 혼합: "%s" → %s/%s', (input, expectedCity, expectedSlug) => {
    const result = normalizeRegion(input);
    expect(result.city).toBe(expectedCity);
    expect(result.district).toBe(expectedSlug);
  });
});

// ─────────────────────────────────────────────
// 21. 유사 명칭 — 경기도 하위구역 세부 매핑
// ─────────────────────────────────────────────

describe("유사 명칭 - 경기도 하위구역 세부 매핑", () => {
  test.each([
    ["일산동구", "gyeonggi", "goyang"],
    ["일산서구", "gyeonggi", "goyang"],
    ["수지", "gyeonggi", "yongin"],
    ["기흥", "gyeonggi", "yongin"],
    ["처인", "gyeonggi", "yongin"],
    ["동탄", "gyeonggi", "hwaseong"],
    ["분당구", "gyeonggi", "seongnam"],
    ["판교", "gyeonggi", "seongnam"],
  ])('하위구역: "%s" → %s/%s', (input, expectedCity, expectedSlug) => {
    const result = normalizeRegion(input);
    expect(result.city).toBe(expectedCity);
    expect(result.district).toBe(expectedSlug);
  });
});

// ─────────────────────────────────────────────
// 22. 매핑 실패 — 비서울경기 광역시
// ─────────────────────────────────────────────

describe("매핑 실패 - 비서울경기 지역", () => {
  test.each([
    "부산",
    "부산광역시",
    "대구",
    "대구광역시",
    "인천",
    "대전",
    "대전광역시",
    "울산",
    "세종",
    "세종특별자치시",
    "제주",
    "제주특별자치도",
    "충청남도",
    "전라북도",
    "경상북도",
  ])('비대상 지역: "%s" → 매칭 실패', (input) => {
    const result = normalizeRegion(input);
    expect(result.district).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 23. 매핑 실패 — 무의미한 입력
// ─────────────────────────────────────────────

describe("매핑 실패 - 무의미한 입력", () => {
  test.each([
    "",
    "   ",
    "에어컨 청소",
    "가격 비교",
    "알 수 없음",
    "가나다라마바사",
    "12345",
    "!@#$%",
    "abc xyz",
    "null",
    "undefined",
  ])('무의미 입력: "%s" → 매칭 실패', (input) => {
    const result = normalizeRegion(input);
    expect(result.district).toBeNull();
    expect(result.matchMethod === "none" || result.confidence === 0).toBe(true);
  });

  test("null-like 빈 문자열의 confidence가 0이다", () => {
    const result = normalizeRegion("");
    expect(result.confidence).toBe(0);
    expect(result.matchMethod).toBe("none");
    expect(result.city).toBeNull();
    expect(result.district).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 24. 매핑 실패 — matchRegionFromText 세부 케이스
// ─────────────────────────────────────────────

describe("matchRegionFromText 매핑 실패 세부 케이스", () => {
  test.each([
    "부산",
    "대전광역시",
    "에어컨",
    "",
    "   ",
    "가나다라",
  ])('matchRegionFromText("%s") → null', (input) => {
    expect(matchRegionFromText(input)).toBeNull();
  });

  test("시/도만 매칭(district 없음) → null", () => {
    expect(matchRegionFromText("서울")).toBeNull();
    expect(matchRegionFromText("경기도")).toBeNull();
    expect(matchRegionFromText("경기")).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 25. 전처리 — 특수문자 및 전각 문자
// ─────────────────────────────────────────────

describe("전처리 - 특수문자 및 전각 문자 처리", () => {
  test("슬래시 구분자", () => {
    const result = normalizeRegion("서울/강남구");
    expect(result.district).toBe("gangnam");
  });

  test("대괄호 포함", () => {
    const result = normalizeRegion("[서울] 강남구");
    expect(result.district).toBe("gangnam");
  });

  test("중괄호 포함", () => {
    const result = normalizeRegion("{강남구}");
    expect(result.district).toBe("gangnam");
  });

  test("파이프 구분자", () => {
    const result = normalizeRegion("서울|강남구");
    expect(result.district).toBe("gangnam");
  });

  test("탭 문자 포함", () => {
    const result = normalizeRegion("서울\t강남구");
    expect(result.district).toBe("gangnam");
  });
});

// ─────────────────────────────────────────────
// 26. normalizeRegionWithGyeonggiContext 추가 케이스
// ─────────────────────────────────────────────

describe("normalizeRegionWithGyeonggiContext 추가 케이스", () => {
  test("광주시 → gyeonggi/gwangju", () => {
    const result = normalizeRegionWithGyeonggiContext("광주시");
    expect(result.city).toBe("gyeonggi");
    expect(result.district).toBe("gwangju");
  });

  test("일반 지역명은 normalizeRegion과 동일하게 동작", () => {
    const result = normalizeRegionWithGyeonggiContext("강남구");
    expect(result.city).toBe("seoul");
    expect(result.district).toBe("gangnam");
    expect(result.confidence).toBe(1.0);
  });

  test("경기 광주와 동일 결과", () => {
    const ctx = normalizeRegionWithGyeonggiContext("광주");
    const explicit = normalizeRegion("경기 광주");
    expect(ctx.city).toBe(explicit.city);
    expect(ctx.district).toBe(explicit.district);
  });
});

// ─────────────────────────────────────────────
// 27. addRegionCustomAliases 엣지 케이스
// ─────────────────────────────────────────────

describe("addRegionCustomAliases 엣지 케이스", () => {
  test("존재하지 않는 슬러그에 추가해도 에러 발생하지 않음", () => {
    expect(() => addRegionCustomAliases("nonexistent_slug", ["test"])).not.toThrow();
  });

  test("빈 문자열 별칭은 추가되지 않음", () => {
    const before = getAliasesForDistrict("mapo");
    const countBefore = before!.aliases.length;
    addRegionCustomAliases("mapo", ["", "  "]);
    const after = getAliasesForDistrict("mapo");
    expect(after!.aliases.length).toBe(countBefore);
  });

  test("중복 별칭은 추가되지 않음", () => {
    addRegionCustomAliases("songpa", ["송파테스트"]);
    const before = getAliasesForDistrict("songpa")!.aliases.length;
    addRegionCustomAliases("songpa", ["송파테스트"]);
    const after = getAliasesForDistrict("songpa")!.aliases.length;
    expect(after).toBe(before);
  });
});

// ─────────────────────────────────────────────
// 28. 배치 정규화 — 세부 시나리오
// ─────────────────────────────────────────────

describe("배치 정규화 세부 시나리오", () => {
  test("전체 성공 시 successRate가 1.0이다", () => {
    const result = batchNormalizeRegions(["강남구", "수원시", "마포구"]);
    expect(result.successCount).toBe(3);
    expect(result.failureCount).toBe(0);
    expect(result.successRate).toBe(1.0);
  });

  test("전체 실패 시 successRate가 0이다", () => {
    const result = batchNormalizeRegions(["부산", "대전", "알 수 없음"]);
    expect(result.successCount).toBe(0);
    expect(result.failureCount).toBe(3);
    expect(result.successRate).toBe(0);
  });

  test("results 배열 순서가 입력 순서와 동일하다", () => {
    const inputs = ["강남구", "부산", "수원시"];
    const result = batchNormalizeRegions(inputs);
    expect(result.results[0].district).toBe("gangnam");
    expect(result.results[1].district).toBeNull();
    expect(result.results[2].district).toBe("suwon");
  });

  test("대량 배치 처리가 정상 동작한다 (56개 전체 지역)", () => {
    const allDistricts = [
      "강남구", "강동구", "강북구", "강서구", "관악구",
      "광진구", "구로구", "금천구", "노원구", "도봉구",
      "동대문구", "동작구", "마포구", "서대문구", "서초구",
      "성동구", "성북구", "송파구", "양천구", "영등포구",
      "용산구", "은평구", "종로구", "중구", "중랑구",
      "수원시", "성남시", "고양시", "용인시", "부천시",
      "안산시", "안양시", "남양주시", "화성시", "평택시",
      "의정부시", "시흥시", "파주시", "김포시", "광명시",
      "광주시", "군포시", "하남시", "오산시", "이천시",
      "안성시", "의왕시", "양주시", "포천시", "여주시",
      "동두천시", "과천시", "구리시", "양평군", "가평군", "연천군",
    ];
    const result = batchNormalizeRegions(allDistricts);
    // 광주시는 모호할 수 있으므로 최소 55개 이상 성공
    expect(result.successCount).toBeGreaterThanOrEqual(55);
    expect(result.results).toHaveLength(56);
  });
});

// ─────────────────────────────────────────────
// 29. 매핑 커버리지 통계 세부 검증
// ─────────────────────────────────────────────

describe("매핑 커버리지 통계 세부 검증", () => {
  test("서울 25구 + 경기 31시군 = 56개", () => {
    const coverage = getRegionMappingCoverage();
    expect(coverage.byCity.seoul.districts).toBe(25);
    expect(coverage.byCity.gyeonggi.districts).toBe(31);
    expect(coverage.totalDistricts).toBe(56);
  });

  test("각 지역에 최소 1개 이상의 별칭이 존재한다", () => {
    const coverage = getRegionMappingCoverage();
    expect(coverage.byCity.seoul.aliases).toBeGreaterThanOrEqual(25);
    expect(coverage.byCity.gyeonggi.aliases).toBeGreaterThanOrEqual(31);
  });

  test("각 지역에 최소 1개 이상의 패턴이 존재한다", () => {
    const coverage = getRegionMappingCoverage();
    expect(coverage.byCity.seoul.patterns).toBeGreaterThanOrEqual(25);
    expect(coverage.byCity.gyeonggi.patterns).toBeGreaterThanOrEqual(31);
  });
});
