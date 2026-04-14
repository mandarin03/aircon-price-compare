/**
 * 숨고 공개 가격 페이지 크롤러
 *
 * soomgo.com/prices/ 페이지의 공개 통계 데이터만 참고합니다.
 * 개별 고수 프로필이나 비공개 데이터는 크롤링하지 않습니다.
 */

import type { Crawler, CrawlResult, CrawlPriceEntry } from "./types";

/* ------------------------------------------------------------------ */
/* 숨고 공개 가격 통계 (수동 업데이트)                                   */
/* ------------------------------------------------------------------ */

/**
 * 숨고 가격 페이지에서 공개된 통계 데이터
 * https://soomgo.com/prices/에어컨-청소
 *
 * 이 데이터는 숨고 웹사이트에서 공개적으로 표시되는 정보입니다.
 * 주 3회 갱신 시 숨고 가격 페이지를 확인하고 업데이트합니다.
 *
 * 마지막 확인: 2026-04-14
 */
const SOOMGO_PRICE_STATS = {
  overall: { avg: 120000, min: 60000, max: 260000 },
  lastChecked: "2026-04-14",
};

/** 숨고 통계 기반 유형별 추정 가격 */
const SOOMGO_ENTRIES: CrawlPriceEntry[] = [
  {
    airconType: "wall-mount",
    cleaningMethod: "unknown",
    price: 60000,
    priceMax: 80000,
    priceUnit: "숨고 평균 (벽걸이)",
    includedServices: ["filter-wash"],
    additionalServices: [],
    extraCharges: [],
    regionCity: "seoul",
    regionDistrict: null,
    isIncomplete: true,
    incompleteFields: [
      { field: "cleaningMethod", reason: "not-specified" },
      { field: "regionDistrict", reason: "not-specified" },
      { field: "includedServices", reason: "ambiguous" },
    ],
  },
  {
    airconType: "standing",
    cleaningMethod: "unknown",
    price: 80000,
    priceMax: 150000,
    priceUnit: "숨고 평균 (스탠드)",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [],
    regionCity: "seoul",
    regionDistrict: null,
    isIncomplete: true,
    incompleteFields: [
      { field: "cleaningMethod", reason: "not-specified" },
      { field: "regionDistrict", reason: "not-specified" },
    ],
  },
  {
    airconType: "system",
    cleaningMethod: "unknown",
    price: 100000,
    priceMax: 260000,
    priceUnit: "숨고 평균 (시스템/천장형)",
    includedServices: ["filter-wash", "sanitization"],
    additionalServices: [],
    extraCharges: [],
    regionCity: "seoul",
    regionDistrict: null,
    isIncomplete: true,
    incompleteFields: [
      { field: "cleaningMethod", reason: "not-specified" },
      { field: "regionDistrict", reason: "not-specified" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 크롤러 구현                                                         */
/* ------------------------------------------------------------------ */

export class SoomgoPricesCrawler implements Crawler {
  name = "soomgo-prices-crawler";
  platform = "soomgo" as const;

  async crawl(): Promise<CrawlResult[]> {
    console.log(`  📊 [숨고] 공개 가격 통계 로드 (최종 확인: ${SOOMGO_PRICE_STATS.lastChecked})`);
    console.log(`  📊 전체 평균: ${SOOMGO_PRICE_STATS.overall.avg.toLocaleString()}원`);

    return [
      {
        platform: "soomgo",
        sourceUrl: "https://soomgo.com/prices/에어컨-청소",
        providerName: "숨고 가격 통계",
        rawText: JSON.stringify(SOOMGO_PRICE_STATS),
        entries: SOOMGO_ENTRIES,
      },
    ];
  }
}
