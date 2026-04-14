/**
 * 에어컨 청소 가격 크롤러 (통합)
 *
 * 실행: npx tsx scripts/crawl.ts
 * GitHub Actions에서 주 3회 자동 실행
 */

import { createClient } from "@supabase/supabase-js";
import { WebsiteCrawler } from "./crawlers/website-crawler";
import { BlogCrawler } from "./crawlers/blog-crawler";
import { SoomgoPricesCrawler } from "./crawlers/soomgo-prices-crawler";
import type { Crawler, CrawlResult, CrawlPriceEntry } from "./crawlers/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error("환경변수 필요: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

/* ------------------------------------------------------------------ */
/* 크롤링 로그                                                         */
/* ------------------------------------------------------------------ */

async function startCrawlLog(platform: string, targetUrl?: string) {
  const { data } = await supabase
    .from("crawl_logs")
    .insert({
      source_platform: platform,
      target_url: targetUrl,
      started_at: new Date().toISOString(),
      status: "running",
    })
    .select("id")
    .single();
  return data?.id;
}

async function finishCrawlLog(
  logId: string,
  status: "success" | "failed" | "partial",
  stats: { found: number; saved: number; updated: number },
  errorMessage?: string
) {
  await supabase
    .from("crawl_logs")
    .update({
      finished_at: new Date().toISOString(),
      status,
      entries_found: stats.found,
      entries_saved: stats.saved,
      entries_updated: stats.updated,
      error_message: errorMessage,
    })
    .eq("id", logId);
}

/* ------------------------------------------------------------------ */
/* 크롤 결과 → DB 저장                                                  */
/* ------------------------------------------------------------------ */

async function saveEntriesToDb(
  crawlResult: CrawlResult
): Promise<{ saved: number; updated: number }> {
  let saved = 0;
  let updated = 0;

  for (const entry of crawlResult.entries) {
    // 중복 체크: 같은 업체 + 같은 유형 + 같은 지역
    const { data: existing } = await supabase
      .from("price_entries")
      .select("id")
      .eq("source_url", crawlResult.sourceUrl)
      .eq("aircon_type", entry.airconType)
      .eq("region_city", entry.regionCity ?? "seoul")
      .eq("region_district", entry.regionDistrict ?? "")
      .limit(1);

    const row = {
      aircon_type: entry.airconType,
      cleaning_method: entry.cleaningMethod,
      region_city: entry.regionCity ?? "seoul",
      region_district: entry.regionDistrict ?? "",
      price: entry.price,
      price_max: entry.priceMax,
      price_unit: entry.priceUnit,
      included_services: entry.includedServices,
      additional_services: entry.additionalServices,
      extra_charges: entry.extraCharges,
      provider_name: crawlResult.providerName,
      source_platform: crawlResult.platform,
      source_url: crawlResult.sourceUrl,
      is_incomplete: entry.isIncomplete,
      incomplete_fields: entry.incompleteFields,
      verified_at: new Date().toISOString(),
      is_active: true,
    };

    if (existing && existing.length > 0) {
      // 기존 데이터 업데이트
      await supabase
        .from("price_entries")
        .update(row)
        .eq("id", existing[0].id);
      updated++;
    } else {
      // 새 데이터 삽입
      await supabase.from("price_entries").insert(row);
      saved++;
    }
  }

  return { saved, updated };
}

async function saveRawData(logId: string, crawlResult: CrawlResult) {
  await supabase.from("raw_crawl_data").insert({
    crawl_log_id: logId,
    source_platform: crawlResult.platform,
    source_url: crawlResult.sourceUrl,
    raw_text: crawlResult.rawText,
    parsed_fields: { providerName: crawlResult.providerName },
    normalization_status: "completed",
  });
}

/* ------------------------------------------------------------------ */
/* Vercel 재빌드 트리거                                                 */
/* ------------------------------------------------------------------ */

async function triggerRebuild() {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hookUrl) {
    console.log("⏭️  VERCEL_DEPLOY_HOOK_URL 미설정 — 재빌드 건너뜀");
    return;
  }

  try {
    const res = await fetch(hookUrl, { method: "POST" });
    if (res.ok) {
      console.log("🚀 Vercel 재빌드 트리거 완료");
    } else {
      console.error("❌ Vercel 재빌드 실패:", res.status);
    }
  } catch (err) {
    console.error("❌ Vercel 재빌드 요청 실패:", err);
  }
}

/* ------------------------------------------------------------------ */
/* 메인                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  console.log("🕷️  에어컨 청소 가격 크롤링 시작");
  console.log(`⏰ ${new Date().toLocaleString("ko-KR")}\n`);

  // 모든 크롤러
  const crawlers: Crawler[] = [
    new WebsiteCrawler(),
    new BlogCrawler(),
    new SoomgoPricesCrawler(),
  ];

  let totalSaved = 0;
  let totalUpdated = 0;

  for (const crawler of crawlers) {
    console.log(`📡 [${crawler.name}] 크롤링 시작...`);
    const logId = await startCrawlLog(crawler.platform);
    if (!logId) continue;

    try {
      const results = await crawler.crawl();
      let crawlerSaved = 0;
      let crawlerUpdated = 0;

      for (const result of results) {
        // 원본 데이터 저장
        await saveRawData(logId, result);
        // 정규화된 데이터 저장
        const { saved, updated } = await saveEntriesToDb(result);
        crawlerSaved += saved;
        crawlerUpdated += updated;
      }

      totalSaved += crawlerSaved;
      totalUpdated += crawlerUpdated;

      const totalEntries = results.reduce((sum, r) => sum + r.entries.length, 0);
      await finishCrawlLog(logId, "success", {
        found: totalEntries,
        saved: crawlerSaved,
        updated: crawlerUpdated,
      });

      console.log(`  ✅ [${crawler.name}] 신규 ${crawlerSaved}건, 갱신 ${crawlerUpdated}건\n`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ [${crawler.name}] 실패:`, msg);
      await finishCrawlLog(logId, "failed", { found: 0, saved: 0, updated: 0 }, msg);
    }
  }

  console.log(`📊 총 결과: 신규 ${totalSaved}건, 갱신 ${totalUpdated}건`);

  if (totalSaved > 0) {
    await triggerRebuild();
  }

  console.log("✅ 크롤링 완료");
}

main().catch(console.error);
