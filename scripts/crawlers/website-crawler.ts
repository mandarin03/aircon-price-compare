/**
 * 업체 자체 사이트 크롤러
 *
 * 공개된 업체 웹사이트에서 가격 정보를 수집합니다.
 * 각 업체별로 파서를 정의하여 가격 데이터를 추출합니다.
 */

import type { Crawler, CrawlResult, CrawlPriceEntry } from "./types";

/* ------------------------------------------------------------------ */
/* 업체별 설정                                                         */
/* ------------------------------------------------------------------ */

interface WebsiteConfig {
  name: string;
  url: string;
  regions: Array<{ city: "seoul" | "gyeonggi"; district: string }>;
  /** 수동 파싱된 가격 데이터 (사이트 구조가 바뀌면 업데이트 필요) */
  prices: CrawlPriceEntry[];
}

/**
 * 업체별 가격 데이터 설정
 *
 * 업체 사이트는 구조가 다양하므로, 수동으로 파싱한 결과를 저장합니다.
 * 사이트가 업데이트되면 이 설정을 갱신하면 됩니다.
 */
const WEBSITE_CONFIGS: WebsiteConfig[] = [
  {
    name: "그린프로청소",
    url: "https://greenproaircon.cafe24.com/",
    regions: [
      { city: "gyeonggi", district: "seongnam" },
      { city: "seoul", district: "dongdaemun" },
      { city: "seoul", district: "songpa" },
    ],
    prices: [
      {
        airconType: "wall-mount",
        cleaningMethod: "complete-disassembly",
        price: 80000,
        priceMax: null,
        priceUnit: "1대 기준",
        includedServices: ["filter-wash", "sanitization", "mold-removal", "operation-check"],
        additionalServices: ["고압세척", "스팀청소", "가스충전"],
        extraCharges: [],
        regionCity: null,
        regionDistrict: null,
        isIncomplete: false,
        incompleteFields: [],
      },
      {
        airconType: "standing",
        cleaningMethod: "complete-disassembly",
        price: 130000,
        priceMax: null,
        priceUnit: "1대 기준",
        includedServices: ["filter-wash", "sanitization", "mold-removal", "operation-check"],
        additionalServices: ["고압세척", "스팀청소"],
        extraCharges: [],
        regionCity: null,
        regionDistrict: null,
        isIncomplete: false,
        incompleteFields: [],
      },
      {
        airconType: "ceiling",
        cleaningMethod: "complete-disassembly",
        price: 150000,
        priceMax: null,
        priceUnit: "4way 1대 기준",
        includedServices: ["filter-wash", "sanitization", "drain-pipe", "mold-removal", "operation-check"],
        additionalServices: ["고압세척"],
        extraCharges: [
          { label: "1way/2way", amount: -50000, condition: "1way 또는 2way 천장형" },
        ],
        regionCity: null,
        regionDistrict: null,
        isIncomplete: false,
        incompleteFields: [],
      },
      {
        airconType: "system",
        cleaningMethod: "complete-disassembly",
        price: 200000,
        priceMax: null,
        priceUnit: "원형 시스템 1대 기준",
        includedServices: ["filter-wash", "sanitization", "operation-check"],
        additionalServices: ["고압세척"],
        extraCharges: [
          { label: "덕트형", amount: -50000, condition: "덕트형 시스템" },
        ],
        regionCity: null,
        regionDistrict: null,
        isIncomplete: false,
        incompleteFields: [],
      },
    ],
  },
  {
    name: "미소",
    url: "https://miso.kr/appclean",
    regions: [
      // 전국 서비스이므로 서울·경기 주요 지역 모두 포함
      { city: "seoul", district: "gangnam" },
      { city: "seoul", district: "seocho" },
      { city: "seoul", district: "songpa" },
      { city: "seoul", district: "mapo" },
      { city: "seoul", district: "yeongdeungpo" },
      { city: "seoul", district: "nowon" },
      { city: "seoul", district: "dongdaemun" },
      { city: "gyeonggi", district: "seongnam" },
      { city: "gyeonggi", district: "suwon" },
      { city: "gyeonggi", district: "goyang" },
      { city: "gyeonggi", district: "yongin" },
      { city: "gyeonggi", district: "bucheon" },
    ],
    prices: [
      {
        airconType: "wall-mount",
        cleaningMethod: "disassembly",
        price: 53910,
        priceMax: 59900,
        priceUnit: "1대 기준",
        includedServices: ["filter-wash", "sanitization", "mold-removal"],
        additionalServices: ["고압세척"],
        extraCharges: [
          { label: "실외기 청소", amount: 30000, condition: "별도 요청 시" },
        ],
        regionCity: null,
        regionDistrict: null,
        isIncomplete: false,
        incompleteFields: [],
      },
      {
        airconType: "standing",
        cleaningMethod: "disassembly",
        price: 89910,
        priceMax: 109000,
        priceUnit: "1대 기준 (LG/삼성 89,910원, 기타 98,100원)",
        includedServices: ["filter-wash", "sanitization", "mold-removal"],
        additionalServices: ["고압세척"],
        extraCharges: [
          { label: "실외기 청소", amount: 50000, condition: "별도 요청 시" },
        ],
        regionCity: null,
        regionDistrict: null,
        isIncomplete: false,
        incompleteFields: [],
      },
      {
        airconType: "ceiling",
        cleaningMethod: "disassembly",
        price: 78210,
        priceMax: 119000,
        priceUnit: "1대 기준 (1·2way 78,210원, 4way 107,100원)",
        includedServices: ["filter-wash", "sanitization", "drain-pipe", "mold-removal"],
        additionalServices: ["고압세척"],
        extraCharges: [
          { label: "층고 3~4m", amount: 30000, condition: "층고 3m 이상" },
          { label: "층고 4~5m", amount: 40000, condition: "층고 4m 이상" },
        ],
        regionCity: null,
        regionDistrict: null,
        isIncomplete: false,
        incompleteFields: [],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 크롤러 구현                                                         */
/* ------------------------------------------------------------------ */

export class WebsiteCrawler implements Crawler {
  name = "website-crawler";
  platform = "website" as const;

  async crawl(): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];

    for (const config of WEBSITE_CONFIGS) {
      console.log(`  📄 [${config.name}] 가격 데이터 로드...`);

      // 각 서비스 지역별로 엔트리 생성
      const entries: CrawlPriceEntry[] = [];

      for (const region of config.regions) {
        for (const priceTemplate of config.prices) {
          entries.push({
            ...priceTemplate,
            regionCity: region.city,
            regionDistrict: region.district,
          });
        }
      }

      results.push({
        platform: "website",
        sourceUrl: config.url,
        providerName: config.name,
        rawText: JSON.stringify(config.prices),
        entries,
      });

      console.log(`  ✅ [${config.name}] ${entries.length}개 가격 항목`);
    }

    return results;
  }
}

/**
 * 새 업체 사이트를 추가하려면:
 * 1. WEBSITE_CONFIGS에 업체 정보 추가
 * 2. 사이트에서 가격 정보를 확인하여 prices 배열 작성
 * 3. npx tsx scripts/crawl.ts 로 테스트
 */
