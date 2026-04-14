import { createClient } from "@supabase/supabase-js";
import type { PriceEntry, PriceSummary, City, AirconType } from "@/types/price";

/* ------------------------------------------------------------------ */
/* Client                                                              */
/* ------------------------------------------------------------------ */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** 서비스 역할 클라이언트 (크롤러 전용, 서버 사이드만) */
export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(supabaseUrl, serviceKey);
}

/* ------------------------------------------------------------------ */
/* DB row → PriceEntry 변환                                            */
/* ------------------------------------------------------------------ */

interface DbPriceRow {
  id: string;
  aircon_type: string;
  cleaning_method: string;
  region_city: string;
  region_district: string;
  price: number;
  price_max: number | null;
  price_unit: string;
  included_services: string[];
  additional_services: string[];
  extra_charges: Array<{ label: string; amount: number; condition: string | null }>;
  provider_name: string;
  source_platform: string;
  source_url: string;
  is_incomplete: boolean;
  incomplete_fields: Array<{ field: string; reason: string }>;
  collected_at: string;
  verified_at: string;
  is_active: boolean;
}

function rowToPriceEntry(row: DbPriceRow): PriceEntry {
  return {
    id: row.id,
    airconType: row.aircon_type as AirconType,
    cleaningMethod: row.cleaning_method as PriceEntry["cleaningMethod"],
    regionCity: row.region_city as City,
    regionDistrict: row.region_district,
    price: row.price,
    priceMax: row.price_max,
    priceUnit: row.price_unit,
    includedServices: row.included_services as PriceEntry["includedServices"],
    additionalServices: row.additional_services,
    extraCharges: row.extra_charges,
    providerName: row.provider_name,
    sourcePlatform: row.source_platform as PriceEntry["sourcePlatform"],
    sourceUrl: row.source_url,
    isIncomplete: row.is_incomplete,
    incompleteFields: row.incomplete_fields as PriceEntry["incompleteFields"],
    collectedAt: row.collected_at,
    verifiedAt: row.verified_at,
    isActive: row.is_active,
  };
}

/* ------------------------------------------------------------------ */
/* 데이터 조회 함수 (기존 priceData.ts API와 동일 인터페이스)            */
/* ------------------------------------------------------------------ */

/**
 * 특정 지역×에어컨 유형의 가격 데이터 조회
 * 기존 getPriceEntries()와 동일한 시그니처
 */
export async function fetchPriceEntries(
  city: City,
  district: string,
  airconType: AirconType
): Promise<PriceEntry[]> {
  const { data, error } = await supabase
    .from("price_entries")
    .select("*")
    .eq("region_city", city)
    .eq("region_district", district)
    .eq("aircon_type", airconType)
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) {
    console.error("Failed to fetch price entries:", error.message);
    return [];
  }

  return (data as DbPriceRow[]).map(rowToPriceEntry);
}

/**
 * 특정 지역×에어컨 유형의 가격 통계 계산
 * 기존 calculatePriceSummary()와 동일한 시그니처
 */
export async function fetchPriceSummary(
  city: City,
  district: string,
  airconType: AirconType
): Promise<PriceSummary> {
  const entries = await fetchPriceEntries(city, district, airconType);

  if (entries.length === 0) {
    return {
      airconType,
      regionCity: city,
      regionDistrict: district,
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0,
      medianPrice: 0,
      totalEntries: 0,
      generalCount: 0,
      disassemblyCount: 0,
      completeDisassemblyCount: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  const prices = entries.map((e) => e.price).sort((a, b) => a - b);
  const mid = Math.floor(prices.length / 2);

  return {
    airconType,
    regionCity: city,
    regionDistrict: district,
    minPrice: prices[0],
    maxPrice: prices[prices.length - 1],
    avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    medianPrice:
      prices.length % 2 === 0
        ? Math.round((prices[mid - 1] + prices[mid]) / 2)
        : prices[mid],
    totalEntries: entries.length,
    generalCount: entries.filter((e) => e.cleaningMethod === "general").length,
    disassemblyCount: entries.filter((e) => e.cleaningMethod === "disassembly").length,
    completeDisassemblyCount: entries.filter(
      (e) => e.cleaningMethod === "complete-disassembly"
    ).length,
    lastUpdated: entries
      .map((e) => e.verifiedAt)
      .sort()
      .pop() ?? new Date().toISOString(),
  };
}

/**
 * 모든 활성 가격 데이터 조회 (빌드 시 전체 로드용)
 */
export async function fetchAllPriceEntries(): Promise<PriceEntry[]> {
  const { data, error } = await supabase
    .from("price_entries")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) {
    console.error("Failed to fetch all entries:", error.message);
    return [];
  }

  return (data as DbPriceRow[]).map(rowToPriceEntry);
}
