/**
 * 기존 mock 데이터를 Supabase에 시드하는 스크립트
 *
 * 실행: npx tsx scripts/seed-data.ts
 * 필요: .env.local에 SUPABASE_SERVICE_ROLE_KEY 설정
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("환경변수를 설정하세요: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

interface SampleEntry {
  id: string;
  airconType: string;
  cleaningMethod: string;
  regionCity: string;
  regionDistrict: string;
  price: number;
  priceMax: number | null;
  priceUnit: string;
  includedServices: string[];
  additionalServices: string[];
  extraCharges: Array<{ label: string; amount: number; condition: string | null }>;
  providerName: string;
  sourcePlatform: string;
  sourceUrl: string;
  isIncomplete: boolean;
  incompleteFields: Array<{ field: string; reason: string }>;
  collectedAt: string;
  verifiedAt: string;
  isActive: boolean;
}

async function seed() {
  console.log("📦 시드 데이터 로드 중...");

  const samplePath = resolve(__dirname, "../data/sample-prices.json");
  const raw = JSON.parse(readFileSync(samplePath, "utf-8"));
  const entries: SampleEntry[] = raw.entries;

  console.log(`📊 ${entries.length}개 항목 발견`);

  // camelCase → snake_case 변환
  const rows = entries.map((e) => ({
    id: e.id,
    aircon_type: e.airconType,
    cleaning_method: e.cleaningMethod,
    region_city: e.regionCity,
    region_district: e.regionDistrict,
    price: e.price,
    price_max: e.priceMax,
    price_unit: e.priceUnit,
    included_services: e.includedServices,
    additional_services: e.additionalServices,
    extra_charges: e.extraCharges,
    provider_name: e.providerName,
    source_platform: e.sourcePlatform,
    source_url: e.sourceUrl,
    is_incomplete: e.isIncomplete,
    incomplete_fields: e.incompleteFields,
    collected_at: e.collectedAt,
    verified_at: e.verifiedAt,
    is_active: e.isActive,
  }));

  // upsert (중복 시 업데이트)
  const { data, error } = await supabase
    .from("price_entries")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("❌ 시드 실패:", error.message);
    process.exit(1);
  }

  console.log(`✅ ${rows.length}개 항목 시드 완료`);
}

seed().catch(console.error);
