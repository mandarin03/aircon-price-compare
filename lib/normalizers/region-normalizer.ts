/**
 * 지역 데이터 표준 코드 정규화/매핑 모듈
 *
 * 크롤링 데이터(숨고, 당근, 블로그, 업체 사이트)에서 수집된 다양한 지역 표현을
 * 표준 지역 코드(city + district)로 매핑한다.
 *
 * 처리 범위:
 * - 정식명칭: "서울특별시 강남구", "경기도 수원시"
 * - 약칭: "서울 강남", "경기 수원"
 * - 구/시/군 단독: "강남구", "수원시"
 * - 오타/비표준 표기: "강남 구", "마포구  ", "의정부"
 * - 영어 슬러그: "gangnam", "seoul-gangnam"
 * - 로마자 표기: "Gangnam-gu", "Suwon-si"
 * - 동 수준 포함: "서울 강남구 역삼동" → 강남구로 매핑
 *
 * @module region-normalizer
 */

import type { City } from "@/lib/types/price-data";

// ─────────────────────────────────────────────
// 1. 결과 타입 정의
// ─────────────────────────────────────────────

/** 지역 정규화 결과 */
export interface RegionNormalizationResult {
  /** 매핑된 시/도 코드 (매칭 실패 시 null) */
  city: City | null;
  /** 매핑된 구/시/군 슬러그 (매칭 실패 시 null) */
  district: string | null;
  /** 매칭 신뢰도 (0~1) */
  confidence: number;
  /** 매칭 방식 */
  matchMethod: "exact" | "alias" | "partial" | "slug" | "fuzzy" | "none";
  /** 원본 입력 텍스트 */
  originalText: string;
  /** 전처리된 텍스트 */
  normalizedText: string;
}

/** 배치 정규화 결과 */
export interface BatchRegionNormalizationResult {
  /** 성공적으로 매핑된 항목 수 */
  successCount: number;
  /** 매핑 실패 항목 수 */
  failureCount: number;
  /** 전체 항목 대비 성공률 (0~1) */
  successRate: number;
  /** 개별 결과 목록 */
  results: RegionNormalizationResult[];
}

// ─────────────────────────────────────────────
// 2. 시/도 매핑 규칙
// ─────────────────────────────────────────────

interface CityMappingRule {
  code: City;
  /** 정확히 일치하는 표현들 */
  names: string[];
  /** 부분 매칭 패턴 */
  patterns: RegExp[];
}

const CITY_MAPPING_RULES: CityMappingRule[] = [
  {
    code: "seoul",
    names: [
      "서울특별시", "서울시", "서울",
      "seoul", "soeul", "seol",  // 영어 + 오타
    ],
    patterns: [
      /^서울/,
      /^seoul/i,
    ],
  },
  {
    code: "gyeonggi",
    names: [
      "경기도", "경기",
      "gyeonggi", "gyeonggi-do", "kyeonggi", "kyonggi", "gyunggi", // 영어 + 변형
    ],
    patterns: [
      /^경기/,
      /^gyeonggi/i,
      /^kyeonggi/i,
      /^kyonggi/i,
    ],
  },
];

// ─────────────────────────────────────────────
// 3. 구/시/군 매핑 규칙
// ─────────────────────────────────────────────

interface DistrictMappingRule {
  /** 표준 슬러그 */
  slug: string;
  /** 소속 시/도 */
  city: City;
  /** 정식 한글명 */
  name: string;
  /** 별칭 목록 (약칭, 오타, 영어 등) */
  aliases: string[];
  /** 부분 매칭 패턴 */
  patterns: RegExp[];
}

// 서울 25구
const SEOUL_DISTRICT_RULES: DistrictMappingRule[] = [
  {
    slug: "gangnam", city: "seoul", name: "강남구",
    aliases: ["강남", "강남 구", "gangnam", "gangnam-gu", "kangnam", "gang-nam"],
    patterns: [/강남\s*구?/, /gangnam/i, /kangnam/i],
  },
  {
    slug: "gangdong", city: "seoul", name: "강동구",
    aliases: ["강동", "강동 구", "gangdong", "gangdong-gu", "kangdong"],
    patterns: [/강동\s*구?/, /gangdong/i, /kangdong/i],
  },
  {
    slug: "gangbuk", city: "seoul", name: "강북구",
    aliases: ["강북", "강북 구", "gangbuk", "gangbuk-gu", "kangbuk"],
    patterns: [/강북\s*구?/, /gangbuk/i, /kangbuk/i],
  },
  {
    slug: "gangseo", city: "seoul", name: "강서구",
    aliases: ["강서", "강서 구", "gangseo", "gangseo-gu", "kangseo", "gangsuh"],
    patterns: [/강서\s*구?/, /gangseo/i, /kangseo/i],
  },
  {
    slug: "gwanak", city: "seoul", name: "관악구",
    aliases: ["관악", "관악 구", "gwanak", "gwanak-gu", "kwanak"],
    patterns: [/관악\s*구?/, /gwanak/i, /kwanak/i],
  },
  {
    slug: "gwangjin", city: "seoul", name: "광진구",
    aliases: ["광진", "광진 구", "gwangjin", "gwangjin-gu", "kwangjin"],
    patterns: [/광진\s*구?/, /gwangjin/i, /kwangjin/i],
  },
  {
    slug: "guro", city: "seoul", name: "구로구",
    aliases: ["구로", "구로 구", "guro", "guro-gu", "kuro"],
    patterns: [/구로\s*구?/, /guro/i, /kuro/i],
  },
  {
    slug: "geumcheon", city: "seoul", name: "금천구",
    aliases: ["금천", "금천 구", "금천구", "geumcheon", "geumcheon-gu", "kumcheon", "geumchon"],
    patterns: [/금천\s*구?/, /geumcheon/i, /kumcheon/i],
  },
  {
    slug: "nowon", city: "seoul", name: "노원구",
    aliases: ["노원", "노원 구", "nowon", "nowon-gu", "nohwon"],
    patterns: [/노원\s*구?/, /nowon/i, /nohwon/i],
  },
  {
    slug: "dobong", city: "seoul", name: "도봉구",
    aliases: ["도봉", "도봉 구", "dobong", "dobong-gu", "tobong"],
    patterns: [/도봉\s*구?/, /dobong/i, /tobong/i],
  },
  {
    slug: "dongdaemun", city: "seoul", name: "동대문구",
    aliases: [
      "동대문", "동대문 구", "동대문구", "동대문구 ", "동데문", "동데문구",
      "dongdaemun", "dongdaemun-gu", "tongdaemun",
    ],
    patterns: [/동대문\s*구?/, /동데문\s*구?/, /dongdaemun/i, /tongdaemun/i],
  },
  {
    slug: "dongjak", city: "seoul", name: "동작구",
    aliases: ["동작", "동작 구", "dongjak", "dongjak-gu", "tongjak"],
    patterns: [/동작\s*구?/, /dongjak/i, /tongjak/i],
  },
  {
    slug: "mapo", city: "seoul", name: "마포구",
    aliases: ["마포", "마포 구", "mapo", "mapo-gu"],
    patterns: [/마포\s*구?/, /mapo/i],
  },
  {
    slug: "seodaemun", city: "seoul", name: "서대문구",
    aliases: [
      "서대문", "서대문 구", "서데문", "서데문구",
      "seodaemun", "seodaemun-gu", "sodaemun",
    ],
    patterns: [/서대문\s*구?/, /서데문\s*구?/, /seodaemun/i, /sodaemun/i],
  },
  {
    slug: "seocho", city: "seoul", name: "서초구",
    aliases: ["서초", "서초 구", "seocho", "seocho-gu", "socho"],
    patterns: [/서초\s*구?/, /seocho/i, /socho/i],
  },
  {
    slug: "seongdong", city: "seoul", name: "성동구",
    aliases: ["성동", "성동 구", "seongdong", "seongdong-gu", "songdong"],
    patterns: [/성동\s*구?/, /seongdong/i, /songdong/i],
  },
  {
    slug: "seongbuk", city: "seoul", name: "성북구",
    aliases: ["성북", "성북 구", "seongbuk", "seongbuk-gu", "songbuk"],
    patterns: [/성북\s*구?/, /seongbuk/i, /songbuk/i],
  },
  {
    slug: "songpa", city: "seoul", name: "송파구",
    aliases: ["송파", "송파 구", "songpa", "songpa-gu"],
    patterns: [/송파\s*구?/, /songpa/i],
  },
  {
    slug: "yangcheon", city: "seoul", name: "양천구",
    aliases: ["양천", "양천 구", "yangcheon", "yangcheon-gu", "yangchon"],
    patterns: [/양천\s*구?/, /yangcheon/i, /yangchon/i],
  },
  {
    slug: "yeongdeungpo", city: "seoul", name: "영등포구",
    aliases: [
      "영등포", "영등포 구", "영등포구",
      "yeongdeungpo", "yeongdeungpo-gu", "youngdeungpo", "yongdungpo",
    ],
    patterns: [/영등포\s*구?/, /yeongdeungpo/i, /youngdeungpo/i, /yongdungpo/i],
  },
  {
    slug: "yongsan", city: "seoul", name: "용산구",
    aliases: ["용산", "용산 구", "yongsan", "yongsan-gu"],
    patterns: [/용산\s*구?/, /yongsan/i],
  },
  {
    slug: "eunpyeong", city: "seoul", name: "은평구",
    aliases: ["은평", "은평 구", "eunpyeong", "eunpyeong-gu", "eunpyong"],
    patterns: [/은평\s*구?/, /eunpyeong/i, /eunpyong/i],
  },
  {
    slug: "jongno", city: "seoul", name: "종로구",
    aliases: ["종로", "종로 구", "jongno", "jongno-gu", "chongno", "jongro"],
    patterns: [/종로\s*구?/, /jongno/i, /chongno/i, /jongro/i],
  },
  {
    slug: "jung", city: "seoul", name: "중구",
    aliases: ["중구", "jung", "jung-gu", "joong-gu"],
    // 중구 is tricky — "중" alone is too short, require "중구" or slug
    patterns: [/^중구$/, /^jung(?:-gu)?$/i],
  },
  {
    slug: "jungnang", city: "seoul", name: "중랑구",
    aliases: ["중랑", "중랑 구", "jungnang", "jungnang-gu", "joongrang", "jungrang"],
    patterns: [/중랑\s*구?/, /jungnang/i, /joongrang/i, /jungrang/i],
  },
];

// 경기도 31개 시/군
const GYEONGGI_DISTRICT_RULES: DistrictMappingRule[] = [
  {
    slug: "suwon", city: "gyeonggi", name: "수원시",
    aliases: ["수원", "수원 시", "suwon", "suwon-si"],
    patterns: [/수원\s*시?/, /suwon/i],
  },
  {
    slug: "seongnam", city: "gyeonggi", name: "성남시",
    aliases: ["성남", "성남 시", "seongnam", "seongnam-si", "songnam", "분당", "분당구", "판교"],
    patterns: [/성남\s*시?/, /seongnam/i, /songnam/i, /분당/, /판교/],
  },
  {
    slug: "goyang", city: "gyeonggi", name: "고양시",
    aliases: ["고양", "고양 시", "goyang", "goyang-si", "일산", "일산동구", "일산서구"],
    patterns: [/고양\s*시?/, /goyang/i, /일산/],
  },
  {
    slug: "yongin", city: "gyeonggi", name: "용인시",
    aliases: ["용인", "용인 시", "yongin", "yongin-si", "수지", "기흥", "처인"],
    patterns: [/용인\s*시?/, /yongin/i, /수지/, /기흥/, /처인/],
  },
  {
    slug: "bucheon", city: "gyeonggi", name: "부천시",
    aliases: ["부천", "부천 시", "bucheon", "bucheon-si", "buchon"],
    patterns: [/부천\s*시?/, /bucheon/i, /buchon/i],
  },
  {
    slug: "ansan", city: "gyeonggi", name: "안산시",
    aliases: ["안산", "안산 시", "ansan", "ansan-si"],
    patterns: [/안산\s*시?/, /ansan/i],
  },
  {
    slug: "anyang", city: "gyeonggi", name: "안양시",
    aliases: ["안양", "안양 시", "anyang", "anyang-si"],
    patterns: [/안양\s*시?/, /anyang/i],
  },
  {
    slug: "namyangju", city: "gyeonggi", name: "남양주시",
    aliases: ["남양주", "남양주 시", "namyangju", "namyangju-si"],
    patterns: [/남양주\s*시?/, /namyangju/i],
  },
  {
    slug: "hwaseong", city: "gyeonggi", name: "화성시",
    aliases: ["화성", "화성 시", "hwaseong", "hwaseong-si", "동탄"],
    patterns: [/화성\s*시?/, /hwaseong/i, /동탄/],
  },
  {
    slug: "pyeongtaek", city: "gyeonggi", name: "평택시",
    aliases: ["평택", "평택 시", "pyeongtaek", "pyeongtaek-si", "pyongtaek"],
    patterns: [/평택\s*시?/, /pyeongtaek/i, /pyongtaek/i],
  },
  {
    slug: "uijeongbu", city: "gyeonggi", name: "의정부시",
    aliases: ["의정부", "의정부 시", "uijeongbu", "uijeongbu-si", "uijongbu"],
    patterns: [/의정부\s*시?/, /uijeongbu/i, /uijongbu/i],
  },
  {
    slug: "siheung", city: "gyeonggi", name: "시흥시",
    aliases: ["시흥", "시흥 시", "siheung", "siheung-si"],
    patterns: [/시흥\s*시?/, /siheung/i],
  },
  {
    slug: "paju", city: "gyeonggi", name: "파주시",
    aliases: ["파주", "파주 시", "paju", "paju-si"],
    patterns: [/파주\s*시?/, /paju/i],
  },
  {
    slug: "gimpo", city: "gyeonggi", name: "김포시",
    aliases: ["김포", "김포 시", "gimpo", "gimpo-si", "kimpo"],
    patterns: [/김포\s*시?/, /gimpo/i, /kimpo/i],
  },
  {
    slug: "gwangmyeong", city: "gyeonggi", name: "광명시",
    aliases: ["광명", "광명 시", "gwangmyeong", "gwangmyeong-si", "kwangmyong"],
    patterns: [/광명\s*시?/, /gwangmyeong/i, /kwangmyong/i],
  },
  {
    slug: "gwangju", city: "gyeonggi", name: "광주시",
    aliases: ["경기광주", "경기 광주", "gwangju", "gwangju-si"],
    // "광주" alone is ambiguous (광주광역시 vs 경기 광주시), use pattern only with city context
    patterns: [/경기\s*광주/, /gwangju/i],
  },
  {
    slug: "gunpo", city: "gyeonggi", name: "군포시",
    aliases: ["군포", "군포 시", "gunpo", "gunpo-si"],
    patterns: [/군포\s*시?/, /gunpo/i],
  },
  {
    slug: "hanam", city: "gyeonggi", name: "하남시",
    aliases: ["하남", "하남 시", "hanam", "hanam-si"],
    patterns: [/하남\s*시?/, /hanam/i],
  },
  {
    slug: "osan", city: "gyeonggi", name: "오산시",
    aliases: ["오산", "오산 시", "osan", "osan-si"],
    patterns: [/오산\s*시?/, /osan/i],
  },
  {
    slug: "icheon", city: "gyeonggi", name: "이천시",
    aliases: ["이천", "이천 시", "icheon", "icheon-si", "ichon"],
    patterns: [/이천\s*시?/, /icheon/i, /ichon/i],
  },
  {
    slug: "anseong", city: "gyeonggi", name: "안성시",
    aliases: ["안성", "안성 시", "anseong", "anseong-si"],
    patterns: [/안성\s*시?/, /anseong/i],
  },
  {
    slug: "uiwang", city: "gyeonggi", name: "의왕시",
    aliases: ["의왕", "의왕 시", "uiwang", "uiwang-si"],
    patterns: [/의왕\s*시?/, /uiwang/i],
  },
  {
    slug: "yangju", city: "gyeonggi", name: "양주시",
    aliases: ["양주", "양주 시", "yangju", "yangju-si"],
    patterns: [/양주\s*시?/, /yangju/i],
  },
  {
    slug: "pocheon", city: "gyeonggi", name: "포천시",
    aliases: ["포천", "포천 시", "pocheon", "pocheon-si", "pochon"],
    patterns: [/포천\s*시?/, /pocheon/i, /pochon/i],
  },
  {
    slug: "yeoju", city: "gyeonggi", name: "여주시",
    aliases: ["여주", "여주 시", "yeoju", "yeoju-si"],
    patterns: [/여주\s*시?/, /yeoju/i],
  },
  {
    slug: "dongducheon", city: "gyeonggi", name: "동두천시",
    aliases: ["동두천", "동두천 시", "dongducheon", "dongducheon-si", "tongduchon"],
    patterns: [/동두천\s*시?/, /dongducheon/i, /tongduchon/i],
  },
  {
    slug: "gwacheon", city: "gyeonggi", name: "과천시",
    aliases: ["과천", "과천 시", "gwacheon", "gwacheon-si", "kwachon"],
    patterns: [/과천\s*시?/, /gwacheon/i, /kwachon/i],
  },
  {
    slug: "guri", city: "gyeonggi", name: "구리시",
    aliases: ["구리", "구리 시", "guri", "guri-si", "kuri"],
    patterns: [/구리\s*시?/, /guri/i, /kuri/i],
  },
  {
    slug: "yangpyeong", city: "gyeonggi", name: "양평군",
    aliases: ["양평", "양평 군", "yangpyeong", "yangpyeong-gun", "yangpyong"],
    patterns: [/양평\s*군?/, /yangpyeong/i, /yangpyong/i],
  },
  {
    slug: "gapyeong", city: "gyeonggi", name: "가평군",
    aliases: ["가평", "가평 군", "gapyeong", "gapyeong-gun", "kapyong"],
    patterns: [/가평\s*군?/, /gapyeong/i, /kapyong/i],
  },
  {
    slug: "yeoncheon", city: "gyeonggi", name: "연천군",
    aliases: ["연천", "연천 군", "yeoncheon", "yeoncheon-gun", "yonchon"],
    patterns: [/연천\s*군?/, /yeoncheon/i, /yonchon/i],
  },
];

/** 전체 구/시/군 매핑 규칙 */
const ALL_DISTRICT_RULES: DistrictMappingRule[] = [
  ...SEOUL_DISTRICT_RULES,
  ...GYEONGGI_DISTRICT_RULES,
];

// ─────────────────────────────────────────────
// 4. 전처리 유틸리티
// ─────────────────────────────────────────────

/**
 * 입력 텍스트 전처리 (정규화)
 *
 * - 앞뒤 공백 제거
 * - 연속 공백을 단일 공백으로
 * - 특수문자 정리 (괄호 등 → 공백)
 * - 전각 문자 → 반각 변환
 */
function preprocess(text: string): string {
  return text
    .trim()
    // 전각 → 반각
    .replace(/[\uFF01-\uFF5E]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xFEE0),
    )
    .replace(/[()[\]{}|]+/g, " ")       // 괄호 → 공백
    .replace(/\s+/g, " ")               // 연속 공백 → 단일 공백
    .trim();
}

/**
 * 지역 관련 불필요 접미어/접두어 제거
 * "에어컨", "청소", "출장" 등의 공통 키워드를 제거하여 지역명만 추출
 */
function stripNonRegionWords(text: string): string {
  return text
    .replace(/\s*에어컨\s*/g, " ")
    .replace(/\s*청소\s*/g, " ")
    .replace(/\s*세척\s*/g, " ")
    .replace(/\s*출장\s*/g, " ")
    .replace(/\s*서비스\s*/g, " ")
    .replace(/\s*업체\s*/g, " ")
    .replace(/\s*가격\s*/g, " ")
    .replace(/\s*비교\s*/g, " ")
    .replace(/\s*추천\s*/g, " ")
    .replace(/\s*견적\s*/g, " ")
    .replace(/\s*분해\s*/g, " ")
    .replace(/\s*클리닝\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 한글에서 시/도 접두어를 분리하여 추출
 * "서울특별시 강남구" → { cityPart: "서울특별시", rest: "강남구" }
 * "경기 수원" → { cityPart: "경기", rest: "수원" }
 */
function splitCityPrefix(text: string): { cityPart: string | null; rest: string } {
  // 서울특별시/서울시/서울 접두어
  const seoulMatch = text.match(/^(서울특별시|서울시|서울)\s*(.*)$/);
  if (seoulMatch) {
    return { cityPart: seoulMatch[1], rest: seoulMatch[2].trim() };
  }

  // 경기도/경기 접두어
  const gyeonggiMatch = text.match(/^(경기도|경기)\s*(.*)$/);
  if (gyeonggiMatch) {
    return { cityPart: gyeonggiMatch[1], rest: gyeonggiMatch[2].trim() };
  }

  // 영어 시/도 접두어
  const engCityMatch = text.match(/^(seoul|gyeonggi)[\s\-]+(.*)$/i);
  if (engCityMatch) {
    return { cityPart: engCityMatch[1], rest: engCityMatch[2].trim() };
  }

  return { cityPart: null, rest: text };
}

/**
 * 시/도 텍스트를 표준 코드로 매핑
 */
function matchCity(text: string): City | null {
  const lower = text.toLowerCase();
  for (const rule of CITY_MAPPING_RULES) {
    if (rule.names.includes(lower) || rule.names.includes(text)) {
      return rule.code;
    }
    if (rule.patterns.some((p) => p.test(text) || p.test(lower))) {
      return rule.code;
    }
  }
  return null;
}

// ─────────────────────────────────────────────
// 5. 레벤슈타인 거리 (퍼지 매칭용)
// ─────────────────────────────────────────────

/**
 * 두 문자열 간 레벤슈타인 거리를 계산한다.
 * 오타 처리를 위한 퍼지 매칭에 사용된다.
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  // 1D DP (메모리 최적화)
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,       // 삭제
        curr[j - 1] + 1,   // 삽입
        prev[j - 1] + cost, // 교체
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
}

/**
 * 퍼지 매칭: 레벤슈타인 거리 기반으로 가장 가까운 지역을 찾는다.
 * 최대 허용 거리는 문자열 길이의 30% 또는 2글자 이내
 */
function fuzzyMatchDistrict(
  text: string,
  cityConstraint: City | null,
): DistrictMappingRule | null {
  const rules = cityConstraint
    ? ALL_DISTRICT_RULES.filter((r) => r.city === cityConstraint)
    : ALL_DISTRICT_RULES;

  let bestMatch: DistrictMappingRule | null = null;
  let bestDistance = Infinity;

  for (const rule of rules) {
    // 한글명과 비교
    const targets = [rule.name, ...rule.aliases];
    for (const target of targets) {
      const dist = levenshteinDistance(text, target);
      const maxAllowed = Math.min(2, Math.floor(target.length * 0.3));
      if (dist <= maxAllowed && dist < bestDistance) {
        bestDistance = dist;
        bestMatch = rule;
      }
    }
  }

  return bestMatch;
}

// ─────────────────────────────────────────────
// 6. 핵심 정규화 함수
// ─────────────────────────────────────────────

/**
 * 업체 원본 지역 데이터를 표준 지역 코드로 매핑한다.
 *
 * 매칭 순서:
 * 1. 정확 매칭 (name/aliases) — confidence: 1.0
 * 2. 시/도 접두어 분리 후 구/시/군 매칭 — confidence: 0.95
 * 3. 별칭 매칭 (aliases) — confidence: 0.9
 * 4. 부분 패턴 매칭 (patterns) — confidence: 0.8
 * 5. 영어 슬러그 매칭 — confidence: 0.85
 * 6. 불필요 단어 제거 후 재시도 — confidence: 0.7
 * 7. 퍼지 매칭 (오타 허용) — confidence: 0.5
 * 8. 매칭 실패 — confidence: 0
 *
 * @param text - 크롤링된 원문 지역 텍스트
 * @returns 정규화 결과 (city, district, 신뢰도, 매칭 방식)
 *
 * @example
 * normalizeRegion("서울특별시 강남구")
 * // → { city: "seoul", district: "gangnam", confidence: 1.0, matchMethod: "exact" }
 *
 * @example
 * normalizeRegion("강남")
 * // → { city: "seoul", district: "gangnam", confidence: 0.9, matchMethod: "alias" }
 *
 * @example
 * normalizeRegion("경기 수원 에어컨 청소")
 * // → { city: "gyeonggi", district: "suwon", confidence: 0.7, matchMethod: "partial" }
 */
export function normalizeRegion(text: string): RegionNormalizationResult {
  const normalizedText = preprocess(text);

  if (!normalizedText) {
    return {
      city: null,
      district: null,
      confidence: 0,
      matchMethod: "none",
      originalText: text,
      normalizedText,
    };
  }

  // ── 1단계: 정확 매칭 (구/시/군 정식명칭) ──
  for (const rule of ALL_DISTRICT_RULES) {
    if (normalizedText === rule.name) {
      return {
        city: rule.city,
        district: rule.slug,
        confidence: 1.0,
        matchMethod: "exact",
        originalText: text,
        normalizedText,
      };
    }
  }

  // ── 2단계: 시/도 접두어 분리 후 구/시/군 매칭 ──
  const { cityPart, rest } = splitCityPrefix(normalizedText);
  const cityFromPrefix = cityPart ? matchCity(cityPart) : null;

  if (cityFromPrefix && rest) {
    // 시/도 + 구/시/군 조합 정확 매칭
    const constrainedRules = ALL_DISTRICT_RULES.filter((r) => r.city === cityFromPrefix);

    for (const rule of constrainedRules) {
      if (rest === rule.name || rule.aliases.includes(rest) || rule.aliases.includes(rest.toLowerCase())) {
        return {
          city: rule.city,
          district: rule.slug,
          confidence: 0.95,
          matchMethod: "exact",
          originalText: text,
          normalizedText,
        };
      }
    }

    // 시/도 + 구/시/군 패턴 매칭
    for (const rule of constrainedRules) {
      if (rule.patterns.some((p) => p.test(rest))) {
        return {
          city: rule.city,
          district: rule.slug,
          confidence: 0.9,
          matchMethod: "partial",
          originalText: text,
          normalizedText,
        };
      }
    }
  }

  // ── 3단계: 별칭 매칭 (약칭, 오타 등) ──
  const lowerText = normalizedText.toLowerCase();
  for (const rule of ALL_DISTRICT_RULES) {
    if (rule.aliases.includes(normalizedText) || rule.aliases.includes(lowerText)) {
      return {
        city: rule.city,
        district: rule.slug,
        confidence: 0.9,
        matchMethod: "alias",
        originalText: text,
        normalizedText,
      };
    }
  }

  // ── 4단계: 영어 슬러그 매칭 ──
  // "gangnam-gu", "suwon-si" 등 슬러그 형태 처리
  const slugCandidate = lowerText.replace(/[\s-]+/g, "-");
  for (const rule of ALL_DISTRICT_RULES) {
    if (
      rule.slug === slugCandidate ||
      rule.slug === slugCandidate.replace(/-(gu|si|gun)$/, "") ||
      rule.aliases.some((a) => a.replace(/[\s-]+/g, "-") === slugCandidate)
    ) {
      return {
        city: rule.city,
        district: rule.slug,
        confidence: 0.85,
        matchMethod: "slug",
        originalText: text,
        normalizedText,
      };
    }
  }

  // ── 5단계: 패턴 매칭 (부분 일치) ──
  const patternMatches: DistrictMappingRule[] = [];
  for (const rule of ALL_DISTRICT_RULES) {
    if (rule.patterns.some((p) => p.test(normalizedText) || p.test(lowerText))) {
      patternMatches.push(rule);
    }
  }

  if (patternMatches.length === 1) {
    return {
      city: patternMatches[0].city,
      district: patternMatches[0].slug,
      confidence: 0.8,
      matchMethod: "partial",
      originalText: text,
      normalizedText,
    };
  }

  // 여러 패턴 매칭 시 시/도 접두어로 좁히기
  if (patternMatches.length > 1 && cityFromPrefix) {
    const filtered = patternMatches.filter((r) => r.city === cityFromPrefix);
    if (filtered.length === 1) {
      return {
        city: filtered[0].city,
        district: filtered[0].slug,
        confidence: 0.75,
        matchMethod: "partial",
        originalText: text,
        normalizedText,
      };
    }
  }

  // 여러 패턴 매칭인데 시/도 컨텍스트가 없으면, 더 구체적인 매칭 선택
  if (patternMatches.length > 1) {
    // 이름 길이가 더 긴(더 구체적인) 매칭 우선
    const sorted = [...patternMatches].sort((a, b) => b.name.length - a.name.length);
    return {
      city: sorted[0].city,
      district: sorted[0].slug,
      confidence: 0.6,
      matchMethod: "partial",
      originalText: text,
      normalizedText,
    };
  }

  // ── 6단계: 불필요 단어 제거 후 재시도 ──
  const stripped = stripNonRegionWords(normalizedText);
  if (stripped && stripped !== normalizedText) {
    const retryResult = normalizeRegion(stripped);
    if (retryResult.city && retryResult.district) {
      return {
        ...retryResult,
        confidence: Math.min(retryResult.confidence, 0.7),
        originalText: text,
        normalizedText,
      };
    }
  }

  // ── 7단계: 퍼지 매칭 (오타 허용) ──
  const fuzzyResult = fuzzyMatchDistrict(normalizedText, cityFromPrefix);
  if (fuzzyResult) {
    return {
      city: fuzzyResult.city,
      district: fuzzyResult.slug,
      confidence: 0.5,
      matchMethod: "fuzzy",
      originalText: text,
      normalizedText,
    };
  }

  // 시/도 접두어 제거 후 퍼지 재시도
  if (rest && rest !== normalizedText) {
    const fuzzyRetry = fuzzyMatchDistrict(rest, cityFromPrefix);
    if (fuzzyRetry) {
      return {
        city: fuzzyRetry.city,
        district: fuzzyRetry.slug,
        confidence: 0.45,
        matchMethod: "fuzzy",
        originalText: text,
        normalizedText,
      };
    }
  }

  // ── 8단계: 시/도만 매칭된 경우 ──
  if (cityFromPrefix) {
    return {
      city: cityFromPrefix,
      district: null,
      confidence: 0.3,
      matchMethod: "partial",
      originalText: text,
      normalizedText,
    };
  }

  // ── 9단계: 시/도만이라도 매칭 시도 ──
  const cityOnly = matchCity(normalizedText) ?? matchCity(lowerText);
  if (cityOnly) {
    return {
      city: cityOnly,
      district: null,
      confidence: 0.2,
      matchMethod: "partial",
      originalText: text,
      normalizedText,
    };
  }

  // ── 매칭 실패 ──
  return {
    city: null,
    district: null,
    confidence: 0,
    matchMethod: "none",
    originalText: text,
    normalizedText,
  };
}

// ─────────────────────────────────────────────
// 7. 간편 함수
// ─────────────────────────────────────────────

/**
 * 지역 텍스트를 표준 코드로 변환 (간편 버전)
 *
 * @returns { city, district } 또는 null
 *
 * @example
 * matchRegionFromText("서울 강남구") // → { city: "seoul", district: "gangnam" }
 * matchRegionFromText("분당") // → { city: "gyeonggi", district: "seongnam" }
 * matchRegionFromText("알 수 없음") // → null
 */
export function matchRegionFromText(
  text: string,
): { city: City; district: string } | null {
  const result = normalizeRegion(text);
  if (result.city && result.district) {
    return { city: result.city, district: result.district };
  }
  return null;
}

// ─────────────────────────────────────────────
// 8. 배치 정규화
// ─────────────────────────────────────────────

/**
 * 여러 지역 텍스트를 한 번에 정규화 (크롤링 결과 일괄 처리용)
 *
 * @param texts - 정규화할 지역 텍스트 배열
 * @returns 배치 결과 (성공/실패 통계 + 개별 결과)
 */
export function batchNormalizeRegions(
  texts: string[],
): BatchRegionNormalizationResult {
  const results = texts.map(normalizeRegion);
  const successCount = results.filter(
    (r) => r.city !== null && r.district !== null,
  ).length;
  const failureCount = results.length - successCount;

  return {
    successCount,
    failureCount,
    successRate: results.length > 0 ? successCount / results.length : 0,
    results,
  };
}

// ─────────────────────────────────────────────
// 9. 유틸리티
// ─────────────────────────────────────────────

/**
 * 특정 구/시/군의 모든 별칭 목록 반환 (디버깅/관리 도구용)
 */
export function getAliasesForDistrict(
  slug: string,
): { name: string; aliases: string[] } | null {
  const rule = ALL_DISTRICT_RULES.find((r) => r.slug === slug);
  if (!rule) return null;
  return { name: rule.name, aliases: [...rule.aliases] };
}

/**
 * 전체 매핑 커버리지 통계 반환
 */
export function getRegionMappingCoverage(): {
  totalDistricts: number;
  totalAliases: number;
  totalPatterns: number;
  byCity: Record<City, { districts: number; aliases: number; patterns: number }>;
} {
  const seoulRules = ALL_DISTRICT_RULES.filter((r) => r.city === "seoul");
  const gyeonggiRules = ALL_DISTRICT_RULES.filter((r) => r.city === "gyeonggi");

  const countAliases = (rules: DistrictMappingRule[]) =>
    rules.reduce((sum, r) => sum + r.aliases.length, 0);
  const countPatterns = (rules: DistrictMappingRule[]) =>
    rules.reduce((sum, r) => sum + r.patterns.length, 0);

  return {
    totalDistricts: ALL_DISTRICT_RULES.length,
    totalAliases: countAliases(ALL_DISTRICT_RULES),
    totalPatterns: countPatterns(ALL_DISTRICT_RULES),
    byCity: {
      seoul: {
        districts: seoulRules.length,
        aliases: countAliases(seoulRules),
        patterns: countPatterns(seoulRules),
      },
      gyeonggi: {
        districts: gyeonggiRules.length,
        aliases: countAliases(gyeonggiRules),
        patterns: countPatterns(gyeonggiRules),
      },
    },
  };
}

/**
 * 구/시/군 매핑 규칙에 커스텀 별칭을 동적으로 추가
 * (운영 중 새로운 표현이 발견되었을 때 사용)
 *
 * @param slug - 대상 구/시/군 슬러그
 * @param aliases - 추가할 별칭 목록
 */
export function addRegionCustomAliases(
  slug: string,
  aliases: string[],
): void {
  const rule = ALL_DISTRICT_RULES.find((r) => r.slug === slug);
  if (!rule) return;
  for (const alias of aliases) {
    const trimmed = alias.trim();
    if (trimmed && !rule.aliases.includes(trimmed)) {
      rule.aliases.push(trimmed);
    }
  }
}

/**
 * "광주" 등 시/도가 모호한 지역을 경기도 광주로 강제 매핑
 * (본 서비스가 서울·경기 한정이므로 광주광역시는 제외)
 */
export function normalizeRegionWithGyeonggiContext(
  text: string,
): RegionNormalizationResult {
  const normalizedText = preprocess(text);

  // "광주" 단독 입력 → 경기 광주로 매핑
  if (/^광주\s*시?$/.test(normalizedText)) {
    return {
      city: "gyeonggi",
      district: "gwangju",
      confidence: 0.7,
      matchMethod: "alias",
      originalText: text,
      normalizedText,
    };
  }

  return normalizeRegion(text);
}
