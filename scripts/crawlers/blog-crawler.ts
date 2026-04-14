/**
 * 블로그 비교글 크롤러
 *
 * 에어컨 청소 가격 비교 블로그 글에서 가격 데이터를 수집합니다.
 * HTML을 파싱하여 가격 테이블/목록을 추출합니다.
 */

import type { Crawler, CrawlResult, CrawlPriceEntry } from "./types";

/* ------------------------------------------------------------------ */
/* 블로그 URL 목록                                                     */
/* ------------------------------------------------------------------ */

interface BlogSource {
  url: string;
  title: string;
  /** 수동 파싱된 가격 데이터 */
  entries: CrawlPriceEntry[];
}

/**
 * 블로그 비교글 데이터
 *
 * 블로그는 구조가 비정형이므로 수동 파싱 후 데이터를 입력합니다.
 * 주 3회 갱신 시 새 블로그 글을 발견하면 여기에 추가합니다.
 */
const BLOG_SOURCES: BlogSource[] = [
  {
    url: "https://a.littlejsb.com/entry/2025%EB%85%84-%EC%97%90%EC%96%B4%EC%BB%A8-%EC%B2%AD%EC%86%8C-%EC%97%85%EC%B2%B4-30%EA%B3%B3-%EC%99%84%EB%B2%BD-%EB%B9%84%EC%9A%A9-%EB%B9%84%EA%B5%90-%EC%A7%80%EC%97%AD%EB%B3%84%EC%A2%85%EB%A5%98%EB%B3%84-%EC%A0%95%EB%A6%AC",
    title: "에어컨 청소 업체 30곳 비용 비교",
    entries: [
      // 블로그에서 수집한 서울 지역 평균 가격
      {
        airconType: "wall-mount",
        cleaningMethod: "disassembly",
        price: 55000,
        priceMax: 80000,
        priceUnit: "1대 기준 (서울 평균)",
        includedServices: ["filter-wash", "sanitization"],
        additionalServices: [],
        extraCharges: [],
        regionCity: "seoul",
        regionDistrict: null,
        isIncomplete: true,
        incompleteFields: [
          { field: "regionDistrict", reason: "not-specified" },
          { field: "includedServices", reason: "ambiguous" },
        ],
      },
      {
        airconType: "standing",
        cleaningMethod: "disassembly",
        price: 85000,
        priceMax: 150000,
        priceUnit: "1대 기준 (서울 평균)",
        includedServices: ["filter-wash", "sanitization"],
        additionalServices: [],
        extraCharges: [],
        regionCity: "seoul",
        regionDistrict: null,
        isIncomplete: true,
        incompleteFields: [
          { field: "regionDistrict", reason: "not-specified" },
          { field: "includedServices", reason: "ambiguous" },
        ],
      },
      {
        airconType: "ceiling",
        cleaningMethod: "disassembly",
        price: 100000,
        priceMax: 200000,
        priceUnit: "1대 기준 (서울 평균)",
        includedServices: ["filter-wash", "sanitization", "drain-pipe"],
        additionalServices: [],
        extraCharges: [],
        regionCity: "seoul",
        regionDistrict: null,
        isIncomplete: true,
        incompleteFields: [
          { field: "regionDistrict", reason: "not-specified" },
          { field: "includedServices", reason: "ambiguous" },
        ],
      },
      // 경기 지역
      {
        airconType: "wall-mount",
        cleaningMethod: "disassembly",
        price: 49000,
        priceMax: 70000,
        priceUnit: "1대 기준 (경기 평균)",
        includedServices: ["filter-wash", "sanitization"],
        additionalServices: [],
        extraCharges: [],
        regionCity: "gyeonggi",
        regionDistrict: null,
        isIncomplete: true,
        incompleteFields: [
          { field: "regionDistrict", reason: "not-specified" },
          { field: "includedServices", reason: "ambiguous" },
        ],
      },
      {
        airconType: "standing",
        cleaningMethod: "disassembly",
        price: 79000,
        priceMax: 130000,
        priceUnit: "1대 기준 (경기 평균)",
        includedServices: ["filter-wash", "sanitization"],
        additionalServices: [],
        extraCharges: [],
        regionCity: "gyeonggi",
        regionDistrict: null,
        isIncomplete: true,
        incompleteFields: [
          { field: "regionDistrict", reason: "not-specified" },
          { field: "includedServices", reason: "ambiguous" },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 크롤러 구현                                                         */
/* ------------------------------------------------------------------ */

export class BlogCrawler implements Crawler {
  name = "blog-crawler";
  platform = "blog" as const;

  async crawl(): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];

    for (const source of BLOG_SOURCES) {
      console.log(`  📝 [블로그] ${source.title}`);

      results.push({
        platform: "blog",
        sourceUrl: source.url,
        providerName: source.title,
        rawText: JSON.stringify(source.entries),
        entries: source.entries,
      });

      console.log(`  ✅ ${source.entries.length}개 가격 항목`);
    }

    return results;
  }
}
