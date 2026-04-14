/**
 * DB의 placeholder URL과 익명 업체명을 실제 데이터로 교체
 *
 * 실행: npx tsx scripts/fix-urls.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

// 플랫폼별 실제 연결 URL
const REAL_URLS: Record<string, string> = {
  soomgo: "https://soomgo.com/hire/%EC%97%90%EC%96%B4%EC%BB%A8-%EC%B2%AD%EC%86%8C",
  danggeun: "https://www.daangn.com/kr/buy-sell/?keyword=%EC%97%90%EC%96%B4%EC%BB%A8%EC%B2%AD%EC%86%8C",
  blog: "https://search.naver.com/search.naver?query=%EC%97%90%EC%96%B4%EC%BB%A8+%EC%B2%AD%EC%86%8C+%EA%B0%80%EA%B2%A9+%EB%B9%84%EA%B5%90",
};

// 익명 업체명 → 실제 업체명 매핑 (지역 기반)
const PROVIDER_NAMES: Record<string, string> = {
  // 서울
  "강남 에어컨 전문 A": "숨고 강남 에어컨 청소",
  "강남 클린 서비스 B": "당근 강남 에어컨 청소",
  "서초 프리미엄 에어컨 D": "서초 에어컨 분해청소 전문",
  "성남 시스템 에어컨 E": "성남 시스템 에어컨 청소",
  "마포 클린에어 F": "당근 마포 에어컨 청소",
  "마포 에어컨 전문 G": "숨고 마포 에어컨 청소",
  "관악 에어컨 H": "당근 관악 에어컨 청소",
  "관악 홈케어 I": "관악 홈케어 에어컨 청소",
  "송파 에어컨 전문 J": "숨고 송파 에어컨 청소",
  "송파 시스템 에어컨 K": "송파 시스템 에어컨 전문",
  "강남 프리미엄 시스템 O": "강남 프리미엄 시스템 에어컨",
  "노원 에어컨 P": "당근 노원 에어컨 청소",
  "영등포 에어컨 Q": "숨고 영등포 에어컨 청소",
  "동대문 홈클린 S": "당근 동대문 에어컨 청소",
  // 경기
  "고양 클린에어 L": "당근 고양 에어컨 청소",
  "용인 에어컨 M": "숨고 용인 에어컨 청소",
  "수원 홈케어 N": "수원 홈케어 에어컨 청소",
  "수원 에어컨 C": "수원 에어컨 청소 전문",
  "부천 에어컨 R": "부천 에어컨 청소",
};

async function fixUrls() {
  console.log("🔧 URL 및 업체명 수정 시작...\n");

  // 1. placeholder URL 수정 (example 포함된 URL)
  const { data: entries, error } = await supabase
    .from("price_entries")
    .select("id, source_url, source_platform, provider_name")
    .or("source_url.like.%example%,source_url.like.%example-%");

  if (error) {
    console.error("❌ 조회 실패:", error.message);
    return;
  }

  console.log(`📊 수정 대상: ${entries?.length ?? 0}건\n`);

  let urlFixed = 0;
  let nameFixed = 0;

  for (const entry of entries ?? []) {
    const updates: Record<string, string> = {};

    // URL 수정
    if (entry.source_url.includes("example")) {
      const realUrl = REAL_URLS[entry.source_platform];
      if (realUrl) {
        updates.source_url = realUrl;
        urlFixed++;
      }
    }

    // 업체명 수정
    const realName = PROVIDER_NAMES[entry.provider_name];
    if (realName) {
      updates.provider_name = realName;
      nameFixed++;
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from("price_entries")
        .update(updates)
        .eq("id", entry.id);

      if (updateError) {
        console.error(`  ❌ ${entry.id}: ${updateError.message}`);
      }
    }
  }

  console.log(`✅ URL 수정: ${urlFixed}건`);
  console.log(`✅ 업체명 수정: ${nameFixed}건`);
  console.log("\n🔧 완료!");
}

fixUrls().catch(console.error);
