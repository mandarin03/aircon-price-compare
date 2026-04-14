/**
 * 크롤러 공통 타입 정의
 */

/** 크롤링 결과 (정규화 전) */
export interface CrawlResult {
  /** 출처 플랫폼 */
  platform: "soomgo" | "danggeun" | "blog" | "website" | "registration";
  /** 원본 URL */
  sourceUrl: string;
  /** 업체명 */
  providerName: string;
  /** 원본 텍스트 (디버깅용) */
  rawText: string;
  /** 파싱된 가격 항목들 */
  entries: CrawlPriceEntry[];
}

/** 파싱된 가격 항목 */
export interface CrawlPriceEntry {
  /** 에어컨 유형 */
  airconType: "wall-mount" | "standing" | "ceiling" | "system" | "window";
  /** 청소 방식 */
  cleaningMethod: "general" | "disassembly" | "complete-disassembly" | "unknown";
  /** 가격 (원) */
  price: number;
  /** 가격 상한 (범위인 경우) */
  priceMax: number | null;
  /** 가격 단위 */
  priceUnit: string;
  /** 포함 서비스 */
  includedServices: string[];
  /** 추가 서비스 (표준 카테고리 외) */
  additionalServices: string[];
  /** 추가 요금 */
  extraCharges: Array<{ label: string; amount: number; condition: string | null }>;
  /** 서비스 지역 (시/도) */
  regionCity: "seoul" | "gyeonggi" | null;
  /** 서비스 지역 (구/시/군) */
  regionDistrict: string | null;
  /** 데이터 불완전 여부 */
  isIncomplete: boolean;
  /** 불완전 필드 */
  incompleteFields: Array<{ field: string; reason: string }>;
}

/** 크롤러 인터페이스 */
export interface Crawler {
  /** 크롤러 이름 */
  name: string;
  /** 대상 플랫폼 */
  platform: CrawlResult["platform"];
  /** 크롤링 실행 */
  crawl(): Promise<CrawlResult[]>;
}
