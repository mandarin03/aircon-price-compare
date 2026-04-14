/**
 * 에어컨 유형 데이터 정의
 *
 * 크롤링 데이터를 표준 카테고리로 정규화하기 위한 기준 데이터.
 * 각 유형별로 slug(URL용), 한국어 라벨, 아이콘, 설명, 가격 범위 힌트를 포함한다.
 */

export interface AirconType {
  /** URL slug (e.g. "wall-mounted") — SEO 페이지 경로에 사용 */
  slug: string;
  /** 한국어 라벨 */
  label: string;
  /** 짧은 한국어 라벨 (모바일 버튼용) */
  shortLabel: string;
  /** 유형 설명 */
  description: string;
  /** SVG 아이콘 path (24x24 viewBox 기준) */
  iconPath: string;
  /** 일반 가정에서의 보유 빈도 (정렬 우선순위) */
  priority: number;
  /** 일반적인 가격 범위 참고 (만 원 단위) */
  priceRangeHint: { min: number; max: number };
  /** 크롤링 데이터 매칭용 키워드 목록 */
  matchKeywords: string[];
}

/**
 * 에어컨 유형 목록
 * priority 오름차순 = 가정에서 흔한 순서
 */
export const AIRCON_TYPES: AirconType[] = [
  {
    slug: "wall-mounted",
    label: "벽걸이 에어컨",
    shortLabel: "벽걸이",
    description: "가정에서 가장 많이 사용하는 벽걸이형 에어컨",
    iconPath:
      "M3 6h18v4a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm2 8v2m14-2v2m-10-2v4m6-4v4",
    priority: 1,
    priceRangeHint: { min: 4, max: 8 },
    matchKeywords: [
      "벽걸이",
      "벽걸이형",
      "벽걸이 에어컨",
      "wall",
      "wall-mounted",
      "벽결이",
    ],
  },
  {
    slug: "standing",
    label: "스탠드 에어컨",
    shortLabel: "스탠드",
    description: "거실에 많이 설치하는 스탠드형(타워형) 에어컨",
    iconPath:
      "M8 2h8v16a2 2 0 01-2 2h-4a2 2 0 01-2-2V2zm0 4h8m-8 4h8m-4 8v2",
    priority: 2,
    priceRangeHint: { min: 8, max: 15 },
    matchKeywords: [
      "스탠드",
      "스탠드형",
      "스텐드",
      "타워형",
      "타워",
      "standing",
      "tower",
    ],
  },
  {
    slug: "ceiling",
    label: "천장형 에어컨",
    shortLabel: "천장형",
    description: "천장에 매립 설치하는 카세트형 에어컨",
    iconPath:
      "M2 4h20v3a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm4 4v2m4-2v2m4-2v2m4-2v2m-14 2l2 6m10-6l-2 6",
    priority: 3,
    priceRangeHint: { min: 10, max: 20 },
    matchKeywords: [
      "천장형",
      "천장",
      "카세트",
      "카세트형",
      "천정형",
      "ceiling",
      "cassette",
    ],
  },
  {
    slug: "system",
    label: "시스템 에어컨",
    shortLabel: "시스템",
    description: "멀티 실외기에 연결되는 시스템(멀티) 에어컨",
    iconPath:
      "M4 3h16v5a1 1 0 01-1 1H5a1 1 0 01-1-1V3zm0 11h16v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5zm8-3v3m-4-1h8",
    priority: 4,
    priceRangeHint: { min: 8, max: 18 },
    matchKeywords: [
      "시스템",
      "시스템형",
      "멀티",
      "멀티형",
      "system",
      "multi",
    ],
  },
  {
    slug: "window",
    label: "창문형 에어컨",
    shortLabel: "창문형",
    description: "창문에 설치하는 일체형 에어컨",
    iconPath:
      "M3 4h18v14a2 2 0 01-2 2H5a2 2 0 01-2-2V4zm0 0h18M9 4v16m-6-8h6m6 0h6",
    priority: 5,
    priceRangeHint: { min: 3, max: 6 },
    matchKeywords: [
      "창문형",
      "창문",
      "창문 에어컨",
      "window",
      "일체형",
    ],
  },
];

/** slug로 에어컨 유형 조회 */
export function getAirconTypeBySlug(slug: string): AirconType | undefined {
  return AIRCON_TYPES.find((t) => t.slug === slug);
}

/** 전체 slug 목록 (정적 경로 생성용) */
export function getAllAirconTypeSlugs(): string[] {
  return AIRCON_TYPES.map((t) => t.slug);
}

/** 키워드로 에어컨 유형 매칭 (크롤링 데이터 정규화용) */
export function matchAirconType(keyword: string): AirconType | undefined {
  const normalized = keyword.trim().toLowerCase();
  return AIRCON_TYPES.find((t) =>
    t.matchKeywords.some((k) => normalized.includes(k.toLowerCase()))
  );
}
